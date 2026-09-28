---
name: RPG Online
description: Mesa de RPG online para Ordem Paranormal; telas de entrada no mundo "Dossiê de caso".
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
typography:
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
  button-arquivo:
    textColor: "{colors.grafite-100}"
    typography: "{typography.label}"
    rounded: "{rounded.folha}"
    padding: "0 12px"
    height: "40px"
  button-arquivo-hover:
    textColor: "{colors.kraft-300}"
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
  carimbo:
    textColor: "{colors.carimbo-900}"
    typography: "{typography.label}"
    rounded: "{rounded.carimbo}"
    padding: "2px 8px"
  placa-gaveta:
    backgroundColor: "{colors.papel-100}"
    textColor: "{colors.tinta-900}"
    typography: "{typography.label}"
    rounded: "{rounded.etiqueta}"
    padding: "2px 10px"
---

# Design System: RPG Online

> **Escopo atual.** O mundo "Dossiê de caso" vale hoje **só nas telas de entrada**: login, cadastro, lista de mesas, convite, 404 e a checagem de sessão (`RotaProtegida`/`RotaPublica`). **A tela de mesa (`/salas/:id`) ainda não migrou**: `pages/Sala` e os componentes de `MapaToken`, `Video`, `TurnoTracker`, `FichaOrdemParanormal` e `Chat` continuam no visual antigo zinc/violeta do Tailwind (`ui/estilos.ts`), que **não** é o sistema e não deve ser copiado para telas novas. A migração da mesa é uma etapa posterior; até lá, o `body` global continua em zinc e cada tela do arquivo se envolve em `.mundo-arquivo`.

## Overview

**Creative North Star: "Dossiê de caso"**

Cada mesa é um caso aberto num arquivo de investigação. A interface é um móvel de arquivo escuro, quase preto, onde as mesas são pastas kraft suspensas, com aba de classificação e etiqueta de papel; o que se preenche fica numa folha de papel por cima. A ação é tinta; o estado é carimbo. O mundo recusa o painel de SaaS (grade de cards cinza com botão colorido): nada aqui é "tile", tudo é um objeto de papelaria com material, fibra e peso.

A densidade é baixa e a hierarquia é tipográfica: títulos grandes em Archivo condensado e caixa alta, etiquetas espaçadas, e o que é registro (valores digitados, datas) sai datilografado em Courier Prime. O material aparece por uma fibra de ruído muito fraca no papel e no kraft e por sombras difusas sob as pastas e folhas, nunca por brilho, gradiente ou vidro.

É uma ferramenta de fã sem vínculo oficial: o mundo evoca o arquivo de investigação sem usar nenhum sigilo, símbolo, logo ou arte da Ordem Paranormal oficial.

**Key Characteristics:**
- Fundo de arquivo escuro, pastas kraft, folhas de papel, tinta quase preta e vermelho de carimbo.
- Archivo com eixo de largura: condensado (72%) em títulos, rótulos, botões e abas.
- Courier Prime só no que é datilografado: valores digitados e datas.
- Vermelho de carimbo só para estado, nunca para ação.
- Movimento único: a pasta sobe um pouco da gaveta no hover/foco.

## Colors

Uma paleta de papelaria sobre metal escuro: neutros quentes de papel e kraft, uma tinta quase preta que faz o papel da cor primária, e um único vermelho reservado para estado.

### Primary
- **Tinta de Escritório** (tinta-900): a cor da ação. Preenchimento do botão principal numa folha, contorno do secundário, texto sobre papel e kraft, linha de preenchimento focada, cursor de texto, seta do select. Tons de apoio: **Tinta Gasta** (tinta-700) no hover do botão, em rótulos e textos de ajuda; **Tinta Rala** (tinta-600) na linha do campo em repouso e nos placeholders.

### Secondary
- **Kraft de Pasta** (kraft-500): o corpo e a aba das pastas das mesas e da pasta aberta do login. Não é cor de ação: é material. **Kraft Claro** (kraft-300/400) é o destaque sobre o arquivo escuro: links, hover do botão do arquivo, anel de foco das pastas, seleção de texto. **Kraft Queimado** (kraft-700) desenha o contorno tracejado da pasta vazia; kraft-600 é o sublinhado dos links.

