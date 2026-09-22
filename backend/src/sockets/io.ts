import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { verificarToken } from '../lib/jwt.js'
import { registrarServidorSocket } from './emissor.js'
import { registrarEventosDaSala } from './salaSocket.js'

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
      socket.data.usuarioId = verificarToken(token).usuarioId
      next()
    } catch {
      next(new Error('nao_autenticado'))
    }
  })

  io.on('connection', (socket) => registrarEventosDaSala(socket))
  registrarServidorSocket(io)
  return io
}
