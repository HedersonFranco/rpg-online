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

// Tira um usuário da sala em tempo real (expulso ou banido): avisa as abas dele, remove-as da sala
// de socket e do vídeo, e reenvia a presença de vídeo para quem ficou. Sem isso, a aba aberta de
// quem saiu continuaria recebendo e mandando eventos da mesa até recarregar.
export async function expulsarDaSala(salaId: string, usuarioId: string, motivo: 'expulso' | 'banido') {
  if (!servidor) return
  const sala = nomeSalaSocket(salaId)
  const sockets = await servidor.in(sala).fetchSockets()
  for (const s of sockets) {
    if (s.data.usuarioId !== usuarioId) continue
    s.emit('sala:removido', { salaId, motivo })
    s.leave(sala)
    s.data.salaId = undefined
    s.data.video = undefined
  }
  const restantes = await servidor.in(sala).fetchSockets()
  const participantes = restantes
    .filter((s) => s.data.video)
    .map((s) => ({ usuarioId: s.data.usuarioId, nome: s.data.nome, peerId: s.data.video.peerId, temCamera: s.data.video.temCamera }))
  servidor.to(sala).emit('video:participantes', { participantes })
}
