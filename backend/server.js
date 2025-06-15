require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas'))
.catch(err => console.error('Erro ao conectar ao MongoDB Atlas:', err));

app.use(cors());

app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  const signature = req.headers['x-signature'];
  const webhookId = req.headers['x-id'];
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!signature || !webhookId || !secret) {
    console.warn('Webhook: Cabeçalhos de assinatura ou segredo não encontrados.');
    return res.status(400).send('Bad Request: Missing signature headers or secret.');
  }

  const [algorithm, hash] = signature.split('=');
  if (algorithm !== 'sha256') {
    console.warn('Webhook: Algoritmo de assinatura não suportado.');
    return res.status(400).send('Bad Request: Unsupported signature algorithm.');
  }

  const payload = `${webhookId}${req.body.toString()}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedHash = hmac.digest('hex');

  if (expectedHash !== hash) {
    console.warn('Webhook: Assinatura inválida.');
    return res.status(401).send('Unauthorized: Invalid signature.');
  }

  try {
    req.body = JSON.parse(req.body.toString());
  } catch (e) {
    console.error('Webhook: Erro ao parsear corpo JSON:', e);
    return res.status(400).send('Bad Request: Invalid JSON body.');
  }

  next();
});

const inscricaoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  representante: String,
  celular: String,
  parceiro: String,
  instagramRepresentante: String,
  instagramParceiro: String,
  uniformeRepresentante: String,
  uniformeParceiro: String,
  ctRepresentante: String,
  ctParceiro: String,
  categoria: String,
  segundaInscricao: { type: Boolean, default: false },
  statusPagamento: { type: String, default: 'pendente' },
  preferenceId: String,
  paymentId: String,
}, { timestamps: true });

const Inscricao = mongoose.model('Inscricao', inscricaoSchema);

const generateUniqueId = async () => {
  let id;
  let exists = true;
  while (exists) {
    id = Math.floor(Math.random() * 10000);
    const existing = await Inscricao.findOne({ id });
    exists = existing !== null;
  }
  return id;
};

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const preferenceService = new Preference(client);
const paymentService = new Payment(client);

app.get('/vagas/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    const totalVagas = 10;
    const inscricoesConfirmadas = await Inscricao.countDocuments({
      categoria: categoria,
      statusPagamento: 'aprovado'
    });
    const vagasRestantes = totalVagas - inscricoesConfirmadas;
    res.json({ vagas: vagasRestantes > 0 ? vagasRestantes : 0 });
  } catch (error) {
    console.error('Erro ao verificar vagas:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao verificar vagas.' });
  }
});

app.post('/create_preference', async (req, res) => {
  try {
    const { title, unit_price, quantity, inscricaoData, formaPagamento } = req.body;
    const inscricaoId = await generateUniqueId();

    const tempInscricaoData = {
      ...inscricaoData,
      id: inscricaoId,
      statusPagamento: 'pendente',
    };

    let payment_methods;

    if (formaPagamento === 'pix') {
      payment_methods = {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'ticket' },
          { id: 'atm' },
        ],
      };
    } else if (formaPagamento === 'cartao') {
      payment_methods = {
        excluded_payment_types: [
          { id: 'pix' },
          { id: 'ticket' },
          { id: 'atm' },
        ],
        installments: 1,
      };
    }

    let preferenceBody = {
      items: [
        {
          title: title,
          unit_price: Number(unit_price),
          quantity: Number(quantity),
        },
      ],
      back_urls: {
        success: process.env.FRONTEND_URL + '/sucesso?inscricaoId=' + inscricaoId,
        failure: process.env.FRONTEND_URL + '/falhou',
        pending: process.env.FRONTEND_URL + '/falhou',
      },
      auto_return: 'all',
      metadata: {
        inscricao: tempInscricaoData
      },
      notification_url: process.env.BACKEND_URL + '/webhook',
      payment_methods: payment_methods
    };

    console.log('Corpo da Preferência enviado ao Mercado Pago:', JSON.stringify(preferenceBody, null, 2));

    const response = await preferenceService.create({ body: preferenceBody });

    console.log('Resposta completa do Mercado Pago:', JSON.stringify(response, null, 2));

    const novaInscricao = new Inscricao({
      ...tempInscricaoData,
      preferenceId: response.id,
    });
    await novaInscricao.save();

    res.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      inscricaoId: inscricaoId
    });
  } catch (error) {
    console.error('Erro detalhado ao criar preferência de pagamento:', error);
    res.status(500).json({ message: 'Erro ao criar preferência de pagamento.' });
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      const payment = await paymentService.get({ id: paymentId });

      if (payment.status === 'approved') {
        const preferenceId = payment.external_reference || (payment.metadata ? payment.metadata.inscricao.preferenceId : null);
        const inscricaoDataFromMetadata = payment.metadata ? payment.metadata.inscricao : null;

        if (inscricaoDataFromMetadata) {
          let inscricao;
          if (preferenceId) {
            inscricao = await Inscricao.findOne({ preferenceId: preferenceId });
          } else if (inscricaoDataFromMetadata.id) {
            inscricao = await Inscricao.findOne({ id: inscricaoDataFromMetadata.id });
          }

          if (!inscricao) {
            inscricao = new Inscricao({
              ...inscricaoDataFromMetadata,
              statusPagamento: 'aprovado',
              preferenceId: preferenceId || inscricaoDataFromMetadata.preferenceId,
              paymentId: paymentId,
            });
            await inscricao.save();
            console.log('Inscrição salva no banco de dados após pagamento aprovado:', inscricao);
          } else {
            inscricao.statusPagamento = 'aprovado';
            inscricao.paymentId = paymentId;
            await inscricao.save();
            console.log('Status da inscrição atualizado para aprovado:', inscricao);
          }
        } else {
          console.warn('Webhook recebido, pagamento aprovado, mas metadata de inscrição não encontrado.');
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    res.status(500).send('Erro interno do servidor no webhook.');
  }
});

app.post('/inscricao', async (req, res) => {
  try {
    const { categoria } = req.body;
    const totalVagas = 10;
    const inscricoesConfirmadas = await Inscricao.countDocuments({
      categoria: categoria,
      statusPagamento: 'aprovado'
    });
    const vagasRestantes = totalVagas - inscricoesConfirmadas;

    if (vagasRestantes <= 0) {
      return res.status(400).json({ message: 'Não há vagas disponíveis para esta categoria.' });
    }

    res.status(200).json({ message: 'Vagas disponíveis. Prossiga para o pagamento.' });
  } catch (error) {
    console.error('Erro ao verificar inscrição:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao verificar inscrição.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
