import { useState } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { api, mensagemDeErro } from '../../services/api'
import {
  BONUS_NIVEL_TREINO,
  NOME_NIVEL_TREINO,
  type Ficha,
  type NivelTreino,
  type TestePericia,
} from '../../services/tipos'
import { Alerta, Spinner } from '../ui/Feedback'
import { classeInput } from '../ui/estilos'

const NIVEIS = Object.keys(NOME_NIVEL_TREINO) as NivelTreino[]

// "3d20+5" — os números vêm prontos do backend; aqui só vira texto.
function expressaoTeste(teste: TestePericia) {
  const bonus = teste.bonus > 0 ? `+${teste.bonus}` : ''
  return `${teste.dados}d20${bonus}`
}

export function AbaPericias({
  ficha,
  podeEditar,
  onAtualizada,
}: {
  ficha: Ficha
  podeEditar: boolean
  onAtualizada: (ficha: Ficha) => void
}) {
  const [busca, setBusca] = useState('')
  const [soTreinadas, setSoTreinadas] = useState(false)
  const [pendente, setPendente] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(pendente !== null)

  async function treinar(nome: string, nivel: NivelTreino) {
    setErro(null)
    setPendente(nome)
    try {
      const { ficha: atualizada } = await api<{ ficha: Ficha }>(`/fichas/${ficha.id}/pericias`, {
        method: 'POST',
        body: { nome, nivel },
      })
      onAtualizada(atualizada)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setPendente(null)
    }
  }

  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const visiveis = ficha.testesPericias.filter(
    (t) => (!soTreinadas || t.nivel !== 'DESTREINADO') && (!termo || t.nome.toLocaleLowerCase('pt-BR').includes(termo)),
  )

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <label htmlFor="busca-pericia" className="sr-only">Buscar perícia</label>
        <input id="busca-pericia" type="search" placeholder="Buscar perícia" value={busca}
          onChange={(e) => setBusca(e.target.value)} className={`${classeInput} py-1.5 text-sm`} />
        <div role="group" aria-label="Filtrar perícias" className="flex shrink-0 overflow-hidden rounded-md border border-zinc-700 text-xs">
          {([[false, 'Todas'], [true, 'Treinadas']] as const).map(([valor, rotulo]) => (
            <button key={rotulo} type="button" aria-pressed={soTreinadas === valor} onClick={() => setSoTreinadas(valor)}
              className={`px-2.5 ${soTreinadas === valor ? 'bg-violet-600/30 text-violet-200' : 'text-zinc-400 hover:bg-zinc-800'}`}>
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      {erro && <Alerta mensagem={erro} />}

      {visiveis.length === 0 ? (
        <p className="py-4 text-center text-zinc-500">
          {soTreinadas && !termo ? 'Nenhuma perícia treinada ainda.' : 'Nenhuma perícia encontrada.'}
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-zinc-500">
              <th className="pb-1 font-medium">Perícia</th>
              <th className="pb-1 font-medium">Teste</th>
              <th className="pb-1 text-right font-medium">Treino</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {visiveis.map((teste) => (
              <tr key={teste.nome} className={teste.nivel !== 'DESTREINADO' ? 'text-zinc-100' : 'text-zinc-400'}>
                <td className="py-1.5">
                  {teste.nome} <span className="text-[10px] uppercase text-zinc-500">{teste.atributoBase}</span>
                </td>
                <td className="py-1.5 font-mono text-xs tabular-nums"
                  title={teste.modo === 'menor' ? 'Atributo 0: rola 2d20 e fica com o pior' : 'Rola os d20 e fica com o melhor'}>
                  {expressaoTeste(teste)}
                  {teste.modo === 'menor' && <span className="ml-1 font-sans text-[10px] text-amber-400">(pior)</span>}
                </td>
                <td className="py-1 text-right">
                  {pendente === teste.nome && mostrarSpinner ? (
                    <Spinner tamanho="sm" />
                  ) : podeEditar ? (
                    <select aria-label={`Treino em ${teste.nome}`} value={teste.nivel} disabled={pendente !== null}
                      onChange={(e) => treinar(teste.nome, e.target.value as NivelTreino)}
                      className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-xs text-zinc-200">
                      {NIVEIS.map((n) => <option key={n} value={n}>{NOME_NIVEL_TREINO[n]} ({BONUS_NIVEL_TREINO[n]})</option>)}
                    </select>
                  ) : (
                    <span className="text-xs">{NOME_NIVEL_TREINO[teste.nivel]}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
