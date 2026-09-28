# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primário: grupos de amigos.** Um mestre e até 5 jogadores que já se conhecem e jogam Ordem Paranormal à
distância, em campanhas recorrentes. O mestre prepara o material (mapas, NPCs, pastas) antes da sessão; os
jogadores entram pelo link de convite, montam a própria ficha e jogam.

**Secundário: comunidade aberta.** Pessoas que jogam com desconhecidos (one-shots, mesas montadas em
comunidades). Para elas pesa o primeiro contato: entrar pelo link e entender a mesa sem explicação.

**Quando os dois pedirem coisas diferentes, o grupo de amigos tem prioridade** — profundidade da ficha,
preparação do mestre e campanha longa vêm antes de conveniências de mesa avulsa.

Papel (mestre/jogador) é por usuário+sala, não por perfil: a mesma pessoa é mestre numa mesa e jogadora em outra.

## Product Purpose

Mesa de RPG online para Ordem Paranormal: vídeo/áudio, mapa com tokens, ficha de personagem, chat, rolagem de
dados e controle de turno no mesmo lugar. Produto real, para lançamento — não portfólio nem MVP descartável.

Sucesso: uma sessão inteira acontece sem ninguém precisar sair da aba — nem para o Discord (voz), nem para um
VTT (mapa), nem para uma ferramenta de ficha.

## Positioning

- **Tudo numa aba só.** Vídeo, mapa, ficha e chat juntos. O concorrente real é a combinação
  Discord + Owlbear Rodeo + C.R.I.S. aberta ao mesmo tempo.
- **As duas edições no mesmo lugar.** Cada mesa escolhe, na criação, entre Ordem Paranormal RPG (v1.3) e
  Ordem Paranormal RPG II (Playtest Alpha, Ago/2026). São jogos com mecânicas diferentes; a ficha herda o
  sistema da mesa e não há conversão entre eles.

## Operating Context

- Sessões ao vivo com até 6 pessoas (1 mestre + 5 jogadores) conectadas ao mesmo tempo.
- O mestre é quem opera mais: inicia combate informando a iniciativa de cada participante, cria e remove
  tokens, escolhe o mapa ativo, edita qualquer ficha da mesa.
- O jogador edita só as próprias fichas e move só o token da própria ficha.
- Mudanças aparecem para toda a mesa em tempo real (ficha, chat, rolagem, turno, tokens).
- A tela de mesa é usada em desktop (mínimo 1280px); login, cadastro e lista de mesas precisam funcionar
  no celular.
- Câmera é opcional: sem ela (recusada ou ausente) a mesa continua em texto + mapa.

## Capabilities and Constraints

- **Ficha OP1:** NEX em 20 degraus (5–99%), classe, 5 atributos (0–5), 28 perícias com grau de treino,
  rituais/habilidades/poderes/equipamentos cadastrados pelo próprio jogador, inventário em texto livre.
  PV/PE/Sanidade máximos e testes de perícia são calculados **só pelo servidor**, pela fórmula do livro —
  a interface nunca calcula, só exibe.
- **OP2:** sem fórmula publicada no playtest; PV/PD atribuídos direto. Ficha de OP2 ainda não tem interface.
- **Rolagem:** feita no servidor (ninguém escolhe o resultado), não é persistida.
- **Combate:** estado efêmero em memória; se o servidor reiniciar, a interface avisa
  ("Sessão reiniciada — reinicie o combate").
- **Requisitos de UX não negociáveis:** toda falha mostra mensagem clara (nunca tela branca); operação acima
  de 300ms mostra carregamento; toda ação destrutiva pede confirmação; todo texto do usuário é sanitizado.
- **Tema escuro é o padrão.** Tema claro é pós-lançamento.
- **Fora da v1:** ferramentas de anotação no mapa, mapas com vários pisos, histórico de rolagens, outros
  sistemas além de Ordem Paranormal.
- **Seções ainda não implementadas:** Biblioteca, Notas e NPCs (na navegação da mesa); sessão ativa no header.

## Brand Commitments

- **Nome provisório.** "RPG Online" vai mudar; não construir identidade em cima dele.
- **Ferramenta de fã, sem vínculo oficial** com a Jambô ou com os criadores de Ordem Paranormal. Não pode
  usar logo, arte, ilustrações ou qualquer elemento que faça parecer produto oficial. Estrutura de regras e
  nomes de mecânicas (NEX, Sanidade, elementos) podem aparecer; arte protegida, não.
- Referências de qualidade (não de identidade): **Owlbear Rodeo** para mapa/tokens/biblioteca e
  **C.R.I.S.** para a ficha.
- Interface em português do Brasil.
- **Código fechado.** O repositório no GitHub é público só como portfólio (leitura e avaliação); todos os
  direitos reservados (`LICENSE`). Ninguém pode usar, hospedar ou redistribuir o código. O produto em si
  continua sendo para lançamento.

## Evidence on Hand

- Livro Ordem Paranormal RPG v1.3 e PDF do Playtest Alpha de OP2 — fontes das regras implementadas.
- `docs/referencias/` (fora do Git): ficha oficial editável em PDF e print do RPGpédia — referências de
  estrutura e estilo de terceiros, **não** para copiar arte.
- Não existem usuários, depoimentos, métricas de uso, preços nem imprensa. Nada disso pode ser inventado.

## Product Principles

1. **A mesa recorrente vem primeiro.** Na dúvida, servir a campanha longa do grupo de amigos, não a
   one-shot com desconhecidos.
2. **Uma aba basta.** Cada coisa que obriga a mesa a abrir outra ferramenta é uma falha do produto.
3. **O servidor é a fonte da verdade.** Valores calculados, rolagens e permissões vêm do backend; a
   interface mostra e pede, nunca decide.
4. **Nunca quebra em silêncio.** Erro, carregamento, queda de conexão e reinício do servidor sempre
   aparecem para quem está jogando.
5. **Vídeo é conforto, não requisito.** Sem câmera, sem microfone ou com conexão ruim, a sessão continua.

## Accessibility & Inclusion

Nenhum requisito formal definido ainda. Navegadores-alvo: Chrome, Firefox, Edge 120+ e Safari 17+.
