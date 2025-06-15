require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const app = express();
const PORT = 5000;

const MONGO_URI = 'mongodb+srv://ryancalmon05:M8v5Sy9lwhP5EsZD@cluster0.uk4qeos.mongodb.net/brotherscup?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB Atlas
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Schema do Mongoose (campo id como Number apenas para organização)
const inscricaoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // ID numérico para pesquisa
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
  statusPagamento: { type: String, default: 'pendente' }, // 'pendente', 'aprovado', 'recusado', 'cancelado'
  preferenceId: String, // Para associar a inscrição à preferência do MP
  paymentId: String, // Para associar a inscrição ao pagamento do MP
}, { timestamps: true });

const Inscricao = mongoose.model('Inscricao', inscricaoSchema); // cria collection 'inscricoes'

// Função para gerar um ID único aleatório (apenas para organização)
const generateUniqueId = async () => {
  let id;
  let exists = true;

  // Tente gerar um ID único
  while (exists) {
    id = Math.floor(Math.random() * 10000);  // ID aleatório de 0 a 9999
    const existing = await Inscricao.findOne({ id });
    exists = existing !== null;  // Verifica se já existe esse ID no banco de dados
  }

  return id;
};

// Mercado Pago SDK Initialization
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// Instância global para criar preferências e buscar pagamentos
const preferenceService = new Preference(client);
const paymentService = new Payment(client);

// Rota de POST para criar preferência de pagamento (agora recebe os dados da inscrição)
app.post("/create_preference", async (req, res) => {
  try {
    const { title, unit_price, quantity, inscricaoData } = req.body; // Recebe os dados da inscrição também

    // Gerar um ID único para a inscrição ANTES de criar a preferência
    const inscricaoId = await generateUniqueId();

    // Adicionar o ID gerado e o status inicial à inscricaoData
    const tempInscricaoData = {
      ...inscricaoData,
      id: inscricaoId,
      statusPagamento: 'pendente', // Inscrição começa como pendente
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
        success: "https://brothers-cup.vercel.app/sucesso", // Altere para sua URL de sucesso
        failure: "https://brothers-cup.vercel.app/falhou", // Altere para sua URL de falha
        pending: "https://brothers-cup.vercel.app/falhou", // Altere para sua URL de pendência
      },
      auto_return: "all",
      // Adicionar os dados da inscrição como metadata para serem recuperados no webhook
      metadata: {
        inscricao: tempInscricaoData,
      },
      // É crucial que esta URL seja acessível publicamente para o Mercado Pago
      // Durante o desenvolvimento, use ngrok ou similar
      notification_url: "https://4797-2804-14d-5cb0-11d8-f4be-97c1-5d23-fad5.ngrok-free.app/webhook", // Substitua por sua URL de webhook real
    };
    console.log("Corpo da Preferência enviado ao Mercado Pago:", JSON.stringify(preferenceBody, null, 2 ));

    const response = await preferenceService.create({ body: preferenceBody });

    console.log("Resposta completa do Mercado Pago:", JSON.stringify(response, null, 2));
    // Salvar a inscrição com status pendente e o preferenceId
    const novaInscricao = new Inscricao({
      ...tempInscricaoData,
      preferenceId: response.id,
    });
    await novaInscricao.save();

    res.json({
      id: response.id, // Retorna o ID da preferência para o frontend
      inscricaoId: inscricaoId, // Retorna o ID da inscrição para o frontend (opcional, mas útil)
    });
  } catch (error) {
      console.error("Erro detalhado ao criar preferência de pagamento:", error);
    res.status(500).json({ message: "Erro ao criar preferência de pagamento." });
  }
});

// Rota de POST para salvar inscrição (AGORA NÃO SALVA IMEDIATAMENTE, APENAS VERIFICA VAGAS)
app.post('/inscricao', async (req, res) => {
  try {
    const categoria = req.body.categoria;
    let limiteVagas = 16;
    if (categoria === "Escolinha") {
      limiteVagas = 24;
    }
    const totalInscricoes = await Inscricao.countDocuments({ categoria, statusPagamento: 'aprovado' }); // Conta apenas inscrições pagas
    if (totalInscricoes >= limiteVagas) {
      return res.status(400).json({ message: 'Não há mais vagas nesta categoria.' });
    }
    // Não salva a inscrição aqui, apenas retorna sucesso para o frontend prosseguir com o pagamento
    res.status(200).json({ message: 'Vagas disponíveis. Prossiga para o pagamento.' });
  } catch (err) {
    console.error('Erro ao verificar vagas para inscrição:', err);
    res.status(500).json({ message: 'Erro ao verificar vagas para inscrição.' });
  }
});

