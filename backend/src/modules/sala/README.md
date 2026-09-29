# Módulo sala

Mesas (salas), seus membros, convites e banimentos. Também exporta `buscarSalaOuFalhar()` e `garantirMestre()`, as checagens de acesso usadas pelos outros módulos e pelo socket.

## Rotas

Montado em `/salas` (`server.ts`); todas exigem autenticação. `sala.routes.ts` também monta rotas de outros módulos (fichas, NPCs, mensagens, mapas, pastas) — elas estão documentadas no README do módulo dono.

| Método | Caminho | Quem pode | O que faz |
|---|---|---|---|
| POST | `/salas` | autenticado | Cria sala com `nome` e `sistema` (201); o criador vira membro `MESTRE`. `400` para nome vazio, sistema inválido ou 4ª sala do dono. |
| GET | `/salas` | autenticado | Lista salas em que o usuário é dono ou membro, com o `papel` dele em cada uma. |
| POST | `/salas/entrar` | autenticado | Entra por `{ token }` de convite; vira `JOGADOR` (201). `400` convite ausente/inválido/expirado; `403` se banido. |
| GET | `/salas/:id` | membro da sala | Sala com membros (`id`, `nome` do usuário). `404` para não-membro. |
| DELETE | `/salas/:id` | dono da sala | Apaga a sala (204). `403` para quem não é dono. |
| POST | `/salas/:id/convite` | dono da sala | Gera novo convite, substituindo o anterior. `403` para quem não é dono. |
| PATCH | `/salas/:id/membros/:membroId` | dono da sala | Troca `papel` para `MESTRE` ou `JOGADOR`. `400` papel inválido ou alvo é o dono (o dono é sempre mestre); `403`; `404` membro inexistente. |
| DELETE | `/salas/:id/membros/:membroId` | dono da sala | Expulsa (204); com `?banir=1` (ou `true`) também bane. `400` se o alvo é o dono; `403`; `404`. |
| GET | `/salas/:id/banidos` | dono da sala | Lista banimentos com `id`/`nome` do usuário. `403`. |
| DELETE | `/salas/:id/banidos/:usuarioId` | dono da sala | Remove o banimento (204). `403`; `404` se não havia banimento. |

## Regras

- `sistema` obrigatório: `ORDEM_PARANORMAL_1` ou `ORDEM_PARANORMAL_2`.
- Limite de 3 salas por dono (`LIMITE_SALAS_POR_DONO`); não há limite como participante.
- Não-membro recebe `404`, não `403`, para não confirmar que a sala existe. O dono conta como membro mesmo sem linha em `MembroSala`.
- `garantirMestre()`: membro sem papel `MESTRE` recebe `403`.
- Convite gerado por `engine/convite.ts` com validade de 7 dias; um convite ativo por vez (`conviteToken`/`conviteExpiraEm` em `Sala`).
- `conviteToken`/`conviteExpiraEm` só aparecem para o dono (`ocultarConvite()` no controller, em `GET /salas`, `GET /salas/:id` e `POST /salas/entrar`); os demais recebem `null`.
- Entrar com convite de quem já é membro não duplica nem altera o papel; só uma entrada nova emite `sala:membros`.
- O dono não pode ser removido. Remover apaga só o `MembroSala`; as fichas da pessoa ficam na sala. Banir faz upsert em `Banimento` na mesma transação.
- Desbanir só apaga o banimento; a pessoa não volta à mesa sozinha.
- Deletar sala: o banco cascateia as tabelas filhas; as imagens dos mapas são removidas do disco depois (`removerArquivo`).
- Tempo real:
  - `emitirParaSala(salaId, 'sala:membros', { membros })` ao entrar (membro novo), trocar papel e remover.
  - `expulsarDaSala(salaId, usuarioId, 'expulso' | 'banido')` ao remover: as abas do alvo recebem `sala:removido`, saem da sala de socket e do vídeo; o resto recebe `video:participantes`.
  - `encerrarSala(salaId)` ao deletar: todos recebem `sala:removido` (`motivo: 'apagada'`) e o combate/última rolagem em memória são descartados.

## Dependências

- `lib/prisma.ts` — tabelas `Sala`, `MembroSala`, `Banimento`, `Mapa`.
- `errors/AppError.ts` — erros com status HTTP.
- `engine/convite.ts` — `gerarConvite`, `validarConvite` (service) e `ocultarConvite` (controller).
- `sockets/emissor.ts` — `emitirParaSala`, `expulsarDaSala`, `encerrarSala`.
- `lib/armazenamento.ts` — `removerArquivo` para as imagens de mapa ao apagar a sala.
- `middlewares/auth.ts` — `autenticar` em todo o router.
- `middlewares/upload.ts` — `uploadMapa`, montado aqui em `POST /salas/:id/mapas`.
- Controllers de `ficha`, `npc`, `mensagem`, `mapa` e `pasta` — rotas aninhadas em `/salas/:id/...`.
- Usado por: `ficha`, `mapa`, `mensagem`, `npc`, `pasta` e `sockets/salaSocket.ts` (checagens de acesso).

## Testes

Sem testes automatizados próprios; `engine/convite.test.ts` cobre a geração, validação e ocultação do convite.
