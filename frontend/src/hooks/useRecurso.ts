import { useCallback, useEffect, useState } from 'react'
import { ApiError, api } from '../services/api'

export type EstadoRecurso<T> =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string; status: number }
  | { tipo: 'ok'; dados: T }

export function useRecurso<T>(caminho: string) {
  const [tentativa, setTentativa] = useState(0)
  const [estado, setEstado] = useState<EstadoRecurso<T>>({ tipo: 'carregando' })

  useEffect(() => {
    let cancelado = false
    api<T>(caminho)
      .then((dados) => {
        if (!cancelado) setEstado({ tipo: 'ok', dados })
      })
      .catch((erro: unknown) => {
        if (cancelado) return
        setEstado({
          tipo: 'erro',
          mensagem: erro instanceof Error ? erro.message : 'Erro desconhecido',
          status: erro instanceof ApiError ? erro.status : 0,
        })
      })
    return () => {
      cancelado = true
    }
  }, [caminho, tentativa])

  const recarregar = useCallback(() => {
    setEstado({ tipo: 'carregando' })
    setTentativa((t) => t + 1)
  }, [])

  const atualizar = useCallback((transformar: (dados: T) => T) => {
    setEstado((atual) => (atual.tipo === 'ok' ? { tipo: 'ok', dados: transformar(atual.dados) } : atual))
  }, [])

  return { estado, recarregar, atualizar }
}
