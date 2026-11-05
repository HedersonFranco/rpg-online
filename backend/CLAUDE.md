# Backend — RPG Online

Complementa o `CLAUDE.md` da raiz, que continua valendo aqui (regras de negócio, autorização, eventos de tempo real, pipeline). Este arquivo tem o que só vale dentro de `backend/`. Rotas, permissões e regras de cada módulo: `src/modules/*/README.md`.

---

## Stack — notas do backend

**`ts-node-dev` é incompatível com TS 7** — usar sempre `tsx`.
**Prisma 7** usa `prisma7.config.ts` para `datasource.url` — o `schema.prisma` não declara `url` diretamente.
**Express 5 tipa `req.params` como `string | string[]`** (`@types/express-serve-static-core` 5.1: parâmetro curinga vira lista). Controller declara os parâmetros da rota — `req: Request<{ id: string }>` — e o compilador ainda confere que batem com o caminho da rota. Nada de `req.params.id!` (era a origem de 33 dos 36 erros que faziam o `npm run build` do backend falhar até 22/10/2026).
**Prisma 7 exige driver adapter** — `PrismaClient` não conecta sem um adapter. Usar `@prisma/adapter-pg` + `pg`: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`. Todo service que instanciar o client precisa disso (idealmente um client singleton compartilhado quando os módulos forem escritos).
**`prisma migrate dev` recusa rodar neste ambiente** (detecta shell não-interativo e recusa, mesmo com `--create-only`). Workaround: `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` gera o SQL, salva manualmente em `prisma/migrations/<timestamp>_<nome>/migration.sql`, aplica com `prisma migrate deploy` (não-interativo).
**`typescript-eslint` não suporta TS 7** (bloqueio confirmado, não só peer warning — [issue #10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)). ESLint do backend usa `@babel/eslint-parser` + `@babel/preset-typescript` só para sintaxe — **sem regras tipadas**. Por isso `no-unused-vars` está desligado: Babel não enxerga `import type { X }` usado só em anotação de tipo como uso, e todo handler Express tipado (`Request`/`Response`/`NextFunction`) cairia nesse falso positivo. Revisar tudo isso quando a issue fechar.

---

## Motor de cálculo (`backend/src/engine/calculoFicha.ts`) — só OP1

Função pura chamada pela API REST e pelo WebSocket:
1. Recebe: `classe`, `nex`, atributos (`for`, `agi`, `int`, `vig`, `pre`), perícias treinadas.
2. Consulta `ClasseFormula` (base+incremento por classe) e `ProgressaoClasse` (habilidades por tier) — ambos passados como parâmetro, nunca via banco direto.
3. Retorna: `pv_maximo`, `pe_maximo`, `san_maximo`, testes de perícia (`testesPericias`), habilidades desbloqueadas (acumuladas de todos os tiers ≤ NEX atual).

**Fórmula confirmada no livro (Ordem Paranormal RPG v1.3):** `pv_maximo = pvBase(classe) + Vigor + pvPorTier(classe) × tier`; mesma lógica pra PE com Presença; Sanidade **não soma atributo**. `tier` = posição de `nex` na sequência fixa de 20 degraus `[5,10,...,95,99]` (99% conta como mais um degrau mesmo sendo só +4%). NEX só pode ser um desses 20 valores — qualquer outro é erro tratado.

**Teste de perícia = (atributo-base)d20, fica com o melhor, + bônus do grau de treino** (`Destreinado` 0 / `Treinado` +5 / `Veterano` +10 / `Expert` +15). O atributo é a **quantidade de dados**, não soma no bônus — ex.: Vigor 3 + Fortitude Treinado = **3d20+5**. Atributo 0 rola 2d20 e fica com o **pior** (`modo: 'menor'`). Confirmado no livro (p. 10, "Modificador" e graus de treino). *(Corrigido em 23/09/2026 — a versão anterior deste arquivo e do motor somava atributo + treino, o que estava errado.)* `montarTestesPericias()` é a função pura; toda ficha que sai da API/socket traz `testesPericias` com as 28 (sem linha em `FichaPericia` = Destreinado).

`pv/pe/san_maximo_cache` na tabela `Ficha` são **cache** — nunca fonte da verdade.
Botões de combate alteram só o valor **atual**, validado no servidor: **Vida e Sanidade podem passar do máximo** (há habilidades para isso — decisão de 30/09/2026; teto 999 só contra valor absurdo); Esforço fica em 0 ≤ atual ≤ máximo. A ficha tem −1/+1 nos três e −5/+5 em Vida e Esforço.

**Defesa (30/09/2026, livro p. 42 e p. 87):** `calcularDefesa()` no motor — Defesa = 10 + Agilidade + `defesa_bonus` (modificadores de equipamento/habilidades/condições, informados pelo jogador na ficha); **Esquiva** (treinado em Reflexos) = Defesa + bônus de Reflexos; **Bloqueio** (treinado em Fortitude) = RD igual ao bônus de Fortitude, só contra corpo a corpo. Sem treino → reação indisponível (`null`). Uma reação por rodada. Contra-ataque (treinado em Luta) não entrou — não foi pedido.
NPCs **não** passam por este motor.

A função deve rodar **sem conexão com o banco** nos testes — as tabelas entram como parâmetro ou mock. Se precisar do Prisma para ser testada, não é pura o bastante.

**OP2 não tem motor de cálculo equivalente** — o Playtest Alpha não publica fórmula de PV/PD (fichas são pré-prontas). `FichaOP2.pv_maximo`/`pd_maximo` são valores atribuídos diretamente, não calculados. Revisar quando o playtest completo (com criação de personagem) for lançado.

---

## Banco de dados — decisões de design

- `Ficha` (OP1) usa colunas tipadas (não JSON livre) — permite queries como "fichas com NEX >= 30".
- **OP2 usa tabela separada (`FichaOP2`)** em vez de esticar `Ficha` com campos nulos — mesmo padrão já previsto aqui pra um eventual D&D no futuro (`FichaDnd` ou campo `extra Json`), só que aplicado agora pro próprio Ordem Paranormal (v1.3 x RPG II).
- `ProgressaoClasse` guarda só **habilidades por tier de NEX** (uma linha por classe+NEX). PV/PE/San **não** ficam lá — são fórmula em `ClasseFormula` (uma linha fixa por classe: base + incremento por tier) somada ao atributo do personagem no motor de cálculo. Ver seção "Motor de cálculo".
- `Pericia` (**28** fixas — Tabela 2.1, p. 41 do livro v1.3: Agilidade 7, Força 2, Intelecto 9, **Presença 9**, Vigor 1; a contagem "26" anterior estava errada) é catálogo populado via **seed** a partir de `engine/pericias.ts`, não criado pelo usuário. O seed deve ser **idempotente** (rodar duas vezes não duplica). **`Ritual`/`FichaRitual` foram removidos em 23/09/2026** (estavam vazios) — ritual virou `FichaEntrada` escrita pelo jogador. `Pericia`/`FichaPericia`/`FichaEntrada` são **só de OP1** — OP2 guarda perícias como Json direto em `FichaOP2` (ver "Os dois sistemas").
- `Npc` é entidade separada de `Ficha` — monstros não têm progressão por NEX. Tem `pv/pe/san` (OP1) e `pd` (OP2), todos opcionais; o service rejeita campo do sistema errado pra sala. `atributos` é texto livre (bloco de estatística fixo).
- `Pasta` é genérica e autorreferenciada; relação com Npc/Mapa/Documento é opcional.
- `Sessao` é enxuta — base para histórico futuro sem vínculo obrigatório com mensagens.
- Rolagem de dados **não tem tabela** — é evento em tempo real.
- **Estado de combate (turno/iniciativa) não tem tabela** — vive em memória do processo Node.
- Redis: adiado — estado de sessão ativa em memória do processo Node por ora.
- Armazenamento de arquivos: abstraído em função `salvarArquivo()` (`lib/armazenamento.ts`) para trocar disco local por S3 no futuro — implementado na Etapa 10.
- **Convite não é entidade própria** (não está nas 16) — vive como `conviteToken`/`conviteExpiraEm` direto em `Sala` (um convite ativo por vez, sobrescrito ao gerar outro). Se precisar de histórico de convites no futuro, aí sim vira tabela.
- **Nomenclatura de campos:** `Ficha` usa os nomes citados literalmente nos CLAUDE.md (`usuario_id`, `pv_atual`/`pv_maximo_cache`, etc. em snake_case); `Token` usa `fichaId`/`npcId` em camelCase (citado assim no checklist da Etapa 2). Os demais campos seguem camelCase padrão do Prisma.

### Entidades (19)
`Usuario`, `Sala`, `MembroSala`, `Banimento`, `Sessao`, `Ficha`, `FichaOP2`, `ClasseFormula`, `ProgressaoClasse`, `Pericia`, `FichaPericia`, `FichaEntrada`, `Npc`, `Pasta`, `Documento`, `Mapa`, `Token`, `Mensagem`, `Montaria`

> Eram 16 na Etapa 2 (só OP1). `FichaOP2` e `ClasseFormula` entraram em 22/09/2026 com o suporte a dois sistemas. Em 23/09/2026 `Ritual` + `FichaRitual` (catálogo) saíram e `FichaEntrada` entrou. Em 29/09/2026 entrou `Banimento` (expulsar/banir). Em 22/10/2026 entrou `Montaria` (e `Token` ganhou `montariaId` e `escala`).

---

## Mapa e vídeo no servidor (Etapa 10)

- **Upload:** `multer` em memória, limite 10MB (`413` acima). Tipo detectado pelos **bytes** (PNG/JPEG/WebP), nunca pela extensão. `salvarArquivo()` em `lib/armazenamento.ts` grava em `backend/uploads/` (fora do Git) — é o único ponto a trocar por S3. Servido com `X-Content-Type-Options: nosniff`.
- **Armadilha resolvida:** o PeerJS usa a lib `ws`, que responde `400` a qualquer upgrade de WebSocket fora do caminho dela — isso derrubava o Socket.IO no mesmo servidor. `server.ts` passa ao PeerJS um emissor intermediário e só repassa os upgrades de `/peerjs`. Outra do PeerJS: ele repassa erros de conexão (ex.: mensagem que não é JSON) como evento `error` do próprio app; sem ouvinte, esse `emit` lança e derruba o processo — `server.ts` registra um ouvinte que só loga.

---

## Estrutura de pastas

```
backend/
└── src/
    ├── modules/
    │   ├── usuario/    ← cadastro, login, /auth/me
    │   ├── sala/       ← mesas, membros, convite, expulsar/banir; monta as rotas /salas/:id/*
    │   ├── ficha/
    │   ├── npc/
    │   ├── pasta/
    │   ├── mapa/       ← mapas e tokens
    │   ├── montaria/   ← biblioteca de montarias e o token delas no mapa
    │   ├── mensagem/   ← sem routes.ts: histórico via /salas/:id/mensagens, envio pelo socket
    │   └── rtc/        ← só rtc.routes.ts: configuração ICE (STUN/TURN) para o vídeo
    ├── engine/
    │   ├── calculoFicha.ts       ← só OP1
    │   ├── progressaoClasse.ts   ← só OP1
    │   ├── convite.ts
    │   ├── combate.ts            ← ordem de iniciativa, avançar turno, quem pode encerrar
    │   ├── rolagem.ts            ← rolagem no servidor (soma/maior/menor); lerExpressao() valida sem rolar
    │   ├── arma.ts               ← ataque, dano e crítico da arma da ficha (só OP1)
    │   └── op2/
    │       ├── escalaDados.ts    ← step d4-d12
    │       └── catalogo.ts       ← atributos + perícias de OP2
    ├── sockets/
    │   ├── io.ts           ← servidor Socket.IO, auth JWT
    │   ├── emissor.ts      ← emitirParaSala() (separado pra evitar import circular)
    │   ├── salaSocket.ts   ← eventos da sala (chat, rolagem, combate, tokens, vídeo)
    │   └── estado.ts       ← combate/última rolagem em memória, INSTANCIA_SERVIDOR
    ├── middlewares/
    │   ├── auth.ts
    │   ├── upload.ts       ← multer, limite de 10MB
    │   └── errorHandler.ts
    ├── lib/
    │   ├── prisma.ts
    │   ├── jwt.ts
    │   └── armazenamento.ts ← salvarArquivo(), detecção de tipo pelos bytes
    └── generated/prisma/   ← gerado pelo Prisma, não editar nem versionar
```

Cada módulo em `modules/` tem `<modulo>.controller.ts`, `<modulo>.service.ts`, `<modulo>.routes.ts` e um `README.md` (rotas, quem pode, regras, dependências, testes) — exceções: `mensagem` (sem routes) e `rtc` (só routes). `Sessao` e `Documento` existem no schema, mas ainda não têm módulo.

---

## Variáveis de ambiente (`backend/.env`)

```
DATABASE_URL="postgresql://rpg_user:rpg_pass@localhost:5433/rpg_online?schema=public"
JWT_SECRET="<valor secreto>"
PORT=3333
```

**Porta 5433, não 5432** — há um Postgres nativo do Windows (fora do Docker, de outra origem) ocupando a 5432 nesta máquina, e ele não pode ser encerrado sem privilégio de admin. `docker-compose.yml` mapeia `5433:5432` para não colidir. Se o Postgres nativo for removido/desligado no futuro, dá pra voltar pra 5432 — não é uma decisão de arquitetura, é workaround de ambiente.
