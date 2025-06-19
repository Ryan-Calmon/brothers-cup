const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago'); // Importa MercadoPagoConfig e outros módulos
require('dotenv').config(); // Para carregar variáveis de ambiente

const app = express();
const frontendURL = process.env.FRONTEND_URL;

// Configuração de CORS mais permissiva para resolver problemas de preflight
app.use(cors({
  origin: [frontendURL, 'https://www.brotherscup.com.br', 'http://localhost:3000'], // Múltiplas origens permitidas
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Para suporte a navegadores legados
}));

// Middleware adicional para lidar com preflight requests
app.options('*', cors());

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST, 
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Inicializa o cliente do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// Inicializa os objetos de API do Mercado Pago
const preference = new Preference(client);
const paymentApi = new Payment(client);

// Middleware para parsear JSON
app.use(bodyParser.json());

// Configurações de segurança
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // Hash da senha do admin

// Se não houver hash da senha definido, criar um hash padrão (APENAS PARA DESENVOLVIMENTO)
let adminPasswordHash = ADMIN_PASSWORD_HASH;
if (!adminPasswordHash) {
  console.warn('⚠️  AVISO: Usando senha padrão. MUDE EM PRODUÇÃO!');
  // Hash para a senha "admin123" - MUDE EM PRODUÇÃO
  adminPasswordHash = '$2b$10$rOOjq7O8J8J8J8J8J8J8JeJ8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8';
}

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
};

// Middleware de autorização baseado em papéis
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Acesso negado: você não tem permissão para realizar esta ação' 
      });
    }
    next();
  };
};

// Middleware de rate limiting simples para login
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

