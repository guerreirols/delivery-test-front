---
name: react-architecture
description: Organizar funcionalidades React, limites de dependência e estado deste frontend preservando separação entre apresentação, coordenação e integração HTTP.
---

# Arquitetura do frontend

Leia AGENTS.md, package.json e o fluxo existente. O ponto de partida é um template React com TypeScript e Vite; não trate as convenções como módulos já implementados.

- Organize por funcionalidade com subpastas por responsabilidade quando necessárias: pages, components, hooks, services e types. Não replique entidades e repositories JPA no frontend.
- Reserve app para composição global, providers e navegação. Uma página compõe a experiência de uma rota; um componente apresenta uma responsabilidade; um hook coordena estado/comportamento; um serviço traduz a integração HTTP.
- Coloque em shared/ui apenas elementos visuais sem regras de domínio e com contrato reutilizável concreto. Detalhes de pedidos ou sessão permanecem em sua funcionalidade. Não crie um design system amplo antes de seus primeiros componentes reais.
- A direção de dependência deve ser app para features e shared, e features para shared. Shared não importa features; uma feature não importa páginas e componentes internos de outra. Se um contrato precisar ser compartilhado, defina uma fronteira explícita e estreita.
- Evite arquivos index que exportam tudo e escondem dependências circulares. Introduza uma API pública por funcionalidade quando ela simplificar consumidores reais.
- Mantenha estado local perto do consumidor. Compartilhe estado apenas quando houver múltiplos consumidores; distinga estado da UI, estado de formulário, parâmetros de URL e dados remotos.
- Filtros, paginação e navegação que precisem sobreviver a recarregamento ou compartilhamento devem considerar a URL. Não use contexto global como depósito de todo estado.
- Se o volume de dados remotos exigir cache, invalidação ou deduplicação, avalie uma biblioteca apropriada à stack e centralize a solução. Não acrescente Redux, bibliotecas de query, router ou formulários por hábito.
- Preserve a solução de estilos vigente enquanto for suficiente. Caso CSS Modules seja adotado para isolamento, mantenha tokens globais e regras locais, sem misturar paradigmas concorrentes sem justificativa.
- Mudanças estruturais devem preservar contratos e comportamento. Faça a menor reorganização coerente com a tarefa e valide referências, lint, build e testes.
