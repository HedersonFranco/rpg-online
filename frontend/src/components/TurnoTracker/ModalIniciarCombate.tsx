import { useEffect, useState, type FormEvent } from 'react'
import { useRecurso } from '../../hooks/useRecurso'
import { useSalaSocket } from '../../hooks/useSocket'
import { mensagemDeErro } from '../../services/api'
import type { Ficha, Npc } from '../../services/tipos'
import { Alerta, Carregando } from '../ui/Feedback'
import { classeBotaoPrimario, classeBotaoSecundario } from '../ui/estilos'

type Linha = { chave: string; tipo: 'FICHA' | 'NPC'; refId: string; nome: string }

// O mestre informa a iniciativa de cada participante manualmente (regra do combate na v1).
export function ModalIniciarCombate({ salaId, onFechar }: { salaId: string; onFechar: () => void }) {
  const fichas = useRecurso<Ficha[]>(`/salas/${salaId}/fichas`)
  const npcs = useRecurso<Npc[]>(`/salas/${salaId}/npcs`)
  const { emitir } = useSalaSocket()
  const [incluidos, setIncluidos] = useState<Record<string, boolean>>({})
  const [iniciativas, setIniciativas] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  const carregando = fichas.estado.tipo === 'carregando' || npcs.estado.tipo === 'carregando'
  const erroCarga = fichas.estado.tipo === 'erro' ? fichas.estado.mensagem : npcs.estado.tipo === 'erro' ? npcs.estado.mensagem : null

  const linhas: Linha[] = [
    ...(fichas.estado.tipo === 'ok' ? fichas.estado.dados.map((f): Linha => ({ chave: `F-${f.id}`, tipo: 'FICHA', refId: f.id, nome: f.nome })) : []),
    ...(npcs.estado.tipo === 'ok' ? npcs.estado.dados.map((n): Linha => ({ chave: `N-${n.id}`, tipo: 'NPC', refId: n.id, nome: n.nome })) : []),
  ]
  const escolhidas = linhas.filter((l) => incluidos[l.chave])

  async function iniciar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await emitir('turno:iniciar', {
        participantes: escolhidas.map((l) => ({ tipo: l.tipo, refId: l.refId, iniciativa: Number(iniciativas[l.chave] ?? 0) })),
      })
      onFechar()
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" onClick={onFechar}>
      <form role="dialog" aria-modal="true" aria-labelledby="titulo-combate" onSubmit={iniciar} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
        <h2 id="titulo-combate" className="text-lg font-semibold">Iniciar combate</h2>
        <p className="mt-1 mb-4 text-sm text-zinc-400">Marque quem participa e informe a iniciativa rolada. Maior age primeiro.</p>

        {carregando && <Carregando texto="Carregando participantes..." />}
        {erroCarga && <Alerta mensagem={erroCarga} />}
        {!carregando && !erroCarga && linhas.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhuma ficha ou NPC nesta mesa ainda.</p>
        )}

        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {linhas.map((l) => (
            <li key={l.chave} className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-zinc-800/60">
              <input id={`inc-${l.chave}`} type="checkbox" checked={!!incluidos[l.chave]}
                onChange={(e) => setIncluidos((s) => ({ ...s, [l.chave]: e.target.checked }))} className="h-4 w-4 accent-violet-600" />
              <label htmlFor={`inc-${l.chave}`} className="flex-1 truncate text-sm">
                {l.nome} <span className="text-xs text-zinc-500">{l.tipo === 'NPC' ? 'NPC' : 'Ficha'}</span>
              </label>
              <input type="number" aria-label={`Iniciativa de ${l.nome}`} placeholder="Inic." disabled={!incluidos[l.chave]}
                value={iniciativas[l.chave] ?? ''} onChange={(e) => setIniciativas((s) => ({ ...s, [l.chave]: e.target.value }))}
                className="w-20 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm disabled:opacity-40" />
            </li>
          ))}
        </ul>

        {erro && <div className="mt-3"><Alerta mensagem={erro} /></div>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onFechar} className={classeBotaoSecundario}>Cancelar</button>
          <button type="submit" disabled={enviando || escolhidas.length === 0} className={classeBotaoPrimario}>
            Iniciar ({escolhidas.length})
          </button>
        </div>
      </form>
    </div>
  )
}
