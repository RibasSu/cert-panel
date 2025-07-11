const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Certificate = sequelize.define('Certificate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM('e-CPF', 'e-CNPJ'),
      allowNull: false
    },
    subject: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Informações do titular do certificado (nome, CPF/CNPJ, etc.)'
    },
    publicKey: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Chave pública em formato PEM'
    },
    privateKey: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Chave privada em formato PEM (armazenada apenas para certificados de teste)'
    },
    certificate: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Certificado em formato PEM'
    },
    p12: {
      type: DataTypes.BLOB,
      allowNull: true,
      comment: 'Certificado em formato PKCS#12 (.p12)'
    },
    p12Password: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Senha do arquivo PKCS#12'
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: false
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    revokedReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    policyOid: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'OID da política de certificação (PC)'
    },
    dpcUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'URL da Declaração de Práticas de Certificação (DPC)'
    },
    keyUsage: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Usos permitidos para a chave'
    },
    extendedKeyUsage: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Usos estendidos permitidos para a chave'
    },
    caId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CertificateAuthorities',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['serialNumber']
      },
      {
        fields: ['type']
      },
      {
        fields: ['validTo']
      },
      {
        fields: ['revoked']
      }
    ]
  });

  return Certificate;
};