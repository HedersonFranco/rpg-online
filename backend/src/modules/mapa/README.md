# Módulo mapa

Mapas da sala (upload da imagem, mapa ativo) e tokens sobre eles. Também fornece ao socket a checagem e a gravação do movimento de token.

## Rotas

Upload, listagem e mapa ativo ficam em `sala.routes.ts`; o resto em `/mapas` e `/tokens` (`server.ts`). Todas exigem autenticação.

| Método | Caminho | Quem pode | O que faz |
|---|---|---|---|
| POST | `/salas/:id/mapas` | mestre | Upload multipart (`imagem` + `nome`); grava a imagem e cria o mapa (201). `400` sem nome, sem arquivo ou formato não suportado; `413` acima de 10MB. |
| GET | `/salas/:id/mapas` | mestre | Lista todos os mapas da sala. |
| GET | `/salas/:id/mapa-ativo` | membro da sala | `{ mapa, tokens }` do mapa ativo, ou `{ mapa: null, tokens: [] }`. |
| PUT | `/salas/:id/mapa-ativo` | mestre | Define `{ mapaId }` (ou `null`) como ativo. `400` se o mapa não é desta sala. |
| DELETE | `/mapas/:id` | mestre | Apaga o mapa e a imagem (204). `404` mapa inexistente. |
| POST | `/mapas/:id/tokens` | mestre | Cria token de ficha, NPC ou objeto em `x`,`y` (201). `400` em dados inválidos. |
| DELETE | `/tokens/:id` | mestre | Remove o token (204). `404` token inexistente. |

Quem não é mestre recebe `403`; não-membro, `404` (via `garantirMestre`/`buscarSalaOuFalhar`).

## Regras

- Tipo da imagem detectado pelos bytes (`detectarTipoImagem`): só PNG, JPEG ou WebP. O limite de 10MB é do `multer` (`middlewares/upload.ts`); o `errorHandler` converte em `413`.
- A lista completa de mapas é só do mestre; o jogador só vê o ativo.
- `mapaId` do mapa ativo deve ser string de um mapa da mesma sala, ou `null`.
- Apagar mapa remove o arquivo do armazenamento; os tokens caem por cascade (`onDelete: Cascade` em `Token.mapa`) e `Sala.mapaAtivoId` vira `null` (`SetNull`).
- Token: `x`/`y` números finitos com |valor| ≤ 100.000. Não pode ter `fichaId` e `npcId` juntos. Ficha/NPC precisam ser da mesma sala do mapa. Sem ficha nem NPC, `nome` é obrigatório.
- Dados expostos no token (`INCLUIR_DADOS_TOKEN`): da ficha, `id`, `nome`, `usuario_id`, `avatarUrl`, `pv_atual`, `pv_maximo_cache`; do NPC, só `id`, `nome`, `avatarUrl`.
- Movimento (usado por `sockets/salaSocket.ts`, evento `token:mover`): `podeMoverToken` permite ao mestre qualquer token e ao jogador só o da própria ficha; quem não é mais membro não move nada. `salvarPosicaoToken` usa `updateMany`, então soltar um token já apagado não gera erro.
- Tempo real (`emitirParaSala`):
  - `mapa:ativo` com `{ mapa, tokens }` ao definir o ativo, e com `{ mapa: null, tokens: [] }` ao apagar o mapa que estava ativo.
  - `token:criado` com `{ token }`.
  - `token:removido` com `{ tokenId }`.

## Dependências

- `lib/prisma.ts` — `Mapa`, `Token`, `Sala`, `Ficha`, `Npc`, `MembroSala`.
- `errors/AppError.ts` — erros com status HTTP.
- `lib/armazenamento.ts` — `detectarTipoImagem`, `salvarArquivo`, `removerArquivo`.
- `modules/sala/sala.service.ts` — `buscarSalaOuFalhar` e `garantirMestre`.
- `sockets/emissor.ts` — `emitirParaSala`.
- `middlewares/auth.ts` — `autenticar`; `middlewares/upload.ts` — `uploadMapa` (em `sala.routes.ts`).
- Usado por: `sockets/salaSocket.ts` (`coordenadaValida`, `podeMoverToken`, `salvarPosicaoToken`).

## Testes

Sem testes automatizados próprios; `lib/armazenamento.test.ts` cobre a detecção de tipo da imagem pelos bytes.
