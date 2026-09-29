import { useState, type FormEvent } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { useRecurso } from '../../hooks/useRecurso'
import { api, mensagemDeErro } from '../../services/api'
import type { NpcDetalhe, Sistema } from '../../services/tipos'
import { Alerta, Carregando, Spinner } from '../ui/Feedback'
import { Folha, PastaVazia } from '../ui/arquivo'
import { useConfirmar } from '../ui/confirmacaoContext'
import { Icone } from '../ui/Icone'
import {
  classeBotaoContorno,
  classeBotaoKraft,
  classeBotaoTinta,
  classeCampo,
  classeRotulo,
  classeTituloArquivo,
  condensado,
} from '../ui/estilosArquivo'

type CampoNumero = 'pv' | 'pe' | 'san' | 'pd'

// Cada sistema tem os seus recursos; o backend recusa campo do sistema errado.
const CAMPOS: Record<Sistema, { chave: CampoNumero; rotulo: string }[]> = {
  ORDEM_PARANORMAL_1: [{ chave: 'pv', rotulo: 'PV' }, { chave: 'pe', rotulo: 'PE' }, { chave: 'san', rotulo: 'SAN' }],
  ORDEM_PARANORMAL_2: [{ chave: 'pv', rotulo: 'PV' }, { chave: 'pd', rotulo: 'PD' }],
}

type Rascunho = { nome: string; atributos: string } & Record<CampoNumero, string>

function rascunhoDe(npc?: NpcDetalhe): Rascunho {
  const txt = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v))
  return { nome: npc?.nome ?? '', atributos: npc?.atributos ?? '', pv: txt(npc?.pv), pe: txt(npc?.pe), san: txt(npc?.san), pd: txt(npc?.pd) }
}

// Só manda os campos do sistema da mesa; vazio vira null (sem valor).
function corpoDe(sistema: Sistema, r: Rascunho) {
  const numeros = Object.fromEntries(CAMPOS[sistema].map(({ chave }) => [chave, r[chave].trim() === '' ? null : Number(r[chave])]))
  return { nome: r.nome.trim(), atributos: r.atributos.trim() || null, ...numeros }
}

