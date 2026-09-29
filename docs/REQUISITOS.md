# Documento de requisitos — RPG Online

Versão 1.0 · 29/09/2026 · Autor: Hederson Franco

Mesa virtual de RPG para **Ordem Paranormal** (edições v1.3 e RPG II playtest): vídeo, mapa com tokens,
ficha calculada pelo servidor, chat, rolagem e turnos em tempo real, numa aba só. Produto para lançamento;
código fechado (todos os direitos reservados). Contexto de produto em [`PRODUCT.md`](../PRODUCT.md), sistema
visual em [`DESIGN.md`](../DESIGN.md), decisões e critérios por etapa em [`CLAUDE.md`](../CLAUDE.md).

## Como ler este documento

- **ID**: `RF` = requisito funcional, `RNF` = não funcional, `RN` = regra de negócio, `RS` = restrição.
- **Prioridade**: **E** essencial (sem isso não há lançamento) · **I** importante (lançamento fica pior sem) · **D** desejável.
- **Status**: ✅ implementado e verificado · 🔄 parcial · ⬜ pendente · — fora do escopo da v1.
- **Verificação**: onde o critério foi conferido (etapa do pipeline no `CLAUDE.md`, teste automatizado ou medição).

---

## 1. Requisitos funcionais

### 1.1 Contas e acesso

| ID | Requisito | Prior. | Status | Verificação |
|---|---|---|---|---|
| RF01 | Cadastrar conta com nome, e-mail e senha | E | ✅ | Etapa 3 |
| RF02 | Entrar com e-mail e senha; sessão por token JWT | E | ✅ | Etapa 3 |
| RF03 | Manter a sessão ao recarregar a página | E | ✅ | Etapa 8 |
| RF04 | Sair da conta | E | ✅ | Etapa 8 |
| RF05 | Página de apresentação pública (o que é, por que existe, para quem, como funciona) | I | ✅ | Etapa 11 (textos a reescrever pelo autor) |

### 1.2 Mesas e membros

| ID | Requisito | Prior. | Status | Verificação |
|---|---|---|---|---|
| RF10 | Criar mesa escolhendo o sistema (Ordem Paranormal RPG ou RPG II) | E | ✅ | Etapa 4 |
| RF11 | Listar as mesas de que participo, com o meu papel | E | ✅ | Etapa 4 |
| RF12 | Convidar por link; entrar na mesa pelo link | E | ✅ | Etapa 4 |
| RF13 | Trocar o papel de um membro (mestre/jogador) | I | ✅ | Etapa 4 + tela Membros |
| RF14 | Expulsar membro | I | ✅ | Etapa 11 (teste ponta a ponta) |
| RF15 | Banir e desbanir membro | I | ✅ | Etapa 11 (teste ponta a ponta) |
| RF16 | Apagar mesa | I | ✅ | Etapa 11 (teste ponta a ponta) |

### 1.3 Ficha de personagem (Ordem Paranormal RPG v1.3)

| ID | Requisito | Prior. | Status | Verificação |
|---|---|---|---|---|
| RF20 | Criar ficha: nome, classe, origem, trilha, NEX e 5 atributos | E | ✅ | Etapa 6 |
| RF21 | PV, PE e Sanidade máximos calculados pelo servidor com a fórmula do livro | E | ✅ | Etapa 5 (testes) |
| RF22 | Ajustar PV/PE/Sanidade atuais (0 ≤ atual ≤ máximo, validado no servidor) | E | ✅ | Etapa 6 |
| RF23 | 28 perícias com grau de treino; teste "(atributo)d20 + bônus" calculado no servidor | E | ✅ | Etapa 5/6 |
| RF24 | Rituais, habilidades, poderes e equipamentos cadastrados na ficha | E | ✅ | Etapa 6 |
| RF25 | Habilidades de classe desbloqueadas até o NEX atual | I | ✅ | Etapa 2 (seed + testes) |
| RF26 | Inventário em texto livre | I | ✅ | Etapa 6 |
| RF27 | Ficha de Ordem Paranormal RPG II | I | ⬜ | Sem CRUD nem tela; o playtest não publicou criação de personagem |
| RF28 | Apagar ficha | D | ⬜ | Não existe rota; não foi pedido |

### 1.4 Mesa em jogo

