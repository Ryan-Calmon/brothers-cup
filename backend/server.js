// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const app = express();
const PORT = 5000;

const MONGO_URI = 'mongodb+srv://ryancalmon05:M8v5Sy9lwhP5EsZD@cluster0.uk4qeos.mongodb.net/brotherscup?retryWrites=true&w=majority';

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

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

app.post("/create_preference", async (req, res) => {
  try {
    const { title, unit_price, quantity, inscricaoData } = req.body;
    const inscricaoId = await generateUniqueId();

    const tempInscricaoData = {
      ...inscricaoData,
      id: inscricaoId,
      statusPagamento: 'pendente',
    };

    let preferenceBody = {
      items: [
        {
          title: title,
          unit_price: Number(unit_price),
          quantity: Number(quantity),
        },
      ],
      back_urls: {
        success: "https://brothers-cup.vercel.app/sucesso?inscricaoId=${inscricaoId}",
        failure: "https://brothers-cup.vercel.app/falhou",
        pending: "https://brothers-cup.vercel.app/falhou"
      },
      auto_return: "all",
      metadata: {
        inscricao: tempInscricaoData
      },
      notification_url: "https://4797-2804-14d-5cb0-11d8-f4be-97c1-5d23-fad5.ngrok-free.app/webhook",
      payment_methods: {
    excluded_payment_types: [
      { id: "ticket" }, // Remove boleto
      { id: "atm" }     // Remove pagamento em lotérica
    ],
    installments: 1     // Só permite pagamento em 1x
  }
    };


   

    const response = await preferenceService.create({ body: preferenceBody });

    const novaInscricao = new Inscricao({
      ...tempInscricaoData,
      preferenceId: response.id,
    });
    await novaInscricao.save();

    res.json({
      id: response.id,
      sandbox_init_point: response.sandbox_init_point,
      init_point: response.init_point,
      inscricaoId: inscricaoId
    });
  } catch (error) {
    console.error("Erro detalhado ao criar preferência de pagamento:", error);
    res.status(500).json({ message: "Erro ao criar preferência de pagamento." });
  }
});

app.post('/inscricao', async (req, res) => {
  try {
    const categoria = req.body.categoria;
    let limiteVagas = 16;
    if (categoria === "Escolinha") limiteVagas = 24;

    const totalInscricoes = await Inscricao.countDocuments({ categoria, statusPagamento: 'aprovado' });
    if (totalInscricoes >= limiteVagas) {
      return res.status(400).json({ message: 'Não há mais vagas nesta categoria.' });
    }
    res.status(200).json({ message: 'Vagas disponíveis. Prossiga para o pagamento.' });
  } catch (err) {
    console.error('Erro ao verificar vagas para inscrição:', err);
    res.status(500).json({ message: 'Erro ao verificar vagas para inscrição.' });
  }
});

app.post("/webhook", async (req, res) => {
  try {
    const payment_id = req.query["data.id"] || (req.body.data && req.body.data.id);
    const type = req.query.type || req.body.type;

    if (type === "payment") {
      const paymentInfo = await paymentService.get({ id: payment_id });
      console.log("Webhook - Informações do Pagamento:", paymentInfo.body);

      const paymentStatus = paymentInfo.body.status;
      const preferenceIdFromPayment = paymentInfo.body.external_reference;
      const inscricaoDataFromMetadata = paymentInfo.body.metadata ? paymentInfo.body.metadata.inscricao : null;

      if (paymentStatus === 'approved') {
        let inscricaoExistente = await Inscricao.findOne({ preferenceId: preferenceIdFromPayment });

        if (!inscricaoExistente && inscricaoDataFromMetadata) {
          inscricaoExistente = new Inscricao({
            ...inscricaoDataFromMetadata,
            statusPagamento: 'aprovado',
            preferenceId: preferenceIdFromPayment,
            paymentId: payment_id,
          });
          await inscricaoExistente.save();
          console.log("Inscrição salva via webhook com sucesso!");
        } else if (inscricaoExistente) {
          inscricaoExistente.statusPagamento = 'aprovado';
          inscricaoExistente.paymentId = payment_id;
          await inscricaoExistente.save();
          console.log("Status da inscrição atualizado para aprovado via webhook!");
        }
      } else {
        console.log(`Pagamento ${payment_id} com status: ${paymentStatus}. Inscrição não aprovada.`);
      }
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    res.status(500).json({ message: "Erro ao processar webhook." });
  }
});

app.get('/inscricoes', async (req, res) => {
  try {
    const todas = await Inscricao.find();
    res.json(todas);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar inscrições.' });
  }
});

app.get('/vagas/:categoria', async (req, res) => {
  const { categoria } = req.params;
  let limiteVagas = categoria === "Escolinha" ? 24 : 16;
  try {
    const totalInscricoes = await Inscricao.countDocuments({ categoria });
    const vagasRestantes = Math.max(0, limiteVagas - totalInscricoes);
    res.json({ categoria, vagas: vagasRestantes });
  } catch (err) {
    console.error('Erro ao verificar vagas:', err);
    res.status(500).json({ message: 'Erro ao verificar vagas.' });
  }
});

app.delete('/inscricao/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedInscricao = await Inscricao.findByIdAndDelete(id);
    if (!deletedInscricao) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    res.status(200).json({ message: 'Inscrição excluída com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir inscrição:', err);
    res.status(500).json({ message: 'Erro ao excluir inscrição.' });
  }
});

app.put('/inscricao/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  try {
    const updatedInscricao = await Inscricao.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedInscricao) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    res.status(200).json(updatedInscricao);
  } catch (err) {
    console.error('Erro ao editar inscrição:', err);
    res.status(500).json({ message: 'Erro ao editar inscrição.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
