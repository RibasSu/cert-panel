const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração do Sequelize com SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false
});

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    // Importação dos modelos
    const User = require('../models/User')(sequelize);
    const Certificate = require('../models/Certificate')(sequelize);
    const CertificateAuthority = require('../models/CertificateAuthority')(sequelize);
    
    // Definição das relações entre os modelos
    User.hasMany(Certificate, { foreignKey: 'userId' });
    Certificate.belongsTo(User, { foreignKey: 'userId' });
    
    CertificateAuthority.hasMany(Certificate, { foreignKey: 'caId' });
    Certificate.belongsTo(CertificateAuthority, { foreignKey: 'caId' });
    
    // Sincronização dos modelos com o banco de dados
    // Usamos { force: false } para não recriar as tabelas se já existirem
    await sequelize.sync({ force: false });
    console.log('Modelos sincronizados com o banco de dados');
    
    return { sequelize, models: { User, Certificate, CertificateAuthority } };
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initializeDatabase
};