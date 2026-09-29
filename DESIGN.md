---
name: RPG Online
description: Mesa de RPG online para Ordem Paranormal; telas de entrada, casca da mesa e apresentação no mundo "Dossiê de caso".
colors:
  arquivo-950: "#0e0f10"
  arquivo-900: "#16181a"
  arquivo-850: "#1c1f22"
  arquivo-800: "#24282c"
  arquivo-700: "#33383d"
  arquivo-600: "#4a5057"
  grafite-100: "#ece7dc"
  grafite-300: "#bdb6a7"
  grafite-400: "#9a9385"
  kraft-300: "#e0c697"
  kraft-400: "#d4b27d"
  kraft-500: "#c9a36b"
  kraft-600: "#a98650"
  kraft-700: "#7c6035"
  papel-50: "#f5f1e8"
  papel-100: "#e8e2d4"
  papel-200: "#d8cfbb"
  papel-300: "#bfb398"
  tinta-900: "#1b1915"
  tinta-700: "#3a362f"
  tinta-600: "#4f4a41"
  carimbo-900: "#6e1a15"
  carimbo-800: "#86201a"
  carimbo-600: "#c2352b"
  carimbo-300: "#ec8a80"
  carimbo-100: "#f6dcd6"
  sinal-vivo: "#6fae7c"
typography:
  display-capa:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "6rem"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 72"
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 72"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 72"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
    fontVariation: "'wdth' 72"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.12em"
    fontVariation: "'wdth' 72"
  datilo:
    fontFamily: "Courier Prime, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  campo: "0px"
  etiqueta: "2px"
  carimbo: "3px"
  folha: "4px"
  pasta: "5px"
spacing:
  pasta-interno: "16px"
  folha-interno: "20px"
  folha-interno-sm: "24px"
  campo: "8px"
  secao: "48px"
  trilho-lateral: "72px"
  painel-direito: "380px"
components:
  button-tinta:
    backgroundColor: "{colors.tinta-900}"
    textColor: "{colors.papel-50}"
    typography: "{typography.label}"
    rounded: "{rounded.folha}"
    padding: "0 20px"
    height: "44px"
  button-tinta-hover:
    backgroundColor: "{colors.tinta-700}"
  button-contorno:
    textColor: "{colors.tinta-900}"
    typography: "{typography.label}"
    rounded: "{rounded.folha}"
    padding: "0 20px"
    height: "44px"
  button-kraft:
    backgroundColor: "{colors.kraft-400}"
    textColor: "{colors.tinta-900}"
    typography: "{typography.label}"
    rounded: "{rounded.folha}"
    padding: "0 16px"
    height: "40px"
  button-kraft-hover:
    backgroundColor: "{colors.kraft-300}"
  button-arquivo:
    textColor: "{colors.grafite-100}"
    typography: "{typography.label}"
    rounded: "{rounded.folha}"
    padding: "0 12px"
    height: "40px"
  button-arquivo-hover:
    textColor: "{colors.kraft-300}"
  button-icone-arquivo:
    textColor: "{colors.grafite-100}"
    rounded: "{rounded.folha}"
    size: "40px"
  aba-pasta:
    textColor: "{colors.grafite-300}"
    typography: "{typography.label}"
    padding: "0 16px"
    height: "36px"
  aba-pasta-ativa:
    backgroundColor: "{colors.kraft-500}"
    textColor: "{colors.tinta-900}"
    typography: "{typography.label}"
    padding: "0 16px"
    height: "36px"
  campo-folha:
    backgroundColor: "{colors.papel-50}"
    textColor: "{colors.tinta-900}"
    typography: "{typography.datilo}"
    rounded: "{rounded.campo}"
    padding: "8px"
  folha:
    backgroundColor: "{colors.papel-100}"
    textColor: "{colors.tinta-900}"
    rounded: "{rounded.folha}"
    padding: "20px"
  pasta:
    backgroundColor: "{colors.kraft-500}"
    textColor: "{colors.tinta-900}"
    rounded: "{rounded.pasta}"
    padding: "16px"
  etiqueta-pasta:
    backgroundColor: "{colors.papel-50}"
    textColor: "{colors.tinta-900}"
    typography: "{typography.title}"
    rounded: "{rounded.etiqueta}"
    padding: "10px 12px"
  folha-de-pasta:
    backgroundColor: "{colors.papel-200}"
    textColor: "{colors.tinta-900}"
    typography: "{typography.label}"
    rounded: "{rounded.carimbo}"
    padding: "0 12px"
    height: "48px"
    width: "208px"
  folha-de-pasta-ativa:
    backgroundColor: "{colors.papel-50}"
  carimbo:
    textColor: "{colors.carimbo-900}"
    typography: "{typography.label}"
    rounded: "{rounded.carimbo}"
    padding: "2px 8px"
  carimbo-escuro:
    textColor: "{colors.carimbo-300}"
    typography: "{typography.label}"
    rounded: "{rounded.carimbo}"
    padding: "2px 8px"
  etiqueta-turno:
    backgroundColor: "{colors.papel-50}"
    textColor: "{colors.tinta-900}"
    rounded: "{rounded.etiqueta}"
    padding: "6px 12px"
  foto-participante:
    backgroundColor: "{colors.arquivo-800}"
    textColor: "{colors.grafite-100}"
    rounded: "{rounded.etiqueta}"
    width: "128px"
    height: "72px"
  tag-mestre:
    backgroundColor: "{colors.kraft-500}"
    textColor: "{colors.tinta-900}"
    typography: "{typography.label}"
    padding: "0 6px"
  placa-gaveta:
    backgroundColor: "{colors.papel-100}"
    textColor: "{colors.tinta-900}"
    typography: "{typography.label}"
    rounded: "{rounded.etiqueta}"
    padding: "2px 10px"
