import type { PointerEvent } from 'react'
import { BASE_URL } from '../../services/api'
import type { Token } from '../../services/tipos'
import { nomeDoToken, tipoDoToken } from './token'

const BORDA = { Ficha: 'border-violet-400', NPC: 'border-red-400', Objeto: 'border-zinc-400' } as const
const TAMANHO_TOKEN = 56

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
  const diametro = TAMANHO_TOKEN * escala

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
        className={`pointer-events-auto flex touch-none items-center justify-center overflow-hidden rounded-full border-[3px] bg-zinc-800 font-semibold text-zinc-100 shadow-lg shadow-black/50 ${BORDA[tipo]} ${selecionado ? 'ring-2 ring-white' : ''} ${podeMover ? (arrastando ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-pointer'}`}
        style={{ width: diametro, height: diametro, fontSize: 20 * escala }}
      >
        {avatar ? (
          <img src={avatar.startsWith('/') ? BASE_URL + avatar : avatar} alt="" draggable={false} className="h-full w-full object-cover" />
        ) : (
          nome.charAt(0).toUpperCase()
        )}
      </button>
      <span className="mt-0.5 max-w-32 truncate rounded bg-black/70 px-1.5 text-xs whitespace-nowrap text-zinc-100">{nome}</span>
      {pv && (
        <span role="meter" aria-label={`PV ${pv.atual}/${pv.maximo}`} aria-valuenow={pv.atual} aria-valuemin={0} aria-valuemax={pv.maximo}
          className="mt-0.5 h-1 w-12 rounded-full bg-zinc-800">
          <span className="block h-1 rounded-full bg-red-500" style={{ width: `${pv.maximo > 0 ? (pv.atual / pv.maximo) * 100 : 0}%` }} />
        </span>
      )}
    </div>
  )
}
