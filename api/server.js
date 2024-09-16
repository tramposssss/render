const express = require('express');
const path = require('path');
const helmet = require('helmet');
const { check, validationResult } = require('express-validator');
const { MongoClient } = require('mongodb');

// Configuração do MongoDB
const uri = 'mongodb+srv://jamefagregacoeseentregas:u3bFFsxmwLdwOuxo@infosjamef.p0kt5.mongodb.net/?retryWrites=true&w=majority&appName=InfosJamef'; // Substitua pela sua URI do MongoDB
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'infosjamef';
let db;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    db = client.db(dbName);
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  }
}

connectToDatabase();

const app = express();
const port = process.env.PORT || 3005; // Usa a variável de ambiente PORT, ou 3005 por padrão

// Middleware para segurança adicional
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],  // Fonte padrão permitida
      scriptSrc: ["'self'", "'unsafe-inline'", "https://code.jquery.com", "https://cdn.jsdelivr.net"], // Scripts permitidos
      styleSrc: ["'self'", "'unsafe-inline'", "https://stackpath.bootstrapcdn.com", "https://cdn.jsdelivr.net"], // Estilos permitidos
      imgSrc: ["'self'", "data:", "https://assets.zyrosite.com", "https://www.jamef.com.br"],  // Imagens permitidas
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"], // Fontes permitidas
      connectSrc: ["'self'"],  // Conexões permitidas
      frameSrc: ["'self'"],  // Frames permitidos
      objectSrc: ["'none'"],  // Objetos não permitidos
      baseUri: ["'self'"],  // Base URI permitida
      formAction: ["'self'"]  // Ação do formulário permitida
    }
  }
}));

// Middleware para interpretar dados de formulários
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para validar e sanitizar dados do formulário de contato
const contactFormValidation = [
  check('name').notEmpty().withMessage('Nome é obrigatório'),
  check('email').isEmail().withMessage('Email inválido'),
  check('phone').notEmpty().withMessage('Telefone é obrigatório'),
  check('message').notEmpty().withMessage('Mensagem é obrigatória')
];

// Rota principal
app.get('/', (req, res) => {
  console.log('Rota principal acessada');
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Rota para a página de serviços
app.get('/servicos.html', (req, res) => {
  console.log('Rota de serviços acessada');
  res.sendFile(path.join(__dirname, '../public', 'servicos.html'));
});

// Rota para a página de contato
app.get('/contato.html', (req, res) => {
  console.log('Rota de contato acessada');
  res.sendFile(path.join(__dirname, '../public', 'contato.html'));
});

// Rota para o formulário dividido em três partes
app.get('/formulario.html', (req, res) => {
  console.log('Rota do formulário acessada');
  res.sendFile(path.join(__dirname, '../public', 'formulario.html'));
});

// Rota para processar o número de telefone do footer
app.post('/processa_telefone', (req, res) => {
  const { phone } = req.body;

  console.log('Número de telefone recebido:', phone);

  if (phone) {
    res.redirect(`/contato.html?phone=${encodeURIComponent(phone)}`);
  } else {
    console.log('Erro: Número de telefone não fornecido');
    res.status(400).send('Número de telefone é obrigatório.');
  }
});

// Rotas API
app.post('/api/submit_contact_form', contactFormValidation, async (req, res) => {
  console.log('Requisição recebida em /api/submit_contact_form');

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, message } = req.body;

  console.log('Dados recebidos:', req.body);

  if (name && email && phone && message) {
    const collection = db.collection('contact_forms');
    const content = { name, email, phone, message, timestamp: new Date() };

    try {
      await collection.insertOne(content);
      console.log('Mensagem gravada com sucesso no MongoDB.');
      res.send('Sua mensagem foi enviada com sucesso, logo entraremos em contato!');
    } catch (err) {
      console.error('Erro ao gravar no MongoDB:', err);
      res.status(500).send('Erro ao gravar sua mensagem. Tente novamente mais tarde.');
    }
  } else {
    console.warn('Dados incompletos. Todos os campos são obrigatórios.');
    res.status(400).send('Todos os campos são obrigatórios.');
  }
});

app.post('/api/submit_form', async (req, res) => {
  console.log('Requisição recebida em /api/submit_form');

  const { 
      nome, data_nascimento, cpf, contrato_social, telefone1, telefone2,
      endereco, numero, bairro, cidade, estado, cep,
      categoria, marca_veiculo, modelo_veiculo, ano_veiculo, renavam, placa, habilitacao
  } = req.body;

  let content = {
    nome,
    data_nascimento,
    cpf,
    contrato_social,
    telefone1,
    telefone2,
    endereco,
    numero,
    bairro,
    cidade,
    estado,
    cep,
    categoria,
    marca_veiculo,
    modelo_veiculo,
    ano_veiculo,
    renavam,
    placa,
    habilitacao,
    timestamp: new Date()
  };

  console.log('Preparando para gravar no MongoDB');

  try {
    const collection = db.collection('form_data');
    await collection.insertOne(content);
    console.log('Dados gravados com sucesso no MongoDB.');
    res.send('Formulário enviado com sucesso.');
  } catch (err) {
    console.error('Erro ao gravar no MongoDB:', err);
    res.status(500).send('Erro ao gravar os dados. Tente novamente mais tarde.');
  }
});

// Middleware para tratamento de rotas não encontradas
app.use((req, res) => {
  console.log(`Rota não encontrada: ${req.originalUrl}`);
  res.status(404).send('Página não encontrada');
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
