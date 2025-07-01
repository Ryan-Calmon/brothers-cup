const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
require("dotenv").config();

const app = express();
const frontendURL = process.env.FRONTEND_URL;
const serverStartTime = new Date();

app.use(helmet());
app.use(cors({
  origin: [frontendURL,],
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

// ROTA DE STATUS DO SERVIDOR (NOVA)
app.get("/status", async (req, res) => {
  try {
    const now = new Date();
    const uptime = Math.floor((now - serverStartTime) / 1000); // uptime em segundos
    
    // Testar conexão com o banco de dados
    let dbStatus = "offline";
    let dbLatency = null;
    
    try {
      const dbStart = Date.now();
      await pool.query("SELECT 1");
      dbLatency = Date.now() - dbStart;
      dbStatus = "online";
    } catch (dbError) {
      console.error("Erro ao conectar com o banco:", dbError);
    }

    const status = {
      status: "online",
      timestamp: now.toISOString(),
      uptime: uptime,
      uptimeFormatted: formatUptime(uptime),
      database: {
        status: dbStatus,
        latency: dbLatency ? `${dbLatency}ms` : null
      },
      server: {
        startTime: serverStartTime.toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0"
      }
    };

    res.status(200).json(status);
  } catch (error) {
    console.error("Erro ao obter status do servidor:", error);
    res.status(500).json({
      status: "error",
      message: "Erro interno do servidor",
      timestamp: new Date().toISOString()
    });
  }
});

// Função auxiliar para formatar uptime
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
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
      paymentMethods.installments = 1; 
    }

    const preferenceBody = {
      items: [
        {
          title: `Inscrição Brothers Cup - ${representante} e ${parceiro} - Categoria: ${categoria} `,
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
      message: "Inscrição criada com sucesso! Complete o pagamento para confirmar.",
    });

  } catch (err) {
    console.error("Erro ao criar inscrição:", err);
    res.status(500).json({ message: "Erro ao criar inscrição" });
  }
});