| ID | Requisito | Prior. | Status | Verificação |
|---|---|---|---|---|
| RF30 | Chat da mesa com histórico | E | ✅ | Etapa 9 |
| RF31 | Rolagem de dados feita no servidor (soma, maior, menor) | E | ✅ | Etapa 9 (testes) |
| RF32 | Combate: iniciativa informada pelo mestre, vez de quem, fila, encerrar turno | E | ✅ | Etapa 9 |
| RF33 | Enviar mapas e escolher o mapa da mesa (só o mestre) | E | ✅ | Etapa 10 |
| RF34 | Tokens de ficha, NPC ou objeto; arrastar ao vivo | E | ✅ | Etapa 10 |
| RF35 | Zoom e pan por mouse e por toque | E | ✅ | Etapa 10 |
| RF36 | Vídeo e áudio entre os participantes (opcional) | E | 🔄 | Etapa 10 — falta teste entre redes diferentes (exige TURN) |
| RF37 | NPCs: criar, editar, apagar; campos pelo sistema da mesa (só o mestre) | I | ✅ | Etapa 7 + tela NPCs |
| RF38 | Biblioteca (pastas de NPCs, documentos, mapas) | D | 🔄 | API pronta (Etapa 7), sem tela |
| RF39 | Notas / documentos | D | ⬜ | Entidade existe, sem API nem tela |

---

## 2. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Cada pessoa é dona de até 3 mesas; pode participar de quantas quiser. |
| RN02 | O papel (mestre/jogador) é por pessoa **e** mesa, não fixo no perfil. Quem cria a mesa é dono e mestre. |
| RN03 | Cada mesa tem um sistema, escolhido na criação e imutável; a ficha herda o sistema da mesa. |
| RN04 | O convite expira em 7 dias e só o dono o gera **e o vê** (a API não entrega o link a outros membros). |
| RN05 | Só o dono expulsa, bane, desbane, troca papel e apaga a mesa. O dono não pode ser removido. |
| RN06 | Banido não entra pela mesa por nenhum convite até ser desbanido. As fichas de quem sai ficam na mesa. |
| RN07 | Jogador edita as próprias fichas; mestre edita qualquer ficha da mesa. Conflito: vale a última escrita. |
| RN08 | O servidor é o único que calcula valores derivados (PV/PE/San máximos, testes, habilidades). |
| RN09 | NPCs são blocos de estatística fixos (não passam pelo motor) e são só do mestre; o jogador vê apenas o nome do token. |
| RN10 | Só o mestre cria/remove tokens e escolhe o mapa; o jogador move só o token da própria ficha. |
| RN11 | Só quem está na vez ou o mestre encerram o turno. O combate vive em memória: se o servidor reiniciar, a tela avisa. |
| RN12 | A rolagem não é gravada; só a última de cada mesa fica em memória. O chat é gravado (até 1000 caracteres). |
| RN13 | Toda ação destrutiva pede confirmação. |

---

## 3. Requisitos não funcionais

Medidos em 29/09/2026 contra o build de produção (`vite preview`), backend local e PostgreSQL 16 em Docker,
com 6 contas numa mesma mesa (1 mestre + 5 jogadores). Navegador: Microsoft Edge (Chromium) headless.