---

# Design System: RPG Online

> **Escopo atual.** O mundo "Dossiê de caso" vale em três frentes: (1) as **telas de entrada** — login, cadastro, lista de mesas, convite, 404 e a checagem de sessão (`RotaProtegida`/`RotaPublica`); (2) a **casca da mesa** em `/salas/:id` — header, régua inferior (fotos de vídeo + turno), trilho esquerdo do mestre e moldura do painel direito com abas de pasta, modal de iniciar combate, folha de rolagem, folha do convite e o diálogo de confirmação; (3) a **apresentação pública** (`/` para visitantes, `/sobre`). **Ainda não migrou** e continua no visual antigo zinc/violeta (`ui/estilos.ts`), que **não** é o sistema e não deve ser copiado: o conteúdo da ficha dentro do painel (`components/FichaOrdemParanormal`), a área do mapa e sua toolbar (`components/MapaToken`, incluindo `GerenciarMapas`) e o chat (`components/Chat`). O `body` global continua em zinc; cada tela do mundo se envolve em `.mundo-arquivo`.

## Overview

**Creative North Star: "Dossiê de caso"**

Cada mesa é um caso aberto num arquivo de investigação. A interface é um móvel de arquivo escuro, quase preto, onde as mesas são pastas kraft suspensas, com aba de classificação e etiqueta de papel; o que se preenche fica numa folha de papel por cima. A ação é tinta; o estado é carimbo. O mundo recusa o painel de SaaS (grade de cards cinza com botão colorido): nada aqui é "tile", tudo é um objeto de papelaria com material, fibra e peso.

Na mesa, o móvel continua: o header é a borda da gaveta com o nome da mesa numa etiqueta de papel; a régua inferior junta as fotos impressas dos participantes e a etiqueta de quem tem a vez; as laterais são pastas em pé das quais as folhas deslizam; modais e popovers são folhas de papel postas sobre o arquivo. Na apresentação, a prova é a própria mesa: capturas reais montadas em folhas como recortes de dossiê, cada uma com o carimbo da etapa.

A densidade é baixa e a hierarquia é tipográfica: títulos grandes em Archivo condensado e caixa alta, etiquetas espaçadas, e o que é registro (valores digitados, datas, iniciativa) sai datilografado em Courier Prime. O material aparece por uma fibra de ruído muito fraca no papel e no kraft e por sombras difusas sob as peças, nunca por brilho ou vidro. É uma ferramenta de fã sem vínculo oficial: o mundo evoca o arquivo de investigação sem nenhum sigilo, símbolo, logo ou arte da Ordem Paranormal oficial.

**Key Characteristics:**
- Fundo de arquivo escuro, pastas kraft, folhas de papel, tinta quase preta e vermelho de carimbo.
- Archivo com eixo de largura: condensado (72%) em títulos, rótulos, botões e abas.
- Courier Prime só no que é datilografado: valores digitados, datas e números de registro.
- Vermelho de carimbo só para estado e classificação, nunca para ação.
- Ação principal: tinta chapada numa folha, kraft chapado sobre o arquivo escuro.
- Movimento de papelaria: a pasta sobe da gaveta e a folha desliza da pasta, os dois desligados com `prefers-reduced-motion`.

