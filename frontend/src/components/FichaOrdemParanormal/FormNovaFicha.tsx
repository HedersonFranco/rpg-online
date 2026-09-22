import { useState, type FormEvent } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { api, mensagemDeErro } from '../../services/api'
import { NEX_TIERS, NOME_CLASSE, type Classe, type Ficha } from '../../services/tipos'
import { Alerta, Spinner } from '../ui/Feedback'
import { classeBotaoPrimario, classeBotaoSecundario, classeInput, classeLabel } from '../ui/estilos'

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
    <form onSubmit={enviar} className="space-y-3">
      <h3 className="font-semibold">Nova ficha</h3>
      <div>
        <label htmlFor="ficha-nome" className={classeLabel}>Nome do personagem</label>
        <input id="ficha-nome" required value={nome} onChange={(e) => setNome(e.target.value)} disabled={enviando} className={classeInput} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ficha-classe" className={classeLabel}>Classe</label>
          <select id="ficha-classe" value={classe} onChange={(e) => setClasse(e.target.value as Classe)} disabled={enviando} className={classeInput}>
            {(Object.keys(NOME_CLASSE) as Classe[]).map((c) => <option key={c} value={c}>{NOME_CLASSE[c]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ficha-nex" className={classeLabel}>NEX</label>
          <select id="ficha-nex" value={nex} onChange={(e) => setNex(Number(e.target.value))} disabled={enviando} className={classeInput}>
            {NEX_TIERS.map((n) => <option key={n} value={n}>{n}%</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ficha-origem" className={classeLabel}>Origem</label>
          <input id="ficha-origem" required value={origem} onChange={(e) => setOrigem(e.target.value)} disabled={enviando} className={classeInput} />
        </div>
        <div>
          <label htmlFor="ficha-trilha" className={classeLabel}>Trilha</label>
          <input id="ficha-trilha" required value={trilha} onChange={(e) => setTrilha(e.target.value)} disabled={enviando} className={classeInput} />
        </div>
      </div>
      <fieldset>
        <legend className={classeLabel}>Atributos</legend>
        <div className="grid grid-cols-5 gap-2">
          {ATRIBUTOS.map(([chave, rotulo]) => (
            <div key={chave}>
              <label htmlFor={`ficha-${chave}`} className="block text-center text-xs font-semibold text-zinc-400">{rotulo}</label>
              <input id={`ficha-${chave}`} type="number" min={0} max={5} required value={atributos[chave]}
                onChange={(e) => setAtributos((a) => ({ ...a, [chave]: e.target.value }))}
                disabled={enviando} className={`${classeInput} px-1 text-center`} />
            </div>
          ))}
        </div>
      </fieldset>
      {erro && <Alerta mensagem={erro} />}
      <div className="flex gap-2">
        <button type="submit" disabled={enviando} className={classeBotaoPrimario}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Criando...' : 'Criar ficha'}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} disabled={enviando} className={classeBotaoSecundario}>Cancelar</button>
        )}
      </div>
    </form>
  )
}
