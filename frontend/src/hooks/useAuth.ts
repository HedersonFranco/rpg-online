import { useContext } from 'react'
import { AuthContext } from './authContext'

export function useAuth() {
  const valor = useContext(AuthContext)
  if (!valor) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return valor
}

// Pra telas que só renderizam depois do RotaProtegida — o usuário já existe ali.
export function useUsuarioLogado() {
  const { estado } = useAuth()
  if (estado.status !== 'autenticado') throw new Error('useUsuarioLogado usado fora de rota protegida')
  return estado.usuario
}
