# Módulo mensagem

Chat persistido da sala: histórico via REST e criação de mensagens chamada pelo socket. Não tem `mensagem.routes.ts` — a única rota fica em `sala.routes.ts`.

## Rotas

| Método | Caminho | Quem pode | O que faz |
|---|---|---|---|
| GET | `/salas/:id/mensagens` | membro da sala | Últimas 50 mensagens em ordem cronológica, cada uma com `usuario { id, nome }`. `404` para não-membro. |

A escrita não tem rota REST: `criarMensagem()` é chamada pelo evento de socket `chat:enviar` em `sockets/salaSocket.ts`, que então emite `chat:mensagem` para a sala.

## Regras

- Histórico limitado às 50 mais recentes (`LIMITE_HISTORICO`), devolvidas da mais antiga para a mais nova.
- Mensagem vazia (ou só espaços) ou que não é string: `400` ("Mensagem vazia").
- Tamanho máximo de 1000 caracteres após `trim` (`400` acima disso).
- O texto é gravado como veio (só `trim`); o escape contra XSS fica no render do frontend (sem `dangerouslySetInnerHTML`).
- Este service não emite eventos; quem emite `chat:mensagem` é o `salaSocket.ts`.

## Dependências

- `lib/prisma.ts` — tabela `Mensagem`.
- `errors/AppError.ts` — erros com status HTTP.
- `modules/sala/sala.service.ts` — `buscarSalaOuFalhar` (acesso de membro no histórico).
- Usado por: `sockets/salaSocket.ts` (`criarMensagem`).

## Testes

Sem testes automatizados.
