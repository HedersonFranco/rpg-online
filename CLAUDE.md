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

**Onde está cada coisa (04/11/2026):** este arquivo vale para o projeto inteiro. O que só vale dentro de uma pasta está em `backend/CLAUDE.md` e `frontend/CLAUDE.md` (o Claude Code lê cada um quando trabalha naquela pasta); os critérios das etapas já fechadas estão em `docs/ETAPAS.md`.

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

Notas de cada lado (TS 7 × TS 6, Prisma 7, Express 5, ESLint, Tailwind v4, roteamento): `backend/CLAUDE.md` e `frontend/CLAUDE.md`.

---

## Regras de negócio fechadas (não reabrir)

### Salas
- Dono: até 3 salas. Participante: ilimitado.
- **Só o dono expulsa ou bane (decisão de 29/09/2026).** Expulsar tira a pessoa da mesa na hora (pode voltar com um convite válido); banir também impede a volta por qualquer convite até o dono desbanir (tabela `Banimento`). O dono não pode ser removido. As fichas de quem sai **ficam na mesa** (o mestre segue usando ou apaga); a pessoa perde o acesso a elas. A remoção é em tempo real: as abas abertas dela recebem `sala:removido`, saem da sala de socket e do vídeo, e voltam pra lista de mesas com aviso. Rotas: `DELETE /salas/:id/membros/:membroId` (`?banir=1` para banir), `GET /salas/:id/banidos`, `DELETE /salas/:id/banidos/:usuarioId`. A mesa recebe `sala:membros` a cada entrada, troca de papel ou remoção. UI: aba/folha **Membros** do painel, só do dono (inclui trocar papel mestre/jogador).
- Papel (mestre/jogador) é por usuário+sala, não fixo no perfil.
- Cada sala tem um único sistema de regras, **escolhido na criação** entre `ORDEM_PARANORMAL_1` e
  `ORDEM_PARANORMAL_2` (campo `Sala.sistema`, obrigatório, sem default — o dono decide) — a ficha herda da sala.
- Convite via link com expiração de 7 dias, nunca permanente.
- **Só o dono vê o convite (decisão de 29/09/2026):** `conviteToken`/`conviteExpiraEm` só saem na API para o dono (`ocultarConvite()` em `engine/convite.ts`, aplicado em `GET /salas`, `GET /salas/:id` e `POST /salas/entrar`); para os demais membros vêm `null`. Antes, qualquer jogador lia o link na aba Rede e convidava sem o dono saber.

### Limites por mesa (decisão de 05/11/2026)
Escolhidos medindo: mesa de teste com N itens, API local e build de produção no navegador, num Ryzen 5 5500U (notebook mediano). Constantes em `backend/src/lib/limites.ts`; acima do limite → `400` com mensagem que diz o que apagar (a tela já mostra, ex.: formulário de Mapas).

| Item | Limite | O que pesou na escolha |
|---|---|---|
| Mapas | 10 por mesa | Disco: até 10MB cada (100MB por mesa, 300MB por dono). A lista de Mapas baixa cada imagem inteira. |
| Tokens | 100 por mapa (montaria conta) | Arrastar refaz o mapa a cada movimento: 80 tokens = 4,5 ms (p90), 160 = 4,9 ms, 320 = 9,8 ms com picos de 20 ms (passa do quadro de 16,7 ms). 100 deixa folga para máquina 2–3× mais lenta. |
| Agentes | 40 por mesa | A mesa baixa todas as fichas ao abrir: 40 com 15 entradas = 774 KB (0,6 s a 10 Mbps); 80 = 1,5 MB. |
| Entradas | 100 por ficha (os 4 tipos somados) | A ficha inteira vai para a mesa a cada clique: 100 entradas no tamanho máximo = 438 KB (+1 Vida em 102 ms local); 400 = 1,7 MB (208 ms local, +1,4 s a 10 Mbps). |
| NPCs | 200 por mesa | Só o mestre lista: 200 com bloco de 800 caracteres = 209 KB, 23 ms. |
| Montarias | 20 por mesa | Imagens de até 2MB que todos baixam na aba. |
| Pastas | 100 por mesa | Sem tela; só contra abuso. |