function FormNpc({ salaId, sistema, npc, onSalvo, onCancelar }: {
  salaId: string
  sistema: Sistema
  npc?: NpcDetalhe
  onSalvo: (npc: NpcDetalhe) => void
  onCancelar: () => void
}) {
  const [r, setR] = useState(() => rascunhoDe(npc))
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(enviando)
  const id = (sufixo: string) => `npc-${npc?.id ?? 'novo'}-${sufixo}`
  const campo = (chave: keyof Rascunho) => (e: { target: { value: string } }) => setR((a) => ({ ...a, [chave]: e.target.value }))

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const salvo = npc
        ? await api<NpcDetalhe>(`/npcs/${npc.id}`, { method: 'PATCH', body: corpoDe(sistema, r) })
        : await api<NpcDetalhe>(`/salas/${salaId}/npcs`, { method: 'POST', body: corpoDe(sistema, r) })
      onSalvo(salvo)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4 rounded-[2px] bg-papel-50 p-3 shadow-[0_1px_3px_rgb(0_0_0/0.25)]">
      <div>
        <label htmlFor={id('nome')} className={classeRotulo}>Nome</label>
        <input id={id('nome')} required maxLength={100} value={r.nome} onChange={campo('nome')} disabled={enviando} className={classeCampo} />
      </div>
      <div className={`grid gap-3 ${CAMPOS[sistema].length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {CAMPOS[sistema].map(({ chave, rotulo }) => (
          <div key={chave}>
            <label htmlFor={id(chave)} className={classeRotulo}>{rotulo}</label>
            <input id={id(chave)} type="number" min={0} value={r[chave]} onChange={campo(chave)} disabled={enviando} className={classeCampo} />
          </div>
        ))}
      </div>
      <div>
        <label htmlFor={id('atributos')} className={classeRotulo}>Atributos e notas</label>
        <textarea id={id('atributos')} rows={4} maxLength={4000} value={r.atributos} onChange={campo('atributos')} disabled={enviando}
          placeholder="Atributos, perícias, ataques, resistências..." className={`${classeCampo} text-sm`} />
      </div>
      {erro && <Alerta tom="papel" mensagem={erro} />}
      <div className="flex gap-2">
        <button type="submit" disabled={enviando} className={classeBotaoTinta}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Salvando...' : npc ? 'Salvar' : 'Criar NPC'}
        </button>
        <button type="button" onClick={onCancelar} disabled={enviando} className={classeBotaoContorno}>Cancelar</button>
      </div>
    </form>
  )
}

function resumo(sistema: Sistema, npc: NpcDetalhe) {
  return CAMPOS[sistema].filter(({ chave }) => npc[chave] !== null).map(({ chave, rotulo }) => `${rotulo} ${npc[chave]}`).join(' · ')
}

const classeBotaoLinha =
  'inline-flex h-10 w-10 items-center justify-center rounded-sm text-tinta-700 hover:bg-tinta-900/10 hover:text-tinta-900 ' +
  'focus-visible:outline-2 focus-visible:outline-tinta-900 disabled:opacity-40'

// NPCs são ferramenta do mestre: blocos de estatística fixos, reutilizáveis como tokens em qualquer mapa.
export function PainelNpcs({ salaId, sistema }: { salaId: string; sistema: Sistema }) {
  const { estado, recarregar, atualizar } = useRecurso<NpcDetalhe[]>(`/salas/${salaId}/npcs`)
  const confirmar = useConfirmar()
  const [editando, setEditando] = useState<string | null>(null) // 'novo' ou o id do NPC
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(removendo !== null)

  const ordenar = (lista: NpcDetalhe[]) => [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  async function remover(npc: NpcDetalhe) {
    const ok = await confirmar({
      titulo: 'Apagar NPC?',
      mensagem: `"${npc.nome}" sai da mesa. Os tokens dele continuam nos mapas, mas sem vínculo com o NPC.`,
      confirmar: 'Apagar NPC',
    })
    if (!ok) return
    setErro(null)
    setRemovendo(npc.id)
    try {
      await api(`/npcs/${npc.id}`, { method: 'DELETE' })
      atualizar((lista) => lista.filter((n) => n.id !== npc.id))
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setRemovendo(null)
    }
  }

  if (estado.tipo === 'carregando') return <Carregando texto="Carregando NPCs..." />
  if (estado.tipo === 'erro') return <Alerta tom="arquivo" mensagem={estado.mensagem} onTentarNovamente={recarregar} />
  const npcs = estado.dados

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className={`text-2xl leading-none ${classeTituloArquivo}`}>
            NPCs <span className="font-arquivo text-base font-normal tracking-normal text-grafite-300 normal-case [font-stretch:100%]">{npcs.length}</span>
          </h3>
          {editando !== 'novo' && (
            <button type="button" onClick={() => setEditando('novo')} className={classeBotaoKraft}>
              <Icone nome="mais" className="h-4 w-4" /> Novo NPC
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-grafite-300">Só você vê esta lista. No mapa, os jogadores veem só o nome do token.</p>
      </div>

      {erro && <Alerta tom="arquivo" mensagem={erro} />}

      {editando === 'novo' && (
        <FormNpc salaId={salaId} sistema={sistema} onCancelar={() => setEditando(null)}
          onSalvo={(novo) => { atualizar((lista) => ordenar([...lista, novo])); setEditando(null) }} />
      )}

      {npcs.length === 0 && editando !== 'novo' && (
        <PastaVazia>
          <p className={`text-xl text-kraft-300 ${classeTituloArquivo}`}>Nenhum NPC nesta mesa</p>
          <p className="mt-2 text-sm text-grafite-300">Crie monstros, cultistas e testemunhas para usar como tokens.</p>
        </PastaVazia>
      )}

      {npcs.length > 0 && (
        <Folha className="p-4 sm:p-4">
          <ul className="divide-y divide-papel-300">
            {npcs.map((npc) =>
              editando === npc.id ? (
                <li key={npc.id} className="py-3 first:pt-0 last:pb-0">
                  <FormNpc salaId={salaId} sistema={sistema} npc={npc} onCancelar={() => setEditando(null)}
                    onSalvo={(salvo) => { atualizar((lista) => ordenar(lista.map((n) => (n.id === salvo.id ? salvo : n)))); setEditando(null) }} />
                </li>
              ) : (
                <li key={npc.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-lg leading-tight font-extrabold break-words ${condensado}`}>{npc.nome}</p>
                      {resumo(sistema, npc) && <p className="mt-0.5 font-datilo text-sm text-tinta-900">{resumo(sistema, npc)}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => setEditando(npc.id)} disabled={removendo !== null}
                        aria-label={`Editar NPC ${npc.nome}`} title="Editar" className={classeBotaoLinha}>
                        <Icone nome="notas" className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => remover(npc)} disabled={removendo !== null}
                        aria-label={`Apagar NPC ${npc.nome}`} title="Apagar" className={classeBotaoLinha}>
                        {removendo === npc.id && mostrarSpinner ? <Spinner tamanho="sm" /> : <Icone nome="lixeira" className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {npc.atributos && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-tinta-900">{npc.atributos}</p>}
                </li>
              ),
            )}
          </ul>
        </Folha>
      )}
    </div>
  )
}
