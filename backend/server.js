const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
require("dotenv").config();

const app = express();
const frontendURL = process.env.FRONTEND_URL;

app.use(cors({
  origin: [frontendURL, "https://www.brotherscup.com.br", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200
}));

app.options("*", cors());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preference = new Preference(client);
const paymentApi = new Payment(client);

app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

let adminPasswordHash = ADMIN_PASSWORD_HASH;
if (!adminPasswordHash) {
  console.warn("⚠️  AVISO: Usando senha padrão. MUDE EM PRODUÇÃO!");
  adminPasswordHash = "$2b$10$rOOjq7O8J8J8J8J8J8J8JeJ8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8";
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token de acesso não fornecido" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado" });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Acesso negado: você não tem permissão para realizar esta ação",
      });
    }
    next();
  };
};

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

const rateLimitLogin = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (loginAttempts.has(ip)) {
    const attempts = loginAttempts.get(ip);
    if (attempts.count >= MAX_LOGIN_ATTEMPTS && (now - attempts.lastAttempt) < LOCKOUT_TIME) {
      return res.status(429).json({
        message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
      });
    }
    if ((now - attempts.lastAttempt) > LOCKOUT_TIME) {
      loginAttempts.delete(ip);
    }
  }
  next();
};

// FUNÇÕES AUXILIARES DO MERCADO PAGO

// Função para atualizar status de pagamento na tabela inscricoes
const updateInscricaoPaymentStatus = async (inscricaoId, preferenceId, paymentId, status) => {
  try {
    const query = `
      UPDATE inscricoes
      SET status_pagamento = $1,
          preference_id = $2,
          payment_id = $3
      WHERE id = $4
    `;
    await pool.query(query, [status, preferenceId, paymentId, inscricaoId]);
    console.log(`Inscrição ${inscricaoId} atualizada: status=${status}, preference_id=${preferenceId}, payment_id=${paymentId}`);
  } catch (error) {
    console.error("Erro ao atualizar status de pagamento na tabela inscricoes:", error);
  }
};

// Função para salvar preferência na tabela payment_preferences
const savePreferenceToPaymentPreferences = async (preferenceData) => {
  try {
    const query = `
      INSERT INTO payment_preferences (preference_id, external_reference, title, amount, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (preference_id) DO UPDATE SET
      status = EXCLUDED.status,
      updated_at = NOW()
    `;
    
    await pool.query(query, [
      preferenceData.preference_id,
      preferenceData.external_reference,
      preferenceData.title,
      preferenceData.amount,
      preferenceData.status,
      preferenceData.created_at
    ]);
  } catch (error) {
    console.error("Erro ao salvar preferência em payment_preferences:", error);
  }
};