- **Sem furo por pedidos simultâneos:** contar e criar ficam numa transação com trava do Postgres por mesa/mapa/ficha (`criarNoLimite`) — 16 envios de mapa ao mesmo tempo → exatamente 10. O "3 mesas por dono" também furava assim; passou a usar a mesma trava.
- **Mapa e montaria conferem permissão e vaga antes do upload:** quem não pode, ou a mesa cheia, não chega a mandar o arquivo à memória do servidor. O upload de mapa também limita campos e partes, como o de montaria.
- Mesa que já passou de um limite (criada antes dele) fica como está; só não cria mais.
- **Índices por mesa** (migration `indices_por_mesa`): a contagem do limite não varre a tabela, e o histórico do chat com 200 mil mensagens no banco caiu de 386 ms para 20 ms (p90).
- **Nomes até 100 caracteres (12/11/2026):** mesa, agente (nome, origem, trilha), NPC, pasta, mapa e objeto no mapa — `nomeObrigatorio()` em `lib/limites.ts`, que também transforma tipo errado em `400` (antes, `nome: 123` dava `500`). Atributos do NPC até 4000. Sem teto, um nome de 100 KB iria para todos da mesa em cada lista e em cada token.
- Sem limite: mensagens do chat (só as 50 últimas aparecem) e participantes (os 6 dos requisitos são meta de carga, não trava). `Documento` não tem tela.

### Fichas
- Um usuário pode ter mais de uma ficha, inclusive na mesma sala.
- Criação livre — jogador escolhe tudo sem aprovação prévia do mestre.
- Jogador edita a própria ficha; mestre edita qualquer ficha da sala.
- Conflito simultâneo: last-write-wins, sem aviso na v1.
- Inventário: campo de texto livre (anotações soltas), editável na aba "Inventário".
- **Apagar agente (decisão de 21/10/2026):** quem pode editar pode apagar — o dono da ficha ou o mestre —, sempre com confirmação. Perícias e entradas vão em cascata e os tokens do agente saem dos mapas (o `onDelete: SetNull` do schema deixaria um token sem nome). `DELETE /fichas/:id` → `204`, emite `token:removido` (um por token) e `ficha:removida`. Botão "Apagar agente" no topo da ficha aberta, ao lado de "Agentes da mesa". Agente num combate em andamento segue na fila até o mestre encerrar.
- **Rituais, habilidades, poderes e equipamentos (decisão de 23/09/2026):** cada ficha cadastra os seus em `FichaEntrada` (não há catálogo). Campos: todos têm nome + descrição; **ritual** + círculo (1–4) + elemento (Sangue/Morte/Conhecimento/Energia/Medo/Varia) — as condições (execução, alcance, duração, resistência) vão na descrição; **poder** + pré-requisito (opcional); **equipamento** + categoria (0–IV) + espaços. Habilidade é só nome + descrição. O service rejeita campo de outro tipo (`400`) e o tipo não muda depois de criado. Apagar pede confirmação. Rotas: `POST /fichas/:id/entradas`, `PATCH`/`DELETE /fichas/:id/entradas/:entradaId` — todas devolvem `{ ficha }` e emitem `ficha:atualizada`.
- **Favoritos (decisão de 22/10/2026):** a estrela de cada entrada (`FichaEntrada.favorito`, qualquer tipo; `PATCH .../entradas/:entradaId { favorito }`) põe a entrada na aba **Favoritos**, a primeira das divisórias e na linha inteira, agrupada por tipo. Só entradas (rituais, habilidades, poderes, equipamentos) — perícias e habilidades da classe não, por escolha do Hederson. Marca quem pode editar a ficha; editar e apagar continuam na aba do tipo.
- **Armas na ficha (decisão de 05/11/2026, reabre "dano e crítico como campos" — munição continua fora):** equipamento pode ser arma (`FichaEntrada.tipoArma`: corpo a corpo, arremesso, disparo, fogo), com `dano` (dados da arma + bônus fixo, sem a Força), `danoExtra` (dados que não multiplicam no crítico), `bonusAtaque`, `margemAmeaca` (2–20, padrão 20) e `multiplicadorCritico` (2–10, padrão 2). São os valores **efetivos**: poderes e modificações que mudam margem, multiplicador ou bônus, o jogador ajusta na arma — o sistema não aplica poder sozinho. O tipo decide a perícia do ataque (corpo a corpo → Luta; arremesso, disparo e fogo → Pontaria) e se a Força soma no dano (corpo a corpo e arremesso — livro p. 54–55). O servidor calcula e manda `arma` em cada entrada (teste de ataque, dano, dano crítico, "19/x3"); o crítico multiplica só os dados do `dano` (1d8+3 ×2 = 2d8+3). Cartão da arma e aba Favoritos: três botões, ATAQUE / DANO / CRÍTICO; o bilhete da rolagem de arma aparece **embaixo dos três botões**, não no pé da ficha (lá ele cobria o Dano logo depois do Ataque), e rola só o painel o necessário para ficar inteiro à vista — perícia e atributo continuam com o bilhete no pé; o bilhete do ataque leva o carimbo "Ameaça de crítico" quando o d20 que valeu fica ≥ margem (o sistema não sabe se acertou — a mesa compara com a Defesa). Alcance e tipo de dano ficam na descrição. Rolagem de ritual, poder e habilidade não entrou.
- **O backend é o único que calcula valores derivados** (PV/PE/San máximos, bônus de perícias). O frontend nunca calcula — sempre confia no backend.