const rateLimitLogin = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (loginAttempts.has(ip)) {
    const attempts = loginAttempts.get(ip);
    if (attempts.count >= MAX_LOGIN_ATTEMPTS && (now - attempts.lastAttempt) < LOCKOUT_TIME) {
      return res.status(429).json({ 
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' 
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

// Função para buscar inscrição por external_reference
const getInscricaoByExternalReference = async (externalReference) => {
  try {
    const query = `
      SELECT id, preference_id
      FROM inscricoes
      WHERE external_reference = $1
    `;
    const result = await pool.query(query, [externalReference]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Erro ao buscar inscrição por external_reference:", error);
    return null;
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
app.post('/login', rateLimitLogin, async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    // Validação básica
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    }

    // Verificar credenciais
    if (username === ADMIN_USERNAME && await bcrypt.compare(password, adminPasswordHash)) {
      // Login bem-sucedido - limpar tentativas
      loginAttempts.delete(ip);
      
      // Gerar token JWT
      const token = jwt.sign(
        { 
          username: ADMIN_USERNAME, 
          role: 'admin',
          iat: Math.floor(Date.now() / 1000)
        }, 
        JWT_SECRET, 
        { expiresIn: '8h' } // Token expira em 8 horas
      );

      // Log de auditoria
      console.log(`✅ Login bem-sucedido: ${username} em ${new Date().toISOString()}`);

      return res.status(200).json({ 
        message: 'Login realizado com sucesso', 
        token,
        user: { username: ADMIN_USERNAME, role: 'admin' }
      });
    } else {
      // Login falhou - registrar tentativa
      const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
      attempts.count++;
      attempts.lastAttempt = Date.now();
      loginAttempts.set(ip, attempts);

      // Log de auditoria
      console.log(`❌ Tentativa de login falhada: ${username} de ${ip} em ${new Date().toISOString()}`);

      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para verificar se o token é válido
app.get('/verify-token', authenticateToken, (req, res) => {
  res.status(200).json({ 
    valid: true, 
    user: { username: req.user.username, role: req.user.role } 
  });
});

// ROTAS PÚBLICAS (sem autenticação)

// Rota para verificar se há vagas disponíveis na categoria
app.get('/vagas/:categoria', async (req, res) => {
  const categoria = req.params.categoria;

  try {
    const result = await pool.query(
      `SELECT vagas_totais, vagas_ocupadas FROM categorias WHERE nome = $1`,
      [categoria]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const { vagas_totais, vagas_ocupadas } = result.rows[0];
    const vagas_restantes = vagas_totais - vagas_ocupadas;

    res.status(200).json({ vagas: vagas_restantes });
  } catch (err) {
    console.error('Erro ao verificar vagas:', err);
    res.status(500).json({ message: 'Erro ao verificar vagas' });
  }
});

// Rota para criar a inscrição (pública) - INTEGRADA COM MERCADO PAGO
// Rota para criar a inscrição (pública) - INTEGRADA COM MERCADO PAGO
app.post('/inscricoes', async (req, res) => {
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
    valor_inscricao, // Valor da inscrição
    forma_pagamento // Forma de pagamento (pix ou cartao)
  } = req.body;

  try {
    // Validação básica
    if (!representante || !parceiro || !categoria || !celular) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }

    // Usar valor padrão se não fornecido
    const valorInscricao = valor_inscricao || 250;
    const formaPagamento = forma_pagamento || 'pix';

    console.log(`💰 Criando inscrição: Valor=${valorInscricao}, Forma=${formaPagamento}`);

    // Verificar se há vagas disponíveis
    const vagasRes = await pool.query(
      `SELECT vagas_totais, vagas_ocupadas FROM categorias WHERE nome = $1`,
      [categoria]
    );

    if (vagasRes.rowCount === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const { vagas_totais, vagas_ocupadas } = vagasRes.rows[0];
    if (vagas_ocupadas >= vagas_totais) {
      return res.status(400).json({ message: 'Não há mais vagas disponíveis para esta categoria.' });
    }

    // Inserir os dados da inscrição
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
        'pending' // Status inicial como pendente
      ]
    );

    const inscricaoId = result.rows[0].id;

    // Criar preferência de pagamento no Mercado Pago
    const baseUrl = process.env.BACKEND_URL;
    const externalRef = `inscricao_${inscricaoId}`;

    // Configurar métodos de pagamento baseado na forma selecionada
    let paymentMethods = {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: 12,
    };

    if (formaPagamento === 'pix') {
      // Para PIX: excluir cartões de crédito e débito
      paymentMethods.excluded_payment_types = [
        { id: "credit_card" },
        { id: "debit_card" },
        { id: "prepaid_card" }
      ];
      paymentMethods.installments = 1; // PIX não tem parcelamento
    } else if (formaPagamento === 'cartao') {
      // Para Cartão: excluir PIX e outros métodos
      paymentMethods.excluded_payment_types = [
        { id: "bank_transfer" }, // PIX
        { id: "ticket" }, // Boleto
        { id: "atm" }
      ];
    }

    const preferenceBody = {
      items: [
        {
          title: `Inscrição Brothers Cup - ${representante}`,
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

    console.log('🔧 Configuração de pagamento:', JSON.stringify(paymentMethods, null, 2));

    const mpResponse = await preference.create({ body: preferenceBody });

    // Salvar preferência na tabela payment_preferences (se existir)
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

    // Atualizar a inscrição com o preference_id
    await updateInscricaoPaymentStatus(
      inscricaoId,
      mpResponse.id,
      null, // payment_id será atualizado pelo webhook
      "pending"
    );

    // Atualizar o número de vagas ocupadas
    await pool.query(
      `UPDATE categorias SET vagas_ocupadas = vagas_ocupadas + 1 WHERE nome = $1`,
      [categoria]
    );

    console.log(`✅ Nova inscrição criada: ID ${inscricaoId} - ${representante}/${parceiro} - ${categoria} - ${formaPagamento.toUpperCase()} R$${valorInscricao}`);

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
    console.error('Erro ao salvar inscrição:', err);
    res.status(500).json({ message: 'Erro ao salvar inscrição' });
  }
});

// ROTAS DO MERCADO PAGO

// Rota para criar preferência de pagamento (genérica)
app.post('/mercadopago/create-preference', async (req, res) => {
  try {
    const { title, price, quantity, description, buyerInfo, externalReference, inscricaoId } = req.body;
    
    const baseUrl = process.env.BACKEND_URL;
    const externalRef = externalReference || `brothers_cup_order_${Date.now()}`;

    const preferenceBody = {
      items: [
        {
          title: title || 'Inscrição Brothers Cup',
          unit_price: parseFloat(price) || 250,
          quantity: parseInt(quantity) || 1,
          description: description || title || 'Inscrição Brothers Cup',
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

    // Adicionar informações do comprador se fornecidas
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
    
    // Salvar preferência na tabela payment_preferences (se existir)
    try {
      await savePreferenceToPaymentPreferences({
        preference_id: mpResponse.id,
        external_reference: externalRef,
        title: title || 'Inscrição Brothers Cup',
        amount: parseFloat(price) * parseInt(quantity || 1) || 250,
        status: "pending",
        created_at: new Date()
      });
    } catch (error) {
      console.warn("Tabela payment_preferences não existe ou erro ao salvar:", error.message);
    }

    // Atualizar a tabela 'inscricoes' se inscricaoId foi fornecido
    if (inscricaoId) {
      await updateInscricaoPaymentStatus(
        inscricaoId,
        mpResponse.id,
        null, // payment_id será atualizado pelo webhook
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
    console.error('Erro na rota create-preference:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de feedback após pagamento
app.get('/mercadopago/feedback', async (req, res) => {
  const { payment_id, status, merchant_order_id, external_reference } = req.query;
  
  console.log("Feedback recebido:", { payment_id, status, merchant_order_id, external_reference });
  
  // Redirecionar para o frontend com os parâmetros
  const frontendUrl = process.env.FRONTEND_URL;
  const redirectUrl = `${frontendUrl}/payment-result?payment_id=${payment_id}&status=${status}&external_reference=${external_reference}`;
  
  res.redirect(redirectUrl);
});

// Rota de webhook para notificações do Mercado Pago
app.post('/mercadopago/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    console.log("Webhook recebido:", { type, data });
    
    if (type === "payment") {
      console.log("Notificação de pagamento:", data.id);
      
      // Buscar detalhes completos do pagamento
      const payment = await paymentApi.get({ id: data.id });
      
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
      
      // Atualizar na tabela payment_preferences (se existir)
      try {
        await updatePaymentInPaymentPreferences(paymentData);
      } catch (error) {
        console.warn("Tabela payment_preferences não existe ou erro ao atualizar:", error.message);
      }
      
      // Buscar a inscrição associada via external_reference
      const inscricao = await getInscricaoByExternalReference(paymentData.external_reference);

      if (inscricao) {
        // Atualizar a tabela 'inscricoes'
        await updateInscricaoPaymentStatus(
          inscricao.id,
          inscricao.preference_id, // Mantém o preference_id existente
          paymentData.id,
          paymentData.status
        );
      } else {
        console.warn(`Inscrição não encontrada para external_reference: ${paymentData.external_reference}`);
      }
    }
    
    res.status(200).send("OK");
  } catch (error) {
    console.error('Erro na rota webhook:', error);
    res.status(500).send("Error");
  }
});

// Rota para consultar pagamento
app.get('/mercadopago/payment/:id', async (req, res) => {
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
    console.error('Erro na rota payment:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTAS PROTEGIDAS (requerem autenticação)

// Rota para listar todas as inscrições (PROTEGIDA)
app.get('/inscricoes', authenticateToken, authorizeRoles(['admin', 'editor', 'viewer']), async (req, res) => {
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
    console.error('Erro ao buscar inscrições:', err);
    res.status(500).json({ message: 'Erro ao buscar inscrições' });
  }
});

// Rota para listar pagamentos (protegida)
app.get('/mercadopago/payments', authenticateToken, async (req, res) => {
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
    console.error('Erro na rota payments:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para excluir uma inscrição (PROTEGIDA - apenas admin)
app.delete('/inscricao/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar se a inscrição existe e obter a categoria
    const checkResult = await pool.query('SELECT categoria FROM inscricoes WHERE id = $1', [id]);
    
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }

    const categoria = checkResult.rows[0].categoria;

    // Excluir a inscrição
    await pool.query('DELETE FROM inscricoes WHERE id = $1', [id]);
    
    // Decrementar vagas_ocupadas na categoria
    await pool.query(
      `UPDATE categorias SET vagas_ocupadas = vagas_ocupadas - 1 
       WHERE nome = $1 AND vagas_ocupadas > 0`,
      [categoria]
    );

    console.log(`🗑️  Inscrição excluída: ID ${id} - Categoria: ${categoria} - Por: ${req.user.username}`);

    res.status(200).json({ message: 'Inscrição excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir inscrição:', err);
    res.status(500).json({ message: 'Erro ao excluir inscrição' });
  }
});

// Rota para atualizar uma inscrição (PROTEGIDA - admin e editor)
app.put('/inscricao/:id', authenticateToken, authorizeRoles(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const { 
    representante, 
    parceiro, 
    instagramRepresentante, 
    instagramParceiro, 
    ctRepresentante, 
    ctParceiro, 
    categoria, 
    status_pagamento, 
    celular,
    uniformeRepresentante,
    uniformeParceiro
  } = req.body;

  try {
    // Validação básica
    if (!representante || !parceiro || !categoria) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }

    // Verificar se a inscrição existe
    const checkResult = await pool.query('SELECT categoria FROM inscricoes WHERE id = $1', [id]);
    
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }

    const categoriaAnterior = checkResult.rows[0].categoria;

    // Atualizar a inscrição
    const result = await pool.query(
      `UPDATE inscricoes 
       SET representante = $1, 
           parceiro = $2, 
           instagram_representante = $3, 
           instagram_parceiro = $4, 
           ct_representante = $5, 
           ct_parceiro = $6, 
           categoria = $7, 
           status_pagamento = $8, 
           celular = $9,
           uniforme_representante = $10,
           uniforme_parceiro = $11
       WHERE id = $12 
       RETURNING *`,
      [
        representante, 
        parceiro, 
        instagramRepresentante, 
        instagramParceiro, 
        ctRepresentante, 
        ctParceiro, 
        categoria, 
        status_pagamento, 
        celular,
        uniformeRepresentante,
        uniformeParceiro,
        id
      ]
    );

    // Se a categoria mudou, ajustar contadores
    if (categoriaAnterior !== categoria) {
      // Decrementar da categoria anterior
      await pool.query(
        `UPDATE categorias SET vagas_ocupadas = vagas_ocupadas - 1 
         WHERE nome = $1 AND vagas_ocupadas > 0`,
        [categoriaAnterior]
      );
      
      // Incrementar na nova categoria
      await pool.query(
        `UPDATE categorias SET vagas_ocupadas = vagas_ocupadas + 1 
         WHERE nome = $1`,
        [categoria]
      );
    }

    console.log(`✏️  Inscrição atualizada: ID ${id} - Por: ${req.user.username}`);

    res.status(200).json({ 
      message: 'Inscrição atualizada com sucesso', 
      inscricao: result.rows[0] 
    });
  } catch (err) {
    console.error('Erro ao atualizar inscrição:', err);
    res.status(500).json({ message: 'Erro ao atualizar inscrição' });
  }
});

// Rota para atualizar o status do pagamento (PROTEGIDA)
app.post('/atualizar_pagamento', authenticateToken, authorizeRoles(['admin', 'editor']), async (req, res) => {
  const { id, status_pagamento, preference_id, payment_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE inscricoes SET status_pagamento = $1, preference_id = $2, payment_id = $3 WHERE id = $4`,
      [status_pagamento, preference_id, payment_id, id]
    );

    if (result.rowCount > 0) {
      console.log(`💳 Pagamento atualizado: ID ${id} - Status: ${status_pagamento} - Por: ${req.user.username}`);
      res.status(200).json({ message: 'Pagamento atualizado com sucesso' });
    } else {
      res.status(404).json({ message: 'Inscrição não encontrada' });
    }
  } catch (err) {
    console.error('Erro ao atualizar pagamento:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔐 Modo de segurança: ${process.env.NODE_ENV || 'development'}`);
  console.log('🔗 Rotas do Mercado Pago disponíveis em /mercadopago/*');
  
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  AVISO: JWT_SECRET não definido. Use uma chave segura em produção!');
  }
  
  if (!process.env.ADMIN_PASSWORD_HASH) {
    console.warn('⚠️  AVISO: ADMIN_PASSWORD_HASH não definido. Defina uma senha segura em produção!');
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    console.warn('⚠️  ATENÇÃO: MP_ACCESS_TOKEN não está configurado!');
  } else {
    console.log('✅ Mercado Pago configurado com sucesso!');
  }

  if (!process.env.BACKEND_URL) {
    console.warn('⚠️  ATENÇÃO: BACKEND_URL não está configurado! Webhooks podem não funcionar.');
  } else {
    console.log(`🔗 Webhook URL configurada: ${process.env.BACKEND_URL}/mercadopago/webhook`);
  }
});

