import { useState, type FormEvent } from 'react'
import { useRecurso } from '../../hooks/useRecurso'
import { api, mensagemDeErro } from '../../services/api'
import type { Ficha, Npc } from '../../services/tipos'
import { Alerta } from '../ui/Feedback'
import { Folha } from '../ui/arquivo'
import { classeAbaFolha, classeBotaoContorno, classeBotaoTinta, classeCampo, classeRotulo, classeSelect } from '../ui/estilosArquivo'

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
    <div onPointerDown={(e) => e.stopPropagation()} className="absolute top-3 left-16 z-30 w-80">
      <Folha className="p-4 sm:p-4">
        <form onSubmit={adicionar} aria-label="Adicionar token" className="space-y-4">
          <div role="radiogroup" aria-label="Tipo de token" className="grid grid-cols-3 gap-1.5">
            {(['FICHA', 'NPC', 'OBJETO'] as const).map((t) => (
              <button key={t} type="button" role="radio" aria-checked={tipo === t} onClick={() => { setTipo(t); setRefId('') }}
                className={classeAbaFolha(tipo === t)}>
                {t === 'FICHA' ? 'Ficha' : t === 'NPC' ? 'NPC' : 'Objeto'}
              </button>
            ))}
          </div>
          {tipo === 'OBJETO' ? (
            <div>
              <label htmlFor="token-nome" className={classeRotulo}>Nome do objeto</label>
              <input id="token-nome" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Baú, Porta" className={classeCampo} />
            </div>
          ) : (
            <div>
              <label htmlFor="token-ref" className={classeRotulo}>{tipo === 'FICHA' ? 'Ficha' : 'NPC'}</label>
              <select id="token-ref" required value={refId} onChange={(e) => setRefId(e.target.value)} className={classeSelect(refId === '')}>
                <option value="" disabled>{opcoes.length ? 'Escolha' : tipo === 'FICHA' ? 'Nenhuma ficha na mesa' : 'Nenhum NPC na mesa'}</option>
                {opcoes.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </select>
            </div>
          )}
          {erro && <Alerta tom="papel" mensagem={erro} />}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={onFechar} className={classeBotaoContorno}>Cancelar</button>
            <button type="submit" disabled={enviando} className={classeBotaoTinta}>Adicionar</button>
          </div>
        </form>
      </Folha>
    </div>
  )
}
