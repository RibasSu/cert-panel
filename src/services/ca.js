const forge = require('node-forge');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('../database/db');

// Função para inicializar a CA
async function initializeCA() {
  try {
    const CertificateAuthority = sequelize.models.CertificateAuthority;
    const User = sequelize.models.User;
    
    // Verificar se já existe um usuário admin
    await User.createDefaultAdmin();
    
    // Verificar se já existe uma CA Raiz
    const rootCA = await CertificateAuthority.findOne({ where: { isRoot: true } });
    
    if (!rootCA) {
      // Criar a CA Raiz
      await createRootCA();
      console.log('CA Raiz criada com sucesso');
      
      // Criar a CA Intermediária (AC-ICP-Brasil)
      await createIntermediateCA();
      console.log('CA Intermediária criada com sucesso');
    } else {
      console.log('CAs já existem no banco de dados');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar a CA:', error);
    throw error;
  }
}

// Função para criar a CA Raiz (AC Raiz ICP-Brasil)
async function createRootCA() {
  const CertificateAuthority = sequelize.models.CertificateAuthority;
  
  // Gerar par de chaves RSA para a CA Raiz
  const keys = forge.pki.rsa.generateKeyPair(4096);
  
  // Converter chaves para formato PEM
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
  
  // Criar certificado
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = generateSerialNumber();
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 20); // Validade de 20 anos
  
  // Atributos do certificado conforme ICP-Brasil
  const attrs = [
    { name: 'commonName', value: 'AC Raiz ZeroTLS' },
    { name: 'organizationName', value: 'ZeroTLS Segurança Digital Ltda.' },
    { name: 'organizationalUnitName', value: 'Autoridade Certificadora Raiz' },
    { name: 'countryName', value: 'BR' },
    { name: 'stateOrProvinceName', value: 'DF' },
    { name: 'localityName', value: 'Brasília' }
  ];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs); // Auto-assinado
  
  // Extensões do certificado conforme ICP-Brasil
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true,
      critical: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      cRLSign: true,
      critical: true
    },
    {
      name: 'subjectKeyIdentifier'
    }
  ]);
  
  // Auto-assinar o certificado com a chave privada da CA Raiz
  cert.sign(keys.privateKey, forge.md.sha512.create());
  
  // Converter certificado para formato PEM
  const certPem = forge.pki.certificateToPem(cert);
  
  // Salvar a CA Raiz no banco de dados
  await CertificateAuthority.create({
    name: 'AC Raiz ZeroTLS',
    commonName: 'AC Raiz ZeroTLS',
    organization: 'ZeroTLS Segurança Digital Ltda.',
    organizationalUnit: 'Autoridade Certificadora Raiz',
    country: 'BR',
    state: 'DF',
    locality: 'Brasília',
    serialNumber: cert.serialNumber,
    publicKey: publicKeyPem,
    privateKey: privateKeyPem,
    certificate: certPem,
    validFrom: cert.validity.notBefore,
    validTo: cert.validity.notAfter,
    isRoot: true,
    crlDistributionPoint: 'https://cert.zerotls.com.br/crl/root.crl',
    ocspResponderUrl: 'https://cert.zerotls.com.br/ocsp',
    active: true
  });
  
  return true;
}