### NPCs / Tokens
- NPCs são blocos de estatística fixos — não passam pelo motor de cálculo.
- NPCs são reutilizáveis (um registro → múltiplos tokens em mapas diferentes).
- Token = Ficha, NPC, Montaria ou objeto genérico — no máximo um vínculo (CHECK `token_um_vinculo`, que em 22/10/2026 substituiu `token_ficha_xor_npc`).
- **Montarias (decisão de 22/10/2026):** biblioteca da mesa (aba **Montarias** do painel, para todos): carro, cavalo, skate — nome + imagem (PNG/JPEG/WebP pelos bytes, até 2MB). **Qualquer membro** salva, põe no mapa ("Pôr no mapa": ponto livre no centro da vista), move, muda o tamanho e tira do mapa; apagar da biblioteca é de quem salvou ou do mestre (leva os tokens e a imagem). O token de montaria fica **sempre por baixo** dos outros (desenhado antes, z 0) e não tem círculo nem nome no mapa: é a própria imagem, 2× o token comum vezes `Token.escala`. Tamanho como no Owlbear: selecionar mostra a alça no canto (arrastar = `token:escalar`, voláteis no caminho e o final grava, de 0,25 a 10); pelo teclado, −/+ no quadro do token selecionado. Módulo `modules/montaria`.
- **Deletar pasta nunca apaga conteúdo** — tudo sobe pra pasta-pai (ou raiz), numa transação. Mover pasta pra dentro de um descendente é rejeitado (ciclo).

### Tempo real
- Rolagem de dados: evento em tempo real, **não persiste** no banco — apenas o resultado mais recente em memória.
- **Turnos/iniciativa: DENTRO do escopo da v1.** (Decisão revisada em 22/09/2026 — o CLAUDE.md anterior dizia o contrário.)
  - O mestre inicia o combate informando um valor de iniciativa por participante — digitando, ou (fichas) com "Rolar iniciativa": o servidor rola a perícia Iniciativa de cada ficha marcada (`turno:rolarIniciativa`), cada rolagem vai pro chat e o valor preenche o campo, ainda editável. NPC segue manual (não tem perícias). *(01/10/2026)*
  - Participantes: fichas dos jogadores + NPCs que o mestre incluir.
  - A barra inferior mostra o jogador ativo e a fila; "Encerrar turno" avança.
  - Só o jogador ativo e o mestre podem encerrar o turno.
  - **Estado do combate é efêmero** — vive em memória do processo Node, sem tabela no banco. Se o servidor reiniciar, o estado se perde e a UI deve avisar claramente ("Sessão reiniciada — reinicie o combate").
