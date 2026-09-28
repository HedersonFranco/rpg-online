import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Alerta, Carregando } from './ui/Feedback'

function TelaCheia({ children }: { children: ReactNode }) {
  return <main className="mundo-arquivo flex items-center justify-center px-4">{children}</main>
}

export function RotaProtegida({ children }: { children: ReactNode }) {
  const { estado, tentarNovamente } = useAuth()
  const location = useLocation()

  if (estado.status === 'carregando') {
    return <TelaCheia><Carregando texto="Verificando sua sessão..." /></TelaCheia>
  }
  if (estado.status === 'erro') {
    return <TelaCheia><div className="w-full max-w-md"><Alerta tom="arquivo" mensagem={estado.mensagem} onTentarNovamente={tentarNovamente} /></div></TelaCheia>
  }
  if (estado.status === 'anonimo') {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />
  }
  return children
}

// Login/cadastro: quem já está logado volta pra onde queria ir (ou pra lista de mesas).
export function RotaPublica({ children }: { children: ReactNode }) {
  const { estado } = useAuth()
  const location = useLocation()
  const destino = (location.state as { de?: string } | null)?.de ?? '/salas'

  if (estado.status === 'autenticado') return <Navigate to={destino} replace />
  if (estado.status === 'carregando') {
    return <TelaCheia><Carregando texto="Verificando sua sessão..." /></TelaCheia>
  }
  return children
}
