import { useEffect, useRef, type ReactNode } from 'react'

// <dialog> nativo em modo modal: o navegador prende o foco, fecha com Esc,
// deixa o resto da página inerte e devolve o foco a quem abriu.
export function Dialogo({ aberto, onFechar, rotulo, children, className = '' }: {
  aberto: boolean
  onFechar: () => void
  rotulo: string
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (aberto && !el.open) el.showModal()
    if (!aberto && el.open) el.close()
  }, [aberto])

  return (
    <dialog ref={ref} aria-label={rotulo} onClose={onFechar}
      // Clique no fundo (fora da folha) fecha, como no modal antigo.
      onClick={(e) => { if (e.target === e.currentTarget) onFechar() }}
      className={`m-auto max-h-[90vh] w-full max-w-md overflow-visible bg-transparent p-4 text-tinta-900 backdrop:bg-arquivo-950/75 ${className}`}>
      {aberto && children}
    </dialog>
  )
}
