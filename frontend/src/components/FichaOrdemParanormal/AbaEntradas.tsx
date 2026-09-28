import { useState, type FormEvent } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { api, mensagemDeErro } from '../../services/api'
import {
  CATEGORIAS_EQUIPAMENTO,
  NOME_ELEMENTO,
  type ElementoRitual,
  type EntradaFicha,
  type Ficha,
  type TipoEntrada,
} from '../../services/tipos'
import { Alerta, Spinner } from '../ui/Feedback'
import { Icone } from '../ui/Icone'
import { classeBotaoPrimario, classeBotaoSecundario, classeInput, classeLabel } from '../ui/estilos'

const TEXTOS: Record<TipoEntrada, { singular: string; vazio: string; placeholderDescricao: string }> = {
  RITUAL: {
    singular: 'ritual',
    vazio: 'Nenhum ritual cadastrado.',
    placeholderDescricao: 'Execução, alcance, alvo, duração, resistência, efeito...',
  },
  HABILIDADE: { singular: 'habilidade', vazio: 'Nenhuma habilidade cadastrada.', placeholderDescricao: 'O que a habilidade faz' },
  PODER: { singular: 'poder', vazio: 'Nenhum poder cadastrado.', placeholderDescricao: 'O que o poder faz' },
  EQUIPAMENTO: { singular: 'equipamento', vazio: 'Nenhum equipamento cadastrado.', placeholderDescricao: 'Dano, crítico, alcance, efeito...' },
}

const ELEMENTOS = Object.keys(NOME_ELEMENTO) as ElementoRitual[]

// Cor do elemento (referência: cards de ritual do RPGpédia) — só a cor, não a arte.
const COR_ELEMENTO: Record<ElementoRitual, string> = {
  SANGUE: 'border-l-red-600',
  MORTE: 'border-l-zinc-400',
  CONHECIMENTO: 'border-l-amber-500',
  ENERGIA: 'border-l-fuchsia-500',
  MEDO: 'border-l-sky-300',
  VARIA: 'border-l-violet-500',
}

const ROMANO = ['I', 'II', 'III', 'IV']

type Rascunho = {
  nome: string
  descricao: string
  circulo: string
  elemento: ElementoRitual
  preRequisito: string
  categoria: string
  espacos: string
}

function rascunhoDe(entrada?: EntradaFicha): Rascunho {
  return {
    nome: entrada?.nome ?? '',
    descricao: entrada?.descricao ?? '',
    circulo: String(entrada?.circulo ?? 1),
    elemento: entrada?.elemento ?? 'SANGUE',
    preRequisito: entrada?.preRequisito ?? '',
    categoria: String(entrada?.categoria ?? 0),
    espacos: String(entrada?.espacos ?? 1),
  }
}

// Só manda os campos do tipo — o backend rejeita campo de outro tipo.
function corpoDe(tipo: TipoEntrada, r: Rascunho) {
  const base = { nome: r.nome.trim(), descricao: r.descricao }
  if (tipo === 'RITUAL') return { ...base, circulo: Number(r.circulo), elemento: r.elemento }
  if (tipo === 'PODER') return { ...base, preRequisito: r.preRequisito.trim() || null }
  if (tipo === 'EQUIPAMENTO') return { ...base, categoria: Number(r.categoria), espacos: Number(r.espacos) }
  return base
}

function detalhes(entrada: EntradaFicha) {
  if (entrada.tipo === 'RITUAL' && entrada.circulo && entrada.elemento) {
    return `${ROMANO[entrada.circulo - 1]} círculo · ${NOME_ELEMENTO[entrada.elemento]}`
  }
  if (entrada.tipo === 'PODER' && entrada.preRequisito) return `Pré-requisito: ${entrada.preRequisito}`
  if (entrada.tipo === 'EQUIPAMENTO' && entrada.categoria !== null) {
    const espacos = entrada.espacos === 1 ? '1 espaço' : `${entrada.espacos} espaços`
    return `Categoria ${CATEGORIAS_EQUIPAMENTO[entrada.categoria]} · ${espacos}`
  }
  return null
}

