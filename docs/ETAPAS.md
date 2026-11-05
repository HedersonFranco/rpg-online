# Pipeline — critérios das etapas concluídas

Registro do que foi verificado em cada etapa já fechada: os critérios, como foram conferidos e os números medidos. A tabela de status e as etapas ainda em andamento ficam no `CLAUDE.md` da raiz; quando uma etapa fechar, a seção dela vem para cá.

Seções citadas abaixo: "Os dois sistemas" está no `CLAUDE.md` da raiz; "Motor de cálculo", em `backend/CLAUDE.md`; "Layout da tela de mesa", em `frontend/CLAUDE.md`.

## Etapa 1 — Setup
- [x] `docker compose up -d` sobe o Postgres; `docker ps` mostra `rpg-postgres` rodando
- [x] `GET /health` responde `{"status":"ok"}` na porta 3333
- [x] `vite.config.ts` carrega `@tailwindcss/vite`; `index.css` tem `@import "tailwindcss"`
- [x] `.env` fora do Git, `.env.example` presente
- [x] **ESLint configurado no backend** (hoje só existe no frontend) + script `lint`
- [x] **Runner de teste no backend** — `vitest` instalado e confirmado rodando sob TS 7 + `tsx` (teste sanity temporário passou); `npm test` hoje falha com "no test files" porque a Etapa 5 ainda não escreveu testes
- [x] Confirmar visualmente que uma classe Tailwind renderiza no navegador — verificado na Etapa 8 (screenshots do navegador real com o tema aplicado)

## Etapa 2 — Modelagem no Prisma
- [x] `schema.prisma` declara as entidades de OP1 (16 na época; hoje 18 com `FichaOP2`/`ClasseFormula` — ver "Os dois sistemas")
- [x] `npx prisma migrate dev --name init` cria a migration; `prisma/migrations/` passa a existir
- [x] `npx prisma migrate status` reporta aplicada e **nenhuma pendente** (reconfirmado após a migration de 22/09/2026)
- [x] `npx prisma studio` lista as tabelas — verificado via `psql \dt`, não pela GUI
- [x] Seed configurado (`migrations.seed` em `prisma7.config.ts` — Prisma 7 não lê `package.json`) e `npx prisma db seed` roda sem erro
- [x] Seed é **idempotente** — rodado duas vezes, contagens iguais (upsert por `classe`/`nome`)
- [x] `SELECT COUNT(*) FROM "Pericia"` retorna **28** (AGI 7, FOR 2, INT 9, PRE 9, VIG 1 — conferido por `GROUP BY` contra a Tabela 2.1 do livro; o critério antigo dizia 26, contagem errada)
- [x] `SELECT COUNT(*) FROM "ProgressaoClasse"` retorna ≥ 1 linha por classe × tier de NEX — **60** (20 por classe, NEX 5–99), conferido por `GROUP BY` e rodando o seed duas vezes (idempotente). Dados das Tabelas 1.3/1.4/1.5 do livro em `engine/progressaoOP1.ts` (fonte única do seed), com teste
- [x] FKs opcionais (`pastaId` em Npc/Mapa/Documento, `fichaId`/`npcId` em `Token`) aceitam NULL — testado com insert real via Prisma Client
- [x] **Novo:** `Token` tem CHECK constraint (`token_ficha_xor_npc`) impedindo `fichaId` e `npcId` preenchidos ao mesmo tempo — testado, insert violando a regra é rejeitado pelo Postgres. *(Em 22/10/2026 virou `token_um_vinculo`: no máximo um entre ficha, NPC e montaria — testado do mesmo jeito.)*

> **Bloqueio resolvido (29/09/2026):** fórmula de PV/PE/San, os 20 tiers de NEX, as 28 perícias e as habilidades por NEX das três classes (Tabelas 1.3/1.4/1.5) confirmados direto no livro (v1.3) e em seed. Toda ficha que sai da API/socket traz `habilidadesDesbloqueadas` (acumuladas até o NEX atual, calculadas no backend com a tabela do banco); a divisória Habilidades mostra essa lista "da classe", só de leitura, acima das que o jogador cadastra.

