---
version: 1
slug: "frontend-src-pages-listasalas-listasalas-tsx"
primary_target: "frontend/src/pages/ListaSalas/ListaSalas.tsx"
related_targets: ["frontend/src/pages/Login/Login.tsx","frontend/src/pages/Cadastro/Cadastro.tsx","frontend/src/pages/Convite/Convite.tsx"]
---

# Entrada: login, cadastro, lista de mesas e convite

Modo: Operate. Primeiro contato da comunidade aberta (login/cadastro) e ponto de partida semanal do grupo de amigos (lista). Tarefa: entrar na mesa certa em um clique; criar mesa (máx. 3 como dono) ou entrar por convite. Mesa (`/salas/:id`) fica fora deste escopo.

Estados: carregando (só após 300ms), erro com "Tentar novamente", backend fora do ar, lista vazia, limite de 3 mesas, convite inválido/expirado, envio em andamento. Nomes de mesa até ~60 caracteres. Mobile-first, 375px sem scroll horizontal.

Abertos: nome definitivo do produto (hoje "RPG Online", provisório).

## Direction contract

THESIS: Cada mesa é um caso aberto num arquivo de investigação. A tela recusa o painel de SaaS (grade de cards cinza + botão colorido): as mesas são pastas kraft num arquivo escuro, não tiles.

OWN-WORLD: Fundo de arquivo quase preto (#16181a), pastas kraft (#c9a36b) com aba, etiquetas e folhas de papel (#e8e2d4) onde se preenche, tinta quase preta para ação primária, vermelho de carimbo (#c2352b) só para estado (papel na mesa, erro). Archivo com eixo de largura (condensado nas etiquetas e títulos), Courier Prime só no que é datilografado (valores digitados, datas). Nenhum símbolo, sigilo ou arte da Ordem oficial.

STORY: A pessoa entende que ali estão os casos dela, qual papel tem em cada um (carimbo) e onde abrir um novo ou entrar num existente pelo convite.

FIRST VIEWPORT: Lista: placa de gaveta "RPG Online" à esquerda do topo, nome e Sair à direita; título "Suas mesas" condensado e grande; logo abaixo, as pastas lado a lado (1 coluna no celular, 2–3 no desktop), cada uma com aba de classificação (sistema), etiqueta com o nome, data datilografada e carimbo do papel. Abaixo, duas folhas de formulário: Criar mesa (ação primária em tinta) e Entrar com convite. Login: uma pasta aberta centralizada, aba com o nome do produto, folha de acesso com os campos.

FORM: Dossiê de caso — candidato 1 da lista ordenada (escolha do usuário, IMPECCABLE'S PICK); seed 0d87877d.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