### Tertiary
- **Tinta de Carimbo** (carimbo-900): o carimbo de estado (papel na mesa, "Sem acesso", "Não arquivado"), com borda dupla e falhas de entintamento. Sobre kraft dá cerca de 4,9:1; sobre papel, cerca de 8,9:1. **Carimbo Vivo** (carimbo-800) é o texto e a borda do alerta de erro numa folha, sobre **Rosa de Borrão** (carimbo-100). No arquivo escuro, o alerta usa carimbo-800 translúcido com texto carimbo-100 e borda carimbo-300. carimbo-600 existe na escala mas não é usado como texto.

### Neutral
- **Gaveta de Arquivo** (arquivo-900): o fundo de todas as telas do mundo. arquivo-950 no header translúcido; arquivo-700 nos divisores; arquivo-600 na placa de metal, na borda do botão do arquivo e na barra de rolagem. arquivo-850/800 ficam na escala para superfícies intermediárias.
- **Grafite Claro** (grafite-100): texto principal sobre o arquivo escuro. **Grafite Médio** (grafite-300) para texto secundário (nome do usuário, contagem de mesas, carregando). grafite-400 fica para texto terciário.
- **Papel de Folha** (papel-100): as folhas de formulário e a placa da gaveta. **Papel Novo** (papel-50) nas etiquetas das pastas, no fundo do campo (70% em repouso, cheio no foco) e no texto do botão de tinta. papel-200/300 ficam na escala.

### Named Rules
**The Carimbo é Estado Rule.** O vermelho de carimbo marca só estado: o papel da pessoa numa mesa, erro, acesso negado. Nunca pinta botão, link, cursor, foco ou qualquer ação.

**The Tinta Age Rule.** Numa folha, quem age é a tinta: ação principal em tinta chapada (tinta-900), secundária em contorno de tinta. Sobre o arquivo escuro, a ação é borda grafite que esquenta para kraft no hover.

**The Carimbo Legível Rule.** Carimbo usa sempre carimbo-900 (≥ 4,5:1 sobre kraft e papel). Os tons mais claros da escala não servem de texto de carimbo.

## Typography

**Display Font:** Archivo, com eixo de largura (Google Fonts, `wdth` 62–125, `wght` 400–800), fallback ui-sans-serif, system-ui
**Body Font:** Archivo em largura normal
**Label/Mono Font:** Courier Prime (400/700), fallback ui-monospace

**Character:** Archivo condensado dá a voz de etiqueta e cabeçalho de dossiê, apertada e em caixa alta; Courier Prime é a máquina de escrever que preenche o formulário. Os números são tabulares em todo o mundo (`font-variant-numeric: tabular-nums`).

### Hierarchy
- **Display** (800, 3rem → 3.75rem a partir de 640px, line-height 1, tracking -0.01em, caixa alta, condensado): o título da tela ("Suas mesas").
- **Headline** (800, 1.875rem, line-height 1, caixa alta, condensado): título de folha ("Criar mesa", "Entrar com convite", 404, convite). O título do login/cadastro sobe para 2.25rem.
- **Title** (700, 1.25rem, line-height 1.25, condensado): o nome da mesa na etiqueta da pasta; quebra palavra em nomes longos (~60 caracteres).
- **Body** (400, 0.875rem): subtítulos, ajuda de campo (0.75rem), contagem, texto de estado vazio.
- **Label** (700, 0.75rem, tracking 0.12em, caixa alta, condensado): rótulos de campo e abas de pasta. Botões usam o mesmo desenho em 0.875rem e tracking 0.1em; a placa da gaveta, 0.875rem com tracking 0.16em.
- **Datilo** (Courier Prime 400, 1rem nos campos, 0.875rem nas datas): o valor digitado em campo e select escolhido, e a linha de registro da pasta ("Aberta em 28/09/2026").

