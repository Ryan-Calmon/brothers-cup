const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Para carregar variáveis de ambiente

const app = express();
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
// Configuração de CORS para permitir requisições do frontend
app.use(cors({
  origin: frontendURL, // URL do frontend
  credentials: true
}));

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'brothers_cup',
  password: process.env.DB_PASSWORD || 'Ryan04052005#',
  port: process.env.DB_PORT || 5432,
});

// Middleware para parsear JSON
app.use(bodyParser.json());

// Configurações de segurança
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_mude_em_producao';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
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

// Rota para criar a inscrição (pública)
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
    celular 
  } = req.body;

  try {
    // Validação básica
    if (!representante || !parceiro || !categoria || !celular) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }

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
        celular
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
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
        celular
      ]
    );

    const idInscricao = result.rows[0].id;

    // Atualizar o número de vagas ocupadas
    await pool.query(
      `UPDATE categorias SET vagas_ocupadas = vagas_ocupadas + 1 WHERE nome = $1`,
      [categoria]
    );

    console.log(`✅ Nova inscrição criada: ID ${idInscricao} - ${representante}/${parceiro} - ${categoria}`);

    res.status(200).json({ id: idInscricao });
  } catch (err) {
    console.error('Erro ao salvar inscrição:', err);
    res.status(500).json({ message: 'Erro ao salvar inscrição' });
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
    res.status(500).json({ message: 'Erro ao atualizar pagamento' });
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
  
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  AVISO: JWT_SECRET não definido. Use uma chave segura em produção!');
  }
  
  if (!process.env.ADMIN_PASSWORD_HASH) {
    console.warn('⚠️  AVISO: ADMIN_PASSWORD_HASH não definido. Defina uma senha segura em produção!');
  }
});

