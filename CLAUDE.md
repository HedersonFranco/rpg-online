# RPG Online — Ordem Paranormal

Sistema colaborativo de RPG à distância (webcam/áudio, fichas, mapas, chat).
Desenvolvedor solo: Hederson. Repositório: `HedersonFranco/rpg-online`.

**Multissistema (decisão de 22/09/2026):** a mesa escolhe, na criação da sala, entre dois sistemas de regras —
**Ordem Paranormal RPG (v1.3)**, o clássico, e **Ordem Paranormal RPG II** (Playtest Alpha, Ago/2026), a
reconstrução ainda em teste. São jogos com mecânicas bem diferentes (ver seção "Os dois sistemas" abaixo) —
isso NÃO é o "D&D no futuro" mencionado nas decisões de design; é o mesmo IP, duas edições, ambas dentro do
escopo de "Ordem Paranormal".

**Natureza do projeto:** produto **real, para lançamento** — não portfólio, não MVP descartável.
**Código fechado (decisão de 28/09/2026):** o repositório é público só como portfólio — todos os direitos
reservados (`LICENSE`), sem permissão de uso, cópia, hospedagem ou redistribuição. Isso não muda a natureza
do projeto: continua sendo produto para lançamento. Nunca adicionar licença open source sem pedido explícito.
Referências de qualidade: **Owlbear Rodeo** (mapa/tokens/biblioteca) e **C.R.I.S.** (ficha de Ordem Paranormal).
Isso significa: estados de erro, estados de carregamento e confirmação em ações destrutivas são **requisito**, não polimento opcional.

---