### Named Rules
**The Datilografado Rule.** Courier Prime só no que é datilografado: valores que a pessoa digitou e datas de registro. Instrução, rótulo, placeholder, select sem escolha e mensagem vão em Archivo.

**The Condensado Rule.** Largura 72% é para títulos, rótulos, botões, abas e etiquetas. Texto corrido fica em largura normal.

## Layout

Mobile-first nas telas de entrada; 375px sem rolagem horizontal. Conteúdo em coluna central de até 64rem (lista) ou 28rem (login, cadastro, convite, 404), com respiro lateral de 16px. Header da lista em faixa fina: placa da gaveta à esquerda, nome e Sair à direita.

As pastas das mesas formam uma grade de 1 coluna no celular, 2 a partir de 640px e 3 a partir de 1024px, com 20px entre colunas e 32px entre linhas (a aba precisa de ar). Abaixo, as duas folhas de formulário ficam lado a lado a partir de 768px, alinhadas pelo topo. Seções separadas por 48px; título da tela a 32px das pastas. Dentro das peças: pasta com 16px, folha com 20px (24px a partir de 640px), campos empilhados a 16px.

Telas de passagem (login, cadastro, convite, 404, checagem de sessão) são uma pasta aberta centralizada vertical e horizontalmente, com a folha por cima.

## Elevation & Depth

Profundidade por material e sombra difusa, sem brilho. Pastas e folhas pousam sobre o arquivo com sombras largas, negativas no espalhamento e escuras, como papel sobre metal; a etiqueta da pasta tem uma sombra de contato mínima. A fibra (ruído SVG a ~9% de opacidade) no papel, no kraft e na placa é o que impede o material de parecer plástico. A placa da gaveta é uma moldura plana de metal, sem bisel.

