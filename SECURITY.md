# Política de Segurança do ZeroCert

## Aviso Importante

**O ZeroCert é um sistema de simulação da ICP-Brasil destinado EXCLUSIVAMENTE para fins de teste e desenvolvimento.** Os certificados digitais emitidos por este sistema NÃO são reconhecidos oficialmente e NÃO devem ser utilizados em ambientes de produção ou para qualquer finalidade que exija certificados digitais válidos e legalmente reconhecidos.

## Limitações de Segurança

1. **Certificados Não Oficiais**: Os certificados gerados pelo Test Cert Panel da ZeroCert não são reconhecidos pela ICP-Brasil oficial ou qualquer outra autoridade certificadora reconhecida.

2. **Ambiente de Desenvolvimento**: O sistema utiliza certificados SSL autoassinados para HTTPS, que não são verificáveis por navegadores e sistemas operacionais padrão.

3. **Armazenamento Local**: Todos os dados, incluindo informações de certificados e chaves privadas, são armazenados localmente em um banco de dados SQLite, sem as proteções de segurança encontradas em sistemas de produção.

4. **Senhas Padrão**: O sistema vem com credenciais padrão (admin/admin123) que devem ser alteradas imediatamente após a instalação, mesmo em ambiente de desenvolvimento.

## Práticas Recomendadas

1. **Isolamento**: Execute o Test Cert Panel apenas em ambientes isolados de desenvolvimento ou teste.

2. **Dados Fictícios**: Utilize apenas dados fictícios para testes. Nunca insira dados reais de CPF, CNPJ ou outras informações sensíveis.

3. **Acesso Restrito**: Limite o acesso ao sistema apenas a desenvolvedores e testadores autorizados.

4. **Não Exponha Publicamente**: Nunca exponha o Test Cert Panel à internet ou a redes não confiáveis.

5. **Alteração de Credenciais**: Altere as credenciais padrão imediatamente após a instalação.

## Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança no ZeroCert, por favor, reporte-a através de um dos seguintes canais:

1. Abra uma issue no repositório GitHub (marque como "security issue")
2. Envie um e-mail para [contato@zerocert.com.br] com o assunto "Vulnerabilidade de Segurança"

Por favor, forneça detalhes suficientes para que possamos reproduzir e corrigir o problema, incluindo:

- Descrição da vulnerabilidade
- Passos para reproduzir
- Possível impacto
- Sugestões para mitigação (se disponíveis)

## Atualizações de Segurança

O Test Cert Panel da ZeroCert é um projeto de código aberto mantido por voluntários. Embora nos esforcemos para corrigir vulnerabilidades de segurança prontamente, não podemos garantir tempos de resposta específicos.

Recomendamos que você mantenha seu sistema atualizado com as versões mais recentes do Test Cert Panel e suas dependências.

## Isenção de Responsabilidade

O Test Cert Panel da ZeroCert é fornecido "como está", sem garantias de qualquer tipo. Os mantenedores do projeto não são responsáveis por qualquer dano ou problema causado pelo uso do sistema, incluindo, mas não se limitando a, violações de segurança, perda de dados ou uso indevido.

Ao utilizar o Test Cert Panel, você reconhece que está usando um sistema de simulação para fins de teste e desenvolvimento, e assume todos os riscos associados ao seu uso.