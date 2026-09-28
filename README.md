# RPG Online — mesa virtual para Ordem Paranormal

Mesa de RPG à distância feita para **Ordem Paranormal**: vídeo e áudio, mapa com tokens, ficha de
personagem, chat, rolagem de dados e controle de turno no mesmo lugar. A ideia é que uma sessão inteira
aconteça sem ninguém precisar abrir Discord, um VTT e uma ferramenta de ficha ao mesmo tempo.

Cada mesa escolhe, na criação, entre as duas edições do jogo: **Ordem Paranormal RPG (v1.3)** e
**Ordem Paranormal RPG II (Playtest Alpha)**.

> **Código fechado — todos os direitos reservados.** O repositório está público só para leitura e
> avaliação (portfólio); não é permitido usar, copiar, hospedar ou redistribuir. Ver [Licença](#licença).
>
> Projeto de fã, sem vínculo com a Jambô Editora nem com os criadores de Ordem Paranormal.
> Não usa logo, arte ou material protegido da obra. "RPG Online" é um nome provisório.

<p align="center">
  <img src="docs/screenshots/mesas.png" alt="Lista de mesas: cada mesa é uma pasta kraft com o sistema na aba e um carimbo com o papel do usuário (mestre ou jogador)" width="100%">
</p>

## O que já funciona

- **Contas e mesas.** Cadastro e login (JWT); cada pessoa é dona de até 3 mesas e participa de quantas quiser.
  Convite por link, que expira em 7 dias. O papel (mestre ou jogador) é por mesa, não por perfil.
- **Ficha de Ordem Paranormal (v1.3).** NEX, classe, atributos, 28 perícias com grau de treino, rituais,
  habilidades, poderes, equipamentos e inventário. **PV, PE, Sanidade e testes de perícia são calculados pelo
  servidor** com a fórmula do livro — a interface só exibe.
- **Tempo real.** Mudanças na ficha, chat, rolagens e turnos aparecem para a mesa inteira na hora
  (Socket.IO). A rolagem é feita no servidor: ninguém escolhe o resultado.
- **Combate.** O mestre informa a iniciativa; a barra de turno mostra quem age e a fila. Só o jogador da vez
  ou o mestre encerram o turno.
- **Mapa e tokens.** Upload de mapa (até 10 MB, tipo verificado pelos bytes), tokens ligados a fichas ou
  NPCs, arrastar em tempo real, zoom e pan por mouse e por toque.
- **Vídeo.** Chamada P2P (WebRTC/PeerJS) para até 6 pessoas, com reconexão automática. Câmera é opcional:
  sem ela, a mesa segue em texto e mapa.
- **Reconexão.** Queda de rede ou reinício do servidor não deixa ninguém numa tela quebrada: o cliente
  reconecta sozinho e avisa quando o combate precisa ser reiniciado.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/login.png" alt="Tela de login: uma pasta aberta com a folha de acesso"></td>
    <td width="50%"><img src="docs/screenshots/mesa.png" alt="Mesa: mapa ao centro, vídeo no topo, ficha com atributos e barras de Vida, Sanidade e Esforço à direita"></td>
  </tr>
  <tr>
    <td align="center">Login</td>
    <td align="center">Mesa (ainda no visual anterior — em migração)</td>
  </tr>
</table>

## Status

Desenvolvido em 11 etapas, cada uma com critérios verificáveis (o detalhe fica em [`CLAUDE.md`](CLAUDE.md)).

| # | Etapa | Status |
|---|---|---|
| 1 | Setup e configuração | ✅ |
| 2 | Modelagem no Prisma, migrations e seeds | 🔄 falta o seed de progressão por classe |
| 3 | Autenticação (JWT, convite com expiração) | ✅ |
| 4 | Mesas e membros | ✅ |
| 5 | Motor de cálculo da ficha + testes | ✅ |
| 6 | CRUD de ficha | 🔄 OP1 pronto; ficha de OP2 ainda sem interface |
| 7 | NPCs e pastas | ✅ |
| 8 | Frontend consumindo a API | ✅ |
| 9 | Tempo real, turno e reconexão | ✅ |
| 10 | Mapa, tokens e webcam | 🔄 falta testar vídeo entre redes diferentes (exige TURN) |
| 11 | Polimento e documentação | ⬜ |

**Identidade visual:** as telas de entrada já usam o visual "Dossiê de caso" (arquivo escuro, pastas kraft,
carimbos — ver [`DESIGN.md`](DESIGN.md)). A mesa migra em seguida.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS v4, React Router |
| Backend | Node.js, Express 5, TypeScript 7 (`tsx`) |
| Tempo real | Socket.IO |
| Vídeo | WebRTC via PeerJS (sinalização no próprio backend) |
| Banco | PostgreSQL 16 (Docker) + Prisma 7 |
| Testes | Vitest |

## Como rodar localmente

Para quem estiver avaliando o projeto. Rodar localmente para avaliação não concede nenhum outro direito
de uso (ver [Licença](#licença)).

Pré-requisitos: Node.js 20.19+ (ou 22.12+) e Docker.

```bash
# 1. Banco (Postgres na porta 5433)
docker compose up -d

# 2. Backend — porta 3333
cd backend
cp .env.example .env        # ajuste DATABASE_URL e JWT_SECRET
npm install
npx prisma migrate deploy
npx prisma db seed          # classes e as 28 perícias (idempotente)
npm run dev

# 3. Frontend — porta 5173 (outro terminal)
cd frontend
npm install
npm run dev
```

Com o `docker-compose.yml` do projeto, a `DATABASE_URL` fica:
`postgresql://rpg_user:rpg_pass@localhost:5433/rpg_online?schema=public`.

Verificações: `curl http://localhost:3333/health` deve responder `{"status":"ok"}`; `npm test` no backend
roda os testes do motor de cálculo, da rolagem, do combate, do convite, da escala de dados de OP2 e do armazenamento de arquivos.

## Estrutura

```
backend/src/
  modules/     usuario, sala, ficha, npc, pasta, mapa, mensagem… (controller + service + routes)
  engine/      funções puras: cálculo da ficha, rolagem, combate, convite, dados de OP2
  sockets/     Socket.IO: auth, eventos da sala, estado em memória
frontend/src/
  pages/       Login, Cadastro, ListaSalas, Sala (a mesa), Convite
  components/  ficha, mapa e tokens, vídeo, chat, turno, ui/
  hooks/       auth, socket da mesa, vídeo, carregamento
  services/    api.ts (fetch), malhaVideo.ts (WebRTC), tipos
```

## Documentos do projeto

- [`PRODUCT.md`](PRODUCT.md) — para quem é, o que resolve e os compromissos de marca.
- [`DESIGN.md`](DESIGN.md) — o sistema visual: tokens, tipografia, componentes e regras.
- [`CLAUDE.md`](CLAUDE.md) — regras de negócio, decisões de arquitetura e os critérios de cada etapa.

## Licença

© 2026 Hederson Franco. **Todos os direitos reservados.** O RPG Online é um produto em desenvolvimento;
este repositório é público apenas para que o código possa ser lido como portfólio. Nenhuma permissão é concedida para usar, copiar, modificar, hospedar, implantar ou
redistribuir o código, no todo ou em parte, sem autorização prévia e por escrito. Texto completo em
[`LICENSE`](LICENSE).

---

Desenvolvido por [Hederson Franco](https://github.com/HedersonFranco).
