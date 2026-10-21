---
name: react-clean-code
description: Implementar e refatorar componentes React, hooks e TypeScript deste frontend com responsabilidades coesas, composição e contratos tipados.
---

# Clean Code em React e TypeScript

Leia AGENTS.md, package.json e os componentes relacionados. Confirme a estrutura vigente antes de criar abstrações.

- Mantenha cada componente em um nível de abstração: composição da tela, apresentação de uma parte ou coordenação de um comportamento. Extraia quando houver responsabilidades distintas ou intenção difícil de acompanhar, sem limite arbitrário de linhas.
- Use componentes funcionais, nomes de componentes em PascalCase e hooks com prefixo use. Prefira propriedades de domínio a nomes genéricos e contratos pequenos que impeçam estados inválidos.
- Separe acesso HTTP em serviços e coordenação de operações assíncronas em hooks quando houver lógica suficiente para justificar a extração. JSX não deve conter parsing de respostas, renovação de sessão ou regras complexas de negócio.
- Derive valores simples durante a renderização. Não duplique em state algo calculável a partir de props ou de outro estado. Reserve effects para sincronização externa; eventos de usuário devem iniciar suas ações nos handlers correspondentes.
- Effects que disparam operações assíncronas precisam tratar cancelamento ou respostas obsoletas. Não use refs para contornar StrictMode nem suprima dependências para silenciar o lint.
- Prefira const, imutabilidade e atualizações funcionais quando dependerem do estado anterior. Não use var ou comentários no corpo do código.
- Tipos de props, serviços e contratos externos devem ser explícitos. Use inferência local quando clara; unknown e narrowing nas fronteiras incertas. Não use any, non-null assertions ou casts para esconder ausência de validação.
- Não trate asserção TypeScript como validação de JSON em runtime. Modele estados assíncronos e erros de forma que a UI possa responder a eles.
- Reutilize por composição e props claras. Evite componentes universais, funções utilitárias sem assunto, interfaces desnecessárias e abstrações criadas antes de um uso concreto.
- Memoização só deve existir por custo identificado ou requisito de identidade; não aplique memo, useMemo e useCallback automaticamente.
- Use chaves estáveis de domínio em listas mutáveis; não use índices quando houver inserção, remoção ou reordenação. Preserve a identidade de componentes para não perder foco ou estado do formulário.
- Teste o comportamento alterado conforme frontend-testing; não teste implementação privada nem apenas snapshots.

Referências para decisões sobre estado e efeitos: [Thinking in React](https://react.dev/learn/thinking-in-react) e [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).
