# Módulo rtc

Entrega ao cliente a lista de servidores ICE (STUN/TURN) do WebRTC. Tem só `rtc.routes.ts`, com a lógica inline — sem controller nem service.

## Rotas

Montado em `/rtc` (`server.ts`).

| Método | Caminho | Quem pode | O que faz |
|---|---|---|---|
| GET | `/rtc/config` | autenticado | Devolve `{ iceServers, turnConfigurado }`. |

## Regras

- Sempre inclui o STUN público `stun:stun.l.google.com:19302`.
- Se `TURN_URL` estiver no ambiente, acrescenta um servidor TURN com `TURN_USERNAME` e `TURN_CREDENTIAL`; a credencial fica fora do código.
- `turnConfigurado` é `true` só quando `TURN_URL` existe.
- A sinalização do PeerJS (`/peerjs`) não está neste módulo; é montada direto em `server.ts`.
- Nenhum evento em tempo real.

## Dependências

- `middlewares/auth.ts` — `autenticar` na rota (`401` sem token válido).
- Variáveis de ambiente `TURN_URL`, `TURN_USERNAME`, `TURN_CREDENTIAL`.

## Testes

Sem testes automatizados.
