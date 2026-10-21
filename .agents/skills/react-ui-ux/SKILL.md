---
name: react-ui-ux
description: Projetar, implementar e revisar interfaces React com componentes reutilizáveis, hierarquia visual, estados completos, responsividade e acessibilidade.
---

# UI e experiência de uso

Leia AGENTS.md e examine os componentes e estilos existentes. Parta do objetivo do usuário e das ações reais da tela; respeite identidade visual e referências fornecidas. Não associe a interface à marca de uma empresa sem pedido do usuário.

## Composição e consistência

- Defina a ação principal e a hierarquia da tela antes de distribuir elementos. Use tipografia, alinhamento, espaçamento e densidade de informação para orientar a tarefa; evite cartões e decorações sem função.
- Centralize tokens de cores, tipografia, espaçamento, bordas e foco na base de estilos quando iniciar a UI real. Use uma escala coerente em vez de valores arbitrários repetidos.
- Extraia componentes compartilhados conforme os usos concretos, como botões, campos e feedback. Defina variantes pequenas e estados visuais consistentes; mantenha regras de domínio fora dessas primitivas.
- Preserve o mesmo significado para cores e rótulos em toda a aplicação. Estados de pedidos devem ter texto ou ícone identificável, sem depender apenas da cor.
- Use conteúdo realista em português, com ações específicas e mensagens úteis. Não exponha detalhes de infraestrutura ao usuário nem apresente conteúdo de demonstração como dado real.

## Estados e formulários

- Inclua carregamento inicial, atualização, lista vazia, erro recuperável, sucesso e indisponibilidade. Diferencie vazio de falha e preserve dados existentes durante atualização quando adequado.
- Previna envio duplicado e dê feedback durante a ação sem bloquear desnecessariamente toda a tela. Em falhas, preserve os campos que puderem ser mantidos com segurança e ofereça um caminho claro de recuperação.
- Relacione mensagens de validação aos campos. Não use toast como única indicação de erro de formulário. Mantenha labels visíveis, autocomplete apropriado e permita colagem e gerenciadores de senhas.
- Para ações destrutivas ou de consequência relevante, use confirmação contextual ou possibilidade de desfazer quando aplicável, proporcional ao efeito real da ação.

## Acessibilidade e responsividade

- Prefira HTML semântico: button para ação, link para navegação, labels associados a inputs e headings em ordem coerente. Componentes customizados devem preservar o comportamento de teclado esperado.
- Garanta nomes acessíveis para controles com ícone, foco visível e ordem de tabulação lógica. Não remova outline sem substituição; não use placeholder como label.
- Diálogos devem gerenciar foco, fechamento e retorno ao acionador. Prefira mecanismos nativos ou componentes acessíveis já disponíveis em vez de recriar padrões frágeis.
- Verifique contraste, zoom, quebra de texto e tamanho confortável de alvos. Respeite prefers-reduced-motion; animações não devem impedir a interação.
- Use layouts fluidos e ajuste pelo conteúdo. Verifique viewport pequeno, intermediário e desktop; formulários, tabelas e navegação precisam de adaptação intencional, sem scroll horizontal na página.
- Inspecione a interface renderizada e navegue por teclado quando as ferramentas permitirem. Avalie alinhamento, recortes, textos longos, foco e estados de erro. Testes automatizados não comprovam sozinhos a qualidade visual.

Referência para semântica, formulários e navegação: [W3C WAI Tutorials](https://www.w3.org/WAI/tutorials/). Não declare conformidade formal de acessibilidade sem avaliação correspondente.
