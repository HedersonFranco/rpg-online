import { createContext } from 'react'
import type { Usuario } from '../services/tipos'

export type EstadoAuth =
  | { status: 'carregando' }
  | { status: 'erro'; mensagem: string }
  | { status: 'anonimo' }
  | { status: 'autenticado'; usuario: Usuario }

export type ValorAuth = {
  estado: EstadoAuth
  entrar: (email: string, senha: string) => Promise<void>
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>
  sair: () => void
  tentarNovamente: () => void
}

export const AuthContext = createContext<ValorAuth | null>(null)
