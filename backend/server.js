const express = require('express');
const { Pool } = require('pg'); // Cliente PostgreSQL
const bodyParser = require('body-parser');
const app = express();

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  user: 'postgres', // Coloque seu usuário do PostgreSQL
  host: 'localhost',
  database: 'brothers_cup', // Nome do banco de dados
  password: 'Ryan04052005#', // Coloque a sua senha do PostgreSQL
  port: 5432,
});

// Middleware para parsear JSON
app.use(bodyParser.json());

// Rota para verificar se há vagas disponíveis na categoria
app.get('/vagas/:categoria', async (req, res) => {
  const categoria = req.params.categoria;

  try {
    // Consulta o número de vagas ocupadas e totais da categoria
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

// Rota para criar a inscrição
app.post('/inscricao', async (req, res) => {
  const { representante, parceiro, instagramRepresentante, instagramParceiro, uniformeRepresentante, uniformeParceiro, categoria, ctRepresentante, ctParceiro } = req.body;

  try {
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
      `INSERT INTO inscricoes (representante, parceiro, instagram_representante, instagram_parceiro, uniforme_representante, uniforme_parceiro, categoria, ct_representante, ct_parceiro) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [representante, parceiro, instagramRepresentante, instagramParceiro, uniformeRepresentante, uniformeParceiro, categoria, ctRepresentante, ctParceiro]
    );

    const idInscricao = result.rows[0].id;

    // Atualizar o número de vagas ocupadas
    await pool.query(
      `UPDATE categorias SET vagas_ocupadas = vagas_ocupadas + 1 WHERE nome = $1`,
      [categoria]
    );

    res.status(200).json({ id: idInscricao });
  } catch (err) {
    console.error('Erro ao salvar inscrição:', err);
    res.status(500).json({ message: 'Erro ao salvar inscrição' });
  }
});

// Rota para atualizar o status do pagamento
app.post('/atualizar_pagamento', async (req, res) => {
  const { id, status_pagamento, preference_id, payment_id } = req.body;

  try {
    // SQL para atualizar o status de pagamento da inscrição
    const result = await pool.query(
      `UPDATE inscricoes SET status_pagamento = $1, preference_id = $2, payment_id = $3 WHERE id = $4`,
      [status_pagamento, preference_id, payment_id, id]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Pagamento atualizado com sucesso' });
    } else {
      res.status(404).json({ message: 'Inscrição não encontrada' });
    }
  } catch (err) {
    console.error('Erro ao atualizar pagamento:', err);
    res.status(500).json({ message: 'Erro ao atualizar pagamento' });
  }
});

app.listen(5000, () => {
  console.log('Servidor rodando na porta 5000');
});