- Reconexão automática (socket e vídeo) sem exigir reload manual; cliente reconectado pede o estado atual via `turno:estadoSolicitado`.

### Tempo real — como está implementado (Etapa 9)
- **Escrita continua pelo REST.** Ficha criada/alterada/perícia treinada: o service grava, e só então `emitirParaSala(salaId, 'ficha:atualizada', { ficha })` distribui. Nenhuma regra de validação duplicada no socket.
- **Eventos cliente → servidor** (todos com ack `{ ok, ...dados }` ou `{ ok: false, erro, status }`): `sala:entrar`, `turno:estadoSolicitado`, `chat:enviar`, `rolagem:rolar`, `rolagem:teste`, `turno:rolarIniciativa` (mestre), `turno:iniciar` (mestre), `turno:encerrar`, `turno:finalizar` (mestre). O ack só vale se for função (`tratar()` em `salaSocket.ts`); qualquer outra coisa no lugar é ignorada — antes, isso derrubava o processo inteiro.
- **Eventos servidor → sala:** `ficha:atualizada`, `ficha:removida`, `npc:atualizado` (só nome e foto, e só se o NPC tem token no mapa da mesa — 10/11/2026), `chat:mensagem`, `rolagem:resultado` (a do mestre só para mestres), `rolagem:aviso` (só jogadores), `turno:estado`.
- Socket autentica com o mesmo JWT (`auth.token` no handshake). Token recusado → cliente faz logout (o socket.io não tenta de novo nesse caso).
- **A conexão vence com o JWT (12/11/2026):** o servidor derruba o socket quando o `exp` chega (`io.ts`); o cliente, ao ser derrubado pelo servidor (`io server disconnect`), reconecta, o token vencido é recusado e a aba vai para o login. Antes, uma aba aberta seguia na mesa para sempre.
- **Teto de 60 eventos/s por conexão (12/11/2026, `io.ts`):** o excedente é descartado e recebe ack `{ ok: false, status: 429 }`. O uso mais intenso, arrastar token, manda ~30/s. O chat não tem teto próprio — quem floodar é banido pelo dono.
- **Cache de permissão de token** (`token:mover`) fica em `socket.data.permissaoToken` e é esvaziado ao trocar o papel (`esquecerPermissoes()` em `emissor.ts`) — antes, mestre rebaixado seguia movendo tudo até recarregar.
- **Chat persiste** (`Mensagem`, até 1000 caracteres; histórico via `GET /salas/:id/mensagens`, últimas 50). **Rolagem não persiste**: o servidor rola (crypto, ninguém escolhe o resultado) e guarda só a última por sala em memória. Modos: soma, maior (teste de OP1) e menor (OP1 com atributo 0).
- **Rolagem do mestre em segredo (decisão de 22/10/2026):** o que um mestre rola (painel ou ficha) vai só para os sockets dos mestres da mesa (`publicarRolagem` consulta os mestres a cada rolagem) e chega com `secreta: true` — o bilhete mostra o carimbo "Segredo". Não vira a "última rolagem" da sala (quem entra não a recebe). Com o aviso ligado ("Avisar os jogadores quando eu rolar", no painel Rolagem; preferência deste navegador, guardada no `SalaSocketProvider` para a ficha e o painel lerem o mesmo valor), os jogadores recebem `rolagem:aviso { frase }` — sem resultado. As frases (`FRASES_ROLAGEM_SECRETA` em `salaSocket.ts`) são do Hederson: só ele acrescenta (licença: nada de texto gerado por IA). Rolagens dos jogadores continuam abertas para todos, e a Iniciativa que o mestre rola para as fichas também (`aberta`).
- **Rolagem de arma (05/11/2026):** `rolagem:teste { fichaId, tipo: 'ataque'|'dano'|'critico', entradaId }` — mesma regra do teste de perícia: o cliente diz só qual arma e qual botão, tudo sai do banco; o ataque traz `ameacaCritico: true` quando o d20 que valeu atinge a margem.
- **Rolagens a partir da ficha e de dano (01/10/2026):** `rolagem:teste { fichaId, tipo: 'pericia'|'atributo', nome }` — o cliente diz só QUAL teste; dados e bônus saem da ficha no banco (`pedidoDeTeste()` no motor, função pura), ninguém infla o próprio bônus. Rola quem pode editar a ficha (dono ou mestre — `403` pro resto). Atributo puro = (atributo)d20, fica com o melhor, sem bônus (0 → 2d20, pior). `rolagem:rolar { expressao }` aceita dano livre (`rolarExpressao()`: "2d6+1d8+3", até 10 termos/50 dados, mesmas faces). Toda rolagem traz `detalhe` (dados formatados no servidor) e, quando vem da ficha, `rotulo` ("Fortitude · Helena Duarte"). Na ficha, o teste da perícia e os atributos do círculo são os botões de rolar; o bilhete do resultado aparece também no pé da ficha (o chat pode estar escondido atrás dela).
- **Bilhete compacto (22/10/2026):** a rolagem da ficha traz também `teste` (`sigla`, `atributo`, `ficha`, `d20`, `bonus`) e o bilhete mostra "INV (INT) · Franco" ⬡3 +5 — o ⬡ é o d20 com a quantidade de dados, e atributo 0 vira ⬡-1 (rola dois e fica com o pior). O nome por extenso fica no título e no leitor de tela. Siglas de 3 letras no catálogo (`engine/pericias.ts`), nenhuma igual à de um atributo (Fortitude é FRT, não FOR). Rolagem livre continua com "fulano rolou 2d6+3".
- `turno:encerrar` manda `indiceAtivo`/`rodada` esperados: clique duplo simultâneo (jogador + mestre) não pula turno — o segundo recebe `409`.
- **Detecção de reinício:** cada processo gera um `INSTANCIA_SERVIDOR`. Se o cliente tinha combate e, ao reconectar, a instância mudou e não há combate → aviso "Sessão reiniciada — reinicie o combate." e o estado local é limpo.
- Heartbeat do socket: `pingInterval` 10s + `pingTimeout` 5s; backoff de reconexão do cliente máx. 5s → queda detectada e recuperada bem dentro dos 30s.
- **Etapa 10 acrescentou:** `token:mover` (cliente → servidor; posições intermediárias voláteis, só a final grava no banco; permissão cacheada por conexão) → `token:movido` (pra sala, exceto quem arrastou); `mapa:ativo`, `token:criado`, `token:removido` (vindos do REST); `token:escalar` → `token:escalado` (tamanho da montaria, mesmo esquema do mover — 22/10/2026) e `montaria:criada`/`montaria:removida` (do REST); presença de vídeo `video:entrar`/`video:sair`/`video:pedirReconexao` → `video:participantes`/`video:reconexaoPedida`.