### Shadow Vocabulary
- **Pasta pousada** (`box-shadow: 0 12px 24px -14px rgb(0 0 0 / 0.9)`): corpo da pasta kraft.
- **Folha pousada** (`box-shadow: 0 10px 24px -12px rgb(0 0 0 / 0.8)`): folhas de formulário.
- **Etiqueta colada** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.25)`): etiqueta de papel com o nome da mesa.

### Named Rules
**The Gaveta Rule.** O único movimento do mundo é a pasta subir 4px da gaveta no hover e no foco (180ms, `cubic-bezier(0.16, 1, 0.3, 1)`). Com `prefers-reduced-motion`, a pasta não se desloca.

## Shapes

Cantos quase retos, de papelaria: campo sem raio nenhum (é uma linha de preenchimento), etiqueta 2px, carimbo e placa 3px, folha e botão 4px, pasta 5px. A silhueta que define o mundo é a **aba da pasta suspensa**: uma lingueta no topo esquerdo, com o ombro direito cortado em diagonal de 12px, colada ao corpo da pasta, que por isso não tem raio no canto superior esquerdo. O carimbo é a única peça torta (−4°), com borda dupla de 3px e máscara de ruído que simula falha de tinta. Sem pílulas, sem círculos, sem cantos generosos.

## Components

### Buttons
Firmes e impressos, em caixa alta condensada.
- **Shape:** cantos de 4px, altura mínima de 44px (alvo de toque), 20px de respiro lateral.
- **Tinta (primário numa folha):** tinta-900 chapada, texto papel-50; hover em tinta-700. Um por folha.
- **Contorno (secundário numa folha):** borda de 2px em tinta-900, texto tinta-900; hover com véu de tinta a 10%.
- **Arquivo (sobre o fundo escuro, ex.: Sair):** borda de 1px arquivo-600, texto grafite-100, altura 40px; hover leva borda e texto ao kraft.
- **Focus:** contorno de 2px afastado 2px, em tinta-900 no papel e kraft-400 no arquivo.
- **Envio:** o rótulo troca para o gerúndio ("Criando...", "Entrando...") e o spinner só aparece após 300ms; desabilitado cai para 60% de opacidade.

### Cards / Containers
- **Pasta** (a mesa): corpo kraft-500 com aba de classificação (o sistema da mesa), etiqueta de papel papel-50 com o nome, linha datilografada com data e "Criada por você", e o carimbo do papel no canto inferior direito. O link inteiro é a pasta; foco com anel kraft-300 afastado 4px.
- **Folha:** papel-100 com fibra, cantos de 4px, sombra de folha pousada, 20/24px de respiro. Contém formulários e mensagens de passagem.
- **Pasta vazia:** o contorno tracejado (2px, kraft-700) de uma pasta com aba, no mesmo desenho das cheias, com a mensagem de gaveta vazia dentro.

### Inputs / Fields
- **Style:** linha de preenchimento: sem raio, sem bordas laterais, só a linha inferior de 2px em tinta-600 sobre papel-50 a 70%. O valor sai em Courier Prime; o placeholder, em Archivo menor e tinta-600.
- **Focus:** linha em tinta-900, fundo papel-50 cheio e contorno de foco de 2px em tinta-900.
- **Select:** mesma linha, seta desenhada em tinta; sem escolha, o texto é instrução em Archivo; escolhido, vira datilografado.
- **Rótulo:** Label condensado em tinta-700, acima do campo.
- **Error / Disabled:** erro vai num alerta abaixo dos campos (ver Alerta); desabilitado a 60%.

### Alerta
Três tons conforme o chão: **papel** (dentro de uma folha: borda 2px carimbo-800 sobre carimbo-100), **arquivo** (sobre o fundo escuro: carimbo-800 a 25% com borda carimbo-300 a 50% e texto carimbo-100) e **mesa** (o tom zinc/vermelho antigo, só para a mesa ainda não migrada). "Tentar novamente" usa o botão secundário do chão correspondente.

### Carimbo (Signature Component)
Marca de estado em tinta de carimbo: caixa alta condensada, borda dupla de 3px em carimbo-900, rotação de −4°, máscara de ruído de entintamento. Usos atuais: papel na mesa ("Mestre"/"Jogador"), "Sem acesso" no convite inválido, "Não arquivado" no 404.

### Placa da gaveta (Signature Component)
A identificação do produto: etiqueta de papel papel-100 com fibra, em caixa alta condensada (tracking 0.16em), numa moldura plana de metal arquivo-600 de 3px. É o único "logo"; o nome é provisório e não deve virar identidade.

### Navigation
Não há navegação própria nas telas de entrada além do header da lista (placa, nome, Sair) e dos links entre login e cadastro. Links sobre papel: tinta-900 em negrito com sublinhado de 2px; sobre o arquivo: kraft-300 com sublinhado kraft-600.

## Do's and Don'ts

### Do:
- **Do** envolver toda tela do mundo em `.mundo-arquivo` (fundo arquivo-900, texto grafite-100, Archivo, números tabulares).
- **Do** usar tinta chapada (tinta-900) para a ação principal de uma folha e contorno de tinta para a secundária.
- **Do** usar carimbo-900 para o carimbo de estado (≈ 4,9:1 sobre kraft-500).
- **Do** escrever títulos, rótulos, botões e abas em Archivo condensado (72%) e caixa alta.
- **Do** reservar Courier Prime para valores digitados e datas de registro.
- **Do** manter o único movimento na pasta que sobe 4px, respeitando `prefers-reduced-motion`.
- **Do** manter botões e alvos com pelo menos 44px de altura nas folhas.

### Don't:
- **Don't** usar vermelho de carimbo em botão, link, cursor, foco ou qualquer ação.
- **Don't** usar Courier Prime para instruções, rótulos, placeholders ou mensagens.
- **Don't** usar sigilos, símbolos, logos, ilustrações ou qualquer arte da Ordem Paranormal oficial; o mundo é arquivo de investigação genérico.
- **Don't** montar a lista como grade de cards cinza com botão colorido; mesas são pastas.
- **Don't** copiar o visual zinc/violeta da mesa (`ui/estilos.ts`) para telas novas; ele é legado até a migração.
- **Don't** adicionar gradientes, brilho, vidro ou bisel; profundidade é sombra difusa e fibra.
