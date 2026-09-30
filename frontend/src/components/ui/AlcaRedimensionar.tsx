import { useRef, type PointerEvent } from 'react'

// Alça de redimensionar na borda de um painel (o pai precisa ser `relative`).
// Nas duas bordas que usamos — esquerda do painel direito (eixo x) e topo da régua (eixo y) —
// o painel cresce quando a alça vai para trás (esquerda/cima), então o sinal é o mesmo.
// Teclado: setas (Shift = passo maior), Home/End nos limites. Duplo clique volta ao padrão.
export function AlcaRedimensionar({ eixo, valor, min, max, padrao, onMudar, rotulo }: {
  eixo: 'x' | 'y'
  valor: number
  min: number
  max: number
  padrao: number
  onMudar: (valor: number) => void
  rotulo: string
}) {
  const inicio = useRef<{ ponteiro: number; valor: number } | null>(null)
  const limitar = (v: number) => Math.min(max, Math.max(min, Math.round(v)))
  const posicao = (e: PointerEvent) => (eixo === 'x' ? e.clientX : e.clientY)
  const soltar = () => { inicio.current = null }

  return (
    <div role="separator" tabIndex={0} aria-label={rotulo} aria-orientation={eixo === 'x' ? 'vertical' : 'horizontal'}
      aria-valuenow={valor} aria-valuemin={min} aria-valuemax={max}
      title={`${rotulo} — arraste; duplo clique volta ao tamanho padrão`}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.preventDefault() // sem seleção de texto durante o arrasto
        e.currentTarget.setPointerCapture(e.pointerId)
        inicio.current = { ponteiro: posicao(e), valor }
      }}
      onPointerMove={(e) => {
        const i = inicio.current
        if (i) onMudar(limitar(i.valor - (posicao(e) - i.ponteiro)))
      }}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      onDoubleClick={() => onMudar(padrao)}
      onKeyDown={(e) => {
        const passo = e.shiftKey ? 64 : 16
        const teclas: Record<string, number> = eixo === 'x'
          ? { ArrowLeft: valor + passo, ArrowRight: valor - passo, Home: min, End: max }
          : { ArrowUp: valor + passo, ArrowDown: valor - passo, Home: min, End: max }
        if (!(e.key in teclas)) return
        e.preventDefault()
        onMudar(limitar(teclas[e.key]))
      }}
      className={`group absolute z-30 touch-none select-none focus-visible:outline-none ${eixo === 'x' ? 'inset-y-0 -left-1 w-2 cursor-col-resize' : 'inset-x-0 -top-1 h-2 cursor-row-resize'}`}>
      <span aria-hidden="true"
        className={`pointer-events-none absolute bg-kraft-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 motion-reduce:transition-none ${eixo === 'x' ? 'inset-y-0 left-[3px] w-0.5' : 'inset-x-0 top-[3px] h-0.5'}`} />
    </div>
  )
}