### Mapa, tokens e vídeo — como está implementado (Etapa 10)
- **Mapa ativo por sala** (`Sala.mapaAtivoId`, persistido). Lista de mapas é só do mestre (material de preparo, pode ter spoiler); jogador só vê o ativo.
- **Tokens:** só o mestre cria/remove; mestre move qualquer um, jogador só o da própria ficha (servidor valida, `403`). Posição em pixels da imagem original (zoom/pan não afetam o que vai pro servidor). Payload do token: da ficha, nome + PV + foto; do NPC, só nome/foto. Só o círculo é clicável (nome/barra não encolhem com zoom e cobririam vizinhos). Token novo nasce no centro da tela, desviado se já houver outro ali.
- Upload e as armadilhas do PeerJS no servidor: `backend/CLAUDE.md`. Zoom/pan, vídeo e câmera no cliente: `frontend/CLAUDE.md`.

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

## Autorização

- Jogador: altera apenas própria ficha (`usuario_id == ficha.usuario_id`).
- Mestre: altera qualquer ficha da sala (checar papel em `MembroSala`).
- **Toda rota de escrita** (`POST`, `PATCH`, `DELETE`) valida propriedade ou papel de mestre. Estar autenticado não basta.
- **Avatar só pelo envio (decisão de 10/10/2026, revista em 10/11/2026 com o upload — RNF10):** a foto de ficha e de NPC só entra por `PUT /fichas/:id/avatar` (dono ou mestre) e `PUT /npcs/:id/avatar` (mestre) — PNG/JPEG/WebP pelos bytes, até 2MB, permissão conferida antes do arquivo chegar à memória; `DELETE` na mesma rota tira. Criação e PATCH **ignoram** `avatarUrl`. Por quê: (1) URL externa num `<img>` faz o navegador de cada pessoa da mesa entregar o IP a terceiros (era o motivo de 10/10); (2) cada avatar é um arquivo só daquele registro, então trocar, tirar ou apagar a ficha/NPC/mesa apaga o antigo do disco — se o PATCH aceitasse uma URL de `/uploads`, um jogador apontaria para a imagem do mapa e a apagaria ao tirar a foto. O front sempre monta o avatar com `BASE_URL`; a peça é `ui/FotoColada.tsx` (clicar na foto troca, × tira com confirmação).
- **Senha e JWT (decisão de 10/10/2026):** senha de 8 a 72 bytes no cadastro (o bcrypt ignora o que passa de 72 — antes, "a"×72 + qualquer final entrava na mesma conta); contas antigas seguem entrando. Senha de tipo errado → `400`/`401`, nunca `500`. O JWT só é aceito em HS256, e o servidor **não sobe** com `JWT_SECRET` de menos de 32 caracteres (ver `.env.example`). `X-Powered-By` desligado.
- **Login com tempo igual (12/11/2026):** email inexistente também roda o bcrypt (contra um hash falso), senão a resposta mais rápida entregava quem tem conta. O cadastro ainda diz "Email já cadastrado" — esconder isso exigiria confirmação por email, fora da v1.
- **Postgres só em `127.0.0.1` (12/11/2026):** a senha do `docker-compose.yml` é pública (está no repositório), então a porta não escuta na rede. Em produção, senha própria.
- **Checklist da senha (decisão de 21/10/2026):** além dos 8 a 72 bytes, uma maiúscula, uma minúscula, um número e um símbolo (`faltasNaSenha()` em `usuario.service.ts`, que é quem barra; o `400` diz o que falta). O cadastro mostra o checklist ao vivo (✓/✗, o que faltar fica em vermelho depois de tentar enviar) e tem "Mostrar". O Hederson escolheu o checklist clássico no lugar da linha NIST/OWASP (só tamanho + bloquear senhas comuns) — não trocar sem pedir. Vale só para senha nova.
- **NPC e Pasta são ferramentas do mestre**: leitura e escrita exigem papel `MESTRE` (NPC não tem dono, então "propriedade" não se aplica). Jogador → 403. Quando tokens de NPC aparecerem no mapa (Etapa 10), o que o jogador enxerga do NPC é decisão daquela etapa.

