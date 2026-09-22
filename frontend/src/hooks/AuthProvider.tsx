import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type EstadoAuth } from './authContext'
import { ApiError, api, lerToken, limparToken, registrarAoExpirarSessao, salvarToken } from '../services/api'
import type { Usuario } from '../services/tipos'

type RespostaAuth = { usuario: Usuario; token: string }

export function AuthProvider({ children }: { children: ReactNode }) {
  // Com token salvo, começa "carregando" e valida com /auth/me — é isso que faz o refresh manter o login.
  const [estado, setEstado] = useState<EstadoAuth>(() =>
    lerToken() ? { status: 'carregando' } : { status: 'anonimo' },
  )

  useEffect(() => {
    registrarAoExpirarSessao(() => {
      limparToken()
      setEstado({ status: 'anonimo' })
    })
    return () => registrarAoExpirarSessao(null)
  }, [])

  useEffect(() => {
    if (estado.status !== 'carregando') return
    let cancelado = false
    api<Usuario>('/auth/me')
      .then((usuario) => {
        if (!cancelado) setEstado({ status: 'autenticado', usuario })
      })
      .catch((erro: unknown) => {
        if (cancelado) return
        if (erro instanceof ApiError && erro.status === 401) {
          limparToken()
          setEstado({ status: 'anonimo' })
        } else {
          setEstado({ status: 'erro', mensagem: erro instanceof Error ? erro.message : 'Erro desconhecido' })
        }
      })
    return () => {
      cancelado = true
    }
  }, [estado.status])

  const autenticar = useCallback((resposta: RespostaAuth) => {
    salvarToken(resposta.token)
    setEstado({ status: 'autenticado', usuario: resposta.usuario })
  }, [])

  const entrar = useCallback(
    async (email: string, senha: string) => {
      autenticar(await api<RespostaAuth>('/auth/login', { method: 'POST', body: { email, senha } }))
    },
    [autenticar],
  )

  const cadastrar = useCallback(
    async (nome: string, email: string, senha: string) => {
      autenticar(await api<RespostaAuth>('/auth/cadastro', { method: 'POST', body: { nome, email, senha } }))
    },
    [autenticar],
  )

  const sair = useCallback(() => {
    limparToken()
    setEstado({ status: 'anonimo' })
  }, [])

  const tentarNovamente = useCallback(() => setEstado({ status: 'carregando' }), [])

  const valor = useMemo(
    () => ({ estado, entrar, cadastrar, sair, tentarNovamente }),
    [estado, entrar, cadastrar, sair, tentarNovamente],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
