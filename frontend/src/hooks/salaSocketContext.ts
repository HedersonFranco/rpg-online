import { createContext } from 'react'
import type { Socket } from 'socket.io-client'
import type { AvisoRolagem, Combate, Rolagem } from '../services/tipos'

export type StatusConexao = 'conectando' | 'conectado' | 'reconectando'

export type ValorSalaSocket = {
  socket: Socket
  status: StatusConexao
  // Incrementa a cada (re)entrada bem-sucedida na sala: quem mostra dados do REST revalida.
  sincronia: number
  combate: Combate | null
  aviso: string | null
  limparAviso: () => void
  rolagens: Rolagem[]
  avisosRolagem: AvisoRolagem[]
  // Mestre: avisar os jogadores (com uma frase, sem resultado) quando rolar em segredo. Fica neste navegador.
  avisarRolagem: boolean
  setAvisarRolagem: (avisar: boolean) => void
  emitir: <T = Record<string, unknown>>(evento: string, dados?: unknown) => Promise<T>
}

export const SalaSocketContext = createContext<ValorSalaSocket | null>(null)