---

## Estrutura de pastas

```
rpg-online/
├── backend/     ← API REST, socket, motor de cálculo — árvore em backend/CLAUDE.md
├── frontend/    ← React — árvore em frontend/CLAUDE.md
├── docs/        ← REQUISITOS.md, ETAPAS.md
├── PRODUCT.md   ← contexto do produto e resumo da licença
├── DESIGN.md    ← sistema visual
└── CLAUDE.md
```

---

## Os dois sistemas

| | Ordem Paranormal RPG (v1.3) | Ordem Paranormal RPG II (Playtest Alpha, Ago/2026) |
|---|---|---|
| Progressão | NEX% (20 tiers: 5,10,...,95,99) + classe (Combatente/Especialista/Ocultista) | Nível 1-10 + Perfil (Executor/Analista/Vigilante) + Ocupação (texto livre) |
| Atributos | 5, numéricos 0-5 (For/Agi/Int/Vig/Pre) | 3, em dado de step (Físico/Mente/Emoção, d4-d12) |
| Teste | Rola N d20 (N = valor do atributo), pega o melhor; 0 rola 2d20 e pega o pior | Rola 1 dado do atributo + 1 da perícia, soma os dois |
| Perícias | 28 fixas, grau Destreinado/Treinado/Veterano/Expert (bônus 0/+5/+10/+15); teste = (atributo)d20 + bônus | 20 fixas, cada uma no próprio dado de step d4-d12 |
| PV/PE/San | **Fórmula real, calculada** (`ClasseFormula` + atributo) — ver "Motor de cálculo" em `backend/CLAUDE.md` | **Sem fórmula publicada** — PV/PD atribuídos direto na ficha (fichas pré-prontas no playtest) |
| Tabela no schema | `Ficha`, `FichaPericia`, `FichaEntrada`, `ProgressaoClasse`, `ClasseFormula` | `FichaOP2` (perícias em Json, sem join table — catálogo em `engine/op2/catalogo.ts`) |

