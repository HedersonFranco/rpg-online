---
name: RPG Online
description: Mesa de RPG online para Ordem Paranormal; o produto inteiro (entrada, mesa, mapa, chat, ficha, NPCs e apresentação) no mundo "Dossiê de caso".
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
  recurso-vida: "#a0283f"
  recurso-sanidade: "#2d5a86"
  recurso-esforco: "#a56c13"
  elemento-sangue: "#7e2231"
  elemento-morte: "#3a3731"
  elemento-conhecimento: "#b0861a"
  elemento-energia: "#6f3b93"
  elemento-medo: "#c9d6e0"
  elemento-varia: "#6d6a62"
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
  peca: "9999px"
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
  button-icone-folha:
    textColor: "{colors.tinta-900}"
    rounded: "{rounded.folha}"
  aba-folha:
    backgroundColor: "{colors.papel-200}"
    textColor: "{colors.tinta-700}"
    typography: "{typography.label}"
    rounded: "{rounded.etiqueta}"
    padding: "0 4px"
    height: "36px"
  aba-folha-ativa:
    backgroundColor: "{colors.tinta-900}"
    textColor: "{colors.papel-50}"
    typography: "{typography.label}"
    rounded: "{rounded.etiqueta}"
    padding: "0 4px"
    height: "36px"
  campo-folha:
    backgroundColor: "{colors.papel-50}"
    textColor: "{colors.tinta-900}"
    typography: "{typography.datilo}"
    rounded: "{rounded.campo}"
    padding: "8px"
  avatar-ficha:
    backgroundColor: "{colors.arquivo-800}"
    textColor: "{colors.grafite-300}"
    rounded: "{rounded.etiqueta}"
    width: "56px"
    height: "64px"
  bilhete-entrada:
    backgroundColor: "{colors.papel-50}"
    textColor: "{colors.tinta-900}"
    rounded: "{rounded.etiqueta}"
    padding: "12px"
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
  button-ferramenta:
    textColor: "{colors.grafite-100}"
    rounded: "{rounded.carimbo}"
    size: "40px"
  button-ferramenta-hover:
    backgroundColor: "{colors.arquivo-800}"
    textColor: "{colors.kraft-300}"
  button-ferramenta-ativa:
    backgroundColor: "{colors.kraft-400}"
    textColor: "{colors.tinta-900}"
    rounded: "{rounded.carimbo}"
    size: "40px"
  token-mapa:
    backgroundColor: "{colors.arquivo-800}"
    textColor: "{colors.grafite-100}"
    rounded: "{rounded.peca}"
    size: "56px"
  nome-token:
    backgroundColor: "{colors.arquivo-950}"
    textColor: "{colors.grafite-100}"
    rounded: "{rounded.etiqueta}"
    padding: "0 6px"
  foto-mapa:
    backgroundColor: "{colors.arquivo-800}"
    rounded: "{rounded.etiqueta}"
    height: "144px"
  bilhete-rolagem:
    backgroundColor: "{colors.papel-100}"
    textColor: "{colors.tinta-900}"
    rounded: "{rounded.etiqueta}"
    padding: "8px 12px"
---

# Design System: RPG Online

> **Escopo atual.** O mundo "Dossiê de caso" é o produto inteiro: telas de entrada (login, cadastro, lista de mesas, convite, 404, checagem de sessão), a casca da mesa, a área do mapa com tokens e o gerenciador de mapas, o chat, a ficha de personagem, os NPCs do mestre, a apresentação pública e a tela de erro (`ErrorBoundary`, uma Folha). Não há mais visual legado: o antigo zinc/violeta (`ui/estilos.ts`) foi apagado, o `body` global já é arquivo-900 com texto grafite-100, e as classes de `ui/estilosArquivo.ts` são as únicas do projeto. Cada tela continua se envolvendo em `.mundo-arquivo` para a fonte, os números tabulares, a seleção e a barra de rolagem.

## Overview

**Creative North Star: "Dossiê de caso"**

Cada mesa é um caso aberto num arquivo de investigação. A interface é um móvel de arquivo escuro, quase preto, onde as mesas são pastas kraft suspensas, com aba de classificação e etiqueta de papel; o que se preenche fica numa folha de papel por cima. A ação é tinta; o estado é carimbo. O mundo recusa o painel de SaaS (grade de cards cinza com botão colorido): nada aqui é "tile", tudo é um objeto de papelaria com material, fibra e peso.