// Rota para webhook do Mercado Pago
app.post("/webhook", async (req, res) => {
  try {
    const payment_id = req.query["data.id"] || (req.body.data && req.body.data.id);
    const type = req.query.type || req.body.type;

    if (type === "payment") {
      const paymentInfo = await paymentService.get({ id: payment_id });
      console.log("Webhook - Informações do Pagamento:", paymentInfo.body);

      const paymentStatus = paymentInfo.body.status;
      const preferenceIdFromPayment = paymentInfo.body.external_reference; // Ou outro campo que você usou para associar

      // Recuperar os dados da inscrição do metadata, se existirem
      const inscricaoDataFromMetadata = paymentInfo.body.metadata ? paymentInfo.body.metadata.inscricao : null;

      if (paymentStatus === 'approved') {
        // Se o pagamento foi aprovado, atualize o status da inscrição no banco de dados
        // Ou, se a inscrição ainda não foi salva, salve-a agora
        if (inscricaoDataFromMetadata) {
          // Tenta encontrar a inscrição existente pelo preferenceId ou id gerado
          let inscricaoExistente = await Inscricao.findOne({ preferenceId: preferenceIdFromPayment });

          if (!inscricaoExistente) {
            // Se não encontrou, pode ser que a inscrição ainda não foi salva (cenário ideal)
            // Crie uma nova inscrição com os dados do metadata
            inscricaoExistente = new Inscricao({
              ...inscricaoDataFromMetadata,
              statusPagamento: 'aprovado',
              preferenceId: preferenceIdFromPayment,
              paymentId: payment_id,
            });
            await inscricaoExistente.save();
            console.log("Inscrição salva via webhook com sucesso!");
          } else {
            // Se encontrou, apenas atualize o status
            inscricaoExistente.statusPagamento = 'aprovado';
            inscricaoExistente.paymentId = payment_id;
            await inscricaoExistente.save();
            console.log("Status da inscrição atualizado para aprovado via webhook!");
          }
        } else {
          console.warn("Webhook recebido para pagamento aprovado, mas sem dados de inscrição no metadata.");
          // Lógica de fallback se metadata não estiver disponível
          // Ex: buscar inscrição por preferenceId ou outro identificador
        }
      } else {
        // Pagamento não aprovado (pendente, recusado, etc.)
        console.log(`Pagamento ${payment_id} com status: ${paymentStatus}. Inscrição não aprovada.`);
        // Você pode atualizar o status da inscrição para 'recusado' ou 'pendente' aqui
        // Ex: await Inscricao.findOneAndUpdate({ preferenceId: preferenceIdFromPayment }, { statusPagamento: paymentStatus });
      }
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    res.status(500).json({ message: "Erro ao processar webhook." });
  }
});

// Rota GET para visualizar inscrições
app.get('/inscricoes', async (req, res) => {
  try {
    const todas = await Inscricao.find(); // Busca todas as inscrições no MongoDB
    res.json(todas); // Retorna as inscrições em formato JSON
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar inscrições.' });
  }
});

app.get('/vagas/:categoria', async (req, res) => {
  const { categoria } = req.params;

  let limiteVagas = 16;
  if (categoria === "Escolinha") {
    limiteVagas = 24;
  }

  try {
    const totalInscricoes = await Inscricao.countDocuments({ categoria });
    const vagasRestantes = Math.max(0, limiteVagas - totalInscricoes);

    res.json({
      categoria,
      vagas: vagasRestantes
    });
  } catch (err) {
    console.error('Erro ao verificar vagas:', err);
    res.status(500).json({ message: 'Erro ao verificar vagas.' });
  }
});

// Rota DELETE para excluir uma inscrição usando _id (ObjectId)
app.delete('/inscricao/:id', async (req, res) => {
  const { id } = req.params;

  console.log(`Excluindo inscrição com _id: ${id}`); // Verifique o ID sendo passado

  try {
    // Usando _id (ObjectId) para excluir o documento
    const deletedInscricao = await Inscricao.findByIdAndDelete(id); // Usando _id
    if (!deletedInscricao) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    res.status(200).json({ message: 'Inscrição excluída com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir inscrição:', err);
    res.status(500).json({ message: 'Erro ao excluir inscrição.' });
  }
});

// Rota PUT para editar uma inscrição usando _id (ObjectId)
app.put('/inscricao/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    // Usando _id (ObjectId) para editar o documento
    const updatedInscricao = await Inscricao.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedInscricao) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    res.status(200).json(updatedInscricao); // Retorna os dados atualizados
  } catch (err) {
    console.error('Erro ao editar inscrição:', err);
    res.status(500).json({ message: 'Erro ao editar inscrição.' });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});


