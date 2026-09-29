import { useState, type FormEvent } from 'react'
import { useRecurso } from '../../hooks/useRecurso'
import { useSalaSocket } from '../../hooks/useSocket'
import { mensagemDeErro } from '../../services/api'
import type { Ficha, Npc } from '../../services/tipos'
import { Alerta, Carregando } from '../ui/Feedback'
import { Dialogo } from '../ui/Dialogo'
import { Folha } from '../ui/arquivo'
import { classeBotaoContorno, classeBotaoTinta, classeCampo, classeTituloArquivo } from '../ui/estilosArquivo'

type Linha = { chave: string; tipo: 'FICHA' | 'NPC'; refId: string; nome: string }

export function ModalIniciarCombate({ salaId, aberto, onFechar }: { salaId: string; aberto: boolean; onFechar: () => void }) {
  return (
    <Dialogo aberto={aberto} onFechar={onFechar} rotulo="Iniciar combate">
      <FormIniciarCombate salaId={salaId} onFechar={onFechar} />
    </Dialogo>
  )
}

// O mestre informa a iniciativa de cada participante manualmente (regra do combate na v1).
function FormIniciarCombate({ salaId, onFechar }: { salaId: string; onFechar: () => void }) {
  const fichas = useRecurso<Ficha[]>(`/salas/${salaId}/fichas`)
  const npcs = useRecurso<Npc[]>(`/salas/${salaId}/npcs`)
  const { emitir } = useSalaSocket()
  const [incluidos, setIncluidos] = useState<Record<string, boolean>>({})
  const [iniciativas, setIniciativas] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

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
    <Folha>
      <form onSubmit={iniciar} aria-labelledby="titulo-combate">
        <h2 id="titulo-combate" className={`text-3xl leading-none ${classeTituloArquivo}`}>Iniciar combate</h2>
        <p className="mt-2 mb-5 text-sm text-tinta-700">Marque quem participa e informe a iniciativa rolada. Maior age primeiro.</p>

        {carregando && <div className="text-tinta-700"><Carregando texto="Carregando participantes..." /></div>}
        {erroCarga && <Alerta tom="papel" mensagem={erroCarga} />}
        {!carregando && !erroCarga && linhas.length === 0 && (
          <p className="text-sm text-tinta-700">Nenhuma ficha ou NPC nesta mesa ainda.</p>
        )}

        <ul className="max-h-72 divide-y divide-papel-300 overflow-y-auto">
          {linhas.map((l) => (
            <li key={l.chave} className="flex items-center gap-3 py-2">
              <input id={`inc-${l.chave}`} type="checkbox" checked={!!incluidos[l.chave]}
                onChange={(e) => setIncluidos((s) => ({ ...s, [l.chave]: e.target.checked }))} className="h-5 w-5 shrink-0 accent-tinta-900" />
              <label htmlFor={`inc-${l.chave}`} className="min-w-0 flex-1 truncate text-sm font-semibold">
                {l.nome} <span className="font-normal text-tinta-700">{l.tipo === 'NPC' ? 'NPC' : 'Ficha'}</span>
              </label>
              <div className="w-20 shrink-0">
                <input type="number" aria-label={`Iniciativa de ${l.nome}`} placeholder="Inic." disabled={!incluidos[l.chave]}
                  value={iniciativas[l.chave] ?? ''} onChange={(e) => setIniciativas((s) => ({ ...s, [l.chave]: e.target.value }))}
                  className={`${classeCampo} py-1 disabled:opacity-40`} />
              </div>
            </li>
          ))}
        </ul>

        {erro && <div className="mt-3"><Alerta tom="papel" mensagem={erro} /></div>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onFechar} className={classeBotaoContorno}>Cancelar</button>
          <button type="submit" disabled={enviando || escolhidas.length === 0} className={classeBotaoTinta}>
            Iniciar ({escolhidas.length})
          </button>
        </div>
      </form>
    </Folha>
  )
}
