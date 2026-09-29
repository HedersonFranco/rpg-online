import type { PointerEvent } from 'react'
import { BASE_URL } from '../../services/api'
import type { Token } from '../../services/tipos'
import { nomeDoToken, tipoDoToken } from './token'

// Borda pelo tipo: agente (papel), NPC (carimbo — classificação de ameaça), objeto (grafite).
const BORDA = { Ficha: 'border-papel-50', NPC: 'border-carimbo-300', Objeto: 'border-grafite-400' } as const
const TAMANHO_TOKEN = 56
// Pisos no zoom baixo: o token continua clicável e a letra legível.
const DIAMETRO_MINIMO = 28
const FONTE_MINIMA = 12

// Só o círculo é clicável: nome e barra de PV não encolhem com o zoom e, se
// fossem clicáveis, cobririam tokens vizinhos em zoom baixo.
export function TokenNoMapa({
  token,
  escala,
  selecionado,
  podeMover,
  arrastando,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  token: Token
  escala: number
  selecionado: boolean
  podeMover: boolean
  arrastando: boolean
  onPointerDown: (e: PointerEvent<HTMLButtonElement>) => void
  onPointerMove: (e: PointerEvent<HTMLButtonElement>) => void
  onPointerUp: (e: PointerEvent<HTMLButtonElement>) => void
}) {
  const nome = nomeDoToken(token)
  const tipo = tipoDoToken(token)
  const avatar = token.ficha?.avatarUrl ?? token.npc?.avatarUrl
  const pv = token.ficha ? { atual: token.ficha.pv_atual, maximo: token.ficha.pv_maximo_cache } : null
  const diametro = Math.max(DIAMETRO_MINIMO, TAMANHO_TOKEN * escala)

  return (
    <div
      data-token-id={token.id}
      className="pointer-events-none absolute flex flex-col items-center"
      style={{
        left: token.x * escala,
        top: token.y * escala,
        transform: `translate(-50%, -${diametro / 2}px)`,
        zIndex: arrastando ? 20 : selecionado ? 10 : 1,
      }}
    >
      <button
        type="button"
        aria-label={`Token ${nome} (${tipo})`}
        aria-pressed={selecionado}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`pointer-events-auto flex touch-none items-center justify-center overflow-hidden rounded-full border-[3px] bg-arquivo-800 font-extrabold text-grafite-100 shadow-[0_6px_12px_-4px_rgb(0_0_0/0.9)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kraft-300 [font-stretch:72%] ${BORDA[tipo]} ${selecionado ? 'outline-2 outline-offset-2 outline-kraft-300' : ''} ${podeMover ? (arrastando ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-pointer'}`}
        style={{ width: diametro, height: diametro, fontSize: Math.max(FONTE_MINIMA, 20 * escala) }}
      >
        {avatar ? (
          <img src={avatar.startsWith('/') ? BASE_URL + avatar : avatar} alt="" draggable={false} className="h-full w-full object-cover" />
        ) : (
          nome.charAt(0).toUpperCase()
        )}
      </button>
      <span className="mt-1 max-w-32 truncate rounded-[2px] bg-arquivo-950/85 px-1.5 text-xs whitespace-nowrap text-grafite-100">{nome}</span>
      {pv && (
        <span role="meter" aria-label={`PV ${pv.atual}/${pv.maximo}`} aria-valuenow={pv.atual} aria-valuemin={0} aria-valuemax={pv.maximo}
          className="mt-0.5 h-1.5 w-12 overflow-hidden rounded-[1px] bg-arquivo-800 ring-1 ring-arquivo-950">
          <span className="block h-1.5 bg-recurso-vida" style={{ width: `${pv.maximo > 0 ? (pv.atual / pv.maximo) * 100 : 0}%` }} />
        </span>
      )}
    </div>
  )
}