// Função para criar a CA Intermediária (AC-ICP-Brasil)
async function createIntermediateCA() {
  const CertificateAuthority = sequelize.models.CertificateAuthority;
  
  // Buscar a CA Raiz
  const rootCA = await CertificateAuthority.findOne({ where: { isRoot: true } });
  
  if (!rootCA) {
    throw new Error('CA Raiz não encontrada');
  }
  
  // Carregar a chave privada e o certificado da CA Raiz
  const rootPrivateKey = forge.pki.privateKeyFromPem(rootCA.privateKey);
  const rootCert = forge.pki.certificateFromPem(rootCA.certificate);
  
  // Gerar par de chaves RSA para a CA Intermediária
  const keys = forge.pki.rsa.generateKeyPair(4096);
  
  // Converter chaves para formato PEM
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
  
  // Criar certificado
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = generateSerialNumber();
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10); // Validade de 10 anos
  
  // Atributos do certificado conforme ICP-Brasil
  const subjectAttrs = [
    { name: 'commonName', value: 'AC ZeroCert Intermediária' },
    { name: 'organizationName', value: 'ZeroCert Certificados e Identidade Digital' },
    { name: 'organizationalUnitName', value: 'Autoridade Certificadora Intermediária' },
    { name: 'countryName', value: 'BR' },
    { name: 'stateOrProvinceName', value: 'DF' },
    { name: 'localityName', value: 'Brasília' }
  ];
  
  cert.setSubject(subjectAttrs);
  
  // Emissor é a CA Raiz
  cert.setIssuer(rootCert.subject.attributes);
  
  // Extensões do certificado conforme ICP-Brasil
    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: true,
        critical: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        cRLSign: true,
        critical: true
      },
      {
        name: 'subjectKeyIdentifier'
      }
  ]);
  
  // Assinar o certificado com a chave privada da CA Raiz
  cert.sign(rootPrivateKey, forge.md.sha512.create());
  
  // Converter certificado para formato PEM
  const certPem = forge.pki.certificateToPem(cert);
  
  // Salvar a CA Intermediária no banco de dados
  await CertificateAuthority.create({
    name: 'AC ZeroCert Intermediária',
    commonName: 'AC ZeroCert Intermediária',
    organization: 'ZeroCert Certificados e Identidade Digital',
    organizationalUnit: 'Autoridade Certificadora Intermediária',
    country: 'BR',
    state: 'DF',
    locality: 'Brasília',
    serialNumber: cert.serialNumber,
    publicKey: publicKeyPem,
    privateKey: privateKeyPem,
    certificate: certPem,
    validFrom: cert.validity.notBefore,
    validTo: cert.validity.notAfter,
    isRoot: false,
    parentCAId: rootCA.id,
    crlDistributionPoint: 'https://cert.zerocert.com.br/crl/intermediate.crl',
    ocspResponderUrl: 'https://cert.zerocert.com.br/ocsp',
    active: true
  });
  
  return true;
}

// Função para gerar um número de série único
function generateSerialNumber() {
  const buffer = forge.random.getBytesSync(16);
  const hex = forge.util.bytesToHex(buffer);
  return hex;
}

// Função para criar um certificado e-CPF
async function createECPFCertificate(data) {
  try {
    const CertificateAuthority = sequelize.models.CertificateAuthority;
    const Certificate = sequelize.models.Certificate;
    
    // Buscar a CA Intermediária
    const intermediateCA = await CertificateAuthority.findOne({
      where: { isRoot: false, active: true },
      order: [['createdAt', 'DESC']]
    });
    
    if (!intermediateCA) {
      throw new Error('CA Intermediária não encontrada');
    }
    
    // Carregar a chave privada e o certificado da CA Intermediária
    const caPrivateKey = forge.pki.privateKeyFromPem(intermediateCA.privateKey);
    const caCert = forge.pki.certificateFromPem(intermediateCA.certificate);
    
    // Gerar par de chaves RSA para o certificado e-CPF
    const keys = forge.pki.rsa.generateKeyPair(2048);
    
    // Converter chaves para formato PEM
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
    
    // Criar certificado
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = generateSerialNumber();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 3); // Validade de 3 anos
    
    // Formatar CPF para o certificado (apenas números)
    const cpf = data.cpf.replace(/[^0-9]/g, '');
    
    // Atributos do certificado conforme ICP-Brasil para e-CPF
    const subjectAttrs = [
      { name: 'commonName', value: data.name },
      { name: 'organizationName', value: 'ZeroCert Certificados e Identidade Digital' },
      { name: 'organizationalUnitName', value: 'e-CPF A1' },
      { name: 'countryName', value: 'BR' },
      { name: 'stateOrProvinceName', value: data.state },
      { name: 'localityName', value: data.city },
      // OID específico para CPF conforme ICP-Brasil
      { name: '2.16.76.1.3.1', value: formatICPBrasilPFData(cpf, data.birthDate, data.socialSecurity), type: '2.16.76.1.3.1' }
    ];
    
    cert.setSubject(subjectAttrs);
    
    // Emissor é a CA Intermediária
    cert.setIssuer(caCert.subject.attributes);
    
    // Extensões do certificado conforme ICP-Brasil
    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: false,
        critical: true
      },
      {
        name: 'keyUsage',
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
        critical: true
      },
      {
        name: 'extKeyUsage',
        clientAuth: true,
        emailProtection: true,
        codeSigning: true,
        timeStamping: true
      },
      {
        name: 'subjectKeyIdentifier'
      }
    ]);
    
    // Assinar o certificado com a chave privada da CA Intermediária
    cert.sign(caPrivateKey, forge.md.sha256.create());
    
    // Converter certificado para formato PEM
    const certPem = forge.pki.certificateToPem(cert);
    
    // Criar PKCS#12 (arquivo .p12)
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
      keys.privateKey,
      [cert],
      data.p12Password,
      { generateLocalKeyId: true, friendlyName: `${data.name} - CPF ${data.cpf}` }
    );
    
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    const p12Buffer = Buffer.from(p12Der, 'binary');
    
    // Salvar o certificado no banco de dados
    const certificate = await Certificate.create({
      serialNumber: cert.serialNumber,
      type: 'e-CPF',
      subject: {
        name: data.name,
        cpf: cpf,
        birthDate: data.birthDate,
        socialSecurity: data.socialSecurity,
        email: data.email
      },
      publicKey: publicKeyPem,
      privateKey: privateKeyPem,
      certificate: certPem,
      p12: p12Buffer,
      p12Password: data.p12Password,
      validFrom: cert.validity.notBefore,
      validTo: cert.validity.notAfter,
      policyOid: '2.16.76.1.2.1.7', // OID da política de certificação A3 da ICP-Brasil
      dpcUrl: 'http://zerocert.com.br/dpc/dpc.pdf',
      keyUsage: {
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      extendedKeyUsage: {
        clientAuth: true,
        emailProtection: true,
        codeSigning: true,
        timeStamping: true
      },
      caId: intermediateCA.id,
      userId: data.userId
    });
    
    return certificate;
  } catch (error) {
    console.error('Erro ao criar certificado e-CPF:', error);
    throw error;
  }
}

