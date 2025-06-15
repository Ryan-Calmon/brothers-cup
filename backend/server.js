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
          { id: "credit_card" },
          { id: "ticket" },
          { id: "atm" },
        ],
      };
    } else if (formaPagamento === 'cartao') {
      payment_methods = {
        excluded_payment_types: [
          { id: "pix" },
          { id: "ticket" },
          { id: "atm" },
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
        success: "https://brothers-cup.vercel.app/sucesso?inscricaoId=${inscricaoId}",
        failure: "https://brothers-cup.vercel.app/falhou",
        pending: "https://brothers-cup.vercel.app/falhou"
      },
      auto_return: "all",
      metadata: {
        inscricao: tempInscricaoData
      },
      notification_url: "https://brotherscup.com.br/webhook",
      payment_methods: payment_methods
    };

    const response = await preferenceService.create({ body: preferenceBody });

    const novaInscricao = new Inscricao({
      ...tempInscricaoData,
      preferenceId: response.id,
    });
    await novaInscricao.save();

    res.json({
      id: response.id,
      init_point: response.init_point,
      inscricaoId: inscricaoId
    });
  } catch (error) {
    console.error("Erro detalhado ao criar preferência de pagamento:", error);
    res.status(500).json({ message: "Erro ao criar preferência de pagamento." });
  }
});
