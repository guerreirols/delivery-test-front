---
name: frontend-testing
description: Criar testes de comportamento e validar entregas React com verificações proporcionais de lógica, componentes, integração e experiência de uso.
---

# Qualidade e testes do frontend

Leia AGENTS.md, package.json e a configuração de testes vigente. A suíte existente utiliza Vitest, React Testing Library, jest-dom e user-event com jsdom; npm test executa uma vez e npm run test:watch acompanha alterações. Não confunda compilação com execução de testes.

- Toda nova feature ou correção com alteração de comportamento deve incluir testes novos ou atualizados na mesma entrega. Para bug, reproduza o cenário e cubra a regressão com a expectativa correta.
- Reutilize a configuração e o setup existentes. Altere a infraestrutura somente quando houver necessidade concreta e verifique compatibilidade das versões antes de instalar dependências. Não instale E2E ou ferramentas de cobertura sem necessidade da tarefa.
- Teste lógica pura sem renderização; componentes e fluxos interativos pelo comportamento no DOM. Prefira consultas por papel, nome acessível e label e interações por user-event. Não dependa de classes CSS ou detalhes internos de hooks.
- Cubra sucesso, rejeição, limite, carregamento, recuperação e prevenção de submissão duplicada quando pertinentes. Verifique resultado visível e ausência de efeitos indevidos em falhas.
- Simule a fronteira HTTP para testes de integração entre UI e serviços quando necessário; use ferramentas existentes ou uma solução justificada. Não substitua todos os hooks e componentes internos por mocks, eliminando o fluxo que deveria ser testado.
- Em autenticação, teste restauração da sessão, falha de renovação, chamadas concorrentes, logout e limpeza dos dados do usuário. Não use credenciais reais nem acesse o backend de desenvolvimento por padrão na suíte isolada.
- Controle relógio e operações assíncronas conforme a necessidade. Evite sleeps arbitrários e testes que dependem da ordem de execução. Não duplique a implementação para formar a expectativa.
- Coloque testes .test.ts e .test.tsx próximos do código correspondente. Compartilhe setup e fixtures de teste somente quando houver reutilização real.
- Não escreva testes específicos de logs, exports triviais ou CSS literal; não use snapshots extensos como principal proteção. Movimentações sem mudança comportamental e documentação não exigem testes artificiais.
- Execute npm run lint, npm run build e os testes aplicáveis em execução única. Se script de testes ainda não existir numa tarefa apenas de instruções, valide os arquivos sem inventar execução de testes.
- Em mudanças visuais, complemente com inspeção em navegador e teclado, quando disponível. Registre resultados e limites reais; não alegue percentual de cobertura ou acessibilidade comprovada sem evidência.

Referências: [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles/) e [Vitest Guide](https://vitest.dev/guide/).
