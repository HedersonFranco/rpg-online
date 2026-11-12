# Módulo pasta

Pastas da biblioteca do mestre (árvore autorreferenciada por `paiId`) e a listagem da biblioteca por nível.

## Rotas

Criação e biblioteca ficam em `sala.routes.ts`; o resto em `/pastas` (`server.ts`). Todas exigem autenticação.

| Método | Caminho | Quem pode | O que faz |
|---|---|---|---|
| POST | `/salas/:id/pastas` | mestre | Cria pasta com `nome` e `paiId` opcional (201). `400` nome vazio ou pai de outra sala. |
| GET | `/salas/:id/biblioteca` | mestre | `{ pastaId, pastas, npcs }` de um nível; `?pastaId=` escolhe o nível, sem ele é a raiz. `400` pasta de outra sala. |
| PATCH | `/pastas/:id` | mestre | Renomeia e/ou move (`paiId`). `400` nome vazio, destino de outra sala ou ciclo; `404` inexistente. |
| DELETE | `/pastas/:id` | mestre | Apaga a pasta e devolve `{ movidosPara, npcs, documentos, mapas, subpastas }` (contagens movidas). `404`. |

Quem não é mestre recebe `403`; não-membro, `404` (via `garantirMestre`).

## Regras

- **Limite (05/11/2026):** 100 pastas por mesa (`criarNoLimite`); acima → `400`.
- Leitura e escrita exigem papel `MESTRE`.
- `paiId`/pasta de destino precisa existir e ser da mesma sala (`validarPastaDaSala`, `400`).
- No PATCH, `paiId` `undefined` não mexe, `null` move para a raiz.
- Mover uma pasta para dentro dela mesma ou de um descendente é rejeitado (`400`, subindo a cadeia de `paiId`). A checagem e o movimento correm numa transação com trava por mesa (`travar()`, 12/11/2026): sem ela, A→B e B→A ao mesmo tempo passavam os dois e fechavam um ciclo (19 de 20 rodadas no teste), e o próximo movimento ficava preso no laço.
- `nome` até 100 caracteres (`nomeObrigatorio()`).
- Deletar pasta nunca apaga conteúdo: NPCs, documentos, mapas e subpastas vão para a pasta-pai (ou raiz), tudo numa transação.
- A biblioteca lista só pastas e NPCs do nível, ordenados por nome.
- Nenhum evento em tempo real.

## Dependências

- `lib/prisma.ts` — `Pasta`, `Npc`, `Documento`, `Mapa`.
- `errors/AppError.ts` — erros com status HTTP.
- `modules/sala/sala.service.ts` — `garantirMestre`.
- `middlewares/auth.ts` — `autenticar` no router.
- Usado por: `modules/npc/npc.service.ts` (`validarPastaDaSala`).

## Testes

Sem testes automatizados.
