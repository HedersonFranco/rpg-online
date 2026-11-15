import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { verificarToken } from '../lib/jwt.js'
import { registrarServidorSocket } from './emissor.js'
import { registrarEventosDaSala } from './salaSocket.js'

const EVENTOS_POR_SEGUNDO = 60

export function iniciarSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
    // Queda de rede é detectada em até ~15s (10s + 5s); somado ao backoff de
    // reconexão do cliente (máx. 5s), fica dentro da meta de 30s.
    pingInterval: 10_000,
    pingTimeout: 5_000,
  })

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (typeof token !== 'string') throw new Error('sem token')
      const { usuarioId, exp } = verificarToken(token)
      socket.data.usuarioId = usuarioId
      socket.data.expiraEm = exp * 1000
      next()
    } catch {
      next(new Error('nao_autenticado'))
    }
  })

  io.on('connection', (socket) => {
    // O JWT expira, a conexão não: sem isto, uma aba aberta seguiria na mesa para sempre. O cliente
    // tenta reconectar, o token vencido é recusado no aperto de mão e a aba volta para o login.
    const prazo = setTimeout(() => socket.disconnect(true), socket.data.expiraEm - Date.now())
    socket.on('disconnect', () => clearTimeout(prazo))

    // Teto por conexão contra flood. O uso mais intenso é arrastar token (~30 eventos/s).
    let inicioJanela = 0
    let eventosNaJanela = 0
    socket.use((pacote, next) => {
      const agora = Date.now()
      if (agora - inicioJanela >= 1000) {
        inicioJanela = agora
        eventosNaJanela = 0
      }
      if (++eventosNaJanela <= EVENTOS_POR_SEGUNDO) return next()
      const ack = pacote.at(-1)
      if (typeof ack === 'function') ack({ ok: false, erro: 'Muitas ações seguidas. Espere um instante.', status: 429 })
    })

    registrarEventosDaSala(socket)
  })
  registrarServidorSocket(io)
  return io
}