## Colors

Uma paleta de papelaria sobre metal escuro: neutros quentes de papel e kraft, uma tinta quase preta que faz o papel da cor primária, um único vermelho reservado para estado e uma só luz verde de equipamento.

### Primary
- **Tinta de Escritório** (tinta-900): a cor da ação numa folha. Preenchimento do botão principal, contorno do secundário, texto sobre papel e kraft, linha de preenchimento focada, cursor de texto, seta do select, marca do checkbox. Tons de apoio: **Tinta Gasta** (tinta-700) no hover do botão, em rótulos e textos de ajuda; **Tinta Rala** (tinta-600) na linha do campo em repouso e nos placeholders.

### Secondary
- **Kraft de Pasta** (kraft-500): o corpo e a aba das pastas, a aba de pasta ativa do painel e a tag "Mestre" nas fotos. É material. **Kraft Claro** (kraft-300/400) é o destaque sobre o arquivo escuro: fundo do botão kraft (a ação principal no escuro), links, hover do botão do arquivo, anel de foco, seleção de texto. **Kraft Queimado** (kraft-700) desenha a pasta vazia tracejada, a borda dos itens da fila de iniciativa e a faixa de aviso de largura mínima da mesa; kraft-600 é o sublinhado dos links e o corpo da pasta em pé nas laterais.

### Tertiary
- **Tinta de Carimbo** (carimbo-900): o carimbo sobre papel e kraft (papel na mesa, "Sua vez", "Sem acesso", "Não arquivado", o carimbo de etapa da apresentação), com borda dupla e falhas de entintamento. **Carimbo Desbotado** (carimbo-300) é o carimbo e o texto de erro sobre o arquivo escuro, onde a tinta escura sumiria. **Carimbo Vivo** (carimbo-800) é o texto e a borda do alerta numa folha, sobre **Rosa de Borrão** (carimbo-100); no escuro, o alerta e o aviso de sessão reiniciada usam carimbo-800 translúcido com texto carimbo-100. carimbo-600 existe na escala mas não é usado.
- **Luz de Sinal** (sinal-vivo): só o ponto de conexão "Ao vivo" no header. É a única cor fora da papelaria: luz de equipamento, não tinta.

### Neutral
- **Gaveta de Arquivo** (arquivo-900): o fundo de todas as telas do mundo e dos trilhos laterais da mesa. **Gaveta Funda** (arquivo-950) no header e na régua da mesa, no header e nas faixas da apresentação e no véu dos diálogos. arquivo-850 no painel direito e na faixa do aviso de câmera; arquivo-800 no fundo das fotos sem vídeo e no hover das abas; arquivo-700 nos divisores; arquivo-600 na placa, na borda dos botões do arquivo e na barra de rolagem.
- **Grafite Claro** (grafite-100): texto principal sobre o arquivo escuro. **Grafite Médio** (grafite-300) para texto secundário e abas inativas. grafite-400 para o ponto "Conectando..." e texto terciário.
- **Papel de Folha** (papel-100): as folhas, a placa e a borda das fotos impressas. **Papel Novo** (papel-50) nas etiquetas (pasta, nome da mesa no header, etiqueta do turno), na folha ativa da pasta em pé e no fundo do campo. **Papel Envelhecido** (papel-200) nas folhas em repouso da pasta em pé; papel-300 nos divisores dentro de uma folha.

### Named Rules
**The Carimbo é Estado Rule.** O vermelho de carimbo marca só estado ou classificação de arquivo: o papel da pessoa, a vez no turno, erro, acesso negado, a etapa de um recorte. Nunca pinta botão, link, cursor, foco ou qualquer ação.

**The Tinta Age Rule.** Numa folha, quem age é a tinta: ação principal em tinta chapada, secundária em contorno de tinta. Sobre o arquivo escuro, a ação principal é kraft chapado com texto em tinta (uma por área) e as demais são borda grafite que esquenta para kraft no hover.

**The Carimbo Legível Rule.** Sobre papel e kraft o carimbo usa carimbo-900 (≥ 4,5:1); sobre o arquivo escuro, carimbo-300 (≈ 7:1 sobre arquivo-900). Nenhum outro tom da escala serve de texto de carimbo.