Na mesa, o móvel continua: o header é a borda da gaveta com o nome da mesa numa etiqueta de papel; a régua inferior junta as fotos impressas dos participantes e a etiqueta de quem tem a vez; as laterais são pastas em pé das quais as folhas deslizam; modais e popovers são folhas de papel postas sobre o arquivo. O mapa é uma foto grande pousada no tampo escuro da mesa, sobre uma grade pontilhada muito fraca, e os tokens são peças redondas de jogo em cima dela. O chat é o que se fala à mesa (nome em kraft, hora datilografada) e cada rolagem é um bilhete de papel com o total. Na apresentação, a prova é a própria mesa: capturas reais montadas em folhas como recortes de dossiê, cada uma com o carimbo da etapa.

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
- **Kraft de Pasta** (kraft-500): o corpo e a aba das pastas, a aba de pasta ativa do painel e a tag "Mestre" nas fotos. É material. **Kraft Claro** (kraft-300/400) é o destaque sobre o arquivo escuro: fundo do botão kraft (a ação principal no escuro) e da ferramenta ligada do mapa, links, hover do botão do arquivo, anel de foco, contorno do token selecionado, nome do autor no chat, seleção de texto. **Kraft Queimado** (kraft-700) desenha a pasta vazia tracejada, a borda dos itens da fila de iniciativa, a faixa de aviso de largura mínima da mesa, o ícone do mapa vazio e os pontos da grade do tampo (a 35%); kraft-600 é o sublinhado dos links e o corpo da pasta em pé nas laterais.

### Tertiary
- **Tinta de Carimbo** (carimbo-900): o carimbo sobre papel e kraft (papel na mesa, "Sua vez", "Sem acesso", "Não arquivado", "Na mesa" no mapa ativo, o carimbo de etapa da apresentação), com borda dupla e falhas de entintamento. **Carimbo Desbotado** (carimbo-300) é o carimbo e o texto de erro sobre o arquivo escuro, onde a tinta escura sumiria, e a borda dos tokens de NPC (classificação de ameaça). **Carimbo Vivo** (carimbo-800) é o texto e a borda do alerta numa folha, sobre **Rosa de Borrão** (carimbo-100); no escuro, o alerta e o aviso de sessão reiniciada usam carimbo-800 translúcido com texto carimbo-100, e o aviso de erro do mapa é carimbo-800 a 90% com "Dispensar". carimbo-600 existe na escala mas não é usado.
- **Luz de Sinal** (sinal-vivo): só o ponto de conexão "Ao vivo" no header. É a única cor fora da papelaria: luz de equipamento, não tinta.
- **Tintas de recurso** (só na ficha, sobre papel): **Carmim de Vida** (recurso-vida), escolhido de propósito longe do vermelho-alaranjado do carimbo; **Azul de Sanidade** (recurso-sanidade); **Ocre de Esforço** (recurso-esforco). Pintam só o preenchimento da barra fina do recurso, na ordem da ficha oficial: Vida, Sanidade, Esforço. A Vida também pinta a barrinha de PV sob o token de agente no mapa.
- **Marcas de elemento** (só nas entradas de ritual, sobre papel): elemento-sangue, elemento-morte, elemento-conhecimento, elemento-energia, elemento-medo (papel-50, legível só pelo anel de tinta à volta) e elemento-varia. Aparecem num quadradinho de 12px ao lado do nome escrito do elemento; a cor nunca fala sozinha.

### Neutral
- **Gaveta de Arquivo** (arquivo-900): o fundo do `body`, de todas as telas e dos trilhos laterais da mesa, e das barras flutuantes do mapa (a 95%). **Gaveta Funda** (arquivo-950) no header e na régua da mesa, no tampo do mapa, na etiqueta de nome do token (a 85%), no header e nas faixas da apresentação e no véu dos diálogos. arquivo-850 no painel direito e na faixa do aviso de câmera; arquivo-800 no fundo das fotos sem vídeo, no disco dos tokens, no hover das abas e das ferramentas do mapa; arquivo-700 nos divisores e na borda das barras do mapa; arquivo-600 na placa, na borda dos botões do arquivo e na barra de rolagem.
- **Grafite Claro** (grafite-100): texto principal sobre o arquivo escuro. **Grafite Médio** (grafite-300) para texto secundário e abas inativas. grafite-400 para o ponto "Conectando...", a hora das mensagens, a borda dos tokens de objeto e texto terciário.
- **Papel de Folha** (papel-100): as folhas, a placa, o bilhete de rolagem e a borda das fotos impressas (participantes e mapas). **Papel Novo** (papel-50) nas etiquetas (pasta, nome da mesa no header, etiqueta do turno), na folha ativa da pasta em pé, no fundo do campo, no bilhete de formulário e na borda dos tokens de agente. **Papel Envelhecido** (papel-200) nas folhas em repouso da pasta em pé; papel-300 nos divisores dentro de uma folha.

### Named Rules
**The Carimbo é Estado Rule.** O vermelho de carimbo marca só estado ou classificação de arquivo: o papel da pessoa, a vez no turno, erro, acesso negado, a etapa de um recorte. Nunca pinta botão, link, cursor, foco ou qualquer ação.

**The Tinta Age Rule.** Numa folha, quem age é a tinta: ação principal em tinta chapada, secundária em contorno de tinta. Sobre o arquivo escuro, a ação principal é kraft chapado com texto em tinta (uma por área) e as demais são borda grafite que esquenta para kraft no hover.

**The Carimbo Legível Rule.** Sobre papel e kraft o carimbo usa carimbo-900 (≥ 4,5:1); sobre o arquivo escuro, carimbo-300 (≈ 7:1 sobre arquivo-900). Nenhum outro tom da escala serve de texto de carimbo.

**The Luz de Equipamento Rule.** sinal-vivo é o único verde e só acende no indicador de conexão. Não vira cor de sucesso, botão ou destaque.

