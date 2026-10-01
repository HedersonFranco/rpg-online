import { useState } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { api, mensagemDeErro } from '../../services/api'
import {
  NOME_NIVEL_TREINO,
  type Ficha,
  type NivelTreino,
  type TestePericia,
} from '../../services/tipos'
import { Alerta, Spinner } from '../ui/Feedback'
import { classeCampo, classeSelect, condensado } from '../ui/estilosArquivo'

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
    <div className="space-y-4">
      {/* Folha estreita (painel perto de 320px): o filtro desce para a linha de baixo e a busca fica inteira. */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-40 flex-1">
          <label htmlFor="busca-pericia" className="sr-only">Buscar perícia</label>
          <input id="busca-pericia" type="search" placeholder="Buscar perícia" value={busca}
            onChange={(e) => setBusca(e.target.value)} className={`${classeCampo} py-1.5`} />
        </div>
        <div role="group" aria-label="Filtrar perícias" className="flex shrink-0 overflow-hidden rounded-sm border-2 border-tinta-900">
          {([[false, 'Todas'], [true, 'Treinadas']] as const).map(([valor, rotulo]) => (
            <button key={rotulo} type="button" aria-pressed={soTreinadas === valor} onClick={() => setSoTreinadas(valor)}
              className={`min-h-10 px-2.5 text-xs font-bold tracking-[0.08em] uppercase ${condensado} focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-papel-50 ${soTreinadas === valor ? 'bg-tinta-900 text-papel-50' : 'text-tinta-900 hover:bg-tinta-900/10'}`}>
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      {erro && <Alerta tom="papel" mensagem={erro} />}

      {visiveis.length === 0 ? (
        <p className="py-4 text-center text-tinta-700">
          {soTreinadas && !termo ? 'Nenhuma perícia treinada ainda.' : 'Nenhuma perícia encontrada.'}
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className={`text-left text-xs tracking-[0.1em] text-tinta-700 uppercase ${condensado}`}>
              <th className="pb-1.5 font-bold">Perícia</th>
              <th className="pb-1.5 font-bold">Teste</th>
              <th className="pb-1.5 text-right font-bold">Treino</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-papel-300">
            {visiveis.map((teste) => {
              const treinada = teste.nivel !== 'DESTREINADO'
              return (
                <tr key={teste.nome} className={treinada ? 'text-tinta-900' : 'text-tinta-600'}>
                  <td className="py-1.5 pr-2">
                    <span className={treinada ? 'font-bold' : ''}>{teste.nome}</span>{' '}
                    <span className={`text-xs tracking-[0.08em] uppercase ${condensado}`}>{teste.atributoBase}</span>
                  </td>
                  <td className="py-1.5 pr-3 font-datilo text-sm whitespace-nowrap"
                    title={teste.modo === 'menor' ? 'Atributo 0: rola 2d20 e fica com o pior' : 'Rola os d20 e fica com o melhor'}>
                    {expressaoTeste(teste)}
                    {teste.modo === 'menor' && <span className="ml-1 font-arquivo text-xs text-tinta-700">(pior)</span>}
                  </td>
                  <td className="w-32 py-1 text-right">
                    {pendente === teste.nome && mostrarSpinner ? (
                      <Spinner tamanho="sm" />
                    ) : podeEditar ? (
                      <select aria-label={`Treino em ${teste.nome}`} value={teste.nivel} disabled={pendente !== null}
                        onChange={(e) => treinar(teste.nome, e.target.value as NivelTreino)}
                        // Destreinada não mostra a linha do campo até o hover/foco: as treinadas saltam aos olhos.
                        className={`${classeSelect(false)} py-1 text-sm ${treinada ? '' : '!border-transparent !bg-transparent !text-xs text-tinta-600 hover:!border-tinta-600 focus:!border-tinta-900'}`}>
                        {NIVEIS.map((n) => <option key={n} value={n}>{NOME_NIVEL_TREINO[n]}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs">{NOME_NIVEL_TREINO[teste.nivel]}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
