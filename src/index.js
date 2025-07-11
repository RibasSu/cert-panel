const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { initializeDatabase } = require('./database/db');
const { initializeCA } = require('./services/ca');

// Importação das rotas
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const certificateRoutes = require('./routes/certificates');

// Inicialização do app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do mecanismo de visualização
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware para processamento de requisições
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da sessão
app.use(session({
  secret: 'zerocert-icp-brasil-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Em produção, defina como true se usar HTTPS
}));

// Middleware para disponibilizar variáveis globais para as views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Inicialização do banco de dados
initializeDatabase().then(() => {
  console.log('Banco de dados inicializado com sucesso');
  
  // Inicialização da CA (Autoridade Certificadora)
  return initializeCA();
}).then(() => {
  console.log('Autoridade Certificadora (CA) inicializada com sucesso');
  
  // Configuração das rotas
  app.use('/', authRoutes);
  app.use('/dashboard', dashboardRoutes);
  app.use('/certificates', certificateRoutes);
  
  // Rota para a página inicial
  app.get('/', (req, res) => {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('index', { title: 'ZeroCert - Simulador ICP-Brasil' });
  });
  
  // Inicialização do servidor
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao inicializar o aplicativo:', err);
});