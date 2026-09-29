# Módulo npc

NPCs da sala: blocos de estatística fixos do mestre, que não passam pelo motor de cálculo e podem virar tokens em vários mapas.

## Rotas

Criação e listagem ficam em `sala.routes.ts`; o resto em `/npcs` (`server.ts`). Todas exigem autenticação.

| Método | Caminho | Quem pode | O que faz |
|---|---|---|---|
| POST | `/salas/:id/npcs` | mestre | Cria NPC (201) e devolve os valores gravados. `400` nome vazio, campo inválido ou pasta de outra sala. |
| GET | `/salas/:id/npcs` | mestre | Todos os NPCs da sala, sem olhar pasta, por nome. |
| GET | `/npcs/:id` | mestre | Um NPC. `404` inexistente. |
| PATCH | `/npcs/:id` | mestre | Altera campos; `pastaId` move entre pastas. `400`; `404`. |
| DELETE | `/npcs/:id` | mestre | Apaga o NPC (204). `404`. |

Quem não é mestre recebe `403`; não-membro, `404` (via `garantirMestre`).

## Regras

- Leitura e escrita exigem papel `MESTRE` na sala do NPC.
- `nome` obrigatório na criação; no PATCH, se enviado, não pode ser vazio.
- Estatísticas por sistema da sala:
  - `ORDEM_PARANORMAL_1`: aceita `pv`, `pe`, `san`; `pd` é rejeitado (`400`).
  - `ORDEM_PARANORMAL_2`: aceita `pv`, `pd`; `pe` e `san` são rejeitados (`400`).
  - Valores aceitos devem ser inteiros ≥ 0 ou `null`.
- `atributos` é texto livre; `avatarUrl` opcional. Valores são gravados como enviados, sem cálculo.
- `pastaId`: `undefined` não mexe, `null` move para a raiz, string precisa ser pasta da mesma sala (`400` senão, via `validarPastaDaSala`).
- Apagar o NPC deixa os tokens que apontavam para ele no mapa com `npcId = null` (`onDelete: SetNull`).
- Nenhum evento em tempo real.

## Dependências

- `lib/prisma.ts` — tabela `Npc`.
- `errors/AppError.ts` — erros com status HTTP.
- `modules/sala/sala.service.ts` — `garantirMestre` (acesso e sistema da sala).
- `modules/pasta/pasta.service.ts` — `validarPastaDaSala`.
- `middlewares/auth.ts` — `autenticar` no router.

## Testes

Sem testes automatizados.
