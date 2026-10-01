import { useState, type FormEvent } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { api, mensagemDeErro } from '../../services/api'
import { NEX_TIERS, NOME_CLASSE, type Classe, type Ficha } from '../../services/tipos'
import { Alerta, Spinner } from '../ui/Feedback'
import { Folha } from '../ui/arquivo'
import { classeBotaoContorno, classeBotaoTinta, classeCampo, classeRotulo, classeSelect, classeTituloArquivo } from '../ui/estilosArquivo'

const ATRIBUTOS = [
  ['for', 'FOR'],
  ['agi', 'AGI'],
  ['int', 'INT'],
  ['vig', 'VIG'],
  ['pre', 'PRE'],
] as const

type Atributo = (typeof ATRIBUTOS)[number][0]

// O formulário só coleta escolhas do jogador. PV/PE/San saem do backend na resposta.
export function FormNovaFicha({
  salaId,
  onCriada,
  onCancelar,
}: {
  salaId: string
  onCriada: (ficha: Ficha) => void
  onCancelar?: () => void
}) {
  const [nome, setNome] = useState('')
  const [classe, setClasse] = useState<Classe>('COMBATENTE')
  const [origem, setOrigem] = useState('')
  const [trilha, setTrilha] = useState('')
  const [nex, setNex] = useState(5)
  const [atributos, setAtributos] = useState<Record<Atributo, string>>({ for: '1', agi: '1', int: '1', vig: '1', pre: '1' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(enviando)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const { ficha } = await api<{ ficha: Ficha }>(`/salas/${salaId}/fichas`, {
        method: 'POST',
        body: {
          nome: nome.trim(),
          classe,
          origem: origem.trim(),
          trilha: trilha.trim(),
          nex,
          ...Object.fromEntries(ATRIBUTOS.map(([chave]) => [chave, Number(atributos[chave])])),
        },
      })
      onCriada(ficha)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <Folha className="p-4 sm:p-4">
    <form onSubmit={enviar} className="space-y-4">
      <h3 className={`text-3xl leading-none ${classeTituloArquivo}`}>Nova ficha</h3>
      <div>
        <label htmlFor="ficha-nome" className={classeRotulo}>Nome do personagem</label>
        <input id="ficha-nome" required value={nome} onChange={(e) => setNome(e.target.value)} disabled={enviando} className={classeCampo} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ficha-classe" className={classeRotulo}>Classe</label>
          <select id="ficha-classe" value={classe} onChange={(e) => setClasse(e.target.value as Classe)} disabled={enviando} className={classeSelect(false)}>
            {(Object.keys(NOME_CLASSE) as Classe[]).map((c) => <option key={c} value={c}>{NOME_CLASSE[c]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ficha-nex" className={classeRotulo}>NEX</label>
          <select id="ficha-nex" value={nex} onChange={(e) => setNex(Number(e.target.value))} disabled={enviando} className={classeSelect(false)}>
            {NEX_TIERS.map((n) => <option key={n} value={n}>{n}%</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ficha-origem" className={classeRotulo}>Origem</label>
          <input id="ficha-origem" required value={origem} onChange={(e) => setOrigem(e.target.value)} disabled={enviando} className={classeCampo} />
        </div>
        <div>
          <label htmlFor="ficha-trilha" className={classeRotulo}>Trilha</label>
          <input id="ficha-trilha" required value={trilha} onChange={(e) => setTrilha(e.target.value)} disabled={enviando} className={classeCampo} />
        </div>
      </div>
      <fieldset>
        <legend className={classeRotulo}>Atributos</legend>
        <div className="grid grid-cols-5 gap-2">
          {ATRIBUTOS.map(([chave, rotulo]) => (
            <div key={chave}>
              <label htmlFor={`ficha-${chave}`} className={`${classeRotulo} text-center`}>{rotulo}</label>
              <input id={`ficha-${chave}`} type="number" min={0} max={5} required value={atributos[chave]}
                onChange={(e) => setAtributos((a) => ({ ...a, [chave]: e.target.value }))}
                disabled={enviando} className={`${classeCampo} px-1 text-center`} />
            </div>
          ))}
        </div>
      </fieldset>
      {erro && <Alerta tom="papel" mensagem={erro} />}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={enviando} className={classeBotaoTinta}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Criando...' : 'Criar ficha'}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} disabled={enviando} className={classeBotaoContorno}>Cancelar</button>
        )}
      </div>
    </form>
    </Folha>
  )
}