function FormEntrada({
  ficha,
  tipo,
  entrada,
  onSalva,
  onCancelar,
}: {
  ficha: Ficha
  tipo: TipoEntrada
  entrada?: EntradaFicha
  onSalva: (ficha: Ficha) => void
  onCancelar: () => void
}) {
  const [r, setR] = useState(() => rascunhoDe(entrada))
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(enviando)
  const campo = (chave: keyof Rascunho) => (e: { target: { value: string } }) => setR((a) => ({ ...a, [chave]: e.target.value }))
  const id = (sufixo: string) => `entrada-${entrada?.id ?? 'nova'}-${sufixo}`

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const { ficha: atualizada } = entrada
        ? await api<{ ficha: Ficha }>(`/fichas/${ficha.id}/entradas/${entrada.id}`, { method: 'PATCH', body: corpoDe(tipo, r) })
        : await api<{ ficha: Ficha }>(`/fichas/${ficha.id}/entradas`, { method: 'POST', body: { tipo, ...corpoDe(tipo, r) } })
      onSalva(atualizada)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3 rounded-lg bg-zinc-900 p-3 ring-1 ring-zinc-800">
      <div>
        <label htmlFor={id('nome')} className={classeLabel}>Nome</label>
        <input id={id('nome')} required maxLength={100} value={r.nome} onChange={campo('nome')} disabled={enviando} className={classeInput} />
      </div>

      {tipo === 'RITUAL' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={id('circulo')} className={classeLabel}>Círculo</label>
            <select id={id('circulo')} value={r.circulo} onChange={campo('circulo')} disabled={enviando} className={classeInput}>
              {ROMANO.map((romano, i) => <option key={romano} value={i + 1}>{romano}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={id('elemento')} className={classeLabel}>Elemento</label>
            <select id={id('elemento')} value={r.elemento} onChange={campo('elemento')} disabled={enviando} className={classeInput}>
              {ELEMENTOS.map((el) => <option key={el} value={el}>{NOME_ELEMENTO[el]}</option>)}
            </select>
          </div>
        </div>
      )}

      {tipo === 'PODER' && (
        <div>
          <label htmlFor={id('prereq')} className={classeLabel}>Pré-requisito <span className="font-normal text-zinc-500">(opcional)</span></label>
          <input id={id('prereq')} maxLength={200} value={r.preRequisito} onChange={campo('preRequisito')} disabled={enviando}
            placeholder="Ex.: Int 2, treinado em Tática" className={classeInput} />
        </div>
      )}

      {tipo === 'EQUIPAMENTO' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={id('categoria')} className={classeLabel}>Categoria</label>
            <select id={id('categoria')} value={r.categoria} onChange={campo('categoria')} disabled={enviando} className={classeInput}>
              {CATEGORIAS_EQUIPAMENTO.map((c, i) => <option key={c} value={i}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={id('espacos')} className={classeLabel}>Espaços</label>
            <input id={id('espacos')} type="number" min={0} max={99} required value={r.espacos} onChange={campo('espacos')}
              disabled={enviando} className={classeInput} />
          </div>
        </div>
      )}

      <div>
        <label htmlFor={id('descricao')} className={classeLabel}>{tipo === 'RITUAL' ? 'Descrição e condições' : 'Descrição'}</label>
        <textarea id={id('descricao')} rows={4} maxLength={4000} value={r.descricao} onChange={campo('descricao')} disabled={enviando}
          placeholder={TEXTOS[tipo].placeholderDescricao} className={`${classeInput} text-sm`} />
      </div>

      {erro && <Alerta mensagem={erro} />}
      <div className="flex gap-2">
        <button type="submit" disabled={enviando} className={`${classeBotaoPrimario} px-3 py-1.5 text-sm`}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Salvando...' : entrada ? 'Salvar' : 'Adicionar'}
        </button>
        <button type="button" onClick={onCancelar} disabled={enviando} className={`${classeBotaoSecundario} py-1.5 text-sm`}>Cancelar</button>
      </div>
    </form>
  )
}

export function AbaEntradas({
  ficha,
  tipo,
  podeEditar,
  onAtualizada,
}: {
  ficha: Ficha
  tipo: TipoEntrada
  podeEditar: boolean
  onAtualizada: (ficha: Ficha) => void
}) {
  // 'nova' = formulário de criação aberto; id = editando aquela entrada.
  const [editando, setEditando] = useState<string | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(removendo !== null)
  const entradas = ficha.entradas.filter((e) => e.tipo === tipo)
  const { singular, vazio } = TEXTOS[tipo]

  function salva(atualizada: Ficha) {
    setEditando(null)
    onAtualizada(atualizada)
  }

  async function remover(entrada: EntradaFicha) {
    if (!window.confirm(`Apagar ${singular} "${entrada.nome}"? Isso não pode ser desfeito.`)) return
    setErro(null)
    setRemovendo(entrada.id)
    try {
      const { ficha: atualizada } = await api<{ ficha: Ficha }>(`/fichas/${ficha.id}/entradas/${entrada.id}`, { method: 'DELETE' })
      onAtualizada(atualizada)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setRemovendo(null)
    }
  }

  return (
    <div className="space-y-3">
      {podeEditar && editando !== 'nova' && (
        <button type="button" onClick={() => setEditando('nova')} className={`${classeBotaoPrimario} w-full py-1.5 text-sm`}>
          <Icone nome="mais" className="h-4 w-4" /> Adicionar {singular}
        </button>
      )}
      {editando === 'nova' && (
        <FormEntrada ficha={ficha} tipo={tipo} onSalva={salva} onCancelar={() => setEditando(null)} />
      )}
      {erro && <Alerta mensagem={erro} />}

      {entradas.length === 0 && editando !== 'nova' ? (
        <p className="py-4 text-center text-zinc-500">{vazio}</p>
      ) : (
        <ul className="space-y-2">
          {entradas.map((entrada) =>
            editando === entrada.id ? (
              <li key={entrada.id}>
                <FormEntrada ficha={ficha} tipo={tipo} entrada={entrada} onSalva={salva} onCancelar={() => setEditando(null)} />
              </li>
            ) : (
              <li key={entrada.id}
                className={`rounded-lg border-l-4 bg-zinc-900 p-3 ring-1 ring-zinc-800 ${entrada.elemento ? COR_ELEMENTO[entrada.elemento] : 'border-l-zinc-700'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium break-words">{entrada.nome}</p>
                    {detalhes(entrada) && <p className="text-xs text-zinc-400">{detalhes(entrada)}</p>}
                  </div>
                  {podeEditar && (
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => setEditando(entrada.id)} disabled={removendo !== null}
                        aria-label={`Editar ${singular} ${entrada.nome}`} title="Editar"
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40">
                        <Icone nome="notas" className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => remover(entrada)} disabled={removendo !== null}
                        aria-label={`Apagar ${singular} ${entrada.nome}`} title="Apagar"
                        className="rounded p-1 text-zinc-400 hover:bg-red-950 hover:text-red-300 disabled:opacity-40">
                        {removendo === entrada.id && mostrarSpinner ? <Spinner tamanho="sm" /> : <Icone nome="lixeira" className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                </div>
                {entrada.descricao && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-300">{entrada.descricao}</p>}
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}
