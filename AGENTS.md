# Convenções do frontend

Aplicação web em React, TypeScript e Vite para gerenciamento de delivery. Priorize uma entrega coesa, acessível, testável e fácil de explicar. Comunique decisões em português; use identificadores em inglês e textos da interface em português.

## Regras permanentes

- Antes de editar, leia package.json, configurações, código relacionado e as skills aplicáveis. Preserve mudanças existentes do usuário.
- Use organização por funcionalidade com responsabilidades explícitas. Separe páginas, componentes, hooks, serviços e tipos conforme a necessidade; não concentre a aplicação em App.tsx nem crie diretórios vazios.
- Componentes devem ser coesos. Compartilhe componentes visuais estáveis por composição; não crie componentes universais com dezenas de flags ou abstrações para usos hipotéticos.
- Use const e let quando houver reatribuição; não use var. Tipos de props, contratos HTTP e fronteiras públicas devem ser explícitos. Aproveite a inferência de TypeScript para valores locais simples; não replique a exigência Java de anotar toda variável.
- Não adicione comentários no corpo do código. Expresse intenção por nomes e responsabilidades; registre decisões relevantes na documentação.
- Preserve regras de hooks, renderização pura, imutabilidade e tipagem segura. Não esconda problemas com any, as indiscriminado ou desativação de regras de lint.
- UI/UX inclui estados de carregamento, vazio, erro, sucesso, foco e indisponibilidade; não entregue apenas o caminho feliz. Valide responsividade e navegação por teclado nas telas alteradas.
- Toda feature ou correção com mudança de comportamento deve incluir testes novos ou atualizados. Não crie testes específicos de logs. Movimentações sem mudança de comportamento e documentação usam verificações proporcionais.
- Não exponha senhas, tokens, cookies, dados pessoais ou segredos em logs, mensagens, fixtures reais ou variáveis públicas do Vite.
- Não instale uma coleção de bibliotecas por antecipação. Acrescente dependências quando houver necessidade concreta da implementação, verificando compatibilidade com a stack atual.

## Arquitetura de referência

Use src/app para composição global, providers e configuração de navegação; src/features/<funcionalidade> para páginas, componentes, hooks, serviços e tipos de cada assunto; src/shared para UI genérica, infraestrutura HTTP, hooks e estilos compartilhados quando existirem consumidores concretos.

Dentro de cada funcionalidade, crie subpastas por responsabilidade apenas quando houver arquivos. Componentes específicos continuam na funcionalidade. Tipos de props usados apenas por um componente podem ficar no próprio arquivo. Shared não importa features; features não importam páginas ou detalhes internos de outras features. App compõe o conjunto.

Não replique as camadas de entidades e repositories do backend no navegador. Separe renderização, coordenação de estado e acesso HTTP. A estrutura atual ainda é o template Vite; estas são convenções para sua evolução, não uma declaração de que os módulos já existem.

## Skills locais

- .agents/skills/react-clean-code/SKILL.md: componentes, hooks e TypeScript.
- .agents/skills/react-architecture/SKILL.md: limites entre funcionalidades, estado e dependências.
- .agents/skills/react-ui-ux/SKILL.md: sistema visual, responsividade e acessibilidade.
- .agents/skills/frontend-testing/SKILL.md: testes de comportamento e validação da entrega.
- .agents/skills/frontend-api-integration/SKILL.md: HTTP, sessão, erros e integração com o backend.

## Stack e validação

O estado inicial possui React, React DOM, TypeScript, Vite e ESLint, com npm e package-lock.json. Preserve o gerenciador de pacotes e consulte os arquivos de configuração para requisitos efetivos. Não assuma TypeScript strict habilitado: ao preparar a base para funcionalidades, avalie e habilite strict, corrigindo os problemas em vez de suprimi-los.

Os comandos atuais são npm run dev, npm run lint, npm run build e npm run preview. Ainda não existe infraestrutura ou script de testes: na primeira implementação com comportamento, configure uma suíte mínima conforme frontend-testing e adicione os testes da feature. Não alegue testes aprovados com base apenas em build/lint.

Em mudanças executáveis, execute lint, build e os testes aplicáveis em modo de execução única. Em mudanças visuais, inspecione a interface no navegador quando disponível, com viewport pequeno e desktop. Informe o que foi validado e as limitações reais; não declare acessibilidade ou qualidade visual comprovadas apenas pelo código.

## Especialistas

- .codex/agents/react_frontend_senior.toml: implementação e revisão técnica React.
- .codex/agents/ui_ux_reviewer.toml: revisão de experiência, apresentação e acessibilidade.

Use especialistas quando o usuário solicitar ou autorizar delegação. A existência dos arquivos não exige execução de múltiplos agentes em toda tarefa.