**The Luz de Equipamento Rule.** sinal-vivo é o único verde e só acende no indicador de conexão. Não vira cor de sucesso, botão ou destaque.

## Typography

**Display Font:** Archivo, com eixo de largura (Google Fonts, `wdth` 62–125, `wght` 400–800), fallback ui-sans-serif, system-ui
**Body Font:** Archivo em largura normal
**Label/Mono Font:** Courier Prime (400/700), fallback ui-monospace

**Character:** Archivo condensado dá a voz de etiqueta e cabeçalho de dossiê, apertada e em caixa alta; Courier Prime é a máquina de escrever que preenche o formulário. Os números são tabulares em todo o mundo (`font-variant-numeric: tabular-nums`).

### Hierarchy
- **Display Capa** (800, 3.75rem → 6rem a partir de 640px, line-height 0.9, caixa alta, condensado): só o título da capa da apresentação.
- **Display** (800, 3rem → 3.75rem a partir de 640px, line-height 1, caixa alta, condensado): título de tela ("Suas mesas") e títulos de seção da apresentação (2.25rem → 3.75rem).
- **Headline** (800, 1.875rem, line-height 1, caixa alta, condensado): título de folha ("Criar mesa", "Iniciar combate", 404, convite); 1.5rem no diálogo de confirmação, 2.25rem no login/cadastro.
- **Title** (700–800, 1.25rem, line-height 1.25, condensado): nome da mesa na etiqueta da pasta e no header (1.125rem), nome de quem tem a vez na etiqueta do turno.
- **Body** (400, 0.875rem): subtítulos, ajuda de campo (0.75rem), estados vazios. Na apresentação, texto corrido em 1rem–1.125rem com entrelinha folgada (1.625) e medida de até 65ch.
- **Label** (700, 0.75rem, tracking 0.12em, caixa alta, condensado): rótulos de campo, abas, folhas da pasta em pé (0.875rem), "Rodada N · vez de". Botões usam o mesmo desenho em 0.875rem e tracking 0.1em; a placa, 0.875rem com tracking 0.16em.
- **Datilo** (Courier Prime 400, 1rem nos campos, 0.875rem nas datas, 0.75rem na iniciativa): valor digitado, select escolhido, data de registro e o número de iniciativa.

### Named Rules
**The Datilografado Rule.** Courier Prime só no que é datilografado: valores que a pessoa digitou e números de registro (datas, iniciativa). Instrução, rótulo, placeholder, select sem escolha e mensagem vão em Archivo.

**The Condensado Rule.** Largura 72% é para títulos, rótulos, botões, abas e etiquetas. Texto corrido fica em largura normal.

## Layout

**Telas de entrada:** mobile-first, 375px sem rolagem horizontal. Coluna central de até 64rem (lista) ou 28rem (login, cadastro, convite, 404), respiro lateral de 16px. As pastas formam uma grade de 1 coluna, 2 a partir de 640px e 3 a partir de 1024px, com 20px entre colunas e 32px entre linhas; abaixo, as duas folhas de formulário lado a lado a partir de 768px. Seções a 48px; dentro das peças, pasta 16px, folha 20px (24px a partir de 640px), campos a 16px. Telas de passagem são uma pasta aberta centralizada com a folha por cima.

**Casca da mesa:** desktop-first, largura mínima de 1280px; abaixo de 1280px aparece uma faixa kraft-700 avisando e a mesa rola para o lado. Header de 56px; abaixo, da esquerda para a direita: o trilho do mestre (72px, só quando há mais de uma vista), a coluna central (mapa em cima, régua de 96px embaixo) e o painel direito de 380px — ou, recolhido, um trilho de 72px com as folhas Ficha e Chat. A régua divide-se em fotos à esquerda (até 45% da largura, 30% em combate, rolando para o lado) e turno à direita. Avisos (sessão reiniciada, câmera) entram como faixas finas entre o mapa e a régua.

**Apresentação:** coluna de até 72rem com respiro de 16px e header fixo. Capa com ao menos 92% da altura da tela, texto ancorado à esquerda em até 36rem. As etapas alternam texto (5 colunas) e recorte (7 colunas; 4 para capturas estreitas) numa grade de 12 a partir de 768px, com 96–128px entre etapas. Seções com 80–112px de respiro vertical; título de seção a 48px do conteúdo.

## Elevation & Depth