`Sala.sistema` decide qual conjunto de tabelas vale pra aquela sala. Não existe conversão entre sistemas — trocar o sistema de uma sala em andamento não está no escopo (não foi pedido e não há regra de conversão de ficha entre os dois jogos).

---

## Licença da Comunidade e identidade oficial

- **Licença da Comunidade de Ordem Paranormal (v1.0, 28/06/2026)** rege o produto — resumo e exigências em `PRODUCT.md` → Brand Commitments. Em código: nunca usar arte/texto oficial nem nomes próprios do cânone (inclusive em seeds, testes e screenshots); o aviso literal + selo aparecem na landing (selo oficial do kit em `frontend/public/licenca/`, versão branca a 10% da largura da capa e 100% de opacidade; o original de 1942px fica guardado ao lado da cópia de 480px usada no site).
- **Nada da identidade oficial de Ordem Paranormal** (sigilos, símbolos, arte) — é ferramenta de fã.
- Sistema visual "Dossiê de caso" (pastas, carimbo, tipografia) e layout da mesa: `frontend/CLAUDE.md`; tokens em `DESIGN.md`.

---

## Fora do escopo da v1

- Histórico de rolagens persistido
- Redis / estado distribuído
- Regras mecânicas de itens além das armas: munição, alcance e tipo de dano como campos (ficam na descrição); aplicar poder sozinho; conferir acerto contra a Defesa; descontar Vida do alvo. *(Dano e crítico de arma entraram em 05/11/2026 — ver "Armas na ficha".)*
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
| 2 | Modelagem no Prisma + migration + seeds | ✅ Concluída (18 entidades, multissistema; seed de `ClasseFormula`, 28 `Pericia` e 60 `ProgressaoClasse`) |
| 3 | Autenticação (JWT, convite com expiração) | ✅ Concluída |
| 4 | CRUD de Sala e Membros | ✅ Concluída |
| 5 | Motor de cálculo isolado + testes | ✅ Concluída (só OP1 — OP2 não tem fórmula publicada, ver "Os dois sistemas") |
| 6 | CRUD de Ficha (sem tempo real) | 🔄 OP1 pronto — falta conferir contra o C.R.I.S. (sem acesso); FichaOP2 sem CRUD ainda |
| 7 | CRUD de NPC e Pastas | ✅ Concluída |
| 8 | Frontend consumindo REST | ✅ Concluída (UI de ficha só OP1) |
| 9 | Tempo real (Socket.IO) + turno + reconexão | ✅ Concluída |
| 10 | Mapa, tokens e webcam | 🔄 6 de 7 — falta vídeo entre redes diferentes (exige TURN em produção + 2 dispositivos) |
| 11 | Polimento e documentação formal | 🔄 5 de 6 + textos da landing — falta vídeo no Firefox, Safari e auditoria de acessibilidade (RNF05/17) |

Critérios das etapas já fechadas (1–5, 7–9): `docs/ETAPAS.md`. Quando uma etapa fechar, a seção dela vai para lá.

