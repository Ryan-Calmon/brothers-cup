const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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

// Rota de POST para salvar inscrição
app.post('/inscricao', async (req, res) => {
  try {
    // Gera um ID único numérico para organização
    const id = await generateUniqueId();

    // Adiciona o ID gerado ao corpo da inscrição
    const novaInscricao = {
      ...req.body,
      id: id,  // Adiciona o ID gerado
    };

    // Cria e salva no MongoDB
    const nova = new Inscricao(novaInscricao);
    await nova.save();

    res.status(201).json({ message: 'Inscrição salva com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar inscrição:', err);
    res.status(500).json({ message: 'Erro ao salvar inscrição.' });
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
