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
| DELETE | `/npcs/:id` | mestre | Apaga o NPC (204) e a foto dele do disco. `404`. |
| PUT | `/npcs/:id/avatar` | mestre | Troca a foto (multipart, campo `imagem`, PNG/JPEG/WebP até 2MB), devolve o NPC. `400` sem arquivo ou tipo errado; `403` antes de receber o arquivo; `413` acima de 2MB. |
| DELETE | `/npcs/:id/avatar` | mestre | Tira a foto, devolve o NPC. |

Quem não é mestre recebe `403`; não-membro, `404` (via `garantirMestre`).

## Regras

- **Limite (05/11/2026):** 200 NPCs por mesa (`criarNoLimite`); acima → `400`.
- Leitura e escrita exigem papel `MESTRE` na sala do NPC.
- `nome` obrigatório na criação; no PATCH, se enviado, não pode ser vazio.
- Estatísticas por sistema da sala:
  - `ORDEM_PARANORMAL_1`: aceita `pv`, `pe`, `san`; `pd` é rejeitado (`400`).
  - `ORDEM_PARANORMAL_2`: aceita `pv`, `pd`; `pe` e `san` são rejeitados (`400`).
  - Valores aceitos devem ser inteiros ≥ 0 ou `null`.
- `atributos` é texto livre. Valores são gravados como enviados, sem cálculo.
- **Avatar (RNF10, 10/11/2026):** só entra pelo `PUT /npcs/:id/avatar` — criação e PATCH ignoram `avatarUrl`. Mesma regra e mesmo motivo da ficha (ver `modules/ficha/README.md`): cada foto é um arquivo só deste NPC, e trocar, tirar ou apagar o NPC remove o antigo do disco.
- `pastaId`: `undefined` não mexe, `null` move para a raiz, string precisa ser pasta da mesma sala (`400` senão, via `validarPastaDaSala`).
- Apagar o NPC deixa os tokens que apontavam para ele no mapa com `npcId = null` (`onDelete: SetNull`).
- Tempo real (10/11/2026): editar o NPC ou trocar/tirar a foto emite `npc:atualizado` `{ npc: { id, nome, avatarUrl } }` — **só se o NPC tem token no mapa que está na mesa**, para o token mudar ao vivo. Fora do mapa ninguém é avisado: a lista de NPCs é material de preparo (spoiler).

## Dependências

- `lib/prisma.ts` — tabela `Npc`.
- `errors/AppError.ts` — erros com status HTTP.
- `modules/sala/sala.service.ts` — `garantirMestre` (acesso e sistema da sala).
- `modules/pasta/pasta.service.ts` — `validarPastaDaSala`.
- `lib/armazenamento.ts` — `salvarImagemEnviada` e `removerArquivo` (avatar); `middlewares/upload.ts` — `uploadAvatar` (2MB).
- `sockets/emissor.ts` — `emitirParaSala` para `npc:atualizado`.
- `middlewares/auth.ts` — `autenticar` no router.

## Testes

Sem testes automatizados. A foto e o `npc:atualizado` foram conferidos em 10/11/2026 pela API e pelo socket (nas 27 verificações da foto, ver `modules/ficha/README.md`: `403` do jogador, nada para os jogadores com o NPC fora do mapa, aviso só com `id`/`nome`/`avatarUrl` quando ele tem token, arquivo apagado ao trocar e ao apagar o NPC) e no navegador (token do NPC mudando na tela da jogadora; foto e × na linha da lista).