## Stack (não mudar sem discussão explícita)

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite 8 + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`) |
| Backend | Node.js + Express 5 + TypeScript 7, dev com `tsx watch` |
| Tempo real | Socket.IO |
| Webcam | WebRTC via PeerJS |
| Banco | PostgreSQL 16 (Docker) + Prisma 7 |
| Auth | JWT |
| Ambiente dev | Windows + WSL2 + Docker Desktop |

**Frontend é mobile-first** nas telas de login/cadastro/lista de salas.
**A tela de mesa é desktop-first** (mínimo 1280px) — mapa + vídeo + ficha não cabem bem em 375px.
**`ts-node-dev` é incompatível com TS 7** — usar sempre `tsx`.
**Tailwind v4** usa `@tailwindcss/vite` e `@import "tailwindcss"` no CSS, não PostCSS legado.
**Roteamento do frontend: `react-router`** (adicionado na Etapa 8 — o stack não definia router; URLs reais tipo `/salas/:id` e `/convite/:token` precisam de um). Sem outras libs de UI/estado/requisição: `fetch` num wrapper próprio (`services/api.ts`).
**Frontend usa TypeScript 6** (não 7 como o backend) — é o que o template trouxe e o que o `typescript-eslint` do front suporta. `tsconfig` tem `verbatimModuleSyntax` (tipos só via `import type`) e `erasableSyntaxOnly` (sem enum, sem parameter properties).
**Prisma 7** usa `prisma7.config.ts` para `datasource.url` — o `schema.prisma` não declara `url` diretamente.
**Prisma 7 exige driver adapter** — `PrismaClient` não conecta sem um adapter. Usar `@prisma/adapter-pg` + `pg`: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`. Todo service que instanciar o client precisa disso (idealmente um client singleton compartilhado quando os módulos forem escritos).
**`prisma migrate dev` recusa rodar neste ambiente** (detecta shell não-interativo e recusa, mesmo com `--create-only`). Workaround: `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` gera o SQL, salva manualmente em `prisma/migrations/<timestamp>_<nome>/migration.sql`, aplica com `prisma migrate deploy` (não-interativo).
**`typescript-eslint` não suporta TS 7** (bloqueio confirmado, não só peer warning — [issue #10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)). ESLint do backend usa `@babel/eslint-parser` + `@babel/preset-typescript` só para sintaxe — **sem regras tipadas**. Por isso `no-unused-vars` está desligado: Babel não enxerga `import type { X }` usado só em anotação de tipo como uso, e todo handler Express tipado (`Request`/`Response`/`NextFunction`) cairia nesse falso positivo. Revisar tudo isso quando a issue fechar.

---

## Regras de negócio fechadas (não reabrir)

### Salas
- Dono: até 3 salas. Participante: ilimitado.
- Papel (mestre/jogador) é por usuário+sala, não fixo no perfil.
- Cada sala tem um único sistema de regras, **escolhido na criação** entre `ORDEM_PARANORMAL_1` e
  `ORDEM_PARANORMAL_2` (campo `Sala.sistema`, obrigatório, sem default — o dono decide) — a ficha herda da sala.
- Convite via link com expiração de 7 dias, nunca permanente.

### Fichas
- Um usuário pode ter mais de uma ficha, inclusive na mesma sala.
- Criação livre — jogador escolhe tudo sem aprovação prévia do mestre.
- Jogador edita a própria ficha; mestre edita qualquer ficha da sala.
- Conflito simultâneo: last-write-wins, sem aviso na v1.
- Inventário: campo de texto livre (anotações soltas), editável na aba "Inventário".
- **Rituais, habilidades, poderes e equipamentos (decisão de 23/09/2026):** cada ficha cadastra os seus em `FichaEntrada` (não há catálogo). Campos: todos têm nome + descrição; **ritual** + círculo (1–4) + elemento (Sangue/Morte/Conhecimento/Energia/Medo/Varia) — as condições (execução, alcance, duração, resistência) vão na descrição; **poder** + pré-requisito (opcional); **equipamento** + categoria (0–IV) + espaços. Habilidade é só nome + descrição. O service rejeita campo de outro tipo (`400`) e o tipo não muda depois de criado. Apagar pede confirmação. Rotas: `POST /fichas/:id/entradas`, `PATCH`/`DELETE /fichas/:id/entradas/:entradaId` — todas devolvem `{ ficha }` e emitem `ficha:atualizada`.
- **O backend é o único que calcula valores derivados** (PV/PE/San máximos, bônus de perícias). O frontend nunca calcula — sempre confia no backend.

### NPCs / Tokens
- NPCs são blocos de estatística fixos — não passam pelo motor de cálculo.
- NPCs são reutilizáveis (um registro → múltiplos tokens em mapas diferentes).
- Token = Ficha, NPC ou objeto genérico (nunca os dois primeiros ao mesmo tempo).

### Tempo real
- Rolagem de dados: evento em tempo real, **não persiste** no banco — apenas o resultado mais recente em memória.
- **Turnos/iniciativa: DENTRO do escopo da v1.** (Decisão revisada em 22/09/2026 — o CLAUDE.md anterior dizia o contrário.)
  - O mestre inicia o combate informando manualmente um valor de iniciativa por participante.
  - Participantes: fichas dos jogadores + NPCs que o mestre incluir.
  - A barra inferior mostra o jogador ativo e a fila; "Encerrar turno" avança.
  - Só o jogador ativo e o mestre podem encerrar o turno.
  - **Estado do combate é efêmero** — vive em memória do processo Node, sem tabela no banco. Se o servidor reiniciar, o estado se perde e a UI deve avisar claramente ("Sessão reiniciada — reinicie o combate").
- Reconexão automática (socket e vídeo) sem exigir reload manual; cliente reconectado pede o estado atual via `turno:estadoSolicitado`.

### Tempo real — como está implementado (Etapa 9)
- **Escrita continua pelo REST.** Ficha criada/alterada/perícia treinada: o service grava, e só então `emitirParaSala(salaId, 'ficha:atualizada', { ficha })` distribui. Nenhuma regra de validação duplicada no socket.
- **Eventos cliente → servidor** (todos com ack `{ ok, ...dados }` ou `{ ok: false, erro, status }`): `sala:entrar`, `turno:estadoSolicitado`, `chat:enviar`, `rolagem:rolar`, `turno:iniciar` (mestre), `turno:encerrar`, `turno:finalizar` (mestre).
- **Eventos servidor → sala:** `ficha:atualizada`, `chat:mensagem`, `rolagem:resultado`, `turno:estado`.
- Socket autentica com o mesmo JWT (`auth.token` no handshake). Token recusado → cliente faz logout (o socket.io não tenta de novo nesse caso).
- **Chat persiste** (`Mensagem`, até 1000 caracteres; histórico via `GET /salas/:id/mensagens`, últimas 50). **Rolagem não persiste**: o servidor rola (crypto, ninguém escolhe o resultado) e guarda só a última por sala em memória. Modos: soma, maior (teste de OP1) e menor (OP1 com atributo 0).
- `turno:encerrar` manda `indiceAtivo`/`rodada` esperados: clique duplo simultâneo (jogador + mestre) não pula turno — o segundo recebe `409`.
- **Detecção de reinício:** cada processo gera um `INSTANCIA_SERVIDOR`. Se o cliente tinha combate e, ao reconectar, a instância mudou e não há combate → aviso "Sessão reiniciada — reinicie o combate." e o estado local é limpo.
- Heartbeat do socket: `pingInterval` 10s + `pingTimeout` 5s; backoff de reconexão do cliente máx. 5s → queda detectada e recuperada bem dentro dos 30s.
- **Etapa 10 acrescentou:** `token:mover` (cliente → servidor; posições intermediárias voláteis, só a final grava no banco; permissão cacheada por conexão) → `token:movido` (pra sala, exceto quem arrastou); `mapa:ativo`, `token:criado`, `token:removido` (vindos do REST); presença de vídeo `video:entrar`/`video:sair`/`video:pedirReconexao` → `video:participantes`/`video:reconexaoPedida`.

### Mapa, tokens e vídeo — como está implementado (Etapa 10)
- **Mapa ativo por sala** (`Sala.mapaAtivoId`, persistido). Lista de mapas é só do mestre (material de preparo, pode ter spoiler); jogador só vê o ativo.
- **Upload:** `multer` em memória, limite 10MB (`413` acima). Tipo detectado pelos **bytes** (PNG/JPEG/WebP), nunca pela extensão. `salvarArquivo()` em `lib/armazenamento.ts` grava em `backend/uploads/` (fora do Git) — é o único ponto a trocar por S3. Servido com `X-Content-Type-Options: nosniff`.
- **Tokens:** só o mestre cria/remove; mestre move qualquer um, jogador só o da própria ficha (servidor valida, `403`). Posição em pixels da imagem original (zoom/pan não afetam o que vai pro servidor). Payload do token: da ficha, nome + PV; do NPC, só nome/avatar. Só o círculo é clicável (nome/barra não encolhem com zoom e cobririam vizinhos). Token novo nasce no centro da tela, desviado se já houver outro ali.
- **Zoom/pan:** Pointer Events (mouse, toque e caneta com o mesmo código): 1 ponteiro arrasta, 2 fazem pinça; roda do mouse com zoom no cursor (listener nativo não-passivo).
- **Vídeo (PeerJS, malha P2P, até 6 pessoas):** sinalização no **próprio backend** (`/peerjs`, não o servidor público do PeerJS). Cada par tem **uma** chamada, criada uma vez pelo `peerId` menor, com ou sem câmera. Sem câmera = trilhas vazias (vídeo preto 2×2 + áudio mudo); ligar/desligar câmera só troca a trilha (`replaceTrack`) — sem fechar/refazer conexão (o modelo anterior, que refazia a chamada a cada troca de câmera, tinha corridas: 4–8/10 em estresse; o atual, 30/30). Sucesso = ICE conectado (não o evento `stream`, que chega antes). Queda: quem liga tenta 3× com espera crescente, depois botão; quem atende espera 20s e oferece botão (que pede a religação pelo socket). Se a sinalização precisar ser recriada, a aba volta com **id novo** (o servidor PeerJS segura o id antigo por um tempo — "ID is taken") e os outros reconectam sozinhos.
- **Câmera é opt-in** ("Entrar com câmera"). Recusa/ausência → aviso e modo texto+mapa. Autoplay com som bloqueado → cai pro mudo com botão "Ativar som" (só em `NotAllowedError`).
- **Gancho de dev:** `window.__rpgVideo` (`derrubar`, `restaurar`, `diagnostico`) existe só em `import.meta.env.DEV` — some do build de produção.
- **Armadilha resolvida:** o PeerJS usa a lib `ws`, que responde `400` a qualquer upgrade de WebSocket fora do caminho dela — isso derrubava o Socket.IO no mesmo servidor. `server.ts` passa ao PeerJS um emissor intermediário e só repassa os upgrades de `/peerjs`.

---

## Requisitos não funcionais (metas de lançamento)

| Categoria | Alvo |
|---|---|
| Resposta da API REST | < 500ms em carga normal |
| Latência de evento WebSocket | < 150ms percebida |
| Carregamento da tela de mesa | < 3s em 10 Mbps |
| Participantes por sala (v1) | 6 (1 mestre + 5 jogadores) |
| Navegadores | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| Tema | **Escuro é o padrão.** Tema claro é pós-lançamento. Identidade visual "Dossiê de caso" (decisão de 28/09/2026 — o violeta deixou de ser obrigatório), ver `DESIGN.md`. |
| Expiração do JWT | 24h (sem refresh token na v1 — relogin) |
| Rate limit em `/auth` | 10 tentativas/min por IP → 429 |
| Upload de mapa | máx. 10MB; avatar máx. 2MB |
| Reconexão de socket | automática em até 30s |
| Reconexão de vídeo | automática; após 3 falhas, botão "Reconectar" manual |

**Degradação obrigatória:** se o usuário recusar câmera/microfone, o sistema continua funcionando em modo texto+mapa. Vídeo nunca é requisito para usar o sistema.

**Padrão mínimo de UX (não negociável):**
- Toda operação que pode falhar mostra mensagem de erro clara — nunca tela branca.
- Operação acima de 300ms mostra spinner ou skeleton.
- Toda ação destrutiva (deletar sala, remover jogador, apagar mapa/NPC) pede confirmação.
- Todo input de texto é sanitizado (chat, documentos, nome de personagem) — XSS básico.

---

## Motor de cálculo (`backend/src/engine/calculoFicha.ts`) — só OP1

Função pura chamada pela API REST e pelo WebSocket:
1. Recebe: `classe`, `nex`, atributos (`for`, `agi`, `int`, `vig`, `pre`), perícias treinadas.
2. Consulta `ClasseFormula` (base+incremento por classe) e `ProgressaoClasse` (habilidades por tier) — ambos passados como parâmetro, nunca via banco direto.
3. Retorna: `pv_maximo`, `pe_maximo`, `san_maximo`, testes de perícia (`testesPericias`), habilidades desbloqueadas (acumuladas de todos os tiers ≤ NEX atual).

**Fórmula confirmada no livro (Ordem Paranormal RPG v1.3):** `pv_maximo = pvBase(classe) + Vigor + pvPorTier(classe) × tier`; mesma lógica pra PE com Presença; Sanidade **não soma atributo**. `tier` = posição de `nex` na sequência fixa de 20 degraus `[5,10,...,95,99]` (99% conta como mais um degrau mesmo sendo só +4%). NEX só pode ser um desses 20 valores — qualquer outro é erro tratado.

**Teste de perícia = (atributo-base)d20, fica com o melhor, + bônus do grau de treino** (`Destreinado` 0 / `Treinado` +5 / `Veterano` +10 / `Expert` +15). O atributo é a **quantidade de dados**, não soma no bônus — ex.: Vigor 3 + Fortitude Treinado = **3d20+5**. Atributo 0 rola 2d20 e fica com o **pior** (`modo: 'menor'`). Confirmado no livro (p. 10, "Modificador" e graus de treino). *(Corrigido em 23/09/2026 — a versão anterior deste arquivo e do motor somava atributo + treino, o que estava errado.)* `montarTestesPericias()` é a função pura; toda ficha que sai da API/socket traz `testesPericias` com as 28 (sem linha em `FichaPericia` = Destreinado).

`pv/pe/san_maximo_cache` na tabela `Ficha` são **cache** — nunca fonte da verdade.
Botões de combate alteram só o valor **atual** (0 ≤ atual ≤ máximo), validado no servidor.
NPCs **não** passam por este motor.

A função deve rodar **sem conexão com o banco** nos testes — as tabelas entram como parâmetro ou mock. Se precisar do Prisma para ser testada, não é pura o bastante.

**OP2 não tem motor de cálculo equivalente** — o Playtest Alpha não publica fórmula de PV/PD (fichas são pré-prontas). `FichaOP2.pv_maximo`/`pd_maximo` são valores atribuídos diretamente, não calculados. Revisar quando o playtest completo (com criação de personagem) for lançado.

---

## Autorização

- Jogador: altera apenas própria ficha (`usuario_id == ficha.usuario_id`).
- Mestre: altera qualquer ficha da sala (checar papel em `MembroSala`).
- **Toda rota de escrita** (`POST`, `PATCH`, `DELETE`) valida propriedade ou papel de mestre. Estar autenticado não basta.

---

## Estrutura de pastas

```
rpg-online/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── usuario/
│       │   ├── sala/
│       │   ├── sessao/
│       │   ├── ficha/
│       │   ├── npc/
│       │   ├── pasta/
│       │   ├── mapa/
│       │   ├── documento/
│       │   └── mensagem/
│       ├── engine/
│       │   ├── calculoFicha.ts       ← só OP1
│       │   ├── progressaoClasse.ts   ← só OP1
│       │   ├── convite.ts
│       │   ├── combate.ts            ← ordem de iniciativa, avançar turno, quem pode encerrar
│       │   ├── rolagem.ts            ← rolagem no servidor (soma/maior/menor)
│       │   └── op2/
│       │       ├── escalaDados.ts    ← step d4-d12
│       │       └── catalogo.ts       ← atributos + perícias de OP2
│       ├── sockets/
│       │   ├── io.ts           ← servidor Socket.IO, auth JWT
│       │   ├── emissor.ts      ← emitirParaSala() (separado pra evitar import circular)
│       │   ├── salaSocket.ts   ← eventos da sala (chat, rolagem, combate, tokens, vídeo)
│       │   └── estado.ts       ← combate/última rolagem em memória, INSTANCIA_SERVIDOR
│       ├── middlewares/
│       │   ├── auth.ts
│       │   ├── upload.ts       ← multer, limite de 10MB
│       │   └── errorHandler.ts
│       ├── lib/
│       │   ├── prisma.ts
│       │   ├── jwt.ts
│       │   └── armazenamento.ts ← salvarArquivo(), detecção de tipo pelos bytes
│       └── generated/prisma/   ← gerado pelo Prisma, não editar nem versionar
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login/          ← + LayoutAuth (compartilhado com Cadastro)
│       │   ├── Cadastro/
│       │   ├── ListaSalas/
│       │   ├── Sala/           ← mesa + BotaoConvite
│       │   └── Convite/        ← /convite/:token (link de convite)
│       ├── components/
│       │   ├── FichaOrdemParanormal/
│       │   ├── MapaToken/      ← AreaMapa, useViewport (zoom/pan), TokenNoMapa, AdicionarToken, GerenciarMapas
│       │   ├── Video/          ← FaixaVideo
│       │   ├── Biblioteca/
│       │   ├── Chat/
│       │   ├── TurnoTracker/
│       │   ├── ui/             ← Feedback (Spinner/Carregando/Alerta), Icone, estilos
│       │   ├── Rotas.tsx       ← RotaProtegida / RotaPublica
│       │   └── ErrorBoundary.tsx
│       ├── hooks/
│       │   ├── SalaSocketProvider.tsx / salaSocketContext.ts ← conexão da mesa, reconexão, aviso de reinício
│       │   ├── useSocket.ts    ← useSalaSocket, useEventoSocket, useAoResincronizar
│       │   ├── AuthProvider.tsx / authContext.ts / useAuth.ts
│       │   ├── useRecurso.ts   ← GET com estados carregando/erro/ok
│       │   ├── useAtrasado.ts  ← spinner só depois de 300ms
│       │   └── useVideoChamada.ts ← câmera/microfone + liga a MalhaVideo ao socket
│       └── services/
│           ├── api.ts          ← fetch + token + erro de conexão legível (JSON e FormData)
│           ├── malhaVideo.ts   ← WebRTC/PeerJS em classe pura (fora do React)
│           └── tipos.ts
└── CLAUDE.md
```

Cada módulo em `modules/` tem: `<modulo>.controller.ts`, `<modulo>.service.ts`, `<modulo>.routes.ts`.

---

## Banco de dados — decisões de design

- `Ficha` (OP1) usa colunas tipadas (não JSON livre) — permite queries como "fichas com NEX >= 30".
- **OP2 usa tabela separada (`FichaOP2`)** em vez de esticar `Ficha` com campos nulos — mesmo padrão já previsto aqui pra um eventual D&D no futuro (`FichaDnd` ou campo `extra Json`), só que aplicado agora pro próprio Ordem Paranormal (v1.3 x RPG II).
- `ProgressaoClasse` guarda só **habilidades por tier de NEX** (uma linha por classe+NEX). PV/PE/San **não** ficam lá — são fórmula em `ClasseFormula` (uma linha fixa por classe: base + incremento por tier) somada ao atributo do personagem no motor de cálculo. Ver seção "Motor de cálculo".
- `Pericia` (**28** fixas — Tabela 2.1, p. 41 do livro v1.3: Agilidade 7, Força 2, Intelecto 9, **Presença 9**, Vigor 1; a contagem "26" anterior estava errada) é catálogo populado via **seed** a partir de `engine/pericias.ts`, não criado pelo usuário. O seed deve ser **idempotente** (rodar duas vezes não duplica). **`Ritual`/`FichaRitual` foram removidos em 23/09/2026** (estavam vazios) — ritual virou `FichaEntrada` escrita pelo jogador. `Pericia`/`FichaPericia`/`FichaEntrada` são **só de OP1** — OP2 guarda perícias como Json direto em `FichaOP2` (ver "Os dois sistemas").
- `Npc` é entidade separada de `Ficha` — monstros não têm progressão por NEX. Tem `pv/pe/san` (OP1) e `pd` (OP2), todos opcionais; o service rejeita campo do sistema errado pra sala. `atributos` é texto livre (bloco de estatística fixo).
- **NPC e Pasta são ferramentas do mestre**: leitura e escrita exigem papel `MESTRE` (NPC não tem dono, então "propriedade" não se aplica). Jogador → 403. Quando tokens de NPC aparecerem no mapa (Etapa 10), o que o jogador enxerga do NPC é decisão daquela etapa.
- **Deletar pasta nunca apaga conteúdo** — tudo sobe pra pasta-pai (ou raiz), numa transação. Mover pasta pra dentro de um descendente é rejeitado (ciclo).
- `Pasta` é genérica e autorreferenciada; relação com Npc/Mapa/Documento é opcional.
- `Sessao` é enxuta — base para histórico futuro sem vínculo obrigatório com mensagens.
- Rolagem de dados **não tem tabela** — é evento em tempo real.
- **Estado de combate (turno/iniciativa) não tem tabela** — vive em memória do processo Node.
- Redis: adiado — estado de sessão ativa em memória do processo Node por ora.
- Armazenamento de arquivos: abstraído em função `salvarArquivo()` (`lib/armazenamento.ts`) para trocar disco local por S3 no futuro — implementado na Etapa 10.
- **Convite não é entidade própria** (não está nas 16) — vive como `conviteToken`/`conviteExpiraEm` direto em `Sala` (um convite ativo por vez, sobrescrito ao gerar outro). Se precisar de histórico de convites no futuro, aí sim vira tabela.
- **Nomenclatura de campos:** `Ficha` usa os nomes citados literalmente neste arquivo (`usuario_id`, `pv_atual`/`pv_maximo_cache`, etc. em snake_case); `Token` usa `fichaId`/`npcId` em camelCase (citado assim no checklist da Etapa 2). Os demais campos seguem camelCase padrão do Prisma.

### Entidades (17)
`Usuario`, `Sala`, `MembroSala`, `Sessao`, `Ficha`, `FichaOP2`, `ClasseFormula`, `ProgressaoClasse`, `Pericia`, `FichaPericia`, `FichaEntrada`, `Npc`, `Pasta`, `Documento`, `Mapa`, `Token`, `Mensagem`

> Eram 16 na Etapa 2 (só OP1). `FichaOP2` e `ClasseFormula` entraram em 22/09/2026 com o suporte a dois sistemas. Em 23/09/2026 `Ritual` + `FichaRitual` (catálogo) saíram e `FichaEntrada` entrou.

---

## Os dois sistemas

| | Ordem Paranormal RPG (v1.3) | Ordem Paranormal RPG II (Playtest Alpha, Ago/2026) |
|---|---|---|
| Progressão | NEX% (20 tiers: 5,10,...,95,99) + classe (Combatente/Especialista/Ocultista) | Nível 1-10 + Perfil (Executor/Analista/Vigilante) + Ocupação (texto livre) |
| Atributos | 5, numéricos 0-5 (For/Agi/Int/Vig/Pre) | 3, em dado de step (Físico/Mente/Emoção, d4-d12) |
| Teste | Rola N d20 (N = valor do atributo), pega o melhor; 0 rola 2d20 e pega o pior | Rola 1 dado do atributo + 1 da perícia, soma os dois |
| Perícias | 28 fixas, grau Destreinado/Treinado/Veterano/Expert (bônus 0/+5/+10/+15); teste = (atributo)d20 + bônus | 20 fixas, cada uma no próprio dado de step d4-d12 |
| PV/PE/San | **Fórmula real, calculada** (`ClasseFormula` + atributo) — ver "Motor de cálculo" | **Sem fórmula publicada** — PV/PD atribuídos direto na ficha (fichas pré-prontas no playtest) |
| Tabela no schema | `Ficha`, `FichaPericia`, `FichaEntrada`, `ProgressaoClasse`, `ClasseFormula` | `FichaOP2` (perícias em Json, sem join table — catálogo em `engine/op2/catalogo.ts`) |

`Sala.sistema` decide qual conjunto de tabelas vale pra aquela sala. Não existe conversão entre sistemas — trocar o sistema de uma sala em andamento não está no escopo (não foi pedido e não há regra de conversão de ficha entre os dois jogos).

---

## Identidade visual — "Dossiê de caso" (28/09/2026)

Escolhida via `/impeccable shape` para tirar o frontend do visual genérico (zinc + violeta). Contexto do produto em `PRODUCT.md`; sistema visual em `DESIGN.md` (fonte da verdade dos tokens, em `@theme` no `index.css`).
- Cada mesa é um caso num arquivo escuro: pastas kraft com aba (sistema), etiqueta com o nome, data datilografada, **carimbo** com o papel. Folhas de papel para formulários.
- Vermelho de carimbo **só para estado** (papel, erro, acesso negado) — nunca ação. Courier Prime só para valor digitado e data; Archivo condensado para títulos, rótulos e botões.
- **Nada da identidade oficial de Ordem Paranormal** (sigilos, símbolos, arte) — é ferramenta de fã.
- **Licença da Comunidade de Ordem Paranormal (v1.0, 28/06/2026)** rege o produto — resumo e exigências em `PRODUCT.md` → Brand Commitments. Em código: nunca usar arte/texto oficial nem nomes próprios do cânone (inclusive em seeds, testes e screenshots); o aviso literal + selo precisam aparecer no site (pendente — a landing é o lugar).
- **Migração completa (29/09/2026):** o produto inteiro usa o mundo — entrada, apresentação (`/` para visitantes, `/sobre`) e a mesa (moldura, ficha, mapa, chat, NPCs). Peças em `components/ui/arquivo.tsx` + `estilosArquivo.ts`; o legado zinc/violeta (`ui/estilos.ts`) foi apagado.
- `GET /salas` passou a devolver `papel` (o do próprio usuário em cada sala) para o carimbo.

## Layout da tela de mesa

Referência visual: `preview.webp` (no Project do Claude). Estrutura-alvo:

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER: campanha + sessão        [ícones]  [Sair]            │
├────┬────────────────────────────────────────┬────────────────┤
│    │  FAIXA DE VÍDEO (webcams horizontais)  │                │
│ S  ├────────────────────────────────────────┤  PAINEL        │
│ I  │                                        │  DIREITO       │
│ D  │          ÁREA DO MAPA                  │                │
│ E  │      (elemento dominante)              │  Ficha de      │
│ B  │                                        │  Personagem    │
│ A  ├────────────────────────────────────────┤                │
│ R  │  BARRA DE TURNO                        │                │
└────┴────────────────────────────────────────┴────────────────┘
```

- **Barras laterais = pasta de folhas (29/09/2026, `ui/PastaDeFolhas.tsx`):** uma pasta vetorial em pé; cada item é uma folha que desliza para fora no hover/foco mostrando nome + ícone. À esquerda, só para o mestre: **Mesa / Mapas**. À direita, com o painel recolhido: **Ficha / Chat / NPCs** (NPCs só para o mestre). Biblioteca e Notas **saíram** até ganharem tela. (Fichas já tinha saído em 23/09/2026.)
- **Régua inferior (29/09/2026):** vídeo (fotos com borda de papel) e turno numa faixa só embaixo do mapa, liberando o topo para o mapa.
- **Faixa de vídeo:** feeds horizontais com nome, indicador de áudio e badge "Mestre". Sem câmera → placeholder com inicial.
- **Mapa:** toolbar vertical à esquerda (cursor e pan na v1; lápis/linha/texto/régua/grade são v2). Zoom +/− e tela cheia no canto inferior esquerdo. O seletor "Piso 1" **foi removido** (multi-piso é v2; placeholder desabilitado não fica na interface).
- **NPCs (29/09/2026):** aba/folha do painel direito, só do mestre (`components/Npc/PainelNpcs.tsx`): listar, criar, editar, apagar (com confirmação), campos por sistema (PV/PE/SAN em OP1, PV/PD em OP2) + atributos em texto livre. Usa a API da Etapa 7.
- **Painel direito é recolhível (decisão de 23/09/2026):** botão `>` recolhe pra uma faixa de 48px com atalhos Ficha/Chat; aberto/recolhido fica no `localStorage` do navegador. A aba Ficha do painel mostra a lista "Agentes da mesa" (cards à la C.R.I.S. `/agentes`: nome, classe·NEX, jogador, data, "Acessar ficha"). A lista é **só da sala** — não existe "meus agentes" global (a ficha continua pertencendo à sala). Ao entrar na mesa, abre direto na ficha do próprio usuário, se houver.
- **Painel direito (ficha):** a ficha é uma folha de papel: foto colada + nome + origem/classe/trilha, NEX (select datilografado + barra em tinta), **círculo de atributos na disposição da ficha oficial** (`PentagonoAtributos.tsx`: AGI no topo, INT/VIG/PRE/FOR em sentido horário, disco "ATRIBUTOS" no centro — só a disposição; o traço é **desenho próprio em tinta**, nunca a arte da Jambô), linhas de **Vida / Sanidade / Esforço** com tintas próprias (carmim / azul-tinteiro / ocre) e −/+, seções como **divisórias de fichário 3×2** (Perícias / Rituais / Habilidades / Poderes / Equipamentos / Inventário, com setas do teclado). Perícias: busca + filtro Todas/Treinadas, teste "3d20+5" vindo do backend, destreinadas discretas e treinadas em destaque. Rituais: marca de cor do elemento + nome (a borda lateral colorida saiu — é padrão proibido).
- **Barra de turno:** jogador ativo + iniciativa à esquerda, fila de próximos no centro, botão primário "Encerrar turno", botão "Rolagem" à direita. Sem combate ativo → barra recolhida.

> O `preview.webp` mostra atributos de D&D (FOR/DES/CON/INT/SAB/CAR, CA, Descanso Curto/Longo). **A estrutura é a referência, o conteúdo não.** Mapear sempre para Ordem Paranormal.

---

## Fora do escopo da v1

- Histórico de rolagens persistido
- Redis / estado distribuído
- Regras mecânicas de itens (dano/crítico/munição como campos; equipamento tem só categoria e espaços, o resto é descrição)
- Motor de cálculo para NPCs
- D&D ou outros sistemas além de Ordem Paranormal
- Ferramentas de anotação no mapa (lápis, linha, texto, régua, grade)
- Mapas multi-piso
- Tema claro
- Refresh token

---

## Convenções de commit

```
feat: <descrição curta>      # nova funcionalidade
fix: <descrição curta>       # correção de bug
test: <descrição curta>      # testes
chore: <descrição curta>     # infra, config, deps
```

Um commit por funcionalidade fechada dentro de cada etapa.
Branch por etapa/módulo: `feat/motor-calculo`, `feat/auth`, `feat/ficha`, etc.
Ao fechar uma etapa: `chore: etapa N concluída — critérios verificados`.

---

## Pipeline — 11 etapas com critérios verificáveis

> **Regra:** nunca marcar uma etapa como concluída sem rodar os critérios. "Acho que terminei" não fecha etapa.

| # | Etapa | Status |
|---|---|---|
| 1 | Setup e configuração | ✅ Concluída |
| 2 | Modelagem no Prisma + migration + seeds | 🔄 Schema + migration prontos (17 entidades, multissistema); seed de `ClasseFormula` + 28 `Pericia` pronto — falta `ProgressaoClasse` |
| 3 | Autenticação (JWT, convite com expiração) | ✅ Concluída |
| 4 | CRUD de Sala e Membros | ✅ Concluída |
| 5 | Motor de cálculo isolado + testes | ✅ Concluída (só OP1 — OP2 não tem fórmula publicada, ver "Os dois sistemas") |
| 6 | CRUD de Ficha (sem tempo real) | 🔄 OP1 pronto — falta conferir contra o C.R.I.S. (sem acesso); FichaOP2 sem CRUD ainda |
| 7 | CRUD de NPC e Pastas | ✅ Concluída |
| 8 | Frontend consumindo REST | ✅ Concluída (UI de ficha só OP1) |
| 9 | Tempo real (Socket.IO) + turno + reconexão | ✅ Concluída |
| 10 | Mapa, tokens e webcam | 🔄 6 de 7 — falta vídeo entre redes diferentes (exige TURN em produção + 2 dispositivos) |
| 11 | Polimento e documentação formal | ⬜ |

### Etapa 1 — Setup
- [x] `docker compose up -d` sobe o Postgres; `docker ps` mostra `rpg-postgres` rodando
- [x] `GET /health` responde `{"status":"ok"}` na porta 3333
- [x] `vite.config.ts` carrega `@tailwindcss/vite`; `index.css` tem `@import "tailwindcss"`
- [x] `.env` fora do Git, `.env.example` presente
- [x] **ESLint configurado no backend** (hoje só existe no frontend) + script `lint`
- [x] **Runner de teste no backend** — `vitest` instalado e confirmado rodando sob TS 7 + `tsx` (teste sanity temporário passou); `npm test` hoje falha com "no test files" porque a Etapa 5 ainda não escreveu testes
- [x] Confirmar visualmente que uma classe Tailwind renderiza no navegador — verificado na Etapa 8 (screenshots do navegador real com o tema aplicado)

### Etapa 2 — Modelagem no Prisma
- [x] `schema.prisma` declara as entidades de OP1 (16 na época; hoje 18 com `FichaOP2`/`ClasseFormula` — ver "Os dois sistemas")
- [x] `npx prisma migrate dev --name init` cria a migration; `prisma/migrations/` passa a existir
- [x] `npx prisma migrate status` reporta aplicada e **nenhuma pendente** (reconfirmado após a migration de 22/09/2026)
- [x] `npx prisma studio` lista as tabelas — verificado via `psql \dt`, não pela GUI
- [x] Seed configurado (`migrations.seed` em `prisma7.config.ts` — Prisma 7 não lê `package.json`) e `npx prisma db seed` roda sem erro
- [x] Seed é **idempotente** — rodado duas vezes, contagens iguais (upsert por `classe`/`nome`)
- [x] `SELECT COUNT(*) FROM "Pericia"` retorna **28** (AGI 7, FOR 2, INT 9, PRE 9, VIG 1 — conferido por `GROUP BY` contra a Tabela 2.1 do livro; o critério antigo dizia 26, contagem errada)
- [ ] `SELECT COUNT(*) FROM "ProgressaoClasse"` retorna ≥ 1 linha por classe × tier de NEX
- [x] FKs opcionais (`pastaId` em Npc/Mapa/Documento, `fichaId`/`npcId` em `Token`) aceitam NULL — testado com insert real via Prisma Client
- [x] **Novo:** `Token` tem CHECK constraint (`token_ficha_xor_npc`) impedindo `fichaId` e `npcId` preenchidos ao mesmo tempo — testado, insert violando a regra é rejeitado pelo Postgres

> **Bloqueio parcialmente resolvido (22/09/2026):** a fórmula de PV/PE/San, os 20 tiers de NEX e a lista completa de 26 perícias com atributo-base **já foram confirmados** direto no livro (v1.3) — ver `ClasseFormula`/`engine/calculoFicha.ts`. O que falta pro seed: ~~lista de `Ritual`~~ (não é mais necessária — ritual virou entrada da ficha) e transformar as tabelas 1.3/1.4/1.5 (habilidades por tier, já lidas) em linhas de `ProgressaoClasse`. Ninguém pediu o seed ainda nesta sessão — fica pra quando for pedido explicitamente.

### Etapa 3 — Autenticação
- [x] `POST /auth/cadastro` cria usuário e retorna token válido
- [x] `POST /auth/login` com senha errada → **401**
- [x] Rota protegida (`GET /auth/me`) sem header `Authorization` → **401**; token expirado → **401**
- [x] `senha_hash` no banco não contém a senha em texto plano (bcryptjs, 10 rounds)
- [x] Convite tem expiração — **só a função pura** (`engine/convite.ts`, testada com vitest); endpoint de consumo (entrar na sala) é Etapa 4, por decisão
- [x] 11ª tentativa de login no mesmo minuto pelo mesmo IP → **429** (testado com 15 requisições em sequência)

> Rate limit aplicado em `/auth` inteiro (cadastro + login compartilham o mesmo limiter), não só login — conforme a meta não funcional "Rate limit em `/auth`: 10 tentativas/min por IP".

### Etapa 4 — Sala e Membros
- [x] Sala criada aparece em `GET /salas`
- [x] 4ª sala do mesmo dono → erro claro (limite de 3) — `400 {"error":"Limite de 3 salas por dono atingido"}`
- [x] Segundo usuário entra pelo link e vira `jogador` em `MembroSala` — via `POST /salas/entrar`, consome `engine/convite.ts`
- [x] Dono promove jogador a `mestre` e o papel muda no banco — `PATCH /salas/:id/membros/:membroId`
- [x] Jogador tentando deletar a sala → **403**
- [x] Não-membro tentando `GET /salas/:id` → **404** (escolhido em vez de 403, pra não confirmar a existência da sala pra quem não é membro)

> Criador da sala vira `MembroSala` com papel `MESTRE` automaticamente (decisão nova: `donoId` e o papel em `MembroSala` são conceitos separados no schema, mas sem isso o dono nunca teria papel de mestre nas checagens de autorização). `Sala.donoId` não tem cascade delete (protege contra apagar usuário que ainda é dono de sala) — só `Sala → MembroSala/Ficha/Npc/...` casca.

### Etapa 5 — Motor de cálculo
- [x] `npm test` passa cobrindo **cada classe × ≥ 3 tiers de NEX** (COMBATENTE/ESPECIALISTA/OCULTISTA × NEX 5/50/99, com fórmula real)
- [x] Bordas cobertas: NEX 5% e NEX 99%
- [x] Roda **sem banco** (fórmula + habilidades injetadas como parâmetro — `calcularFicha(entrada, tabelaHabilidades, formulas)`)
- [x] ≥ 3 resultados conferidos manualmente contra o livro — **resolvido em 22/09/2026**: PDF oficial (Ordem Paranormal RPG v1.3) fornecido, dados extraídos direto do texto (Cap. 1, p. 24-25/28-29/32-33). `pv_maximo`/`pe_maximo`/`san_maximo` das 3 classes em NEX 50% conferidos contra a fórmula do livro nos testes. Ainda não conferido contra o C.R.I.S. em si (não usado), mas o livro é a fonte primária aceita pelo critério.
- [x] Entrada inválida (NEX que não é um dos 20 tiers, negativo, > 99, classe inexistente) → erro tratado, não crash

> **OP2 (Ordem Paranormal RPG II — Playtest Alpha, Ago/2026):** o usuário pediu suporte aos dois sistemas. Investiguei o PDF enviado e **não há fórmula de PV/PD publicada nesse playtest** — as fichas são pré-prontas ("sobreviventes") e o texto diz explicitamente que a ficha de criação completa "será apresentada em um playtest futuro". Por isso não existe (ainda) um motor de cálculo de OP2 equivalente ao de OP1 — seria inventar uma regra que o próprio livro não publicou. O que É concreto e foi implementado: `engine/op2/escalaDados.ts` (a escala de step d4↔d12, com d20 como exceção — mecânica real e testada) e `engine/op2/catalogo.ts` (3 atributos — Físico/Mente/Emoção — e as 20 perícias com atributo-base, extraídos literalmente do PDF). Isso é só fundação de dados; schema/seed/ficha de OP2 **não fazem parte do pipeline de 11 etapas** (que é todo OP1) e ficam pra quando isso for decidido explicitamente.

### Etapa 6 — Ficha (só OP1 — ver nota sobre FichaOP2 abaixo)
- [x] `POST /salas/:id/fichas` retorna PV/PE/San máximos **já calculados**
- [x] `PATCH /fichas/:id` alterando NEX recalcula os máximos na resposta
- [x] Jogador A editando ficha do Jogador B → **403**; mestre → **200**
- [x] Treinar perícia grava em `FichaPericia` e o bônus aparece no `GET` (upsert testado via `POST /fichas/:id/pericias`)
- [x] `pv_atual > pv_maximo` é rejeitado pelo servidor (`pe_atual`/`san_atual` também, mesma regra)
- [ ] Uma ficha completa criada pela API bate com a mesma montada no C.R.I.S. — **não verificado**: não tenho acesso ao C.R.I.S. pra comparar ao vivo. A fórmula em si já foi conferida contra o livro (Etapa 5); esse item é especificamente sobre bater com a ferramenta C.R.I.S., que fica pendente de alguém rodar manualmente.

> **FichaOP2 ainda não tem CRUD** — só o schema existe (Etapa "multissistema"). Como OP2 não tem motor de cálculo (fichas pré-prontas, sem fórmula), o CRUD dela seria mais simples (sem cálculo, só atribuição direta de pv/pd) mas não foi pedido nesta etapa — Etapa 6 como documentada é só OP1.

### Etapa 7 — NPC e Pastas
- [x] NPC criado retorna valores idênticos aos inseridos (sem passar pelo motor) — no `POST` e no `GET`
- [x] Criar pasta → subpasta → mover NPC entre pastas funciona (`PATCH /npcs/:id { pastaId }`)
- [x] NPC sem `pastaId` aparece na raiz (`GET /salas/:id/biblioteca` sem `pastaId`); NPC dentro de pasta **não** aparece na raiz
- [x] Comportamento de deletar pasta com conteúdo está **definido e testado**: o conteúdo (NPCs, documentos, mapas, subpastas) **sobe pra pasta-pai**, ou pra raiz se a pasta era de raiz — nada é apagado junto. Testado nos dois casos (pasta aninhada e pasta de raiz).
- [x] O mesmo NPC vira token em dois mapas sem duplicar o registro — verificado **no modelo de dados** (Prisma direto: 2 mapas, 2 tokens, contagem de NPC inalterada), porque Mapa/Token só ganham endpoints na Etapa 10. Também confirmado: deletar o NPC deixa os tokens no mapa com `npcId = null`.

> Extras testados: mover pasta pra dentro da própria filha → 400 (ciclo); jogador criando NPC ou vendo a biblioteca → 403; não-membro → 404; `pv` negativo → 400; campo do sistema errado (`pd` em sala OP1, `san` em sala OP2) → 400.

### Etapa 8 — Frontend REST
> Verificado em navegador real (Edge headless via `playwright-core`, rodado de um diretório temporário fora do repo — não é dependência do projeto), 25 asserções + screenshots conferidos visualmente.
- [x] Login persiste: refresh na página mantém logado (token em `localStorage`, revalidado com `GET /auth/me` no carregamento)
- [x] Lista de salas renderiza dados reais da API (não mock) — contagem e nome conferidos contra `GET /salas`
- [x] Ficha renderiza valores vindos do backend — o front não recalcula nada. Botões +/− só **pedem** um novo `*_atual`; a tela exibe o que o `PATCH` devolve (conferido no banco: 23 → 22)
- [x] Layout bate com as zonas da seção "Layout da tela de mesa" — header, sidebar (6 seções na ordem), faixa de vídeo com badge "Mestre", área do mapa (toolbar, zoom, "Piso 1"), barra de turno recolhida, painel da ficha
- [x] Login/cadastro/lista testados em 375px **sem scroll horizontal** (`scrollWidth <= innerWidth`)
- [x] Backend desligado → **mensagem de erro clara**, não tela branca — testado com o backend realmente parado (não só simulado), com botão "Tentar novamente"
- [x] Operação > 300ms mostra spinner ou skeleton — resposta atrasada em 1,2s mostra o spinner; abaixo de 300ms nada pisca (`useAtrasado`)

> Extras: sessão expirada/token inválido volta pro login; rota protegida sem sessão redireciona pra `/login` e retorna ao destino depois; `ErrorBoundary` na raiz pega erro de render; zero erros inesperados no console. Seções da sidebar além de "Mesa", mapa, rolagem e áudio aparecem como "ainda não disponível" (são das Etapas 9/10) — honesto, não quebrado. **Fichas de OP2 não têm UI** (não há CRUD de `FichaOP2`); a mesa OP2 mostra essa explicação no painel.

### Etapa 9 — Tempo real (testar sempre com duas abas)
> Verificado com duas abas reais (Edge headless, `playwright-core` em diretório temporário fora do repo): aba do mestre + aba do jogador na mesma mesa, com o script subindo e **reiniciando o backend de verdade** no critério 7.
- [x] Alterar PV numa aba reflete na outra em < 1s — medido: **90ms**
- [x] Alterar NEX recalcula os máximos e reflete na outra — NEX 5% → 50% na aba do jogador, aba do mestre mostra PV máximo 59 (20 + Vig 3 + 9×4) em ~120ms
- [x] Chat e rolagem de dados aparecem nas duas abas (mensagem com `<b>` aparece como texto — não é interpretada)
- [x] Mestre inicia combate → ordem aparece nas duas → "Encerrar turno" avança (Zumbi 18 → Bianca 12 → rodada 2)
- [x] "Encerrar turno" por quem não é o jogador ativo nem mestre → rejeitado **pelo servidor** (`403`, testado com cliente socket direto, não só o botão desabilitado)
- [x] DevTools → Offline → religar: socket reconecta sozinho em < 30s e o estado volta — queda percebida em ~14s (heartbeat), reconectou **1,3s** depois de religar, e um PV alterado enquanto a aba estava offline apareceu após a reconexão
- [x] Reiniciar o servidor durante combate → cliente avisa estado perdido, sem dados fantasma — as duas abas mostram "Sessão reiniciada — reinicie o combate." e a barra volta a "Nenhum combate em andamento", sem fila residual

### Etapa 10 — Mapa, tokens e webcam
> Verificado em navegador real (Edge headless via `playwright-core`, diretório temporário fora do repo): 18 asserções de mapa/tokens e 14 de vídeo, com câmera falsa do Chromium. Confiabilidade da conexão inicial de vídeo medida em teste de estresse (as duas abas ligando a câmera ao mesmo tempo): **30/30** rodadas, vídeo em 0,2–1,1s.
- [x] Mapa até 10MB sobe; acima disso é rejeitado com mensagem clara — PNG real de 9,02MB enviado pela UI; 10,5MB recusado no navegador **e** no servidor (`413`, testado sem passar pelo navegador). HTML disfarçado de `.png` → `400` (tipo detectado pelos bytes)
- [x] Token arrastado numa aba move na outra em < 150ms — medido: **12–32ms**. Posição gravada no banco ao soltar
- [x] Token de Ficha mostra dados da ficha (nome + PV ao vivo: PV mudou no painel → mudou no token da outra aba); de NPC mostra do NPC (nome; estatísticas ficam só com o mestre); sem vínculo funciona como objeto (ex.: "Baú")
- [x] Zoom e pan funcionam com mouse e com toque — roda do mouse, arrastar com mouse, pinça com dois dedos e arrastar com um dedo (toque real via CDP `Input.dispatchTouchEvent`, não evento sintético)
- [ ] Vídeo entre **duas redes diferentes** — **não verificado, e não dá pra verificar daqui**: exige dois dispositivos em redes distintas e um servidor TURN de produção (`TURN_URL`/`TURN_USERNAME`/`TURN_CREDENTIAL` no `.env`, ver `.env.example`). Sem TURN, só STUN público: funciona na maioria das redes domésticas, falha em NAT simétrico/4G/rede corporativa. Testado só entre abas da mesma máquina.
- [x] Recusar câmera → sistema segue em modo texto+mapa — aviso claro; mapa, chat e conexão da mesa seguem funcionando; e a pessoa sem câmera ainda **assiste** o vídeo dos outros
- [x] Queda de vídeo → reconexão automática; após 3 falhas, botão manual — queda simulada (sinalização de um participante some sem ele sair da sala, via gancho só de dev `window.__rpgVideo`): quem liga tenta 3 vezes, os dois lados mostram "Reconectar"; o botão dispara nova tentativa; quando a rede volta, o vídeo se restabelece sozinho (0,2s). Testado nos dois papéis (mestre ligando e jogador ligando)

### Etapa 11 — Polimento
- [ ] Documento de requisitos formal com os requisitos classificados
- [ ] README por módulo do backend
- [ ] **Todas** as ações destrutivas com confirmação
- [ ] 6 conexões WebSocket simultâneas numa sala sem degradação
- [ ] Fluxo principal (login → sala → ficha → combate → mapa) **sem erro no console**
- [ ] Tabela de requisitos não funcionais percorrida item a item

---

## Como consultar o estado real a qualquer momento

```bash
git log --oneline -20                # o que foi realmente construído
git branch -a                        # em que frente você estava
docker ps                            # o Postgres está de pé?
npx prisma migrate status            # o schema foi aplicado?
ls backend/prisma/migrations         # existe alguma migration?
npm test                             # o motor de cálculo ainda passa?
```

Se algum critério da última etapa marcada como concluída falhar, **a etapa não está concluída**.

---

## Comandos do dia a dia

```bash
# Banco (rodar antes de desenvolver)
docker compose up -d

# Backend
cd backend && npm run dev          # tsx watch src/server.ts → porta 3333
# Pra testes automatizados, prefira `npx tsx src/server.ts` (sem watch): o `tsx watch`
# é um processo-pai que ressuscita o filho — matar só o dono da porta 3333 não para
# nada, e rodar `npm run dev &` várias vezes acumula watchers órfãos (aconteceu: 5).

# Frontend
cd frontend && npm run dev         # Vite → porta 5173

# Prisma
npx prisma migrate dev --name <nome>
npx prisma studio                  # GUI do banco
npx prisma db seed                 # roda o seed

# Healthcheck
curl http://localhost:3333/health
```

---

## Variáveis de ambiente (`backend/.env`)

```
DATABASE_URL="postgresql://rpg_user:rpg_pass@localhost:5433/rpg_online?schema=public"
JWT_SECRET="<valor secreto>"
PORT=3333
```

**Porta 5433, não 5432** — há um Postgres nativo do Windows (fora do Docker, de outra origem) ocupando a 5432 nesta máquina, e ele não pode ser encerrado sem privilégio de admin. `docker-compose.yml` mapeia `5433:5432` para não colidir. Se o Postgres nativo for removido/desligado no futuro, dá pra voltar pra 5432 — não é uma decisão de arquitetura, é workaround de ambiente.

---

## Como o Hederson trabalha

- Quer entender o **porquê** antes (ou junto) de executar — explicação precede o comando.
- Instruções precisas e sem ambiguidade; ele pega ambiguidade antes de agir.
- Toda decisão nova relevante volta para este arquivo e para o handoff no Project.
- **Nunca marque uma etapa como concluída sem rodar os critérios.** Ele vai perguntar "como você sabe que terminou?" — tenha a resposta verificável.