// Webhook do Mercado Pago
app.post("/mercadopago/webhook", async (req, res) => {
  console.log("🔔 Webhook recebido:", JSON.stringify(req.body, null, 2));

  try {
    const { type, data } = req.body;

    if (type === "payment") {
      const paymentId = data.id;
      console.log(`💳 Processando pagamento: ${paymentId}`);

      const payment = await paymentApi.get({ id: paymentId });
      const paymentData = payment;

      console.log(`📊 Dados do pagamento:`, JSON.stringify(paymentData, null, 2));

      if (paymentData.external_reference) {
        const inscricao = await getInscricaoByExternalReference(paymentData.external_reference);
        
        if (inscricao) {
          let novoStatus = "pending";
          
          switch (paymentData.status) {
            case "approved":
              novoStatus = "approved";
              break;
            case "pending":
              novoStatus = "pending";
              break;
            case "in_process":
              novoStatus = "pending";
              break;
            case "rejected":
            case "cancelled":
              novoStatus = "rejected";
              break;
            default:
              novoStatus = "pending";
          }

          console.log(`🔄 Atualizando status: ${paymentData.status} → ${novoStatus}`);

          await gerenciarVagasPorStatusPagamento(
            paymentData.external_reference,
            novoStatus
          );

          await updateInscricaoPaymentStatus(
            inscricao.id,
            inscricao.preference_id,
            paymentId,
            novoStatus
          );

          try {
            await updatePaymentInPaymentPreferences(paymentData);
          } catch (error) {
            console.warn("Erro ao atualizar payment_preferences:", error.message);
          }

          console.log(`✅ Pagamento processado: ID ${paymentId} - Status: ${novoStatus}`);
        } else {
          console.warn(`⚠️ Inscrição não encontrada para external_reference: ${paymentData.external_reference}`);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ROTAS PROTEGIDAS (requerem autenticação)

// Rota para buscar todas as inscrições (protegida)
app.get("/inscricoes", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM inscricoes ORDER BY data_inscricao DESC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar inscrições:", err);
    res.status(500).json({ message: "Erro ao buscar inscrições" });
  }
});

// Rota para atualizar uma inscrição (protegida)
app.put("/inscricao/:id", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  const { id } = req.params;
  const {
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
  } = req.body;

  try {
    if (!representante || !parceiro || !categoria) {
      return res.status(400).json({ message: "Campos obrigatórios ausentes" });
    }

    // Buscar o status atual antes da atualização
    const currentResult = await pool.query(
      "SELECT categoria, status_pagamento FROM inscricoes WHERE id = $1",
      [id]
    );

    if (currentResult.rowCount === 0) {
      return res.status(404).json({ message: "Inscrição não encontrada" });
    }

    const currentData = currentResult.rows[0];
    const statusAnterior = currentData.status_pagamento;
    const categoriaAnterior = currentData.categoria;

    // Atualizar a inscrição
    const result = await pool.query(
      `UPDATE inscricoes SET 
        representante = $1,
        parceiro = $2,
        instagram_representante = $3,
        instagram_parceiro = $4,
        uniforme_representante = $5,
        uniforme_parceiro = $6,
        categoria = $7,
        ct_representante = $8,
        ct_parceiro = $9,
        celular = $10,
        status_pagamento = $11
      WHERE id = $12
      RETURNING *`,
      [
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
        status_pagamento,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Inscrição não encontrada" });
    }

    // Gerenciar vagas se houve mudança de status ou categoria
    if (statusAnterior !== status_pagamento || categoriaAnterior !== categoria) {
      // Se mudou de categoria, liberar vaga da categoria anterior
      if (categoriaAnterior !== categoria && statusAnterior === "approved") {
        await pool.query(
          `UPDATE categorias 
           SET vagas_ocupadas = GREATEST(0, vagas_ocupadas - 1) 
           WHERE nome = $1`,
          [categoriaAnterior]
        );
      }

      // Gerenciar vaga na categoria atual
      let incrementoVagas = 0;
      if (statusAnterior !== "approved" && status_pagamento === "approved") {
        incrementoVagas = 1; // Ocupar vaga
      } else if (statusAnterior === "approved" && status_pagamento !== "approved") {
        incrementoVagas = -1; // Liberar vaga
      }

      if (incrementoVagas !== 0) {
        await pool.query(
          `UPDATE categorias 
           SET vagas_ocupadas = GREATEST(0, vagas_ocupadas + $1) 
           WHERE nome = $2`,
          [incrementoVagas, categoria]
        );
      }
    }

    console.log(`✏️ Inscrição ${id} atualizada pelo admin: ${req.user.username}`);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar inscrição:", err);
    res.status(500).json({ message: "Erro ao atualizar inscrição" });
  }
});

// Rota para excluir uma inscrição (protegida)
app.delete("/inscricao/:id", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar dados da inscrição antes de excluir
    const inscricaoResult = await pool.query(
      "SELECT categoria, status_pagamento FROM inscricoes WHERE id = $1",
      [id]
    );

    if (inscricaoResult.rowCount === 0) {
      return res.status(404).json({ message: "Inscrição não encontrada" });
    }

    const { categoria, status_pagamento } = inscricaoResult.rows[0];

    // Excluir a inscrição
    const result = await pool.query("DELETE FROM inscricoes WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Inscrição não encontrada" });
    }

    // Se a inscrição estava aprovada, liberar a vaga
    if (status_pagamento === "approved") {
      await pool.query(
        `UPDATE categorias 
         SET vagas_ocupadas = GREATEST(0, vagas_ocupadas - 1) 
         WHERE nome = $1`,
        [categoria]
      );
      console.log(`🔓 Vaga liberada na categoria ${categoria} após exclusão`);
    }

    console.log(`🗑️ Inscrição ${id} excluída pelo admin: ${req.user.username}`);
    res.status(200).json({ message: "Inscrição excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir inscrição:", err);
    res.status(500).json({ message: "Erro ao excluir inscrição" });
  }
});

// Rota para buscar categorias (protegida)
app.get("/categorias", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT nome, vagas_totais, vagas_ocupadas, 
       (vagas_totais - vagas_ocupadas) as vagas_restantes 
       FROM categorias ORDER BY nome`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    res.status(500).json({ message: "Erro ao buscar categorias" });
  }
});
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📅 Servidor iniciado em: ${serverStartTime.toISOString()}`);
});