## Etapa 3 — Autenticação
- [x] `POST /auth/cadastro` cria usuário e retorna token válido
- [x] `POST /auth/login` com senha errada → **401**
- [x] Rota protegida (`GET /auth/me`) sem header `Authorization` → **401**; token expirado → **401**
- [x] `senha_hash` no banco não contém a senha em texto plano (bcryptjs, 10 rounds)
- [x] Convite tem expiração — **só a função pura** (`engine/convite.ts`, testada com vitest); endpoint de consumo (entrar na sala) é Etapa 4, por decisão
- [x] 11ª tentativa de login no mesmo minuto pelo mesmo IP → **429** (testado com 15 requisições em sequência)

> Rate limit em **cadastro e login** (os dois compartilham o mesmo contador, 10/min por IP); `GET /auth/me` fica sem limite, porque só valida o token da sessão. Reconferido na Etapa 11: 10 × 401 e a 11ª × 429.

## Etapa 4 — Sala e Membros
- [x] Sala criada aparece em `GET /salas`
- [x] 4ª sala do mesmo dono → erro claro (limite de 3) — `400 {"error":"Limite de 3 salas por dono atingido"}`
- [x] Segundo usuário entra pelo link e vira `jogador` em `MembroSala` — via `POST /salas/entrar`, consome `engine/convite.ts`
- [x] Dono promove jogador a `mestre` e o papel muda no banco — `PATCH /salas/:id/membros/:membroId`
- [x] Jogador tentando deletar a sala → **403**
- [x] Não-membro tentando `GET /salas/:id` → **404** (escolhido em vez de 403, pra não confirmar a existência da sala pra quem não é membro)

> Criador da sala vira `MembroSala` com papel `MESTRE` automaticamente (decisão nova: `donoId` e o papel em `MembroSala` são conceitos separados no schema, mas sem isso o dono nunca teria papel de mestre nas checagens de autorização). `Sala.donoId` não tem cascade delete (protege contra apagar usuário que ainda é dono de sala) — só `Sala → MembroSala/Ficha/Npc/...` casca.

## Etapa 5 — Motor de cálculo
- [x] `npm test` passa cobrindo **cada classe × ≥ 3 tiers de NEX** (COMBATENTE/ESPECIALISTA/OCULTISTA × NEX 5/50/99, com fórmula real)
- [x] Bordas cobertas: NEX 5% e NEX 99%
- [x] Roda **sem banco** (fórmula + habilidades injetadas como parâmetro — `calcularFicha(entrada, tabelaHabilidades, formulas)`)
- [x] ≥ 3 resultados conferidos manualmente contra o livro — **resolvido em 22/09/2026**: PDF oficial (Ordem Paranormal RPG v1.3) fornecido, dados extraídos direto do texto (Cap. 1, p. 24-25/28-29/32-33). `pv_maximo`/`pe_maximo`/`san_maximo` das 3 classes em NEX 50% conferidos contra a fórmula do livro nos testes. Ainda não conferido contra o C.R.I.S. em si (não usado), mas o livro é a fonte primária aceita pelo critério.
- [x] Entrada inválida (NEX que não é um dos 20 tiers, negativo, > 99, classe inexistente) → erro tratado, não crash

> **OP2 (Ordem Paranormal RPG II — Playtest Alpha, Ago/2026):** o usuário pediu suporte aos dois sistemas. Investiguei o PDF enviado e **não há fórmula de PV/PD publicada nesse playtest** — as fichas são pré-prontas ("sobreviventes") e o texto diz explicitamente que a ficha de criação completa "será apresentada em um playtest futuro". Por isso não existe (ainda) um motor de cálculo de OP2 equivalente ao de OP1 — seria inventar uma regra que o próprio livro não publicou. O que É concreto e foi implementado: `engine/op2/escalaDados.ts` (a escala de step d4↔d12, com d20 como exceção — mecânica real e testada) e `engine/op2/catalogo.ts` (3 atributos — Físico/Mente/Emoção — e as 20 perícias com atributo-base, extraídos literalmente do PDF). Isso é só fundação de dados; schema/seed/ficha de OP2 **não fazem parte do pipeline de 11 etapas** (que é todo OP1) e ficam pra quando isso for decidido explicitamente.