### Etapa 6 — Ficha (só OP1 — ver nota sobre FichaOP2 abaixo)
- [x] `POST /salas/:id/fichas` retorna PV/PE/San máximos **já calculados**
- [x] `PATCH /fichas/:id` alterando NEX recalcula os máximos na resposta
- [x] Jogador A editando ficha do Jogador B → **403**; mestre → **200**
- [x] Treinar perícia grava em `FichaPericia` e o bônus aparece no `GET` (upsert testado via `POST /fichas/:id/pericias`)
- [x] `pv_atual > pv_maximo` é rejeitado pelo servidor (`pe_atual`/`san_atual` também, mesma regra) — **regra revista em 30/09/2026:** Vida e Sanidade passaram a aceitar acima do máximo (até 999); só Esforço segue limitado ao máximo
- [ ] Uma ficha completa criada pela API bate com a mesma montada no C.R.I.S. — **não verificado**: não tenho acesso ao C.R.I.S. pra comparar ao vivo. A fórmula em si já foi conferida contra o livro (Etapa 5); esse item é especificamente sobre bater com a ferramenta C.R.I.S., que fica pendente de alguém rodar manualmente.

> **FichaOP2 ainda não tem CRUD** — só o schema existe (Etapa "multissistema"). Como OP2 não tem motor de cálculo (fichas pré-prontas, sem fórmula), o CRUD dela seria mais simples (sem cálculo, só atribuição direta de pv/pd) mas não foi pedido nesta etapa — Etapa 6 como documentada é só OP1.

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
> Verificado em 29/09/2026 contra o **build de produção** (`vite preview`), com 6 contas numa mesma mesa (Edge headless, `playwright-core` + `socket.io-client` em diretório temporário fora do repo). Números completos em `docs/REQUISITOS.md` §3.
- [x] Documento de requisitos formal com os requisitos classificados — `docs/REQUISITOS.md` (RF/RN/RNF/RS, prioridade E/I/D, status e onde foi verificado)
- [x] README por módulo do backend — `backend/src/modules/*/README.md` (rotas com quem pode, regras, dependências, testes)
- [x] **Todas** as ações destrutivas com confirmação — inventário rotas DELETE × telas: apagar entrada da ficha, remover token, remover mapa, apagar NPC, expulsar, banir, encerrar combate e **apagar mesa** (faltava tela; criada na aba Membros, avisa quem está na mesa e apaga as imagens dos mapas do disco). Apagar pasta não tem tela (Biblioteca fora da v1); apagar ficha ganhou rota e tela ("Apagar agente", com confirmação) em 21/10/2026
- [x] 6 conexões WebSocket simultâneas numa sala sem degradação — 6/6 conectadas; chat p95 16 ms, rolagem p95 3 ms, token p95 9 ms (100 amostras cada)
- [x] Fluxo principal (login → sala → ficha → combate → mapa) **sem erro no console** — pela interface, no build de produção: login, criar mesa, criar ficha, ajustar Vida, enviar mapa e mostrar, iniciar combate, encerrar turno, chat — zero erros
- [ ] Tabela de requisitos não funcionais percorrida item a item — percorrida (RNF01–RNF18 em `docs/REQUISITOS.md`); **não fecha** porque RNF05 (Firefox testado em 04/11/2026 sem o vídeo — nesta máquina o Firefox não reúne candidatos ICE nem numa página em branco; Safari não testado), e RNF17 (sem auditoria com leitor de tela) seguem abertos
- [ ] **Hederson reescreve os textos da landing** (`frontend/src/pages/Apresentacao/Apresentacao.tsx`: título, etapas, "Por que existe", "Para quem", fechamento) com as próprias palavras — a primeira versão foi escrita por IA e a Licença da Comunidade proíbe material gerado por IA em conteúdo comercial. Adiado a pedido dele em 29/09/2026; **lembrar antes de qualquer lançamento.**

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

## Como o Hederson trabalha

- Quer entender o **porquê** antes (ou junto) de executar — explicação precede o comando.
- Instruções precisas e sem ambiguidade; ele pega ambiguidade antes de agir.
- Toda decisão nova relevante volta para o CLAUDE.md certo (este, se vale para o projeto todo; o de `backend/` ou `frontend/`, se só vale ali) e para o handoff no Project.
- **Nunca marque uma etapa como concluída sem rodar os critérios.** Ele vai perguntar "como você sabe que terminou?" — tenha a resposta verificável.
