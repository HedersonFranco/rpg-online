import { useEffect, useState } from 'react'

// Só vira true depois de `ativo` ficar ligado por `ms` — spinner aparece em
// operações acima de 300ms (requisito de UX) sem piscar nas rápidas.
export function useAtrasado(ativo: boolean, ms = 300) {
  const [passou, setPassou] = useState(false)

  useEffect(() => {
    if (!ativo) return
    const timer = setTimeout(() => setPassou(true), ms)
    return () => {
      clearTimeout(timer)
      setPassou(false)
    }
  }, [ativo, ms])

  return ativo && passou
}
