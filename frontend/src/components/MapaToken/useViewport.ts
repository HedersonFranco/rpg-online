import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'

// Tela = mapa × escala + deslocamento. Tokens guardam posição em pixels da
// imagem original, então zoom/pan não mexem em nada que vai pro servidor.
export type Visao = { x: number; y: number; escala: number }

const ESCALA_MIN = 0.1
const ESCALA_MAX = 5
const limitar = (e: number) => Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, e))

type Ponto = { x: number; y: number }
type Gesto = { tipo: 'pan'; ultimo: Ponto } | { tipo: 'pinca'; distancia: number; centro: Ponto } | null

// Pointer Events cobrem mouse, toque e caneta com o mesmo código:
// 1 ponteiro arrasta (pan), 2 ponteiros fazem pinça (zoom + pan). Roda do mouse dá zoom no cursor.
export function useViewport(container: RefObject<HTMLDivElement | null>) {
  const [visao, setVisao] = useState<Visao>({ x: 0, y: 0, escala: 1 })
  const ponteiros = useRef(new Map<number, Ponto>())
  const gesto = useRef<Gesto>(null)

  // Funções que leem container.current só rodam em eventos — não memoizar (o React Compiler recusa).
  function relativo(clientX: number, clientY: number): Ponto {
    const r = container.current?.getBoundingClientRect()
    return { x: clientX - (r?.left ?? 0), y: clientY - (r?.top ?? 0) }
  }

  const zoomEm = useCallback((fator: number, centro: Ponto) => {
    setVisao((v) => {
      const escala = limitar(v.escala * fator)
      const k = escala / v.escala
      return { escala, x: centro.x - (centro.x - v.x) * k, y: centro.y - (centro.y - v.y) * k }
    })
  }, [])

  function zoomNoCentro(fator: number) {
    const r = container.current?.getBoundingClientRect()
    zoomEm(fator, { x: (r?.width ?? 0) / 2, y: (r?.height ?? 0) / 2 })
  }

  // React registra onWheel como passivo (não dá pra impedir o zoom da página) — por isso listener nativo.
  useEffect(() => {
    const el = container.current
    if (!el) return
    const aoRolar = (e: WheelEvent) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      zoomEm(e.deltaY < 0 ? 1.15 : 1 / 1.15, { x: e.clientX - r.left, y: e.clientY - r.top })
    }
    el.addEventListener('wheel', aoRolar, { passive: false })
    return () => el.removeEventListener('wheel', aoRolar)
  }, [container, zoomEm])

  function iniciarGesto() {
    const pontos = [...ponteiros.current.values()]
    if (pontos.length === 1) gesto.current = { tipo: 'pan', ultimo: pontos[0]! }
    else if (pontos.length >= 2) {
      const [a, b] = pontos as [Ponto, Ponto]
      gesto.current = { tipo: 'pinca', distancia: Math.hypot(a.x - b.x, a.y - b.y), centro: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
    } else gesto.current = null
  }

  const aoPressionar = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    ponteiros.current.set(e.pointerId, relativo(e.clientX, e.clientY))
    iniciarGesto()
  }

  const aoMover = (e: PointerEvent<HTMLElement>) => {
    if (!ponteiros.current.has(e.pointerId)) return
    ponteiros.current.set(e.pointerId, relativo(e.clientX, e.clientY))
    const atual = gesto.current
    if (atual?.tipo === 'pan') {
      const p = ponteiros.current.get(e.pointerId)!
      const dx = p.x - atual.ultimo.x
      const dy = p.y - atual.ultimo.y
      gesto.current = { tipo: 'pan', ultimo: p }
      setVisao((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
    } else if (atual?.tipo === 'pinca') {
      const [a, b] = [...ponteiros.current.values()] as [Ponto, Ponto]
      const distancia = Math.hypot(a.x - b.x, a.y - b.y)
      const centro = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const fator = atual.distancia > 0 ? distancia / atual.distancia : 1
      setVisao((v) => {
        const escala = limitar(v.escala * fator)
        const k = escala / v.escala
        return {
          escala,
          x: centro.x - (atual.centro.x - v.x) * k,
          y: centro.y - (atual.centro.y - v.y) * k,
        }
      })
      gesto.current = { tipo: 'pinca', distancia, centro }
    }
  }

  const aoSoltar = (e: PointerEvent<HTMLElement>) => {
    ponteiros.current.delete(e.pointerId)
    iniciarGesto()
  }

  // Encaixa a imagem inteira na área visível, com margem.
  function ajustar(largura: number, altura: number) {
    const r = container.current?.getBoundingClientRect()
    if (!r || !largura || !altura) return
    const escala = limitar(Math.min(r.width / largura, r.height / altura) * 0.9)
    setVisao({ escala, x: (r.width - largura * escala) / 2, y: (r.height - altura * escala) / 2 })
  }

  const telaParaMapa = useCallback(
    (p: Ponto): Ponto => ({ x: (p.x - visao.x) / visao.escala, y: (p.y - visao.y) / visao.escala }),
    [visao],
  )

  return {
    visao,
    zoomNoCentro,
    ajustar,
    telaParaMapa,
    relativo,
    manipuladores: { onPointerDown: aoPressionar, onPointerMove: aoMover, onPointerUp: aoSoltar, onPointerCancel: aoSoltar },
  }
}
