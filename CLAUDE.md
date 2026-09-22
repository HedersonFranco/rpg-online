# RPG Online — Ordem Paranormal

Sistema colaborativo de RPG à distância (webcam/áudio, fichas, mapas, chat).
Desenvolvedor solo: Hederson. Repositório: `HedersonFranco/rpg-online`.

**Natureza do projeto:** produto **real, para lançamento** — não portfólio, não MVP descartável.
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
**Prisma 7** usa `prisma7.config.ts` para `datasource.url` — o `schema.prisma` não declara `url` diretamente.
**`typescript-eslint` não suporta TS 7** (bloqueio confirmado, não só peer warning — [issue #10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)). ESLint do backend usa `@babel/eslint-parser` + `@babel/preset-typescript` só para sintaxe — **sem regras tipadas**. Revisar quando a issue fechar.

---

## Regras de negócio fechadas (não reabrir)

### Salas
- Dono: até 3 salas. Participante: ilimitado.
- Papel (mestre/jogador) é por usuário+sala, não fixo no perfil.
- Cada sala tem um único sistema de regras — a ficha herda da sala.
- Convite via link com expiração de 7 dias, nunca permanente.

### Fichas
- Um usuário pode ter mais de uma ficha, inclusive na mesma sala.
- Criação livre — jogador escolhe tudo sem aprovação prévia do mestre.
- Jogador edita a própria ficha; mestre edita qualquer ficha da sala.
- Conflito simultâneo: last-write-wins, sem aviso na v1.
- Inventário: campo de texto livre (sem tabela estruturada na v1).
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

---

## Requisitos não funcionais (metas de lançamento)

| Categoria | Alvo |
|---|---|
| Resposta da API REST | < 500ms em carga normal |
| Latência de evento WebSocket | < 150ms percebida |
| Carregamento da tela de mesa | < 3s em 10 Mbps |
| Participantes por sala (v1) | 6 (1 mestre + 5 jogadores) |
| Navegadores | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| Tema | **Escuro é o padrão** (violeta como cor primária). Tema claro é pós-lançamento. |
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

## Motor de cálculo (`backend/src/engine/calculoFicha.ts`)

Função pura chamada pela API REST e pelo WebSocket:
1. Recebe: `classe`, `nex`, atributos (`for`, `agi`, `int`, `vig`, `pre`).
2. Consulta `ProgressaoClasse` no banco.
3. Retorna: `pv_maximo`, `pe_maximo`, `san_maximo`, bônus de perícias, habilidades desbloqueadas.

`pv/pe/san_maximo_cache` na tabela `Ficha` são **cache** — nunca fonte da verdade.
Botões de combate alteram só o valor **atual** (0 ≤ atual ≤ máximo), validado no servidor.
NPCs **não** passam por este motor.

A função deve rodar **sem conexão com o banco** nos testes — a tabela de progressão entra como parâmetro ou mock. Se ela precisar do Prisma para ser testada, não é pura o bastante.

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
│       │   ├── calculoFicha.ts
│       │   └── progressaoClasse.ts
│       ├── sockets/
│       │   └── salaSocket.ts
│       ├── middlewares/
│       │   └── auth.ts
│       └── generated/prisma/   ← gerado pelo Prisma, não editar nem versionar
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login/
│       │   ├── Cadastro/
│       │   ├── ListaSalas/
│       │   └── Sala/
│       ├── components/
│       │   ├── FichaOrdemParanormal/
│       │   ├── MapaToken/
│       │   ├── Biblioteca/
│       │   ├── Chat/
│       │   └── TurnoTracker/
│       ├── hooks/
│       │   └── useSocket.ts
│       └── services/
│           └── api.ts
└── CLAUDE.md
```

Cada módulo em `modules/` tem: `<modulo>.controller.ts`, `<modulo>.service.ts`, `<modulo>.routes.ts`.

---

## Banco de dados — decisões de design

- `Ficha` usa colunas tipadas (não JSON livre) para Ordem Paranormal — permite queries como "fichas com NEX >= 30".
- Se D&D entrar no futuro: tabela separada `FichaDnd` ou campo `extra Json`.
- `ProgressaoClasse` existe para não mexer em código ao ajustar valores do livro.
- `Pericia` (~30 fixas) e `Ritual` são catálogos populados via **seed**, não criados pelo usuário. O seed deve ser **idempotente** (rodar duas vezes não duplica).
- `Npc` é entidade separada de `Ficha` — monstros não têm progressão por NEX.
- `Pasta` é genérica e autorreferenciada; relação com Npc/Mapa/Documento é opcional.
- `Sessao` é enxuta — base para histórico futuro sem vínculo obrigatório com mensagens.
- Rolagem de dados **não tem tabela** — é evento em tempo real.
- **Estado de combate (turno/iniciativa) não tem tabela** — vive em memória do processo Node.
- Redis: adiado — estado de sessão ativa em memória do processo Node por ora.
- Armazenamento de arquivos: abstraído em função `salvarArquivo()` para trocar disco local por S3 no futuro.

### Entidades (16)
`Usuario`, `Sala`, `MembroSala`, `Sessao`, `Ficha`, `ProgressaoClasse`, `Pericia`, `FichaPericia`, `Ritual`, `FichaRitual`, `Npc`, `Pasta`, `Documento`, `Mapa`, `Token`, `Mensagem`

---

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

- **Sidebar esquerda:** Mesa, Mapa, Fichas, Biblioteca, Notas, NPCs (ícone + label).
- **Faixa de vídeo:** feeds horizontais com nome, indicador de áudio e badge "Mestre". Sem câmera → placeholder com inicial.
- **Mapa:** toolbar vertical à esquerda (cursor e pan na v1; lápis/linha/texto/régua/grade são v2). Zoom +/− e tela cheia no canto inferior esquerdo. Seletor "Piso 1" é **placeholder na v1** (multi-piso é v2).
- **Painel direito (ficha):** avatar + nome + origem/classe/trilha/NEX%, chips de PV/PE/Sanidade, barra de NEX, grade de atributos **FOR/AGI/INT/VIG/PRE**, tabs (Atributos-Perícias / Rituais / Inventário / Características), barras de recurso com botões +/−.
- **Barra de turno:** jogador ativo + iniciativa à esquerda, fila de próximos no centro, botão primário "Encerrar turno", botão "Rolagem" à direita. Sem combate ativo → barra recolhida.

> O `preview.webp` mostra atributos de D&D (FOR/DES/CON/INT/SAB/CAR, CA, Descanso Curto/Longo). **A estrutura é a referência, o conteúdo não.** Mapear sempre para Ordem Paranormal.

---

## Fora do escopo da v1

- Histórico de rolagens persistido
- Redis / estado distribuído
- Tabela estruturada de itens no inventário
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
| 1 | Setup e configuração | 🔄 Quase — faltam ESLint e runner de teste no backend |
| 2 | Modelagem no Prisma + migration + seeds | 🔄 Iniciada — schema ainda é stub, sem models |
| 3 | Autenticação (JWT, convite com expiração) | ⬜ |
| 4 | CRUD de Sala e Membros | ⬜ |
| 5 | Motor de cálculo isolado + testes | ⬜ |
| 6 | CRUD de Ficha (sem tempo real) | ⬜ |
| 7 | CRUD de NPC e Pastas | ⬜ |
| 8 | Frontend consumindo REST | ⬜ |
| 9 | Tempo real (Socket.IO) + turno + reconexão | ⬜ |
| 10 | Mapa, tokens e webcam | ⬜ |
| 11 | Polimento e documentação formal | ⬜ |

### Etapa 1 — Setup
- [x] `docker compose up -d` sobe o Postgres; `docker ps` mostra `rpg-postgres` rodando
- [x] `GET /health` responde `{"status":"ok"}` na porta 3333
- [x] `vite.config.ts` carrega `@tailwindcss/vite`; `index.css` tem `@import "tailwindcss"`
- [x] `.env` fora do Git, `.env.example` presente
- [x] **ESLint configurado no backend** (hoje só existe no frontend) + script `lint`
- [x] **Runner de teste no backend** — `vitest` instalado e confirmado rodando sob TS 7 + `tsx` (teste sanity temporário passou); `npm test` hoje falha com "no test files" porque a Etapa 5 ainda não escreveu testes
- [ ] Confirmar visualmente que uma classe Tailwind renderiza no navegador

### Etapa 2 — Modelagem no Prisma
- [ ] `schema.prisma` declara as **16 entidades** listadas acima (hoje tem 0)
- [ ] `npx prisma migrate dev --name init` cria a migration; `prisma/migrations/` passa a existir
- [ ] `npx prisma migrate status` reporta aplicada e **nenhuma pendente**
- [ ] `npx prisma studio` lista as 16 tabelas
- [ ] Script `prisma.seed` no `package.json` e `npx prisma db seed` roda sem erro
- [ ] Seed é **idempotente** — rodar duas vezes não duplica registros
- [ ] `SELECT COUNT(*) FROM "Pericia"` retorna ~30
- [ ] `SELECT COUNT(*) FROM "ProgressaoClasse"` retorna ≥ 1 linha por classe × tier de NEX
- [ ] FKs opcionais (`pastaId`, `fichaId`/`npcId` em `Token`) aceitam NULL

> **Bloqueio conhecido:** os dados do livro (lista de perícias com atributo-base, tabela de progressão por NEX) ainda não foram levantados. O schema pode ser escrito sem eles; o **seed não**.

### Etapa 3 — Autenticação
- [ ] `POST /auth/cadastro` cria usuário e retorna token válido
- [ ] `POST /auth/login` com senha errada → **401**
- [ ] Rota protegida sem header `Authorization` → **401**; token expirado → **401**
- [ ] `senha_hash` no banco não contém a senha em texto plano
- [ ] Convite tem expiração; convite vencido é rejeitado ao ser usado
- [ ] 11ª tentativa de login no mesmo minuto pelo mesmo IP → **429**

### Etapa 4 — Sala e Membros
- [ ] Sala criada aparece em `GET /salas`
- [ ] 4ª sala do mesmo dono → erro claro (limite de 3)
- [ ] Segundo usuário entra pelo link e vira `jogador` em `MembroSala`
- [ ] Dono promove jogador a `mestre` e o papel muda no banco
- [ ] Jogador tentando deletar a sala → **403**
- [ ] Não-membro tentando `GET /salas/:id` → **403** ou **404**

### Etapa 5 — Motor de cálculo
- [ ] `npm test` passa cobrindo **cada classe × ≥ 3 tiers de NEX**
- [ ] Bordas cobertas: NEX 5% e NEX 99%
- [ ] Roda **sem banco** (progressão injetada ou mockada)
- [ ] ≥ 3 resultados conferidos manualmente contra o livro ou o C.R.I.S.
- [ ] Entrada inválida (NEX negativo, classe inexistente) → erro tratado, não crash

### Etapa 6 — Ficha
- [ ] `POST /salas/:id/fichas` retorna PV/PE/San máximos **já calculados**
- [ ] `PATCH /fichas/:id` alterando NEX recalcula os máximos na resposta
- [ ] Jogador A editando ficha do Jogador B → **403**; mestre → **200**
- [ ] Treinar perícia grava em `FichaPericia` e o bônus aparece no `GET`
- [ ] `pv_atual > pv_maximo` é rejeitado pelo servidor
- [ ] Uma ficha completa criada pela API bate com a mesma montada no C.R.I.S.

### Etapa 7 — NPC e Pastas
- [ ] NPC criado retorna valores idênticos aos inseridos (sem passar pelo motor)
- [ ] Criar pasta → subpasta → mover NPC entre pastas funciona
- [ ] NPC sem `pastaId` aparece na raiz
- [ ] Comportamento de deletar pasta com conteúdo está **definido e testado**
- [ ] O mesmo NPC vira token em dois mapas sem duplicar o registro

### Etapa 8 — Frontend REST
- [ ] Login persiste: refresh na página mantém logado
- [ ] Lista de salas renderiza dados reais da API (não mock)
- [ ] Ficha renderiza valores vindos do backend — o front não recalcula nada
- [ ] Layout bate com as zonas da seção "Layout da tela de mesa"
- [ ] Login/cadastro/lista testados em 375px **sem scroll horizontal**
- [ ] Backend desligado → **mensagem de erro clara**, não tela branca
- [ ] Operação > 300ms mostra spinner ou skeleton

### Etapa 9 — Tempo real (testar sempre com duas abas)
- [ ] Alterar PV numa aba reflete na outra em < 1s
- [ ] Alterar NEX recalcula os máximos e reflete na outra
- [ ] Chat e rolagem de dados aparecem nas duas abas
- [ ] Mestre inicia combate → ordem aparece nas duas → "Encerrar turno" avança
- [ ] "Encerrar turno" por quem não é o jogador ativo nem mestre → rejeitado
- [ ] DevTools → Offline → religar: socket reconecta sozinho em < 30s e o estado volta
- [ ] Reiniciar o servidor durante combate → cliente avisa estado perdido, sem dados fantasma

### Etapa 10 — Mapa, tokens e webcam
- [ ] Mapa até 10MB sobe; acima disso é rejeitado com mensagem clara
- [ ] Token arrastado numa aba move na outra em < 150ms
- [ ] Token de Ficha mostra dados da ficha; de NPC mostra do NPC; sem vínculo funciona como objeto
- [ ] Zoom e pan funcionam com mouse e com toque
- [ ] Vídeo entre **duas redes diferentes** (não só na mesma LAN — é onde o STUN/TURN é exercitado)
- [ ] Recusar câmera → sistema segue em modo texto+mapa
- [ ] Queda de vídeo → reconexão automática; após 3 falhas, botão manual

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
DATABASE_URL="postgresql://rpg_user:rpg_pass@localhost:5432/rpg_online?schema=public"
JWT_SECRET="<valor secreto>"
PORT=3333
```

---

## Como o Hederson trabalha

- Quer entender o **porquê** antes (ou junto) de executar — explicação precede o comando.
- Instruções precisas e sem ambiguidade; ele pega ambiguidade antes de agir.
- Toda decisão nova relevante volta para este arquivo e para o handoff no Project.
- **Nunca marque uma etapa como concluída sem rodar os critérios.** Ele vai perguntar "como você sabe que terminou?" — tenha a resposta verificável.
