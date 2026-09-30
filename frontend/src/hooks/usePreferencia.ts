import { useEffect, useState } from 'react'

// Preferência de layout só deste navegador (painel aberto, larguras...). Sem storage
// (aba privada etc.) vale o padrão e a mudança dura até recarregar.
// `normalizar` recebe o que estava salvo (ou undefined) e devolve um valor válido.
export function usePreferencia<T>(chave: string, normalizar: (salvo: unknown) => T) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const bruto = localStorage.getItem(chave)
      return normalizar(bruto === null ? undefined : JSON.parse(bruto))
    } catch {
      return normalizar(undefined)
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor))
    } catch {
      // sem storage: vale só até recarregar
    }
  }, [chave, valor])

  return [valor, setValor] as const
}

export const preferenciaBooleana = (padrao: boolean) => (salvo: unknown) => (typeof salvo === 'boolean' ? salvo : padrao)

export const preferenciaNumero = (padrao: number, min: number, max: number) => (salvo: unknown) =>
  typeof salvo === 'number' && Number.isFinite(salvo) ? Math.min(max, Math.max(min, salvo)) : padrao