Profundidade por material e sombra difusa, sem brilho. Pastas, folhas e fotos pousam sobre o arquivo com sombras largas, negativas no espalhamento e escuras, como papel sobre metal; etiquetas têm sombra de contato mínima. A fibra (ruído SVG a ~9% de opacidade) no papel, no kraft e na placa impede o material de parecer plástico. A placa é uma moldura plana de metal, sem bisel. Diálogos são folhas sobre um véu de arquivo-950 a 75%. Gradiente só aparece como função: o véu de legibilidade sobre a foto da capa e a máscara que esvai a fila de iniciativa quando ela transborda.

### Shadow Vocabulary
- **Pasta pousada** (`box-shadow: 0 12px 24px -14px rgb(0 0 0 / 0.9)`): corpo da pasta kraft.
- **Folha pousada** (`box-shadow: 0 10px 24px -12px rgb(0 0 0 / 0.8)`): folhas, diálogos e popovers.
- **Foto impressa** (`box-shadow: 0 6px 12px -8px rgb(0 0 0 / 0.9)`): fotos dos participantes na régua.
- **Folha saindo** (`box-shadow: 0 4px 10px -6px rgb(0 0 0 / 0.9)`): folhas da pasta em pé e o remendo de papel do carimbo de etapa.
- **Pasta em pé** (`box-shadow: 0 0 14px -2px rgb(0 0 0 / 0.8)`): corpo kraft-600 das laterais da mesa, que fica na frente das folhas.
- **Etiqueta colada** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.25)`): etiquetas de papel (pasta, turno).

### Named Rules
**The Gaveta Rule.** O movimento do mundo é de papelaria e curto: a pasta sobe 4px da gaveta no hover e no foco (180ms), e a folha da pasta em pé desliza 136px para fora no hover e no foco (200ms), as duas com `cubic-bezier(0.16, 1, 0.3, 1)`. A folha ativa fica 8px para fora em repouso. Com `prefers-reduced-motion`, nada se desloca com transição. Fora disso, só o ponto de conexão pulsa enquanto reconecta (sinal de estado, também desligado com menos movimento).

## Shapes

Cantos quase retos, de papelaria: campo sem raio (é uma linha de preenchimento), etiqueta e foto 2px, carimbo, placa e folha da pasta em pé 3px, folha e botão 4px, pasta 5px. A silhueta que define o mundo é a **aba da pasta suspensa**: uma lingueta no topo esquerdo, com o ombro direito cortado em diagonal de 12px, colada ao corpo, que por isso não tem raio no canto superior esquerdo. As abas do painel são a mesma aba em fileira (topo com 5px), apoiadas numa linha kraft de 2px. As fotos dos participantes têm borda de papel de 3px, como uma foto impressa. O carimbo é a única peça torta (−4°), com borda dupla de 3px e máscara de falha de tinta. Sem pílulas e sem cantos generosos; o único círculo é o ponto de conexão (8px), que é uma luz, não uma peça de papel.

## Components

### Buttons
Firmes e impressos, em caixa alta condensada.
- **Shape:** cantos de 4px, altura mínima de 44px nas folhas e 40px na mesa, 20px de respiro lateral (16px no kraft, 12px no do arquivo).
- **Tinta (primário numa folha):** tinta-900 chapada, texto papel-50; hover em tinta-700. Um por folha.
- **Contorno (secundário numa folha):** borda de 2px em tinta-900; hover com véu de tinta a 10%.
- **Kraft (primário sobre o arquivo):** kraft-400 chapado, texto tinta-900, hover kraft-300. Ex.: "Encerrar turno", "Criar conta" na capa (48px de altura e 1rem na capa).
- **Arquivo (secundário sobre o escuro):** borda de 1px arquivo-600, texto grafite-100; hover leva borda e texto ao kraft. Ex.: Sair, Câmera, Rolagem, Finalizar, Copiar convite.
- **Ícone do arquivo:** quadrado de 40px com o mesmo contorno, sempre com `aria-label`; ligado (`aria-pressed`) fica em kraft.
- **Focus:** contorno de 2px afastado 2px, em tinta-900 no papel e kraft-300/400 no escuro.
- **Envio:** o rótulo troca para o gerúndio ou para o resultado ("Link copiado!"), o spinner só aparece após 300ms; desabilitado a 60%.

### Abas de pasta
Fileira de abas com o padrão de teclado do WAI-ARIA (setas, Home/End, só a ativa no Tab). Aba ativa em kraft-500 com fibra e texto em tinta; inativa em grafite-300, com hover arquivo-800. Ficam sobre uma linha kraft-500 de 2px, como as abas de uma pasta aberta. Foco com contorno kraft-300 por dentro.

### Pasta de folhas (Signature Component)
As laterais da mesa são uma pasta em pé: trilho de 72px, corpo kraft-600 de 32px com vinco e, saindo da boca, folhas de 208×48px. Em repouso só a ponta com o ícone aparece; no hover ou foco a folha inteira (o botão todo, não só o desenho) desliza e mostra o nome. Folha ativa em papel-50, 8px para fora; demais em papel-200, papel-100 no hover. À esquerda é navegação entre vistas do mestre (`nav`, `aria-current`); à direita, atalhos do painel recolhido.

### Cards / Containers
- **Pasta** (a mesa): corpo kraft-500 com aba de classificação (o sistema), etiqueta papel-50 com o nome, linha datilografada com a data e o carimbo do papel no canto inferior direito. O link inteiro é a pasta; foco com anel kraft-300 afastado 4px.
- **Folha:** papel-100 com fibra, 4px, sombra de folha pousada, 20/24px de respiro (16px em popovers).
- **Pasta vazia:** contorno tracejado (2px, kraft-700) de uma pasta com aba, com a mensagem de gaveta vazia dentro.

### Diálogo e confirmação
Modal é um `<dialog>` nativo: prende o foco, fecha com Esc e com clique no véu, devolve o foco. O conteúdo é uma Folha de até 28rem. Toda ação destrutiva passa pela confirmação (título headline, mensagem em tinta-700, "Cancelar" em contorno com o foco inicial e a ação em tinta), nunca pelo `window.confirm`. Popovers ancorados (rolagem acima da régua, convite abaixo do header) são folhas de 20rem; a da rolagem fecha com Esc.

### Inputs / Fields
- **Style:** linha de preenchimento: sem raio, só a linha inferior de 2px em tinta-600 sobre papel-50 a 70%. O valor sai em Courier Prime; o placeholder, em Archivo menor e tinta-600.
- **Focus:** linha em tinta-900, fundo papel-50 cheio e contorno de 2px em tinta-900.
- **Select:** mesma linha, seta desenhada em tinta; sem escolha, o texto é instrução em Archivo; escolhido, vira datilografado.
- **Checkbox:** nativo, 20px, marcado em tinta-900.
- **Rótulo:** Label condensado em tinta-700, acima do campo.
- **Error / Disabled:** erro num alerta abaixo dos campos; desabilitado a 60% (40% para a iniciativa de quem não participa).

### Alerta
Três tons conforme o chão: **papel** (dentro de uma folha: borda 2px carimbo-800 sobre carimbo-100), **arquivo** (sobre o escuro: carimbo-800 a 25%, borda carimbo-300 a 50%, texto carimbo-100; também a faixa de "Sessão reiniciada") e **mesa** (o tom zinc/vermelho antigo, só para as partes ainda não migradas). "Tentar novamente" usa o botão secundário do chão correspondente.

### Carimbo (Signature Component)
Marca de estado em tinta de carimbo: caixa alta condensada, borda dupla de 3px, −4°, máscara de falha de entintamento. Tom **papel** (carimbo-900) sobre papel e kraft; tom **escuro** (carimbo-300) quando cair direto no arquivo. Usos: papel na mesa, "Sua vez" na etiqueta do turno, "Sem acesso", "Não arquivado" e a etapa de cada recorte da apresentação (sobre um remendo de papel-100 no canto).

### Régua da mesa
- **Foto do participante:** 128×72px, borda de papel-100 de 3px como foto impressa, sombra de foto. Sem vídeo, mostra a inicial condensada em grafite-300 e uma legenda de estado; o nome corre numa faixa arquivo-950 a 80% no pé, com o ícone do microfone. "Mestre" é uma tag kraft-500 reta no canto superior esquerdo, não um carimbo. Fora da mesa, a foto cai para 50%. "Reconectar" é um botãozinho kraft dentro da foto.
- **Etiqueta do turno:** etiqueta papel-50 colada: "Rodada N · vez de" em label, o nome em title, "iniciativa N" datilografado e, se é a vez de quem olha, o carimbo "Sua vez". Ao lado, a fila dos próximos em etiquetas contornadas de kraft-700 com a iniciativa datilografada, esvaindo à direita. Depois, "Encerrar turno" em kraft, "Finalizar" (só mestre, com confirmação) e "Rolagem".
- **Indicador de conexão:** ponto de 8px (grafite-400 conectando, sinal-vivo ao vivo, kraft-400 pulsando ao reconectar) com o texto em grafite-300.

### Placa da gaveta (Signature Component)
A identificação do produto: etiqueta papel-100 com fibra, caixa alta condensada (tracking 0.16em), numa moldura plana de metal arquivo-600 de 3px. É o único "logo"; o nome é provisório e não deve virar identidade. Na mesa, o lugar dela é ocupado pela etiqueta com o nome da mesa.

### Apresentação
- **Capa:** captura real da mesa em uso cobrindo a tela, sob um véu de arquivo-950 que vai de opaco à esquerda (onde está o texto) a 40% à direita; no celular, véu uniforme a 85%. Um esvair inferior leva a foto ao fundo da página.
- **Recorte:** captura com dados inventados montada numa Folha (12–16px de margem de papel), cantos de 2px e sombra de contato, com o carimbo da etapa num remendo de papel no canto superior direito.
- **Aviso e selo da licença:** o aviso literal da Licença da Comunidade em grafite-100 no rodapé, seguido de "sem vínculo" e dos direitos; o selo fica na capa (≥ 10% da largura, opacidade plena) e no rodapé. Até o arquivo oficial chegar, o selo é um espaço reservado tracejado em kraft-600 — é marcador, não o desenho do selo.

### Navigation
Nas telas de entrada, só o header da lista (placa, nome, Sair) e os links entre login e cadastro. Na mesa, o header leva "← Mesas", a etiqueta com o nome da mesa, o sistema em label grafite-300, a conexão, o convite (só o dono), o nome e Sair; as vistas do mestre ficam na pasta de folhas esquerda. Na apresentação, header fixo com a placa, "Como funciona" e Entrar. Links sobre papel: tinta-900 em negrito com sublinhado de 2px; sobre o arquivo: kraft-300 com sublinhado kraft-600.

## Do's and Don'ts

### Do:
- **Do** envolver toda tela do mundo em `.mundo-arquivo` (fundo arquivo-900, texto grafite-100, Archivo, números tabulares).
- **Do** usar tinta chapada para a ação principal de uma folha e kraft chapado (kraft-400, texto tinta-900) para a ação principal sobre o arquivo escuro.
- **Do** usar carimbo-900 para carimbo sobre papel e kraft e carimbo-300 para carimbo sobre o arquivo escuro.
- **Do** escrever títulos, rótulos, botões e abas em Archivo condensado (72%) e caixa alta.
- **Do** reservar Courier Prime para valores digitados e números de registro (datas, iniciativa).
- **Do** limitar o movimento à pasta que sobe 4px e à folha que desliza da pasta, ambos com `cubic-bezier(0.16, 1, 0.3, 1)` e desligados com `prefers-reduced-motion`.
- **Do** passar toda ação destrutiva pelo diálogo de confirmação, com foco inicial em "Cancelar".
- **Do** usar o `<dialog>` nativo para modais e as abas com teclado WAI-ARIA para listas de abas.
- **Do** mostrar o produto com capturas reais e dados inventados, montadas em folhas; nada de nomes do cânone.
- **Do** manter o aviso literal e o selo da Licença da Comunidade em toda página pública.
- **Do** manter botões e alvos com pelo menos 44px nas folhas e 40px na mesa.

### Don't:
- **Don't** usar vermelho de carimbo em botão, link, cursor, foco ou qualquer ação.
- **Don't** usar sinal-vivo fora do indicador de conexão.
- **Don't** usar Courier Prime para instruções, rótulos, placeholders ou mensagens.
- **Don't** usar sigilos, símbolos, logos, ilustrações ou qualquer arte da Ordem Paranormal oficial; o mundo é arquivo de investigação genérico.
- **Don't** montar listas como grade de cards cinza com botão colorido; mesas são pastas.
- **Don't** copiar o visual zinc/violeta (`ui/estilos.ts`) da ficha, do mapa e do chat para telas novas; ele é legado até a migração.
- **Don't** usar `window.confirm` nem modal próprio sem `<dialog>`.
- **Don't** adicionar gradiente decorativo, brilho, vidro ou bisel; gradiente só como véu de legibilidade sobre foto ou máscara de transbordo.