// Função para criar um certificado e-CNPJ
async function createECNPJCertificate(data) {
  try {
    const CertificateAuthority = sequelize.models.CertificateAuthority;
    const Certificate = sequelize.models.Certificate;
    
    // Buscar a CA Intermediária
    const intermediateCA = await CertificateAuthority.findOne({
      where: { isRoot: false, active: true },
      order: [['createdAt', 'DESC']]
    });
    
    if (!intermediateCA) {
      throw new Error('CA Intermediária não encontrada');
    }
    
    // Carregar a chave privada e o certificado da CA Intermediária
    const caPrivateKey = forge.pki.privateKeyFromPem(intermediateCA.privateKey);
    const caCert = forge.pki.certificateFromPem(intermediateCA.certificate);
    
    // Gerar par de chaves RSA para o certificado e-CNPJ
    const keys = forge.pki.rsa.generateKeyPair(2048);
    
    // Converter chaves para formato PEM
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
    
    // Criar certificado
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = generateSerialNumber();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 3); // Validade de 3 anos
    
    // Formatar CNPJ para o certificado (apenas números)
    const cnpj = data.cnpj.replace(/[^0-9]/g, '');
    
    // Atributos do certificado conforme ICP-Brasil para e-CNPJ
    const subjectAttrs = [
      { name: 'commonName', value: data.companyName },
      { name: 'organizationName', value: data.companyName },
      { name: 'organizationalUnitName', value: 'Certificado PJ A3' },
      { name: 'countryName', value: 'BR' },
      { name: 'stateOrProvinceName', value: data.state },
      { name: 'localityName', value: data.city },
      // OID específico para CNPJ conforme ICP-Brasil
      { name: '2.16.76.1.3.3', value: formatICPBrasilPJData(cnpj), type: '2.16.76.1.3.3' },
      // OID específico para responsável legal conforme ICP-Brasil
      { name: '2.16.76.1.3.2', value: formatICPBrasilResponsibleData(data.responsibleName, data.responsibleCPF), type: '2.16.76.1.3.2' }
    ];
    
    cert.setSubject(subjectAttrs);
    
    // Emissor é a CA Intermediária
    cert.setIssuer(caCert.subject.attributes);
    
    // Extensões do certificado conforme ICP-Brasil
    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: false,
        critical: true
      },
      {
        name: 'keyUsage',
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
        critical: true
      },
      {
        name: 'extKeyUsage',
        clientAuth: true,
        emailProtection: true,
        codeSigning: true,
        timeStamping: true
      },
      {
        name: 'subjectKeyIdentifier'
      }
    ]);
    
    // Assinar o certificado com a chave privada da CA Intermediária
    cert.sign(caPrivateKey, forge.md.sha256.create());
    
    // Converter certificado para formato PEM
    const certPem = forge.pki.certificateToPem(cert);
    
    // Criar PKCS#12 (arquivo .p12)
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
      keys.privateKey,
      [cert],
      data.p12Password,
      { generateLocalKeyId: true, friendlyName: `${data.companyName} - CNPJ ${data.cnpj}` }
    );
    
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    const p12Buffer = Buffer.from(p12Der, 'binary');
    
    // Salvar o certificado no banco de dados
    const certificate = await Certificate.create({
      serialNumber: cert.serialNumber,
      type: 'e-CNPJ',
      subject: {
        companyName: data.companyName,
        cnpj: cnpj,
        responsibleName: data.responsibleName,
        responsibleCPF: data.responsibleCPF,
        email: data.email
      },
      publicKey: publicKeyPem,
      privateKey: privateKeyPem,
      certificate: certPem,
      p12: p12Buffer,
      p12Password: data.p12Password,
      validFrom: cert.validity.notBefore,
      validTo: cert.validity.notAfter,
      policyOid: '2.16.76.1.2.1.7', // OID da política de certificação A3 da ICP-Brasil
      dpcUrl: 'http://zerocert.com.br/dpc/dpc.pdf',
      keyUsage: {
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      extendedKeyUsage: {
        clientAuth: true,
        emailProtection: true,
        codeSigning: true,
        timeStamping: true
      },
      caId: intermediateCA.id,
      userId: data.userId
    });
    
    return certificate;
  } catch (error) {
    console.error('Erro ao criar certificado e-CNPJ:', error);
    throw error;
  }
}

