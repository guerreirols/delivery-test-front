# Delivery Web

Aplicação para acompanhar pedidos e organizar novas entregas. Oferece cadastro, autenticação, consulta paginada de pedidos com seus status e criação de pedidos com múltiplos itens.

## Tecnologias

React 19, TypeScript com verificação estrita e Vite. Os estilos usam CSS responsivo com tokens compartilhados. ESLint verifica as convenções de código; Vitest e React Testing Library validam regras e comportamentos de interface.

## Arquitetura

A aplicação é organizada por funcionalidade, com responsabilidades explícitas entre apresentação, coordenação de estado e integração HTTP. A composição global conecta a sessão à experiência de pedidos. Cada funcionalidade mantém suas páginas, componentes, serviços e contratos próximos; elementos de interface e infraestrutura comuns são compartilhados apenas quando têm consumidores concretos.

Componentes apresentam informações e recebem ações por contratos tipados. Hooks coordenam dados remotos e cancelamento; serviços traduzem os contratos da API e validam as respostas recebidas. O estado dos formulários permanece local, a paginação é refletida na URL e a sessão possui uma fronteira pública própria.

A separação evita concentrar regras em componentes de página e permite testar cada responsabilidade sem reproduzir as camadas de persistência do servidor. A navegação entre autenticação, lista e criação é pequena o suficiente para ser composta diretamente, sem dependência adicional de roteamento ou estado global.

## Execução local

Utilize Node.js 22.12 ou superior compatível com o Vite instalado e npm. A API deve estar disponível antes de utilizar os fluxos autenticados.

```sh
npm ci
npm run dev
```

A interface fica disponível em `http://localhost:5173`. Por padrão, a aplicação conecta à API em `http://localhost:8080`. Para usar outro endereço, copie `.env.example` para `.env.local`, ajuste `VITE_API_URL` e reinicie o Vite.

```dotenv
VITE_API_URL=http://localhost:8080
```

Essa variável é pública e contém somente o endereço do serviço. Não inclua segredos em variáveis com prefixo `VITE_`.

### Sessão e ambiente

O token de acesso permanece em memória. O refresh token utiliza cookie `HttpOnly` controlado pela API; a aplicação não armazena tokens em `localStorage` ou `sessionStorage`. Ao recarregar, a sessão é restaurada antes de liberar o conteúdo protegido. Requisições simultâneas compartilham a renovação, e operações em andamento não podem reabrir uma sessão encerrada.

No desenvolvimento HTTP local, inicie a API com `REFRESH_COOKIE_SECURE=false` e permita a origem exata `http://localhost:5173` em `CORS_ALLOWED_ORIGINS`. Use o mesmo hostname nos dois serviços: evite misturar `localhost` e `127.0.0.1`. Em produção, mantenha HTTPS e cookie seguro; ajuste CORS e SameSite conforme a topologia da implantação.

A integração usa o endereço direto da API para preservar o caminho do cookie de autenticação. Se houver proxy reverso, preserve os caminhos públicos da autenticação ou configure a reescrita do cookie de forma coerente.

## Experiência de uso

A listagem apresenta cliente, endereço, data, valor e status textual, com atualização manual e paginação no servidor. Os itens podem ser consultados em cada pedido. A criação aceita múltiplos produtos, calcula os totais em centavos e associa erros aos campos. A aplicação inclui estados de carregamento, vazio, recuperação de falha, envio e confirmação.

O layout adapta listas e formulários para telas menores. Controles possuem labels, foco visível e semântica nativa; os status não dependem apenas de cor. Dados de demonstração não são inseridos no ambiente de execução.

## Qualidade

```sh
npm run lint
npm run test
npm run build
```

A suíte cobre sessão e concorrência de renovação, encerramento durante requisições, contratos HTTP, formulários, validações monetárias, paginação e um fluxo integrado com a fronteira HTTP simulada. Os testes são isolados e não utilizam o banco de desenvolvimento. Para acompanhar mudanças em execução contínua, utilize `npm run test:watch`.

O build gera os arquivos estáticos em `dist`. `npm run preview` permite conferir esse resultado localmente; não substitui um servidor de produção. A configuração de endereço da API é aplicada no momento do build. Os contratos completos são mantidos pela documentação OpenAPI do backend.
