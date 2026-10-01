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
import { classeBotaoContorno, classeBotaoTinta, classeCampo, classeRotulo, classeSelect, condensado } from '../ui/estilosArquivo'
import { useConfirmar } from '../ui/confirmacaoContext'

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

// Marca de cor do elemento (referência: cards de ritual do RPGpédia) — só a cor, não a arte.
const COR_ELEMENTO: Record<ElementoRitual, string> = {
  SANGUE: 'bg-elemento-sangue',
  MORTE: 'bg-elemento-morte',
  CONHECIMENTO: 'bg-elemento-conhecimento',
  ENERGIA: 'bg-elemento-energia',
  MEDO: 'bg-elemento-medo',
  VARIA: 'bg-elemento-varia',
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
    <form onSubmit={enviar} className="space-y-4 rounded-[2px] bg-papel-50 p-3 shadow-[0_1px_3px_rgb(0_0_0/0.25)]">
      <div>
        <label htmlFor={id('nome')} className={classeRotulo}>Nome</label>
        <input id={id('nome')} required maxLength={100} value={r.nome} onChange={campo('nome')} disabled={enviando} className={classeCampo} />
      </div>

      {tipo === 'RITUAL' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={id('circulo')} className={classeRotulo}>Círculo</label>
            <select id={id('circulo')} value={r.circulo} onChange={campo('circulo')} disabled={enviando} className={classeSelect(false)}>
              {ROMANO.map((romano, i) => <option key={romano} value={i + 1}>{romano}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={id('elemento')} className={classeRotulo}>Elemento</label>
            <select id={id('elemento')} value={r.elemento} onChange={campo('elemento')} disabled={enviando} className={classeSelect(false)}>
              {ELEMENTOS.map((el) => <option key={el} value={el}>{NOME_ELEMENTO[el]}</option>)}
            </select>
          </div>
        </div>
      )}

      {tipo === 'PODER' && (
        <div>
          <label htmlFor={id('prereq')} className={classeRotulo}>Pré-requisito <span className="font-normal normal-case tracking-normal text-tinta-600">(opcional)</span></label>
          <input id={id('prereq')} maxLength={200} value={r.preRequisito} onChange={campo('preRequisito')} disabled={enviando}
            placeholder="Ex.: Int 2, treinado em Tática" className={classeCampo} />
        </div>
      )}

      {tipo === 'EQUIPAMENTO' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={id('categoria')} className={classeRotulo}>Categoria</label>
            <select id={id('categoria')} value={r.categoria} onChange={campo('categoria')} disabled={enviando} className={classeSelect(false)}>
              {CATEGORIAS_EQUIPAMENTO.map((c, i) => <option key={c} value={i}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={id('espacos')} className={classeRotulo}>Espaços</label>
            <input id={id('espacos')} type="number" min={0} max={99} required value={r.espacos} onChange={campo('espacos')}
              disabled={enviando} className={classeCampo} />
          </div>
        </div>
      )}

      <div>
        <label htmlFor={id('descricao')} className={classeRotulo}>{tipo === 'RITUAL' ? 'Descrição e condições' : 'Descrição'}</label>
        <textarea id={id('descricao')} rows={4} maxLength={4000} value={r.descricao} onChange={campo('descricao')} disabled={enviando}
          placeholder={TEXTOS[tipo].placeholderDescricao} className={`${classeCampo} text-sm`} />
      </div>

      {erro && <Alerta tom="papel" mensagem={erro} />}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={enviando} className={classeBotaoTinta}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Salvando...' : entrada ? 'Salvar' : 'Adicionar'}
        </button>
        <button type="button" onClick={onCancelar} disabled={enviando} className={classeBotaoContorno}>Cancelar</button>
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
  const confirmar = useConfirmar()

  function salva(atualizada: Ficha) {
    setEditando(null)
    onAtualizada(atualizada)
  }

  async function remover(entrada: EntradaFicha) {
    const ok = await confirmar({
      titulo: `Apagar ${singular}?`,
      mensagem: `"${entrada.nome}" sai da ficha. Isso não pode ser desfeito.`,
      confirmar: `Apagar ${singular}`,
    })
    if (!ok) return
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
        <button type="button" onClick={() => setEditando('nova')} className={`${classeBotaoContorno} w-full`}>
          <Icone nome="mais" className="h-4 w-4" /> Adicionar {singular}
        </button>
      )}
      {editando === 'nova' && (
        <FormEntrada ficha={ficha} tipo={tipo} onSalva={salva} onCancelar={() => setEditando(null)} />
      )}
      {erro && <Alerta tom="papel" mensagem={erro} />}

      {entradas.length === 0 && editando !== 'nova' ? (
        <p className="py-4 text-center text-tinta-700">{vazio}</p>
      ) : (
        <ul className="divide-y divide-papel-300">
          {entradas.map((entrada) =>
            editando === entrada.id ? (
              <li key={entrada.id}>
                <FormEntrada ficha={ficha} tipo={tipo} entrada={entrada} onSalva={salva} onCancelar={() => setEditando(null)} />
              </li>
            ) : (
              <li key={entrada.id} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-base leading-tight font-extrabold break-words ${condensado}`}>{entrada.nome}</p>
                    {detalhes(entrada) && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-tinta-700">
                        {entrada.elemento && (
                          <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-[2px] ring-1 ring-tinta-900/40 ${COR_ELEMENTO[entrada.elemento]}`} />
                        )}
                        {detalhes(entrada)}
                      </p>
                    )}
                  </div>
                  {podeEditar && (
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => setEditando(entrada.id)} disabled={removendo !== null}
                        aria-label={`Editar ${singular} ${entrada.nome}`} title="Editar"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-tinta-700 hover:bg-tinta-900/10 hover:text-tinta-900 focus-visible:outline-2 focus-visible:outline-tinta-900 disabled:opacity-40">
                        <Icone nome="notas" className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => remover(entrada)} disabled={removendo !== null}
                        aria-label={`Apagar ${singular} ${entrada.nome}`} title="Apagar"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-tinta-700 hover:bg-tinta-900/10 hover:text-tinta-900 focus-visible:outline-2 focus-visible:outline-tinta-900 disabled:opacity-40">
                        {removendo === entrada.id && mostrarSpinner ? <Spinner tamanho="sm" /> : <Icone nome="lixeira" className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                </div>
                {entrada.descricao && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-tinta-900">{entrada.descricao}</p>}
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}