// Função para formatar dados de pessoa física conforme ICP-Brasil
function formatICPBrasilPFData(cpf, birthDateDDMMAAAA, nis, rg, issuingOrg, uf) {
  // birthDateDDMMAAAA deve ser string com 8 dígitos: DDMMAAAA
  const day = birthDateDDMMAAAA.slice(0, 2);
  const month = birthDateDDMMAAAA.slice(2, 4);
  const year = birthDateDDMMAAAA.slice(4, 8);
  const formattedBirthDate = year + month + day; // AAAAMMDD

  // CPF
  const formattedCPF = cpf.replace(/\D/g, '').padStart(11, '0');

  // NIS/PIS/PASEP
  const formattedNIS = nis ? nis.replace(/\D/g, '').padStart(11, '0') : '0'.repeat(11);

  // RG
  const formattedRG = rg ? rg.padEnd(15, ' ') : '0'.repeat(15);

  // Órgão Emissor
  const formattedIssuingOrg = issuingOrg ? issuingOrg.padEnd(6, ' ') : '0'.repeat(6);

  // UF
  const formattedUF = uf ? uf.padEnd(2, ' ') : '0'.repeat(2);

  // Concatenação final
  return formattedCPF + formattedNIS + formattedBirthDate + formattedRG + formattedIssuingOrg + formattedUF;
}

// Função para formatar dados de pessoa jurídica conforme ICP-Brasil
function formatICPBrasilPJData(cnpj) {
  // Formatar CNPJ (apenas números)
  const formattedCNPJ = cnpj.padStart(14, '0');
  
  // Formato: CNPJ (14 bytes) + INSS (12 bytes)
  // Neste exemplo, estamos preenchendo INSS com zeros
  return formattedCNPJ + '0'.repeat(12);
}

// Função para formatar dados do responsável legal conforme ICP-Brasil
function formatICPBrasilResponsibleData(name, cpf) {
  // Formatar CPF (apenas números)
  const formattedCPF = cpf.padStart(11, '0');
  
  // Formato: Nome do responsável (até 40 bytes) + CPF (11 bytes)
  // Preencher o nome com espaços até 40 bytes
  const formattedName = name.padEnd(40, ' ');
  
  return formattedName + formattedCPF;
}

// Função para revogar um certificado
async function revokeCertificate(serialNumber, reason) {
  try {
    const Certificate = sequelize.models.Certificate;
    
    // Buscar o certificado pelo número de série
    const certificate = await Certificate.findOne({ where: { serialNumber } });
    
    if (!certificate) {
      throw new Error('Certificado não encontrado');
    }
    
    // Atualizar o certificado como revogado
    await certificate.update({
      revoked: true,
      revokedAt: new Date(),
      revokedReason: reason
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao revogar certificado:', error);
    throw error;
  }
}

// Função para verificar se um certificado está revogado
async function isCertificateRevoked(serialNumber) {
  try {
    const Certificate = sequelize.models.Certificate;
    
    // Buscar o certificado pelo número de série
    const certificate = await Certificate.findOne({ where: { serialNumber } });
    
    if (!certificate) {
      throw new Error('Certificado não encontrado');
    }
    
    return certificate.revoked;
  } catch (error) {
    console.error('Erro ao verificar se o certificado está revogado:', error);
    throw error;
  }
}

module.exports = {
  initializeCA,
  createECPFCertificate,
  createECNPJCertificate,
  revokeCertificate,
  isCertificateRevoked
};