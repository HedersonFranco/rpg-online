import { useState, type FormEvent } from 'react'
import { useRecurso } from '../../hooks/useRecurso'
import { api, mensagemDeErro } from '../../services/api'
import type { Ficha, Npc } from '../../services/tipos'
import { classeBotaoPrimario, classeInput } from '../ui/estilos'

type Tipo = 'FICHA' | 'NPC' | 'OBJETO'

// Só o mestre põe tokens na mesa. O token nasce no centro do que está visível agora.
export function AdicionarToken({
  salaId,
  mapaId,
  posicao,
  onFechar,
}: {
  salaId: string
  mapaId: string
  posicao: { x: number; y: number }
  onFechar: () => void
}) {
  const fichas = useRecurso<Ficha[]>(`/salas/${salaId}/fichas`)
  const npcs = useRecurso<Npc[]>(`/salas/${salaId}/npcs`)
  const [tipo, setTipo] = useState<Tipo>('FICHA')
  const [refId, setRefId] = useState('')
  const [nome, setNome] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const opcoes = tipo === 'FICHA' ? (fichas.estado.tipo === 'ok' ? fichas.estado.dados : []) : tipo === 'NPC' ? (npcs.estado.tipo === 'ok' ? npcs.estado.dados : []) : []

  async function adicionar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const corpo =
        tipo === 'FICHA' ? { fichaId: refId } : tipo === 'NPC' ? { npcId: refId } : { nome: nome.trim() }
      await api(`/mapas/${mapaId}/tokens`, { method: 'POST', body: { ...corpo, x: Math.round(posicao.x), y: Math.round(posicao.y) } })
      onFechar()
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={adicionar} aria-label="Adicionar token" onPointerDown={(e) => e.stopPropagation()}
      className="absolute top-3 left-16 z-30 w-72 space-y-3 rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
      <div role="radiogroup" aria-label="Tipo de token" className="grid grid-cols-3 gap-1 text-xs">
        {(['FICHA', 'NPC', 'OBJETO'] as const).map((t) => (
          <button key={t} type="button" role="radio" aria-checked={tipo === t} onClick={() => { setTipo(t); setRefId('') }}
            className={`rounded-md py-1.5 ${tipo === t ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
            {t === 'FICHA' ? 'Ficha' : t === 'NPC' ? 'NPC' : 'Objeto'}
          </button>
        ))}
      </div>
      {tipo === 'OBJETO' ? (
        <label className="block text-xs text-zinc-400">Nome do objeto
          <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Baú, Porta" className={`${classeInput} mt-1 py-1.5 text-sm`} />
        </label>
      ) : (
        <label className="block text-xs text-zinc-400">{tipo === 'FICHA' ? 'Ficha' : 'NPC'}
          <select required value={refId} onChange={(e) => setRefId(e.target.value)} className={`${classeInput} mt-1 py-1.5 text-sm`}>
            <option value="" disabled>{opcoes.length ? 'Escolha' : tipo === 'FICHA' ? 'Nenhuma ficha na mesa' : 'Nenhum NPC na mesa'}</option>
            {opcoes.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
          </select>
        </label>
      )}
      {erro && <p role="alert" className="text-xs text-red-300">{erro}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onFechar} className="px-2 text-sm text-zinc-400 hover:text-zinc-200">Cancelar</button>
        <button type="submit" disabled={enviando} className={`${classeBotaoPrimario} px-3 py-1.5 text-sm`}>Adicionar</button>
      </div>
    </form>
  )
}
