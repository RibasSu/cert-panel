# ZeroCert - Simulador de ICP-Brasil para Testes

O ZeroCert é um sistema que simula a Infraestrutura de Chaves Públicas Brasileira (ICP-Brasil) para emissão de certificados digitais em ambiente de teste. Este projeto permite a criação e gerenciamento de certificados digitais no padrão ICP-Brasil, como e-CPF e e-CNPJ, para fins de desenvolvimento e testes.

## Características

- Criação e gerenciamento de Autoridades Certificadoras (AC)
- Emissão de certificados e-CPF e e-CNPJ seguindo as normas da ICP-Brasil
- Interface web estilizada para parecer sistemas legados
- Validação de certificados por número de série
- Revogação de certificados
- Download de certificados nos formatos PEM e PKCS#12 (P12)
- Banco de dados SQLite para armazenamento

## Requisitos

- Node.js 14.x ou superior
- NPM 6.x ou superior

## Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/zerocert.git
   cd zerocert/icp-test
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Inicie o servidor:
   ```
   npm start
   ```

4. Acesse a aplicação em seu navegador:
   ```
   http://localhost:3000
   ```

## Estrutura do Projeto

```
├── src/
│   ├── database/        # Configuração do banco de dados
│   ├── models/          # Modelos de dados
│   ├── public/          # Arquivos estáticos (CSS, JS, imagens)
│   ├── routes/          # Rotas da aplicação
│   ├── services/        # Serviços de negócio
│   ├── views/           # Templates Pug
│   └── index.js         # Ponto de entrada da aplicação
├── package.json
└── README.md
```

## Uso

### Primeiro Acesso

Ao iniciar a aplicação pela primeira vez, um usuário administrador padrão será criado:

- **Usuário**: admin
- **Senha**: admin123

Recomenda-se alterar a senha após o primeiro login.

### Emissão de Certificados

1. Faça login no sistema
2. Acesse o menu "Certificados" e selecione "Emitir e-CPF" ou "Emitir e-CNPJ"
3. Preencha os dados solicitados
4. Defina uma senha para o certificado
5. Clique em "Emitir Certificado"

### Validação de Certificados

1. Acesse o menu "Certificados" e selecione "Validar Certificado"
2. Insira o número de série do certificado
3. Clique em "Validar"

## Segurança

**IMPORTANTE**: Este sistema é destinado APENAS para fins de teste e desenvolvimento. Os certificados emitidos NÃO são reconhecidos oficialmente e NÃO devem ser utilizados em ambientes de produção.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express
- **Frontend**: Bootstrap, Pug
- **Banco de Dados**: SQLite
- **Criptografia**: node-forge

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Contato

Para dúvidas ou sugestões, entre em contato através de [seu-email@exemplo.com].