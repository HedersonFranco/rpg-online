import type { PointerEvent } from 'react'
import { BASE_URL } from '../../services/api'
import type { Token } from '../../services/tipos'
import { nomeDoToken, tipoDoToken } from './token'

// Borda pelo tipo: agente (papel), NPC (carimbo — classificação de ameaça), objeto (grafite).
// Montaria não tem círculo nem borda: é a própria imagem (ver TokenMontaria).
const BORDA = { Ficha: 'border-papel-50', NPC: 'border-carimbo-300', Montaria: 'border-kraft-400', Objeto: 'border-grafite-400' } as const
const TAMANHO_TOKEN = 56
// Montaria com escala 1: o dobro do token comum, para caber o cavaleiro em cima.
export const TAMANHO_MONTARIA = 2 * TAMANHO_TOKEN
// Pisos no zoom baixo: o token continua clicável e a letra legível.
const DIAMETRO_MINIMO = 28
const FONTE_MINIMA = 12

type ManipuladoresPonteiro = {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void
  onPointerMove: (e: PointerEvent<HTMLElement>) => void
  onPointerUp: (e: PointerEvent<HTMLElement>) => void
}

type PropsToken = ManipuladoresPonteiro & {
  token: Token
  escala: number
  selecionado: boolean
  podeMover: boolean
  arrastando: boolean
  // Só montaria: a alça do canto muda o tamanho (como no Owlbear). Props `on…` soltas, não um objeto:
  // assim o compilador do React sabe que são eventos, não algo chamado durante o render.
  onAlcaPointerDown?: (e: PointerEvent<HTMLElement>) => void
  onAlcaPointerMove?: (e: PointerEvent<HTMLElement>) => void
  onAlcaPointerUp?: (e: PointerEvent<HTMLElement>) => void
}

// Só o círculo é clicável: nome e barra de PV não encolhem com o zoom e, se
// fossem clicáveis, cobririam tokens vizinhos em zoom baixo.
export function TokenNoMapa(props: PropsToken) {
  const { token, escala, selecionado, podeMover, arrastando, onPointerDown, onPointerMove, onPointerUp } = props
  if (token.montaria) return <TokenMontaria {...props} imagemUrl={token.montaria.imagemUrl} />
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
          <img src={BASE_URL + avatar} alt="" draggable={false} className="h-full w-full object-cover" />
        ) : (
          nome.charAt(0).toUpperCase()
        )}
      </button>
      <span className="mt-1 max-w-32 truncate rounded-[2px] bg-arquivo-950/85 px-1.5 text-xs whitespace-nowrap text-grafite-100">{nome}</span>
      {pv && (
        <span role="meter" aria-label={`PV ${pv.atual}/${pv.maximo}`} aria-valuenow={pv.atual} aria-valuemin={0} aria-valuemax={Math.max(pv.maximo, pv.atual)}
          className="mt-0.5 h-1.5 w-12 overflow-hidden rounded-[1px] bg-arquivo-800 ring-1 ring-arquivo-950">
          <span className="block h-1.5 bg-recurso-vida" style={{ width: `${pv.maximo > 0 ? Math.min(100, (pv.atual / pv.maximo) * 100) : 0}%` }} />
        </span>
      )}
    </div>
  )
}

// Montaria: a imagem inteira (sem recorte em círculo), sempre na camada de baixo (z 0, e o AreaMapa a
// desenha antes dos outros) — o token de quem monta fica por cima. Sem nome no mapa: ele aparece ao selecionar.
function TokenMontaria({
  token, escala, selecionado, arrastando, onPointerDown, onPointerMove, onPointerUp, onAlcaPointerDown, onAlcaPointerMove, onAlcaPointerUp, imagemUrl,
}: PropsToken & { imagemUrl: string }) {
  const lado = Math.max(DIAMETRO_MINIMO, TAMANHO_MONTARIA * token.escala * escala)
  return (
    <div data-token-id={token.id} className="pointer-events-none absolute"
      style={{ left: token.x * escala, top: token.y * escala, width: lado, height: lado, transform: 'translate(-50%, -50%)', zIndex: 0 }}>
      <button
        type="button"
        aria-label={`Token ${nomeDoToken(token)} (Montaria)`}
        aria-pressed={selecionado}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`pointer-events-auto block h-full w-full touch-none rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kraft-300 ${selecionado ? 'outline-2 outline-offset-2 outline-kraft-300' : ''} ${arrastando ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <img src={BASE_URL + imagemUrl} alt="" draggable={false} className="h-full w-full object-contain drop-shadow-[0_6px_8px_rgb(0_0_0/0.85)]" />
      </button>
      {selecionado && onAlcaPointerDown && (
        // Só ponteiro: pelo teclado, o tamanho muda nos botões −/+ do quadro do token selecionado.
        <span aria-hidden="true" onPointerDown={onAlcaPointerDown} onPointerMove={onAlcaPointerMove} onPointerUp={onAlcaPointerUp} onPointerCancel={onAlcaPointerUp}
          className="pointer-events-auto absolute -right-2 -bottom-2 h-4 w-4 cursor-nwse-resize touch-none rounded-[2px] border-2 border-kraft-300 bg-arquivo-900 shadow-[0_2px_6px_rgb(0_0_0/0.8)]" />
      )}
    </div>
  )
}
