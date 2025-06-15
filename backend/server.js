require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const crypto = require("crypto"); // Módulo para criptografia

const app = express();
const PORT = process.env.PORT || 5000;

// *** LOG PARA DEPURAR O SEGREDO DO WEBHOOK ***
console.log("MERCADOPAGO_WEBHOOK_SECRET carregado:", process.env.MERCADOPAGO_WEBHOOK_SECRET);

// Conexão com o MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado ao MongoDB Atlas"))
.catch(err => console.error("Erro ao conectar ao MongoDB Atlas:", err));

// Middleware para CORS
app.use(cors());

// Middleware para o webhook, que lê o corpo RAW e depois o parseia
// ESTE DEVE VIR ANTES DE QUALQUER OUTRO BODY PARSER PARA /webhook
app.use("/webhook", express.raw({ type: "application/json" }), (req, res, next) => {
  // Validação da assinatura secreta
  const signature = req.headers["x-signature"];
  const webhookId = req.headers["x-request-id"];
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  // *** LOGS PARA DEPURAR OS CABEÇALHOS E O SEGREDO ***
  console.log("Webhook Headers:", req.headers);
  console.log("Webhook X-Signature Header:", signature);
  console.log("Webhook X-Request-ID Header:", webhookId);
  console.log("Webhook Secret (do .env):", secret);

  if (!signature || !webhookId || !secret) {
    console.warn("Webhook: Cabeçalhos de assinatura (x-signature, x-request-id) ou segredo (MERCADOPAGO_WEBHOOK_SECRET) não encontrados.");
    return res.status(400).send("Bad Request: Missing signature headers or secret.");
  }

  let receivedHash = null;
  let timestamp = null;
  const signatureParts = signature.split(","); // Dividir por vírgula literal
  console.log("Signature Parts:", signatureParts); // NOVO LOG
  for (const part of signatureParts) {
    const trimmedPart = part.trim(); // NOVO: Remover espaços em branco
    console.log("Processing part:", trimmedPart); // NOVO LOG
    if (trimmedPart.startsWith("v1=")) { // Procurar por v1= literal
      receivedHash = trimmedPart.substring(3); // Extrair o hash após v1=
    } else if (trimmedPart.startsWith("ts=")) { // Procurar por ts= literal
      timestamp = trimmedPart.substring(3); // Extrair o timestamp após ts=
    }
  }

  if (!receivedHash || !timestamp) {
    console.warn("Webhook: Hash v1 ou timestamp não encontrados na assinatura.");
    return res.status(400).send("Bad Request: Missing v1 hash or timestamp in signature.");
  }

  // O algoritmo para v1 é sempre SHA-256
  const algorithm = "sha256";
  const hash = receivedHash;

  // Converte o corpo da requisição para string, remove espaços em branco e converte de volta para Buffer
  const requestBodyString = req.body.toString().trim();
  const requestBodyBuffer = Buffer.from(requestBodyString);

  // Concatena o timestamp, webhookId e o corpo da requisição (agora limpo) para o payload
  const payload = Buffer.concat([
    Buffer.from(timestamp),
    Buffer.from(webhookId),
    requestBodyBuffer
  ]);

  console.log("Payload (hex):", payload.toString("hex")); // NOVO LOG: Conteúdo do payload em hexadecimal

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedHash = hmac.digest("hex");

  // *** NOVOS LOGS PARA DEPURAR O CÁLCULO DO HMAC ***
  console.log("Webhook Assinatura Esperada:", expectedHash);
  console.log("Webhook Assinatura Recebida:", hash);

  if (expectedHash !== hash) {
    console.warn("Webhook: Assinatura inválida.");
    return res.status(401).send("Unauthorized: Invalid signature.");
  }

  // Se a assinatura for válida, parseia o corpo RAW para JSON
  try {
    req.body = JSON.parse(requestBodyString); // Usa o corpo limpo para parsear JSON
  } catch (e) {
    console.error("Webhook: Erro ao parsear corpo JSON:", e);
    return res.status(400).send("Bad Request: Invalid JSON body.");
  }

  next();
});

// Middleware para parsear JSON para TODAS AS OUTRAS ROTAS
// Este deve vir DEPOIS do middleware do webhook para garantir que o webhook receba o corpo RAW
app.use(express.json());

// Esquema e Modelo de Inscrição
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
  statusPagamento: { type: String, default: "pendente" },
  preferenceId: String,
  paymentId: String,
}, { timestamps: true });

const Inscricao = mongoose.model("Inscricao", inscricaoSchema);

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

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const preferenceService = new Preference(client);
const paymentService = new Payment(client);

// Rotas

