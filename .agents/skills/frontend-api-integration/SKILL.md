---
name: frontend-api-integration
description: Integrar este frontend à API Spring com HTTP tipado, renovação de sessão, tratamento de erros e proteção de credenciais no navegador.
---

# Integração com a API

Leia AGENTS.md e os serviços existentes antes de implementar. A API está no diretório irmão ../api; confirme os contratos no código ou na documentação OpenAPI atual. Não altere o backend silenciosamente para acomodar uma suposição do frontend.

## Fronteira HTTP

- Centralize base URL, serialização, respostas sem corpo, erros e autenticação em uma infraestrutura HTTP pequena. Serviços de funcionalidade traduzem operações e contratos do domínio; componentes não fazem fetch disperso pelo JSX.
- Configure a base URL por ambiente, por exemplo VITE_API_URL. Variáveis VITE_ são públicas no bundle; nunca coloque JWT_SECRET, senhas ou credenciais de infraestrutura nelas.
- Verifique status antes de interpretar JSON. Diferencie erro HTTP, falha de rede, timeout/cancelamento e resposta inesperada. Não converta todos em lista vazia ou sucesso.
- Trate dados externos como fronteira incerta e modele contratos TypeScript coerentes. Confirme formatos de paginação, datas e valores monetários; não transforme valores monetários em cálculos imprecisos de domínio no navegador.
- Associe fieldErrors aos campos quando houver e ofereça mensagem geral para falhas não associadas a campos. Não exponha stack traces ou mensagens brutas de infraestrutura.

## Sessão e concorrência

- O contrato atual fornece accessToken, tokenType e expiresIn no JSON; o refresh é um cookie HttpOnly gerenciado pelo backend. Confirme isso no código atual de auth antes de integrar.
- Mantenha o access token em memória. Não grave access ou refresh tokens em localStorage, sessionStorage ou logs. O frontend não lê nem fabrica o cookie HttpOnly.
- No contrato atual, login, refresh e logout precisam de credentials: include para intercâmbio de cookies; refresh e logout exigem X-Refresh-Request: true. Essas operações de autenticação não devem receber um Bearer antigo automaticamente.
- Restaure a sessão antes de decidir se uma rota protegida deve redirecionar. Distinga estado inicial desconhecido, autenticado e não autenticado, evitando piscar conteúdo protegido ou redirecionar prematuramente.
- Compartilhe uma única promessa de refresh entre requisições simultâneas. Após 401 de uma operação protegida, renove no máximo uma vez e evite loops. Não renove automaticamente em 403 nem em falha do próprio login/refresh.
- Só repita automaticamente operações quando for seguro: confirme que o 401 ocorreu antes de qualquer efeito; para mutações com possibilidade de execução, considere idempotência e preserve a ação do usuário sem duplicá-la.
- Logout deve revogar a sessão no servidor e limpar access token, estado e caches do usuário. Impeça que refresh ou requisições em voo restaurem uma sessão após logout ou troca de conta.
- Não esconda falha de rede como credencial inválida. Se o logout remoto falhar, limpe o estado local e comunique que o encerramento remoto não foi confirmado; não prometa revogação que não ocorreu.
- Guarde de rota serve à experiência de navegação; autorização efetiva continua no backend.

## Ambiente

- Confirme origens CORS exatas, hostname e configuração Secure/SameSite do cookie. No desenvolvimento local, frontend e API devem usar o mesmo hostname; portas diferentes continuam exigindo CORS.
- Diagnostique origem bloqueada, cookie não enviado e falha de credenciais separadamente. Não desative proteções ou use wildcard com cookies para contornar configuração.
- Não registre headers, cookies, payloads de autenticação ou dados pessoais. Capture erros em um ponto coerente, sem duplicar console.error em todas as camadas; não acrescente testes específicos de logs.

Referência de configuração pública no build: [Vite Env Variables and Modes](https://vite.dev/guide/env-and-mode).