## Etapa 7 — NPC e Pastas
- [x] NPC criado retorna valores idênticos aos inseridos (sem passar pelo motor) — no `POST` e no `GET`
- [x] Criar pasta → subpasta → mover NPC entre pastas funciona (`PATCH /npcs/:id { pastaId }`)
- [x] NPC sem `pastaId` aparece na raiz (`GET /salas/:id/biblioteca` sem `pastaId`); NPC dentro de pasta **não** aparece na raiz
- [x] Comportamento de deletar pasta com conteúdo está **definido e testado**: o conteúdo (NPCs, documentos, mapas, subpastas) **sobe pra pasta-pai**, ou pra raiz se a pasta era de raiz — nada é apagado junto. Testado nos dois casos (pasta aninhada e pasta de raiz).
- [x] O mesmo NPC vira token em dois mapas sem duplicar o registro — verificado **no modelo de dados** (Prisma direto: 2 mapas, 2 tokens, contagem de NPC inalterada), porque Mapa/Token só ganham endpoints na Etapa 10. Também confirmado: deletar o NPC deixa os tokens no mapa com `npcId = null`.

> Extras testados: mover pasta pra dentro da própria filha → 400 (ciclo); jogador criando NPC ou vendo a biblioteca → 403; não-membro → 404; `pv` negativo → 400; campo do sistema errado (`pd` em sala OP1, `san` em sala OP2) → 400.

## Etapa 8 — Frontend REST
> Verificado em navegador real (Edge headless via `playwright-core`, rodado de um diretório temporário fora do repo — não é dependência do projeto), 25 asserções + screenshots conferidos visualmente.
- [x] Login persiste: refresh na página mantém logado (token em `localStorage`, revalidado com `GET /auth/me` no carregamento)
- [x] Lista de salas renderiza dados reais da API (não mock) — contagem e nome conferidos contra `GET /salas`
- [x] Ficha renderiza valores vindos do backend — o front não recalcula nada. Botões +/− só **pedem** um novo `*_atual`; a tela exibe o que o `PATCH` devolve (conferido no banco: 23 → 22)
- [x] Layout bate com as zonas da seção "Layout da tela de mesa" — header, sidebar (6 seções na ordem), faixa de vídeo com badge "Mestre", área do mapa (toolbar, zoom, "Piso 1"), barra de turno recolhida, painel da ficha
- [x] Login/cadastro/lista testados em 375px **sem scroll horizontal** (`scrollWidth <= innerWidth`)
- [x] Backend desligado → **mensagem de erro clara**, não tela branca — testado com o backend realmente parado (não só simulado), com botão "Tentar novamente"
- [x] Operação > 300ms mostra spinner ou skeleton — resposta atrasada em 1,2s mostra o spinner; abaixo de 300ms nada pisca (`useAtrasado`)

> Extras: sessão expirada/token inválido volta pro login; rota protegida sem sessão redireciona pra `/login` e retorna ao destino depois; `ErrorBoundary` na raiz pega erro de render; zero erros inesperados no console. Seções da sidebar além de "Mesa", mapa, rolagem e áudio aparecem como "ainda não disponível" (são das Etapas 9/10) — honesto, não quebrado. **Fichas de OP2 não têm UI** (não há CRUD de `FichaOP2`); a mesa OP2 mostra essa explicação no painel.

## Etapa 9 — Tempo real (testar sempre com duas abas)
> Verificado com duas abas reais (Edge headless, `playwright-core` em diretório temporário fora do repo): aba do mestre + aba do jogador na mesma mesa, com o script subindo e **reiniciando o backend de verdade** no critério 7.
- [x] Alterar PV numa aba reflete na outra em < 1s — medido: **90ms**
- [x] Alterar NEX recalcula os máximos e reflete na outra — NEX 5% → 50% na aba do jogador, aba do mestre mostra PV máximo 59 (20 + Vig 3 + 9×4) em ~120ms
- [x] Chat e rolagem de dados aparecem nas duas abas (mensagem com `<b>` aparece como texto — não é interpretada)
- [x] Mestre inicia combate → ordem aparece nas duas → "Encerrar turno" avança (Zumbi 18 → Bianca 12 → rodada 2)
- [x] "Encerrar turno" por quem não é o jogador ativo nem mestre → rejeitado **pelo servidor** (`403`, testado com cliente socket direto, não só o botão desabilitado)
- [x] DevTools → Offline → religar: socket reconecta sozinho em < 30s e o estado volta — queda percebida em ~14s (heartbeat), reconectou **1,3s** depois de religar, e um PV alterado enquanto a aba estava offline apareceu após a reconexão
- [x] Reiniciar o servidor durante combate → cliente avisa estado perdido, sem dados fantasma — as duas abas mostram "Sessão reiniciada — reinicie o combate." e a barra volta a "Nenhum combate em andamento", sem fila residual
