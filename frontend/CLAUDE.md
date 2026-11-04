# Frontend — RPG Online

Complementa o `CLAUDE.md` da raiz, que continua valendo aqui (regras de negócio, autorização, eventos de tempo real, pipeline). Este arquivo tem o que só vale dentro de `frontend/`. Tokens visuais: `DESIGN.md`, na raiz.

---

## Stack — notas do frontend

**Frontend é mobile-first** nas telas de login/cadastro/lista de salas.
**A tela de mesa é desktop-first** (mínimo 1280px) — mapa + vídeo + ficha não cabem bem em 375px.
**Tailwind v4** usa `@tailwindcss/vite` e `@import "tailwindcss"` no CSS, não PostCSS legado.
**Roteamento do frontend: `react-router`** (adicionado na Etapa 8 — o stack não definia router; URLs reais tipo `/salas/:id` e `/convite/:token` precisam de um). Sem outras libs de UI/estado/requisição: `fetch` num wrapper próprio (`services/api.ts`).
**Frontend usa TypeScript 6** (não 7 como o backend) — é o que o template trouxe e o que o `typescript-eslint` do front suporta. `tsconfig` tem `verbatimModuleSyntax` (tipos só via `import type`) e `erasableSyntaxOnly` (sem enum, sem parameter properties).

---

## Identidade visual — "Dossiê de caso" (28/09/2026)

Escolhida via `/impeccable shape` para tirar o frontend do visual genérico (zinc + violeta). Contexto do produto em `PRODUCT.md`; sistema visual em `DESIGN.md` (fonte da verdade dos tokens, em `@theme` no `index.css`).
- Cada mesa é um caso num arquivo escuro: pastas kraft com aba (sistema), etiqueta com o nome, data datilografada, **carimbo** com o papel. Folhas de papel para formulários.
- Vermelho de carimbo **só para estado** (papel, erro, acesso negado) — nunca ação. Courier Prime só para valor digitado e data; Archivo condensado para títulos, rótulos e botões.
- **A landing não cita outros produtos pelo nome** (decisão de 29/09/2026): descrever por função — "chamada de voz", "site de rolar dados", "mapa interativo".
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

- **Barras laterais = pasta de folhas (29/09/2026, `ui/PastaDeFolhas.tsx`):** uma pasta vetorial em pé; cada item é uma folha que desliza para fora no hover/foco mostrando nome + ícone. À esquerda, só para o mestre: **Mesa / Mapas**. À direita, com o painel recolhido: **Ficha / Chat / Montarias / NPCs / Membros** (NPCs só para o mestre, Membros só para o dono). Aberto, as abas têm ícone + nome; com 4 ou 5 abas o nome não cabe todo em 380px, então, abaixo do limite de cada quantidade, a ativa fica escrita e as outras só com o ícone (container query; limites medidos, ver `ROTULO_POR_QUANTIDADE` em `Sala.tsx`). Biblioteca e Notas **saíram** até ganharem tela. (Fichas já tinha saído em 23/09/2026.)
- **Régua inferior (29/09/2026):** vídeo (fotos com borda de papel) e turno numa faixa só embaixo do mapa, liberando o topo para o mapa.
- **Layout ajustável (30/09/2026):** alça na borda do painel direito (320–560px, padrão 380; limitada para o centro nunca ficar abaixo de 828px — em 1280px, no máximo 380) e no topo da régua (96–300px; fotos crescem em 16:9). A régua recolhe numa faixa que mostra de quem é a vez; recolhida, só sai da vista (desmontar cortaria o áudio). Tamanhos e estados ficam no `localStorage` (`hooks/usePreferencia.ts`). Na régua o turno tem prioridade de largura sobre as fotos. **Câmera/microfone ficam no cabeçalho** — na régua, em 1280px e em combate, não sobrava espaço para uma foto.
- **Armadilha resolvida (21/10/2026) — a mesa deslizava:** um elemento `absolute` (ex.: rótulo `sr-only`) dentro de uma área rolável que não é `relative` se ancora fora dela, escapa do corte e vira sobra de rolagem na mesa — a rodinha no fim da ficha arrastava a mesa inteira para cima (506px nas Perícias), e com o painel recolhido as folhas da pasta davam 136px de sobra lateral. O bloco da mesa (`Sala.tsx`) é `relative overflow-clip`: nada lá dentro cria rolagem, e `clip` (não `hidden`) nem vira área rolável por foco/`scrollIntoView`.
- **Faixa de vídeo:** feeds horizontais com nome, indicador de áudio e badge "Mestre". Sem câmera → placeholder com inicial.
- **Mapa:** toolbar vertical à esquerda (cursor e pan na v1; lápis/linha/texto/régua/grade são v2). Zoom +/− e tela cheia no canto inferior esquerdo. O seletor "Piso 1" **foi removido** (multi-piso é v2; placeholder desabilitado não fica na interface).
- **NPCs (29/09/2026):** aba/folha do painel direito, só do mestre (`components/Npc/PainelNpcs.tsx`): listar, criar, editar, apagar (com confirmação), campos por sistema (PV/PE/SAN em OP1, PV/PD em OP2) + atributos em texto livre. Usa a API da Etapa 7.
- **Painel direito é recolhível (decisão de 23/09/2026):** botão `>` recolhe pra uma faixa de 48px com atalhos Ficha/Chat; aberto/recolhido fica no `localStorage` do navegador. A aba Ficha do painel mostra a lista "Agentes da mesa" (cards à la C.R.I.S. `/agentes`: nome, classe·NEX, jogador, data, "Acessar ficha"). A lista é **só da sala** — não existe "meus agentes" global (a ficha continua pertencendo à sala). Ao entrar na mesa, abre direto na ficha do próprio usuário, se houver.
- **Painel direito (ficha):** a ficha é uma folha de papel: foto colada + nome + origem/classe/trilha, NEX (select datilografado + barra em tinta), **círculo de atributos na disposição da ficha oficial** (`PentagonoAtributos.tsx`: AGI no topo, INT/VIG/PRE/FOR em sentido horário, disco "ATRIBUTOS" no centro — só a disposição; o traço é **desenho próprio em tinta**, nunca a arte da Jambô), linhas de **Vida / Sanidade / Esforço** com tintas próprias (carmim / azul-tinteiro / ocre) e −/+, seções como **divisórias de fichário 3×2** (Perícias / Rituais / Habilidades / Poderes / Equipamentos / Inventário, com setas do teclado), com **Favoritos** em cima, na linha inteira. Perícias: busca + filtro Todas/Treinadas, teste "3d20+5" vindo do backend, destreinadas discretas e treinadas em destaque. Rituais: marca de cor do elemento + nome (a borda lateral colorida saiu — é padrão proibido).
- **Barra de turno:** jogador ativo + iniciativa à esquerda, fila de próximos no centro, botão primário "Encerrar turno", botão "Rolagem" à direita. Sem combate ativo → barra recolhida.