**The Tinta de Registro Rule.** Tintas de recurso e marcas de elemento são registro, não ação nem estado: nunca pintam botão, link, foco ou aba (a ação continua em tinta-900) e nunca substituem o carimbo. Nenhuma delas é o vermelho de carimbo, e a Vida fica no carmim justamente para não ser confundida com ele.

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
- **Datilo** (Courier Prime 400, 1rem nos campos, 0.875rem nas datas, 0.75rem na iniciativa): valor digitado, select escolhido, data de registro e o número de iniciativa. Na ficha: o valor do recurso ("9/26", o máximo em tinta-600), o NEX só de leitura, a expressão do teste de perícia ("3d20+5", 0.875rem), o inventário só de leitura e, na lista de agentes, o nome do jogador e a data. Fora da ficha: o nível de zoom ("100%"), o PV do token selecionado, a hora das mensagens (0.75rem grafite-400), a expressão e os dados da rolagem, e o resumo do NPC ("PV 60 · PE 10 · SAN 0").
- O total da rolagem é um número grande em 800 condensado (1.875rem); o autor da mensagem, label em 800 condensado kraft-300 com tracking 0.04em; o nome do NPC e do mapa, 1.125rem em 800 condensado.
- Na ficha, o nome do agente é um headline de 1.5rem; o nome de cada entrada, 1rem em 800 condensado; os rótulos dos recursos, 0.875rem em 800 com tracking 0.12em. A sigla do atributo base da perícia é um label pequeno em caixa alta ao lado do nome.

### Named Rules
**The Datilografado Rule.** Courier Prime só no que é datilografado: valores que a pessoa digitou e números de registro (datas, iniciativa, valores e testes da ficha). Instrução, rótulo, placeholder, select sem escolha, nomes de perícia e de entrada, descrição e mensagem vão em Archivo.

**The Condensado Rule.** Largura 72% é para títulos, rótulos, botões, abas e etiquetas. Texto corrido fica em largura normal.

## Layout

**Telas de entrada:** mobile-first, 375px sem rolagem horizontal. Coluna central de até 64rem (lista) ou 28rem (login, cadastro, convite, 404), respiro lateral de 16px. As pastas formam uma grade de 1 coluna, 2 a partir de 640px e 3 a partir de 1024px, com 20px entre colunas e 32px entre linhas; abaixo, as duas folhas de formulário lado a lado a partir de 768px. Seções a 48px; dentro das peças, pasta 16px, folha 20px (24px a partir de 640px), campos a 16px. Telas de passagem são uma pasta aberta centralizada com a folha por cima.

**Casca da mesa:** desktop-first, largura mínima de 1280px; abaixo de 1280px aparece uma faixa kraft-700 avisando e a mesa rola para o lado. Header de 56px; abaixo, da esquerda para a direita: o trilho do mestre (72px, só quando há mais de uma vista), a coluna central (mapa em cima, régua de 96px embaixo) e o painel direito de 380px — ou, recolhido, um trilho de 72px com as folhas Ficha e Chat. A régua divide-se em fotos à esquerda (até 45% da largura, 30% em combate, rolando para o lado) e turno à direita. Avisos (sessão reiniciada, câmera) entram como faixas finas entre o mapa e a régua.

**Ficha no painel:** uma única Folha de 16px de respiro ocupa a largura do painel, com os blocos empilhados a 24px: cabeçalho (avatar + nome), NEX, círculo de atributos (até 300px, centralizado), os três recursos a 16px entre si e as divisórias com o conteúdo 16px abaixo. As divisórias são uma grade de 3×2 com 6px de vão. A lista de agentes e a nova ficha seguem o mesmo painel: pastas empilhadas a 24px e o formulário numa Folha com campos em pares (2 colunas) e os cinco atributos numa linha de 5. A aba NPCs (só do mestre) usa o mesmo painel: cabeçalho, nota, formulário e a lista numa Folha, empilhados a 24px; os recursos do NPC em 3 colunas (OP1) ou 2 (OP2).

**Mapa:** ocupa a coluna central inteira. Barras flutuantes a 12px das bordas: ferramentas em coluna no canto superior esquerdo, zoom em linha no inferior esquerdo, detalhes do token selecionado centralizados no topo, aviso de erro no inferior direito; o popover de novo token (20rem) abre ao lado da barra de ferramentas. Tokens de 56px na escala 1, nunca abaixo de 28px. O gerenciador de mapas é uma vista inteira (32px de respiro): título, formulário de envio numa Folha de até 48rem e as fotos dos mapas em grade de 2 colunas (3 a partir de 1280px), 24px entre colunas e 32px entre linhas.

**Chat:** a conversa rola ocupando a altura do painel, itens a 16px, e o compositor fica fixo embaixo numa faixa de papel.

**Apresentação:** coluna de até 72rem com respiro de 16px e header fixo. Capa com ao menos 92% da altura da tela, texto ancorado à esquerda em até 36rem. As etapas alternam texto (5 colunas) e recorte (7 colunas; 4 para capturas estreitas) numa grade de 12 a partir de 768px, com 96–128px entre etapas. Seções com 80–112px de respiro vertical; título de seção a 48px do conteúdo.

## Elevation & Depth