// Rota para verificar vagas disponíveis
app.get("/vagas/:categoria", async (req, res) => {
  try {
    const { categoria } = req.params;
    const totalVagas = 10; // Exemplo: total de vagas por categoria
    const inscricoesConfirmadas = await Inscricao.countDocuments({
      categoria: categoria,
      statusPagamento: "aprovado"
    });
    const vagasRestantes = totalVagas - inscricoesConfirmadas;
    res.json({ vagas: vagasRestantes > 0 ? vagasRestantes : 0 });
  } catch (error) {
    console.error("Erro ao verificar vagas:", error);
    res.status(500).json({ message: "Erro interno do servidor ao verificar vagas." });
  }
});

// Rota para criar preferência de pagamento (agora não salva a inscrição no DB)
app.post("/create_preference", async (req, res) => {
  try {
    const { title, unit_price, quantity, inscricaoData, formaPagamento } = req.body;
    const inscricaoId = await generateUniqueId();

    const tempInscricaoData = {
      ...inscricaoData,
      id: inscricaoId,
      statusPagamento: "pendente",
    };

    let payment_methods;

    if (formaPagamento === "pix") {
      payment_methods = {
        excluded_payment_types: [
          { id: "credit_card" },
          { id: "ticket" },
          { id: "atm" },
        ],
      };
    } else if (formaPagamento === "cartao") {
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
        success: process.env.FRONTEND_URL + "/sucesso?inscricaoId=" + inscricaoId,
        failure: process.env.FRONTEND_URL + "/falhou",
        pending: process.env.FRONTEND_URL + "/falhou",
      },
      auto_return: "all",
      metadata: {
        inscricao: tempInscricaoData
      },
      notification_url: process.env.BACKEND_URL + "/webhook", // Sua URL de webhook real
      payment_methods: payment_methods
    };

    console.log("Corpo da Preferência enviado ao Mercado Pago:", JSON.stringify(preferenceBody, null, 2));

    const response = await preferenceService.create({ body: preferenceBody });

    console.log("Resposta completa do Mercado Pago:", JSON.stringify(response, null, 2));

    const novaInscricao = new Inscricao({
      ...tempInscricaoData,
      preferenceId: response.id,
    });
    await novaInscricao.save();

    res.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point, // Adicionado sandbox_init_point
      inscricaoId: inscricaoId
    });
  } catch (error) {
    console.error("Erro detalhado ao criar preferência de pagamento:", error);
    res.status(500).json({ message: "Erro ao criar preferência de pagamento." });
  }
});

// Rota para webhook do Mercado Pago (recebe notificações de pagamento)
app.post("/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "payment") {
      const paymentId = data.id;
      const payment = await paymentService.get({ id: paymentId });

      if (payment.status === "approved") {
        // O external_reference é o preferenceId que você pode ter definido
        // Se não for definido, o metadata.inscricao.id pode ser usado
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
            // Se não encontrou, cria uma nova inscrição com os dados do metadata
            inscricao = new Inscricao({
              ...inscricaoDataFromMetadata,
              statusPagamento: "aprovado",
              preferenceId: preferenceId || inscricaoDataFromMetadata.preferenceId, // Garante que preferenceId seja salvo
              paymentId: paymentId,
            });
            await inscricao.save();
            console.log("Inscrição salva no banco de dados após pagamento aprovado:", inscricao);
          } else {
            // Se encontrou, atualiza o status e o paymentId
            inscricao.statusPagamento = "aprovado";
            inscricao.paymentId = paymentId;
            await inscricao.save();
            console.log("Status da inscrição atualizado para aprovado:", inscricao);
          }
        } else {
          console.warn("Webhook recebido, pagamento aprovado, mas metadata de inscrição não encontrado.");
        }
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Erro no webhook do Mercado Pago:", error);
    res.status(500).send("Erro interno do servidor no webhook.");
  }
});

// Rota para verificar e salvar inscrição (apenas para testes de vagas, não salva no DB)
app.post("/inscricao", async (req, res) => {
  try {
    const { categoria } = req.body;
    const totalVagas = 10; // Exemplo: total de vagas por categoria
    const inscricoesConfirmadas = await Inscricao.countDocuments({
      categoria: categoria,
      statusPagamento: "aprovado"
    });
    const vagasRestantes = totalVagas - inscricoesConfirmadas;

    if (vagasRestantes <= 0) {
      return res.status(400).json({ message: "Não há vagas disponíveis para esta categoria." });
    }

    res.status(200).json({ message: "Vagas disponíveis. Prossiga para o pagamento." });
  } catch (error) {
    console.error("Erro ao verificar inscrição:", error);
    res.status(500).json({ message: "Erro interno do servidor ao verificar inscrição." });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});