> O `preview.webp` mostra atributos de D&D (FOR/DES/CON/INT/SAB/CAR, CA, Descanso Curto/Longo). **A estrutura é a referência, o conteúdo não.** Mapear sempre para Ordem Paranormal.

---

## Mapa e vídeo no cliente (Etapa 10)

- **Zoom/pan:** Pointer Events (mouse, toque e caneta com o mesmo código): 1 ponteiro arrasta, 2 fazem pinça; roda do mouse com zoom no cursor (listener nativo não-passivo).
- **Vídeo (PeerJS, malha P2P, até 6 pessoas):** sinalização no **próprio backend** (`/peerjs`, não o servidor público do PeerJS). Cada par tem **uma** chamada, criada uma vez pelo `peerId` menor, com ou sem câmera. Sem câmera = trilhas vazias (vídeo preto 2×2 + áudio mudo); ligar/desligar câmera só troca a trilha (`replaceTrack`) — sem fechar/refazer conexão (o modelo anterior, que refazia a chamada a cada troca de câmera, tinha corridas: 4–8/10 em estresse; o atual, 30/30). Sucesso = ICE conectado (não o evento `stream`, que chega antes). Queda: quem liga tenta 3× com espera crescente, depois botão; quem atende espera 20s e oferece botão (que pede a religação pelo socket). Se a sinalização precisar ser recriada, a aba volta com **id novo** (o servidor PeerJS segura o id antigo por um tempo — "ID is taken") e os outros reconectam sozinhos.
- **Câmera é opt-in** ("Entrar com câmera"). Recusa/ausência → aviso e modo texto+mapa. Autoplay com som bloqueado → cai pro mudo com botão "Ativar som" (só em `NotAllowedError`).
- **Gancho de dev:** `window.__rpgVideo` (`derrubar`, `restaurar`, `diagnostico`) existe só em `import.meta.env.DEV` — some do build de produção.

---

## Estrutura de pastas

```
frontend/
└── src/
    ├── pages/
    │   ├── Login/          ← + LayoutAuth (compartilhado com Cadastro)
    │   ├── Cadastro/
    │   ├── ListaSalas/
    │   ├── Sala/           ← mesa + BotaoConvite
    │   └── Convite/        ← /convite/:token (link de convite)
    ├── components/
    │   ├── FichaOrdemParanormal/
    │   ├── MapaToken/      ← AreaMapa, useViewport (zoom/pan), TokenNoMapa, AdicionarToken, GerenciarMapas
    │   ├── Montaria/       ← PainelMontarias (aba Montarias)
    │   ├── Video/          ← FaixaVideo
    │   ├── Biblioteca/
    │   ├── Chat/
    │   ├── TurnoTracker/
    │   ├── ui/             ← Feedback (Spinner/Carregando/Alerta), Icone, estilos
    │   ├── Rotas.tsx       ← RotaProtegida / RotaPublica
    │   └── ErrorBoundary.tsx
    ├── hooks/
    │   ├── SalaSocketProvider.tsx / salaSocketContext.ts ← conexão da mesa, reconexão, aviso de reinício
    │   ├── useSocket.ts    ← useSalaSocket, useEventoSocket, useAoResincronizar
    │   ├── AuthProvider.tsx / authContext.ts / useAuth.ts
    │   ├── useRecurso.ts   ← GET com estados carregando/erro/ok
    │   ├── useAtrasado.ts  ← spinner só depois de 300ms
    │   └── useVideoChamada.ts ← câmera/microfone + liga a MalhaVideo ao socket
    └── services/
        ├── api.ts          ← fetch + token + erro de conexão legível (JSON e FormData)
        ├── malhaVideo.ts   ← WebRTC/PeerJS em classe pura (fora do React)
        └── tipos.ts
```
