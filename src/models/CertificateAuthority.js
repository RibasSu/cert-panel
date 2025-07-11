const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CertificateAuthority = sequelize.define('CertificateAuthority', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    commonName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nome comum (CN) da CA'
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: false
    },
    organizationalUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'BR'
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    locality: {
      type: DataTypes.STRING,
      allowNull: false
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    publicKey: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Chave pública da CA em formato PEM'
    },
    privateKey: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Chave privada da CA em formato PEM (em produção, seria armazenada em HSM)'
    },
    certificate: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Certificado da CA em formato PEM'
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isRoot: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica se é uma CA Raiz'
    },
    parentCAId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'CertificateAuthorities',
        key: 'id'
      },
      comment: 'ID da CA pai (null para CA Raiz)'
    },
    crlDistributionPoint: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'URL do ponto de distribuição da LCR (Lista de Certificados Revogados)'
    },
    ocspResponderUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL do respondedor OCSP'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        unique: true,
        fields: ['serialNumber']
      },
      {
        fields: ['isRoot']
      },
      {
        fields: ['active']
      }
    ]
  });

  return CertificateAuthority;
};