// Função auxiliar atualizada para buscar inscrição por external_reference
const getInscricaoByExternalReference = async (externalReference) => {
  try {
    // Primeiro, tentar buscar por external_reference (se a coluna existir)
    let query = `
      SELECT id, preference_id, categoria, status_pagamento
      FROM inscricoes
      WHERE external_reference = $1
    `;
    
    let result = await pool.query(query, [externalReference]);
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Se não encontrou, extrair o ID da inscrição do external_reference
    const inscricaoIdMatch = externalReference.match(/inscricao_(\d+)/);
    if (inscricaoIdMatch) {
      const inscricaoId = inscricaoIdMatch[1];
      
      query = `
        SELECT id, preference_id, categoria, status_pagamento
        FROM inscricoes
        WHERE id = $1
      `;
      
      result = await pool.query(query, [inscricaoId]);
      
      if (result.rows.length > 0) {
        return result.rows[0];
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar inscrição por external_reference:", error);
    return null;
  }
};

// Função auxiliar para gerenciar vagas baseado no status do pagamento
const gerenciarVagasPorStatusPagamento = async (externalReference, novoStatus, statusAnterior = null) => {
  try {
    // Extrair o ID da inscrição do external_reference
    const inscricaoIdMatch = externalReference.match(/inscricao_(\d+)/);
    if (!inscricaoIdMatch) {
      console.warn(`External reference inválido: ${externalReference}`);
      return;
    }

    const inscricaoId = inscricaoIdMatch[1];

    // Buscar a categoria da inscrição
    const inscricaoResult = await pool.query(
      "SELECT categoria, status_pagamento FROM inscricoes WHERE id = $1",
      [inscricaoId]
    );

    if (inscricaoResult.rowCount === 0) {
      console.warn(`Inscrição não encontrada: ID ${inscricaoId}`);
      return;
    }

    const { categoria, status_pagamento: statusAtual } = inscricaoResult.rows[0];
    
    console.log(`🎯 Gerenciando vagas: Inscrição ${inscricaoId}, Categoria ${categoria}`);
    console.log(`📊 Status: ${statusAtual} → ${novoStatus}`);

    // Lógica para ocupar/liberar vagas
    let incrementoVagas = 0;

    // Se o status anterior era 'approved' e o novo não é, liberar vaga
    if (statusAtual === "approved" && novoStatus !== "approved") {
      incrementoVagas = -1; // Liberar vaga
      console.log(`🔓 Liberando vaga na categoria ${categoria}`);
    }
    // Se o status anterior não era 'approved' e o novo é, ocupar vaga
    else if (statusAtual !== "approved" && novoStatus === "approved") {
      incrementoVagas = 1; // Ocupar vaga
      console.log(`🔒 Ocupando vaga na categoria ${categoria}`);
    }
    // Se não houve mudança relevante, não fazer nada
    else {
      console.log(`⚪ Sem alteração de vagas necessária`);
      return;
    }

    // Atualizar vagas_ocupadas na tabela categorias
    if (incrementoVagas !== 0) {
      const updateResult = await pool.query(
        `UPDATE categorias 
         SET vagas_ocupadas = GREATEST(0, vagas_ocupadas + $1) 
         WHERE nome = $2 
         RETURNING vagas_totais, vagas_ocupadas`,
        [incrementoVagas, categoria]
      );

      if (updateResult.rowCount > 0) {
        const { vagas_totais, vagas_ocupadas } = updateResult.rows[0];
        console.log(`✅ Vagas atualizadas na categoria ${categoria}: ${vagas_ocupadas}/${vagas_totais}`);
      } else {
        console.warn(`Categoria não encontrada: ${categoria}`);
      }
    }

  } catch (error) {
    console.error("Erro ao gerenciar vagas:", error);
  }
};

// Função para atualizar pagamento na tabela payment_preferences
const updatePaymentInPaymentPreferences = async (paymentData) => {
  try {
    const query = `
      UPDATE payment_preferences 
      SET 
        payment_id = $1,
        status = $2,
        payment_status_detail = $3,
        transaction_amount = $4,
        date_approved = $5,
        payer_email = $6,
        updated_at = NOW()
      WHERE external_reference = $7
    `;
    
    await pool.query(query, [
      paymentData.id,
      paymentData.status,
      paymentData.status_detail,
      paymentData.transaction_amount,
      paymentData.date_approved,
      paymentData.payer?.email,
      paymentData.external_reference
    ]);

    console.log(`Pagamento ${paymentData.id} atualizado em payment_preferences`);
  } catch (error) {
    console.error("Erro ao atualizar pagamento em payment_preferences:", error);
  }
};

// ROTAS DE AUTENTICAÇÃO

// Rota de login
app.post("/login", rateLimitLogin, async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
    }

    if (username === ADMIN_USERNAME && await bcrypt.compare(password, adminPasswordHash)) {
      loginAttempts.delete(ip);
      
      const token = jwt.sign(
        {
          username: ADMIN_USERNAME,
          role: "admin",
          iat: Math.floor(Date.now() / 1000),
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      console.log(`✅ Login bem-sucedido: ${username} em ${new Date().toISOString()}`);

      return res.status(200).json({
        message: "Login realizado com sucesso",
        token,
        user: { username: ADMIN_USERNAME, role: "admin" },
      });
    } else {
      const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
      attempts.count++;
      attempts.lastAttempt = Date.now();
      loginAttempts.set(ip, attempts);

      console.log(`❌ Tentativa de login falhada: ${username} de ${ip} em ${new Date().toISOString()}`);

      return res.status(401).json({ message: "Credenciais inválidas" });
    }
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Rota para verificar se o token é válido
app.get("/verify-token", authenticateToken, (req, res) => {
  res.status(200).json({
    valid: true,
    user: { username: req.user.username, role: req.user.role },
  });
});

// ROTAS PÚBLICAS (sem autenticação)

// Rota para verificar se há vagas disponíveis na categoria
app.get("/vagas/:categoria", async (req, res) => {
  const categoria = req.params.categoria;

  try {
    const result = await pool.query(
      `SELECT vagas_totais, vagas_ocupadas FROM categorias WHERE nome = $1`,
      [categoria]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    const { vagas_totais, vagas_ocupadas } = result.rows[0];
    const vagas_restantes = vagas_totais - vagas_ocupadas;

    res.status(200).json({ vagas: vagas_restantes });
  } catch (err) {
    console.error("Erro ao verificar vagas:", err);
    res.status(500).json({ message: "Erro ao verificar vagas" });
  }
});

// Rota para criar a inscrição (pública) - INTEGRADA COM MERCADO PAGO
// MODIFICADA: Não ocupa vaga imediatamente, apenas após confirmação do pagamento
app.post("/inscricoes", async (req, res) => {
  const {
    representante,
    parceiro,
    instagramRepresentante,
    instagramParceiro,
    uniformeRepresentante,
    uniformeParceiro,
    categoria,
    ctRepresentante,
    ctParceiro,
    celular,
    valor_inscricao,
    forma_pagamento
  } = req.body;

  try {
    if (!representante || !parceiro || !categoria || !celular) {
      return res.status(400).json({ message: "Campos obrigatórios ausentes" });
    }

    const valorInscricao = valor_inscricao || 250;
    const formaPagamento = forma_pagamento || "pix";

    console.log(`💰 Criando inscrição: Valor=${valorInscricao}, Forma=${formaPagamento}`);

    const vagasRes = await pool.query(
      `SELECT vagas_totais, vagas_ocupadas FROM categorias WHERE nome = $1`,
      [categoria]
    );

    if (vagasRes.rowCount === 0) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    const { vagas_totais, vagas_ocupadas } = vagasRes.rows[0];
    if (vagas_ocupadas >= vagas_totais) {
      return res.status(400).json({ message: "Não há mais vagas disponíveis para esta categoria." });
    }

    const result = await pool.query(
      `INSERT INTO inscricoes (
        representante,
        parceiro,
        instagram_representante,
        instagram_parceiro,
        uniforme_representante,
        uniforme_parceiro,
        categoria,
        ct_representante,
        ct_parceiro,
        celular,
        status_pagamento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        representante,
        parceiro,
        instagramRepresentante,
        instagramParceiro,
        uniformeRepresentante,
        uniformeParceiro,
        categoria,
        ctRepresentante,
        ctParceiro,
        celular,
        "pending"
      ]
    );

    const inscricaoId = result.rows[0].id;

    const baseUrl = process.env.BACKEND_URL;
    const externalRef = `inscricao_${inscricaoId}`;

    let paymentMethods = {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: 12,
    };

    if (formaPagamento === "pix") {
      paymentMethods.excluded_payment_types = [
        { id: "credit_card" },
        { id: "debit_card" },
        { id: "prepaid_card" }
      ];
      paymentMethods.installments = 1;
    } else if (formaPagamento === "cartao") {
      paymentMethods.excluded_payment_types = [
        { id: "bank_transfer" },
        { id: "ticket" },
        { id: "atm" }
      ];
    }

    const preferenceBody = {
      items: [
        {
          title: `Inscrição Brothers Cup - ${representante} - ${parceiro} - ${categoria} `,
          unit_price: parseFloat(valorInscricao),
          quantity: 1,
          description: `Inscrição para a categoria ${categoria} - Pagamento via ${formaPagamento.toUpperCase()}`,
        },
      ],
      back_urls: {
        success: "https://www.brotherscup.com.br/successo",
        failure: "https://www.brotherscup.com.br/falhou",
        pending: "https://www.brotherscup.com.br/pendente",
      },
      auto_return: "approved",
      payment_methods: paymentMethods,
      notification_url: `${baseUrl}/mercadopago/webhook`,
      external_reference: externalRef,
      statement_descriptor: "BROTHERS CUP",
    };

    console.log("🔧 Configuração de pagamento:", JSON.stringify(paymentMethods, null, 2));

    const mpResponse = await preference.create({ body: preferenceBody });

    try {
      await savePreferenceToPaymentPreferences({
        preference_id: mpResponse.id,
        external_reference: externalRef,
        title: `Inscrição Brothers Cup - ${representante}`,
        amount: parseFloat(valorInscricao),
        status: "pending",
        created_at: new Date()
      });
    } catch (error) {
      console.warn("Tabela payment_preferences não existe ou erro ao salvar:", error.message);
    }

    await updateInscricaoPaymentStatus(
      inscricaoId,
      mpResponse.id,
      null,
      "pending"
    );
    
    console.log(`✅ Nova inscrição criada (PENDENTE): ID ${inscricaoId} - ${representante}/${parceiro} - ${categoria} - ${formaPagamento.toUpperCase()} R$${valorInscricao}`);
    console.log(`⏳ Vaga NÃO ocupada ainda. Aguardando confirmação do pagamento.`);

    res.status(200).json({
      id: inscricaoId,
      preference_id: mpResponse.id,
      init_point: mpResponse.init_point,
      sandbox_init_point: mpResponse.sandbox_init_point,
      external_reference: externalRef,
      valor: valorInscricao,
      forma_pagamento: formaPagamento
    });
  } catch (err) {
    console.error("Erro ao salvar inscrição:", err);
    res.status(500).json({ message: "Erro ao salvar inscrição" });
  }
});

// ROTAS DO MERCADO PAGO

// Rota para criar preferência de pagamento (genérica)
app.post("/mercadopago/create-preference", async (req, res) => {
  try {
    const { title, price, quantity, description, buyerInfo, externalReference, inscricaoId } = req.body;
    
    const baseUrl = process.env.BACKEND_URL;
    const externalRef = externalReference || `brothers_cup_order_${Date.now()}`;

    const preferenceBody = {
      items: [
        {
          title: title || "Inscrição Brothers Cup",
          unit_price: parseFloat(price) || 250,
          quantity: parseInt(quantity) || 1,
          description: description || title || "Inscrição Brothers Cup",
        },
      ],
      back_urls: {
        success: "https://www.brotherscup.com.br/successo",
        failure: "https://www.brotherscup.com.br/falhou",
        pending: "https://www.brotherscup.com.br/pendente",
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
      },
      notification_url: `${baseUrl}/mercadopago/webhook`,
      external_reference: externalRef,
      statement_descriptor: "BROTHERS CUP",
    };

    if (buyerInfo) {
      preferenceBody.payer = {
        name: buyerInfo.name,
        surname: buyerInfo.surname,
        email: buyerInfo.email,
        phone: buyerInfo.phone ? {
          area_code: buyerInfo.phone.area_code,
          number: buyerInfo.phone.number
        } : undefined,
        identification: buyerInfo.identification ? {
          type: buyerInfo.identification.type,
          number: buyerInfo.identification.number
        } : undefined,
      };
    }

    const mpResponse = await preference.create({ body: preferenceBody });
    
    try {
      await savePreferenceToPaymentPreferences({
        preference_id: mpResponse.id,
        external_reference: externalRef,
        title: title || "Inscrição Brothers Cup",
        amount: parseFloat(price) * parseInt(quantity || 1) || 250,
        status: "pending",
        created_at: new Date()
      });
    } catch (error) {
      console.warn("Tabela payment_preferences não existe ou erro ao salvar:", error.message);
    }

    if (inscricaoId) {
      await updateInscricaoPaymentStatus(
        inscricaoId,
        mpResponse.id,
        null,
        "pending"
      );
    }
    
    res.json({
      id: mpResponse.id,
      init_point: mpResponse.init_point,
      sandbox_init_point: mpResponse.sandbox_init_point,
      external_reference: externalRef,
    });
  } catch (error) {
    console.error("Erro na rota create-preference:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota de feedback após pagamento
app.get("/mercadopago/feedback", async (req, res) => {
  const { payment_id, status, merchant_order_id, external_reference } = req.query;
  
  console.log("Feedback recebido:", { payment_id, status, merchant_order_id, external_reference });
  
  const frontendUrl = process.env.FRONTEND_URL || "https://www.brotherscup.com.br";
  const redirectUrl = `${frontendUrl}/payment-result?payment_id=${payment_id}&status=${status}&external_reference=${external_reference}`;
  
  res.redirect(redirectUrl);
});
app.get("/mercadopago/webhook", (req, res) => {
  console.log("✅ Requisição GET recebida no webhook. Retornando 200 OK para validação.");
  res.status(200).send("OK");
});
// Rota de webhook para notificações do Mercado Pago - ATUALIZADA
app.post("/mercadopago/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;
    
    console.log("🔔 Webhook recebido:", { type, data });
    
    if (type === "payment") {
      console.log("💳 Notificação de pagamento:", data.id);
      
      const payment = await paymentApi.get({ id: data.id });
      console.log("Detalhes do status do pagamento:", payment.status_detail);
      
      const paymentData = {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        currency_id: payment.currency_id,
        date_created: payment.date_created,
        date_approved: payment.date_approved,
        external_reference: payment.external_reference,
        payer: {
          email: payment.payer?.email,
          identification: payment.payer?.identification,
        },
      };
      
      console.log(`💰 Pagamento ${paymentData.id}: Status=${paymentData.status}, Valor=${paymentData.transaction_amount}`);
      
      try {
        await updatePaymentInPaymentPreferences(paymentData);
      } catch (error) {
        console.warn("Tabela payment_preferences não existe ou erro ao atualizar:", error.message);
      }
      
      const inscricao = await getInscricaoByExternalReference(paymentData.external_reference);

      if (inscricao) {
        await gerenciarVagasPorStatusPagamento(
          paymentData.external_reference,
          paymentData.status
        );

        await updateInscricaoPaymentStatus(
          inscricao.id,
          inscricao.preference_id,
          paymentData.id,
          paymentData.status
        );

        console.log(`✅ Inscrição ${inscricao.id} atualizada com status: ${paymentData.status}`);
      } else {
        console.warn(`⚠️  Inscrição não encontrada para external_reference: ${paymentData.external_reference}`);
      }
    }
    
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Erro na rota webhook:", error);
    res.status(500).send("Error");
  }
});

// Rota para consultar pagamento
app.get("/mercadopago/payment/:id", async (req, res) => {
  try {
    const payment = await paymentApi.get({ id: req.params.id });
    
    res.json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      transaction_amount: payment.transaction_amount,
      currency_id: payment.currency_id,
      date_created: payment.date_created,
      date_approved: payment.date_approved,
      external_reference: payment.external_reference,
      payer: {
        email: payment.payer?.email,
        identification: payment.payer?.identification,
      },
    });
  } catch (error) {
    console.error("Erro na rota payment:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ROTAS PROTEGIDAS (requerem autenticação)

// Rota para listar todas as inscrições (PROTEGIDA)
app.get("/inscricoes", authenticateToken, authorizeRoles(["admin", "editor", "viewer"]), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        representante, 
        parceiro, 
        instagram_representante, 
        instagram_parceiro, 
        uniforme_representante, 
        uniforme_parceiro, 
        ct_representante, 
        ct_parceiro, 
        categoria, 
        TO_CHAR(data_inscricao, 'YYYY-MM-DD HH24:MI:SS') as data_inscricao, 
        status_pagamento, 
        preference_id, 
        payment_id, 
        celular 
      FROM inscricoes 
      ORDER BY id DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar inscrições:", err);
    res.status(500).json({ message: "Erro ao buscar inscrições" });
  }
});

// Rota para listar pagamentos (protegida)
app.get("/mercadopago/payments", authenticateToken, async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = "SELECT * FROM payment_preferences WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += " ORDER BY created_at DESC";

    if (limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro na rota payments:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para excluir uma inscrição (PROTEGIDA - apenas admin)
app.delete("/inscricao/:id", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  const { id } = req.params;
  
  try {
    const checkResult = await pool.query("SELECT categoria, status_pagamento FROM inscricoes WHERE id = $1", [id]);
    
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: "Inscrição não encontrada" });
    }

    const { categoria, status_pagamento } = checkResult.rows[0];

    const deleteResult = await pool.query("DELETE FROM inscricoes WHERE id = $1", [id]);

    if (deleteResult.rowCount > 0) {
      if (status_pagamento === "approved") {
        await pool.query(
          `UPDATE categorias SET vagas_ocupadas = GREATEST(0, vagas_ocupadas - 1) WHERE nome = $1`,
          [categoria]
        );
        console.log(`Vaga liberada na categoria ${categoria} após exclusão da inscrição ${id}`);
      }
      res.status(200).json({ message: "Inscrição excluída com sucesso" });
    } else {
      res.status(404).json({ message: "Inscrição não encontrada" });
    }
  } catch (err) {
    console.error("Erro ao excluir inscrição:", err);
    res.status(500).json({ message: "Erro ao excluir inscrição" });
  }
});

// Rota para atualizar uma inscrição (PROTEGIDA - apenas admin ou editor)
app.put("/inscricao/:id", authenticateToken, authorizeRoles(["admin", "editor"]), async (req, res) => {
  const { id } = req.params;
  const { 
    representante, 
    parceiro, 
    instagramRepresentante, 
    instagramParceiro, 
    uniformeRepresentante, 
    uniformeParceiro, 
    categoria, 
    ctRepresentante, 
    ctParceiro,
    celular,
    status_pagamento
  } = req.body;

  try {
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (representante) { updateFields.push(`representante = $${paramCount++}`); updateValues.push(representante); }
    if (parceiro) { updateFields.push(`parceiro = $${paramCount++}`); updateValues.push(parceiro); }
    if (instagramRepresentante) { updateFields.push(`instagram_representante = $${paramCount++}`); updateValues.push(instagramRepresentante); }
    if (instagramParceiro) { updateFields.push(`instagram_parceiro = $${paramCount++}`); updateValues.push(instagramParceiro); }
    if (uniformeRepresentante) { updateFields.push(`uniforme_representante = $${paramCount++}`); updateValues.push(uniformeRepresentante); }
    if (uniformeParceiro) { updateFields.push(`uniforme_parceiro = $${paramCount++}`); updateValues.push(uniformeParceiro); }
    if (categoria) { updateFields.push(`categoria = $${paramCount++}`); updateValues.push(categoria); }
    if (ctRepresentante) { updateFields.push(`ct_representante = $${paramCount++}`); updateValues.push(ctRepresentante); }
    if (ctParceiro) { updateFields.push(`ct_parceiro = $${paramCount++}`); updateValues.push(ctParceiro); }
    if (celular) { updateFields.push(`celular = $${paramCount++}`); updateValues.push(celular); }

    if (status_pagamento) {
      const oldInscricaoResult = await pool.query(
        "SELECT status_pagamento, categoria FROM inscricoes WHERE id = $1",
        [id]
      );
      const oldStatus = oldInscricaoResult.rows[0]?.status_pagamento;
      const oldCategoria = oldInscricaoResult.rows[0]?.categoria;

      if (oldStatus !== status_pagamento) {
        await gerenciarVagasPorStatusPagamento(`inscricao_${id}`, status_pagamento, oldStatus);
      }
      updateFields.push(`status_pagamento = $${paramCount++}`); updateValues.push(status_pagamento);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Nenhum campo para atualizar" });
    }

    const query = `UPDATE inscricoes SET ${updateFields.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    updateValues.push(id);

    const result = await pool.query(query, updateValues);

    if (result.rowCount > 0) {
      res.status(200).json({ message: "Inscrição atualizada com sucesso", inscricao: result.rows[0] });
    } else {
      res.status(404).json({ message: "Inscrição não encontrada" });
    }
  } catch (err) {
    console.error("Erro ao atualizar inscrição:", err);
    res.status(500).json({ message: "Erro ao atualizar inscrição" });
  }
});

// Rota para listar todas as categorias (PROTEGIDA)
app.get("/categorias", authenticateToken, authorizeRoles(["admin", "editor", "viewer"]), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categorias ORDER BY nome");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    res.status(500).json({ message: "Erro ao buscar categorias" });
  }
});

// Rota para criar uma nova categoria (PROTEGIDA - apenas admin)
app.post("/categorias", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  const { nome, vagas_totais } = req.body;
  try {
    if (!nome || vagas_totais === undefined) {
      return res.status(400).json({ message: "Nome e vagas_totais são obrigatórios" });
    }
    const result = await pool.query(
      "INSERT INTO categorias (nome, vagas_totais, vagas_ocupadas) VALUES ($1, $2, 0) RETURNING *",
      [nome, vagas_totais]
    );
    res.status(201).json({ message: "Categoria criada com sucesso", categoria: result.rows[0] });
  } catch (err) {
    console.error("Erro ao criar categoria:", err);
    res.status(500).json({ message: "Erro ao criar categoria" });
  }
});

// Rota para atualizar uma categoria (PROTEGIDA - apenas admin ou editor)
app.put("/categorias/:nome", authenticateToken, authorizeRoles(["admin", "editor"]), async (req, res) => {
  const { nome } = req.params;
  const { vagas_totais, vagas_ocupadas } = req.body;
  try {
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (vagas_totais !== undefined) { updateFields.push(`vagas_totais = $${paramCount++}`); updateValues.push(vagas_totais); }
    if (vagas_ocupadas !== undefined) { updateFields.push(`vagas_ocupadas = $${paramCount++}`); updateValues.push(vagas_ocupadas); }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Nenhum campo para atualizar" });
    }

    const query = `UPDATE categorias SET ${updateFields.join(", ")} WHERE nome = $${paramCount} RETURNING *`;
    updateValues.push(nome);

    const result = await pool.query(query, updateValues);

    if (result.rowCount > 0) {
      res.status(200).json({ message: "Categoria atualizada com sucesso", categoria: result.rows[0] });
    } else {
      res.status(404).json({ message: "Categoria não encontrada" });
    }
  } catch (err) {
    console.error("Erro ao atualizar categoria:", err);
    res.status(500).json({ message: "Erro ao atualizar categoria" });
  }
});

// Rota para excluir uma categoria (PROTEGIDA - apenas admin)
app.delete("/categorias/:nome", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  const { nome } = req.params;
  try {
    const result = await pool.query("DELETE FROM categorias WHERE nome = $1", [nome]);
    if (result.rowCount > 0) {
      res.status(200).json({ message: "Categoria excluída com sucesso" });
    } else {
      res.status(404).json({ message: "Categoria não encontrada" });
    }
  } catch (err) {
    console.error("Erro ao excluir categoria:", err);
    res.status(500).json({ message: "Erro ao excluir categoria" });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo deu errado!");
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


