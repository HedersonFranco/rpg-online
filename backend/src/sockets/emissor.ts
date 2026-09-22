import type { Server } from 'socket.io'
import { nomeSalaSocket } from './estado.js'

// Separado de io.ts de propósito: os services importam só isto, sem puxar
// salaSocket.ts (que importa services) — evita dependência circular.
let servidor: Server | null = null

export function registrarServidorSocket(io: Server) {
  servidor = io
}

// Usado pelos services REST depois de gravar — a escrita continua passando
// pela validação do REST; o socket só distribui o resultado pra sala.
export function emitirParaSala(salaId: string, evento: string, dados: unknown) {
  servidor?.to(nomeSalaSocket(salaId)).emit(evento, dados)
}