| ID | Categoria | Meta | Medido | Status |
|---|---|---|---|---|
| RNF01 | Resposta da API REST | < 500 ms em carga normal | p95 ≤ 40 ms em todas as rotas medidas (ver 3.1) | ✅ |
| RNF02 | Latência de evento em tempo real | < 150 ms percebida | 6 conexões: chat p95 16 ms, rolagem p95 3 ms, token p95 9 ms | ✅ |
| RNF03 | Carregamento da tela de mesa | < 3 s em 10 Mbps | 1,47–1,80 s (rede limitada a 10 Mbps, 40 ms, sem cache; mapa de 659 KB) | ✅ |
| RNF04 | Participantes por mesa | 6 (1 mestre + 5 jogadores) | 6 conexões simultâneas sem perda nem degradação | ✅ |
| RNF05 | Navegadores | Chrome, Firefox, Edge 120+ e Safari 17+ | Verificado só em Edge/Chromium | 🔄 Firefox e Safari não testados |
| RNF06 | Tema | Escuro como padrão | Produto inteiro no tema escuro "Dossiê de caso" | ✅ |
| RNF07 | Validade da sessão | JWT de 24 h, sem refresh token | 24 h (lido do token emitido) | ✅ |
| RNF08 | Proteção de login | 10 tentativas/min por IP em `/auth`; a 11ª → 429 | 10 × 401 e a 11ª × 429 | ✅ |
| RNF09 | Upload de mapa | Máx. 10 MB; tipo pelos bytes | 10,5 MB → 413; tipo detectado pelos bytes (Etapa 10) | ✅ |
| RNF10 | Upload de avatar | Máx. 2 MB | Não existe upload de avatar | ⬜ |
| RNF11 | Reconexão do socket | Automática em até 30 s | Queda percebida em 15 s; reconectou 1,3 s depois de a rede voltar | ✅ |
| RNF12 | Reconexão do vídeo | Automática; após 3 falhas, botão "Reconectar" | Verificado na Etapa 10 (queda simulada, os dois papéis) | ✅ |
| RNF13 | Degradação sem câmera | Mesa funciona em texto + mapa | Verificado na Etapa 10 | ✅ |
| RNF14 | Estados de erro e de carregamento | Nenhuma tela branca; carregamento após 300 ms | Verificado nas Etapas 8–11; erro geral capturado (`ErrorBoundary`) | ✅ |
| RNF15 | Confirmação em ação destrutiva | Toda ação destrutiva confirma | Apagar mesa, expulsar, banir, remover mapa/token/NPC, apagar entrada da ficha, encerrar combate | ✅ |
| RNF16 | Texto do usuário seguro (XSS) | Todo texto sanitizado | Nenhum HTML cru no frontend (React escapa); chat com `<b>` aparece como texto | ✅ |
| RNF17 | Acessibilidade | WCAG AA como régua | Contraste AA, foco visível, abas por teclado, diálogos com foco preso, texto ≥ 12 px | 🔄 Sem auditoria formal com leitor de tela |
| RNF18 | Fluxo principal sem erro no console | Login → mesa → ficha → combate → mapa | Zero erros no console no build de produção | ✅ |

### 3.1 Tempos da API (30 chamadas cada, milissegundos)

| Rota | p50 | p95 | máx. |
|---|---|---|---|
| `GET /salas` | 6,5 | 9,5 | 9,5 |
| `GET /salas/:id` | 8,0 | 9,4 | 9,8 |
| `GET /salas/:id/fichas` | 15,8 | 18,7 | 19,2 |
| `GET /salas/:id/mapa-ativo` | 13,1 | 16,3 | 20,7 |
| `PATCH /fichas/:id` (recalcula a ficha) | 29,6 | 38,3 | 42,1 |

---

## 4. Restrições

| ID | Restrição |
|---|---|
| RS01 | Stack fixa: React 19 + Vite + TypeScript + Tailwind v4 no frontend; Node + Express 5 + TypeScript 7 + Socket.IO + PeerJS + PostgreSQL 16 + Prisma 7 no backend. |
| RS02 | A tela de mesa exige no mínimo 1280 px de largura; login, cadastro, lista e apresentação funcionam no celular (375 px). |
| RS03 | Licença da Comunidade de Ordem Paranormal (v1.0): sem arte, texto, logo ou nomes próprios do cânone; aviso literal e selo obrigatórios; sem material gerado por IA em conteúdo comercial; LGPD (não vender nem compartilhar dados pessoais). |
| RS04 | Código fechado: repositório público só como portfólio; nenhuma licença de uso. |
| RS05 | Vídeo P2P em malha: acima de 6 pessoas a banda de cada um não escala. |

## 5. Fora do escopo da v1

Histórico de rolagens; Redis / estado distribuído; regras mecânicas de itens (dano, crítico, munição);
motor de cálculo para NPCs; outros sistemas além de Ordem Paranormal; ferramentas de anotação no mapa
(lápis, linha, texto, régua, grade); mapas com vários pisos; tema claro; refresh token.

## 6. Pendências para o lançamento

1. **Textos da página de apresentação** reescritos pelo autor (a primeira versão foi escrita com IA — RS03).
2. **Vídeo entre redes diferentes**: configurar um servidor TURN de produção e testar com dois dispositivos (RF36).
3. **Firefox e Safari**: testar o fluxo principal nos dois (RNF05).
4. **Conferir uma ficha contra o C.R.I.S.** (Etapa 6), manualmente.
5. **Ficha de RPG II** (RF27), quando o playtest publicar a criação de personagem.
6. Decidir sobre **upload de avatar** (RNF10) e **apagar ficha** (RF28).
7. Produção: restringir o CORS (hoje aceita qualquer origem) e publicar política de privacidade (LGPD).