Profundidade por material e sombra difusa, sem brilho. Pastas, folhas e fotos pousam sobre o arquivo com sombras largas, negativas no espalhamento e escuras, como papel sobre metal; etiquetas têm sombra de contato mínima. A fibra (ruído SVG a ~9% de opacidade) no papel, no kraft e na placa impede o material de parecer plástico. A placa é uma moldura plana de metal, sem bisel. Diálogos são folhas sobre um véu de arquivo-950 a 75%. Gradiente só aparece como função: o véu de legibilidade sobre a foto da capa, a máscara que esvai a fila de iniciativa quando ela transborda e a grade pontilhada do tampo do mapa (pontos kraft-700 a 35% de 1px a cada 24px, feitos com gradiente radial — é padrão de papel quadriculado, não degradê).

### Shadow Vocabulary
- **Pasta pousada** (`box-shadow: 0 12px 24px -14px rgb(0 0 0 / 0.9)`): corpo da pasta kraft.
- **Folha pousada** (`box-shadow: 0 10px 24px -12px rgb(0 0 0 / 0.8)`): folhas, diálogos e popovers.
- **Foto impressa** (`box-shadow: 0 6px 12px -8px rgb(0 0 0 / 0.9)`): fotos dos participantes na régua.
- **Folha saindo** (`box-shadow: 0 4px 10px -6px rgb(0 0 0 / 0.9)`): folhas da pasta em pé e o remendo de papel do carimbo de etapa.
- **Pasta em pé** (`box-shadow: 0 0 14px -2px rgb(0 0 0 / 0.8)`): corpo kraft-600 das laterais da mesa, que fica na frente das folhas.
- **Etiqueta colada** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.25)`): etiquetas de papel (pasta, turno, nome do agente na pasta).
- **Bilhete** (`box-shadow: 0 1px 3px rgb(0 0 0 / 0.25)`): o formulário de entrada, um papel-50 solto sobre a folha da ficha.
- **Foto colada** (`box-shadow: 0 2px 4px rgb(0 0 0 / 0.3)`): o avatar do agente na folha.
- **Mapa na mesa** (`box-shadow: 0 18px 40px -18px rgb(0 0 0 / 0.95)`): a imagem do mapa pousada no tampo.
- **Foto de mapa** (`box-shadow: 0 14px 28px -16px rgb(0 0 0 / 0.95)`): cada mapa impresso no gerenciador.
- **Barra flutuante** (`box-shadow: 0 8px 20px -10px rgb(0 0 0 / 0.9)`): barras de ferramentas e de zoom sobre o mapa.
- **Peça** (`box-shadow: 0 6px 12px -4px rgb(0 0 0 / 0.9)`): o disco do token.
- **Bilhete de rolagem** (`box-shadow: 0 6px 14px -8px rgb(0 0 0 / 0.9)`): o resultado de dados no chat.

### Named Rules
**The Uma Folha Rule.** A ficha é uma folha só sobre o painel escuro. Nada dentro dela vira card: seções são linhas pautadas (divisores papel-300), e o único papel por cima é o bilhete do formulário, sem borda.

**The Gaveta Rule.** O movimento do mundo é de papelaria e curto: a pasta sobe 4px da gaveta no hover e no foco (180ms), e a folha da pasta em pé desliza 136px para fora no hover e no foco (200ms), as duas com `cubic-bezier(0.16, 1, 0.3, 1)`. A folha ativa fica 8px para fora em repouso. Com `prefers-reduced-motion`, nada se desloca com transição. Fora disso, só o ponto de conexão pulsa enquanto reconecta (sinal de estado, também desligado com menos movimento).

## Shapes

Cantos quase retos, de papelaria: campo sem raio (é uma linha de preenchimento), etiqueta e foto 2px, carimbo, placa e folha da pasta em pé 3px, folha e botão 4px, pasta 5px. A silhueta que define o mundo é a **aba da pasta suspensa**: uma lingueta no topo esquerdo, com o ombro direito cortado em diagonal de 12px, colada ao corpo, que por isso não tem raio no canto superior esquerdo. As abas do painel são a mesma aba em fileira (topo com 5px), apoiadas numa linha kraft de 2px. As fotos dos participantes têm borda de papel de 3px, como uma foto impressa. Na ficha, as divisórias de seção e o avatar têm 2px, os botões de ícone 4px, a barra de recurso 2px, e o círculo de atributos é o único desenho curvo de papel (cinco círculos em volta de um disco, em traço de tinta). O carimbo é a única peça torta (−4°), com borda dupla de 3px e máscara de falha de tinta. As ferramentas do mapa têm 3px e as barras que as seguram 4px; a foto de mapa tem borda de papel de 5px e cantos de 2px. Sem pílulas e sem cantos generosos. Círculos só onde a coisa é redonda de verdade: o token (peça de jogo, borda de 3px), o ponto de conexão (8px, uma luz) e o spinner; nenhuma peça de papel é redonda.

## Components

### Buttons
Firmes e impressos, em caixa alta condensada.
- **Shape:** cantos de 4px, altura mínima de 44px nas folhas e 40px na mesa, 20px de respiro lateral (16px no kraft, 12px no do arquivo).
- **Tinta (primário numa folha):** tinta-900 chapada, texto papel-50; hover em tinta-700. Um por folha.
- **Contorno (secundário numa folha):** borda de 2px em tinta-900; hover com véu de tinta a 10%.
- **Kraft (primário sobre o arquivo):** kraft-400 chapado, texto tinta-900, hover kraft-300. Ex.: "Encerrar turno", "Criar conta" na capa (48px de altura e 1rem na capa).
- **Arquivo (secundário sobre o escuro):** borda de 1px arquivo-600, texto grafite-100; hover leva borda e texto ao kraft. Ex.: Sair, Câmera, Rolagem, Finalizar, Copiar convite.
- **Ícone do arquivo:** quadrado de 40px com o mesmo contorno, sempre com `aria-label`; ligado (`aria-pressed`) fica em kraft.
- **Ícone da folha:** quadrado com borda de 2px em tinta-900 sobre o papel, cantos de 4px, ícone de 16px, sempre com `aria-label`; hover com véu de tinta a 10%, desabilitado a 35%. É o −/+ dos recursos. 40px, o piso da mesa.
- **Ferramenta do mapa:** quadrado de 40px sem borda, cantos de 3px, ícone grafite-100; hover em arquivo-800 com ícone kraft-300; ligada (`aria-pressed`) em kraft-400 chapado com ícone tinta-900; desabilitada a 40%. Sempre com `aria-label` e `title`.
- **Alternador:** dois botões colados numa moldura de 2px em tinta-900 (ex.: Todas/Treinadas), o ligado em tinta chapada com texto papel-50, `aria-pressed`.
- **Focus:** contorno de 2px afastado 2px, em tinta-900 no papel e kraft-300/400 no escuro.
- **Envio:** o rótulo troca para o gerúndio ou para o resultado ("Link copiado!"), o spinner só aparece após 300ms; desabilitado a 60%.

### Abas de pasta
Fileira de abas com o padrão de teclado do WAI-ARIA (setas, Home/End, só a ativa no Tab). Aba ativa em kraft-500 com fibra e texto em tinta; inativa em grafite-300, com hover arquivo-800. Ficam sobre uma linha kraft-500 de 2px, como as abas de uma pasta aberta. Foco com contorno kraft-300 por dentro.

### Divisórias de fichário
As seções da ficha (Perícias, Rituais, Habilidades, Poderes, Equipamentos, Inventário) são divisórias de fichário todas à vista, numa grade de 3×2 dentro da folha, usando a mesma lista de abas com teclado (setas, Home/End). Ativa em tinta-900 chapada com texto papel-50; inativas em papel-200 com texto tinta-700, hover papel-300. 36px de altura, cantos de 2px, label condensado com tracking 0.08em. Foco com contorno tinta-900 afastado 2px. Não são abas de pasta: dentro de uma folha a seleção é tinta, não kraft.

### Ficha de personagem (Signature Component)
Uma Folha só sobre o painel escuro, sem cards dentro (ver The Uma Folha Rule).
- **Cabeçalho:** avatar como foto 3×4 colada (56×64px, borda papel-50 de 3px, cantos de 2px, sombra de foto colada); sem imagem, a inicial condensada em grafite-300 sobre arquivo-800. Ao lado, o nome em headline e "origem · classe · trilha" em body tinta-700.
- **NEX:** rótulo NEX à esquerda e, à direita, o select datilografado (ou o valor datilografado, só leitura); abaixo, uma barra de 8px em tinta-900 sobre papel-300 a 70%.
- **Círculo de atributos:** a disposição da ficha oficial — AGI no topo e, em sentido horário, INT, VIG, PRE, FOR — em volta de um disco "ATRIBUTOS". Desenho próprio em SVG, só traço de tinta sobre papel-50: cinco círculos com anel interno tinta-600, hastes até o disco, um anel externo com marcas de régua impressas (60 marcas, uma forte a cada 5). O valor em 800 condensado grande e a sigla abaixo em tinta-700. `role="img"` com todos os valores no `aria-label`.
- **Recursos:** Vida, Sanidade e Esforço, nessa ordem. Cada linha: rótulo condensado à esquerda, valor datilografado à direita ("9/26"); embaixo, −, barra fina de 12px (cantos de 2px, fundo papel-300 a 70%, preenchimento na tinta do recurso, transição de largura de 200ms desligada com menos movimento) e +. Os botões só pedem; o valor mostrado é o que o servidor devolve.
- **Perícias:** busca (linha de preenchimento) e o alternador Todas/Treinadas; tabela Perícia · Teste · Treino pautada em papel-300. Destreinada é quieta: nome em tinta-600 e o select sem linha nem fundo até hover/foco. Treinada salta: nome em negrito tinta-900 e select com a linha de campo. O teste sai datilografado; atributo 0 ganha "(pior)" em Archivo.
- **Entradas** (rituais, habilidades, poderes, equipamentos): linhas pautadas na própria folha, nome em 800 condensado, detalhes em 0.75rem tinta-700, descrição em body; editar e apagar como ícones discretos em tinta-700 (apagar sempre pede confirmação). O elemento do ritual é um quadradinho de 12px com anel de tinta a 40% seguido do nome escrito ("I círculo · Sangue"). "Adicionar …" é um botão de contorno na largura toda.
- **Bilhete de entrada:** o formulário de criar/editar é um papel-50 solto sobre a folha, sem borda, cantos de 2px, 12px de respiro e sombra de bilhete; ação em tinta e "Cancelar" em contorno.
- **Inventário:** textarea na linha de preenchimento; com alteração, "Salvar inventário" em tinta; sem alteração, a linha de estado "Inventário salvo." em tinta-700 no lugar do botão (`role="status"`).

### Lista de agentes
Os agentes da mesa são pastas kraft, como as mesas: a aba traz "classe · NEX N%", a etiqueta papel-50 colada traz o nome em title condensado e, abaixo, "Jogador:" e "Registrado em" em body tinta-700 com só o nome do jogador e a data datilografados. O botão inteiro é a pasta (sobe da gaveta no hover/foco). Acima, "Agentes" em título com a contagem em body grafite-300 e "Novo agente" em kraft. Vazio: a pasta tracejada.

### Pasta de folhas (Signature Component)
As laterais da mesa são uma pasta em pé: trilho de 72px, corpo kraft-600 de 32px com vinco e, saindo da boca, folhas de 208×48px. Em repouso só a ponta com o ícone aparece; no hover ou foco a folha inteira (o botão todo, não só o desenho) desliza e mostra o nome. Folha ativa em papel-50, 8px para fora; demais em papel-200, papel-100 no hover. À esquerda é navegação entre vistas do mestre (`nav`, `aria-current`); à direita, atalhos do painel recolhido.

### Cards / Containers
- **Pasta** (a mesa): corpo kraft-500 com aba de classificação (o sistema), etiqueta papel-50 com o nome, linha datilografada com a data e o carimbo do papel no canto inferior direito. O link inteiro é a pasta; foco com anel kraft-300 afastado 4px.
- **Folha:** papel-100 com fibra, 4px, sombra de folha pousada, 20/24px de respiro (16px em popovers).
- **Pasta vazia:** contorno tracejado (2px, kraft-700) de uma pasta com aba, com a mensagem de gaveta vazia dentro.

### Diálogo e confirmação
Modal é um `<dialog>` nativo: prende o foco, fecha com Esc e com clique no véu, devolve o foco. O conteúdo é uma Folha de até 28rem. Toda ação destrutiva passa pela confirmação (título headline, mensagem em tinta-700, "Cancelar" em contorno com o foco inicial e a ação em tinta), nunca pelo `window.confirm`. Popovers ancorados (rolagem acima da régua, convite abaixo do header) são folhas de 20rem; a da rolagem fecha com Esc.

### Inputs / Fields
- **Style:** linha de preenchimento: sem raio, só a linha inferior de 2px em tinta-600 sobre papel-50 a 70%. O valor sai em Courier Prime; o placeholder, em Archivo menor e tinta-600. Textareas usam a mesma linha e não se redimensionam (`resize: none`); a altura vem de `rows`.
- **Arquivo (upload):** o botão do seletor nativo é desenhado como o botão de contorno (borda 2px tinta-900, 40px, label condensado), com o nome do arquivo em tinta-900 ao lado.
- **Focus:** linha em tinta-900, fundo papel-50 cheio e contorno de 2px em tinta-900.
- **Select:** mesma linha, seta desenhada em tinta; sem escolha, o texto é instrução em Archivo; escolhido, vira datilografado.
- **Checkbox:** nativo, 20px, marcado em tinta-900.
- **Rótulo:** Label condensado em tinta-700, acima do campo.
- **Error / Disabled:** erro num alerta abaixo dos campos; desabilitado a 60% (40% para a iniciativa de quem não participa).

### Alerta
Dois tons conforme o chão: **arquivo** (o padrão, sobre o escuro: carimbo-800 a 25%, borda carimbo-300 a 50%, texto carimbo-100; também a faixa de "Sessão reiniciada") e **papel** (dentro de uma folha: borda 2px carimbo-800 sobre carimbo-100). "Tentar novamente" usa o botão secundário do chão correspondente. O estado de carregamento segue os mesmos dois chãos: spinner com texto em grafite-300 no arquivo e em tinta-700 no papel, só depois de 300ms. (Havia um terceiro tom, "mesa", no zinc/vermelho antigo; saiu com a migração.)

### Carimbo (Signature Component)
Marca de estado em tinta de carimbo: caixa alta condensada, borda dupla de 3px, −4°, máscara de falha de entintamento. Tom **papel** (carimbo-900) sobre papel e kraft; tom **escuro** (carimbo-300) quando cair direto no arquivo. Usos: papel na mesa, "Sua vez" na etiqueta do turno, "Sem acesso", "Não arquivado", "Na mesa" no mapa ativo (num remendo de papel-100) e a etapa de cada recorte da apresentação (sobre um remendo de papel-100 no canto).

### Régua da mesa
- **Foto do participante:** 128×72px, borda de papel-100 de 3px como foto impressa, sombra de foto. Sem vídeo, mostra a inicial condensada em grafite-300 e uma legenda de estado; o nome corre numa faixa arquivo-950 a 80% no pé, com o ícone do microfone. "Mestre" é uma tag kraft-500 reta no canto superior esquerdo, não um carimbo. Fora da mesa, a foto cai para 50%. "Reconectar" é um botãozinho kraft dentro da foto.
- **Etiqueta do turno:** etiqueta papel-50 colada: "Rodada N · vez de" em label, o nome em title, "iniciativa N" datilografado e, se é a vez de quem olha, o carimbo "Sua vez". Ao lado, a fila dos próximos em etiquetas contornadas de kraft-700 com a iniciativa datilografada, esvaindo à direita. Depois, "Encerrar turno" em kraft, "Finalizar" (só mestre, com confirmação) e "Rolagem".
- **Indicador de conexão:** ponto de 8px (grafite-400 conectando, sinal-vivo ao vivo, kraft-400 pulsando ao reconectar) com o texto em grafite-300.

### Área do mapa (Signature Component)
O tampo da mesa: arquivo-950 com a grade pontilhada kraft, e o mapa por cima como uma foto grande com a sombra de mapa na mesa.
- **Ferramentas:** barra vertical (`role="toolbar"`, `aria-orientation="vertical"`) no canto superior esquerdo: arquivo-900 a 95%, borda 1px arquivo-700, cantos de 4px, 4px de respiro, sombra de barra flutuante. Selecionar, Mover mapa e, só para o mestre, Adicionar token (ligado enquanto o popover está aberto). Na v1 não há seletor de piso nem ferramentas de desenho.
- **Zoom:** a mesma barra em linha no canto inferior esquerdo: −, +, ajustar à tela, tela cheia e o nível de zoom datilografado em grafite-300.
- **Token selecionado:** uma Folha compacta (16×10px de respiro) centralizada no topo, com o nome em 800 condensado, o tipo em tinta-700, o PV datilografado (só agente) e, para o mestre, a lixeira como ícone discreto em tinta-700 (remover pede confirmação).
- **Vazio:** ícone de mapa em kraft-700, "Nenhum mapa na mesa" em 800 condensado grafite-100 e a instrução em grafite-300, diferente para mestre e jogador. Carregando e erro usam os tons de arquivo.
- **Aviso de erro:** caixa carimbo-800 a 90% com borda carimbo-300 a 50% e texto carimbo-100 no canto inferior direito, com "Dispensar" sublinhado.

### Token
Peça redonda de jogo: disco arquivo-800 de 56px (vezes o zoom, nunca menos que 28px) com borda de 3px pelo tipo — **agente** papel-50, **NPC** carimbo-300 (classificação de ameaça, não ação) e **objeto** grafite-400 — e sombra de peça. Dentro, o avatar ou a inicial em 800 condensado grafite-100 (nunca menor que 12px). Selecionado: contorno kraft-300 de 2px afastado 2px. Embaixo, o nome numa etiqueta arquivo-950 a 85% (0.75rem, cantos de 2px, até 8rem) e, só no agente, uma barra de PV de 48×6px em recurso-vida sobre arquivo-800 (`role="meter"`). Só o disco é clicável: nome e barra não encolhem com o zoom e cobririam os vizinhos.

### Novo token
Popover numa Folha de 20rem (16px de respiro) ao lado da barra de ferramentas. O tipo (Ficha, NPC, Objeto) é um `radiogroup` com três divisórias de fichário em linha; abaixo, um select de ficha ou NPC ou o campo de nome do objeto; "Cancelar" em contorno e "Adicionar" em tinta.

### Gerenciador de mapas
Vista só do mestre. Título em display ("Mapas da mesa") e a nota de que só ele vê a lista. O envio fica numa Folha: seletor de arquivo com o botão em contorno de tinta, nome e "Enviar mapa" em tinta. Cada mapa é uma foto impressa (borda papel-100 de 5px, cantos de 2px, sombra de foto de mapa, imagem de 144px), com o nome em 800 condensado grafite-100 abaixo; o mapa ativo leva o carimbo "Na mesa" num remendo de papel no canto. Ações: "Mostrar na mesa" em kraft (a ação principal do item), "Tirar da mesa" e "Remover" (com confirmação) no botão do arquivo.

### Chat
- **Mensagem:** direto sobre o escuro, sem balão: o autor em kraft-300 condensado em caixa alta, a hora datilografada em grafite-400 e o texto em grafite-100 (quebra as linhas como foram digitadas).
- **Rolagem:** um bilhete papel-100 com fibra, cantos de 2px e sombra de bilhete de rolagem: ícone de dados, quem rolou e a expressão datilografada, a hora à direita; embaixo, os dados datilografados em tinta-700 e o total grande em 800 condensado.
- **Compositor:** uma faixa de papel (Folha de 8px de respiro) com o campo em linha de preenchimento e "Enviar" em tinta; erro num alerta de papel dentro da faixa.

### NPCs
Aba e folha do painel direito só do mestre; o jogador não a vê. Cabeçalho "NPCs" em título com a contagem em body grafite-300, "Novo NPC" em kraft e a nota de que só o mestre vê a lista. A lista é uma Folha só com linhas pautadas (papel-300): nome em 800 condensado, o resumo datilografado ("PV 60 · PE 10 · SAN 0" em OP1, "PV · PD" em OP2) e os atributos em texto livre; editar e apagar como ícones discretos em tinta-700 (apagar pelo diálogo de confirmação). O formulário é um bilhete papel-50 sem borda, com os campos do sistema da mesa (PV/PE/SAN ou PV/PD) em colunas e uma textarea para atributos e notas. Vazio: a pasta tracejada.

### Placa da gaveta (Signature Component)
A identificação do produto: etiqueta papel-100 com fibra, caixa alta condensada (tracking 0.16em), numa moldura plana de metal arquivo-600 de 3px. É o único "logo"; o nome é provisório e não deve virar identidade. Na mesa, o lugar dela é ocupado pela etiqueta com o nome da mesa.

### Apresentação
- **Capa:** captura real da mesa em uso cobrindo a tela, sob um véu de arquivo-950 que vai de opaco à esquerda (onde está o texto) a 40% à direita; no celular, véu uniforme a 85%. Um esvair inferior leva a foto ao fundo da página.
- **Recorte:** captura com dados inventados montada numa Folha (12–16px de margem de papel), cantos de 2px e sombra de contato, com o carimbo da etapa num remendo de papel no canto superior direito.
- **Aviso e selo da licença:** o aviso literal da Licença da Comunidade em grafite-100 no rodapé, seguido de "sem vínculo" e dos direitos; o selo fica na capa (≥ 10% da largura, opacidade plena) e no rodapé. Até o arquivo oficial chegar, o selo é um espaço reservado tracejado em kraft-600 — é marcador, não o desenho do selo.

### Navigation
Nas telas de entrada, só o header da lista (placa, nome, Sair) e os links entre login e cadastro. Na mesa, o header leva "← Mesas", a etiqueta com o nome da mesa, o sistema em label grafite-300, a conexão, o convite (só o dono), o nome e Sair; as vistas do mestre (Mesa, Mapas) ficam na pasta de folhas esquerda; o painel direito tem Ficha, Chat e, só para o mestre, NPCs. Na apresentação, header fixo com a placa, "Como funciona" e Entrar. Links sobre papel: tinta-900 em negrito com sublinhado de 2px; sobre o arquivo: kraft-300 com sublinhado kraft-600.

## Do's and Don'ts

### Do:
- **Do** envolver toda tela em `.mundo-arquivo` (fundo arquivo-900, texto grafite-100, Archivo, números tabulares) e montar as classes a partir de `ui/estilosArquivo.ts`.
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
- **Do** montar a ficha como uma Folha só, com seções em linhas pautadas e divisórias de fichário (tinta-900 ativa, papel-200 inativa).
- **Do** usar as tintas de recurso só no preenchimento das barras de Vida, Sanidade e Esforço, e as marcas de elemento só no quadradinho ao lado do nome escrito do elemento.
- **Do** deixar a perícia destreinada quieta e a treinada em negrito, com o teste datilografado vindo do backend.
- **Do** distinguir tokens pela borda (papel-50 agente, carimbo-300 NPC, grafite-400 objeto) e manter o disco com pelo menos 28px e a letra com pelo menos 12px em qualquer zoom.
- **Do** manter as ferramentas do mapa em barras flutuantes arquivo-900 com botões de 40px, a ligada em kraft-400 chapado.
- **Do** mostrar rolagens como bilhete de papel com o total grande e as mensagens direto no escuro, sem balão.

### Don't:
- **Don't** usar vermelho de carimbo em botão, link, cursor, foco ou qualquer ação.
- **Don't** usar sinal-vivo fora do indicador de conexão.
- **Don't** usar Courier Prime para instruções, rótulos, placeholders ou mensagens.
- **Don't** usar sigilos, símbolos, logos, ilustrações ou qualquer arte da Ordem Paranormal oficial; o mundo é arquivo de investigação genérico.
- **Don't** montar listas como grade de cards cinza com botão colorido; mesas são pastas.
- **Don't** reintroduzir zinc ou violeta; o visual antigo (`ui/estilos.ts`) foi apagado quando o mapa e o chat migraram, e violeta não é mais a cor primária.
- **Don't** desenhar peças de papel redondas; círculo é só para token, ponto de conexão e spinner.
- **Don't** mostrar a aba de NPCs, as estatísticas de NPC ou a lista de mapas ao jogador; ele vê só o nome do token e o mapa ativo.
- **Don't** usar tinta de recurso ou marca de elemento como cor de ação, de foco, de aba ou como carimbo; nem aproximar a Vida do vermelho de carimbo.
- **Don't** marcar elemento com faixa colorida na lateral do card; o elemento é um quadradinho mais o nome escrito.
- **Don't** aninhar cards dentro da ficha.
- **Don't** desenhar os sigilos dos elementos nem a arte da ficha oficial no círculo de atributos; dela vem só a disposição.
- **Don't** usar `window.confirm` nem modal próprio sem `<dialog>`.
- **Don't** adicionar gradiente decorativo, brilho, vidro ou bisel; gradiente só como véu de legibilidade sobre foto, máscara de transbordo ou a grade pontilhada do tampo do mapa.
