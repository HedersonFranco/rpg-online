import { useState } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { api, mensagemDeErro } from '../../services/api'
import { NOME_CLASSE, NOME_NIVEL_TREINO, type Ficha } from '../../services/tipos'
import { Alerta, Spinner } from '../ui/Feedback'
import { Icone } from '../ui/Icone'

type Recurso = 'pv' | 'pe' | 'san'

const RECURSOS: { chave: Recurso; rotulo: string; cor: string }[] = [
  { chave: 'pv', rotulo: 'PV', cor: 'bg-red-500' },
  { chave: 'pe', rotulo: 'PE', cor: 'bg-amber-400' },
  { chave: 'san', rotulo: 'Sanidade', cor: 'bg-sky-400' },
]

const ATRIBUTOS = [['for', 'FOR'], ['agi', 'AGI'], ['int', 'INT'], ['vig', 'VIG'], ['pre', 'PRE']] as const

const ABAS = [
  ['pericias', 'Atributos e Perícias'],
  ['rituais', 'Rituais'],
  ['inventario', 'Inventário'],
  ['caracteristicas', 'Características'],
] as const

type Aba = (typeof ABAS)[number][0]

function atualDe(ficha: Ficha, recurso: Recurso) {
  return ficha[`${recurso}_atual`]
}

function maximoDe(ficha: Ficha, recurso: Recurso) {
  return ficha[`${recurso}_maximo_cache`]
}

// Tudo que aparece aqui vem do backend. Os botões +/− só PEDEM um novo valor
// atual; o servidor valida (0 ≤ atual ≤ máximo) e a tela exibe o que ele devolver.
export function VisaoFicha({
  ficha,
  podeEditar,
  onAtualizada,
}: {
  ficha: Ficha
  podeEditar: boolean
  onAtualizada: (ficha: Ficha) => void
}) {
  const [aba, setAba] = useState<Aba>('pericias')
  const [pendente, setPendente] = useState<Recurso | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(pendente !== null)

  async function ajustar(recurso: Recurso, delta: number) {
    setErro(null)
    setPendente(recurso)
    try {
      const { ficha: atualizada } = await api<{ ficha: Ficha }>(`/fichas/${ficha.id}`, {
        method: 'PATCH',
        body: { [`${recurso}_atual`]: atualDe(ficha, recurso) + delta },
      })
      onAtualizada(atualizada)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setPendente(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {ficha.avatarUrl ? (
          <img src={ficha.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-900 text-xl font-semibold text-violet-200">
            {ficha.nome.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{ficha.nome}</h3>
          <p className="truncate text-sm text-zinc-400">
            {ficha.origem} · {NOME_CLASSE[ficha.classe]} · {ficha.trilha}
          </p>
        </div>
      </div>

      <div className="flex gap-2" aria-label="Recursos">
        {RECURSOS.map(({ chave, rotulo }) => (
          <span key={chave} className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-300">
            {rotulo} <strong className="text-zinc-100">{atualDe(ficha, chave)}/{maximoDe(ficha, chave)}</strong>
          </span>
        ))}
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-zinc-400">
          <span>NEX</span>
          <span className="font-semibold text-zinc-200">{ficha.nex}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800">
          <div className="h-2 rounded-full bg-violet-500" style={{ width: `${ficha.nex}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        {RECURSOS.map(({ chave, rotulo, cor }) => {
          const atual = atualDe(ficha, chave)
          const maximo = maximoDe(ficha, chave)
          return (
            <div key={chave} className="flex items-center gap-2">
              <span className="w-16 text-xs font-medium text-zinc-400">{rotulo}</span>
              {podeEditar && (
                <button type="button" aria-label={`Diminuir ${rotulo}`} onClick={() => ajustar(chave, -1)}
                  disabled={pendente !== null || atual <= 0}
                  className="rounded border border-zinc-700 p-1 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40">
                  <Icone nome="menos" className="h-3.5 w-3.5" />
                </button>
              )}
              <div className="h-2.5 flex-1 rounded-full bg-zinc-800">
                <div className={`h-2.5 rounded-full ${cor}`} style={{ width: `${maximo > 0 ? (atual / maximo) * 100 : 0}%` }} />
              </div>
              {podeEditar && (
                <button type="button" aria-label={`Aumentar ${rotulo}`} onClick={() => ajustar(chave, 1)}
                  disabled={pendente !== null || atual >= maximo}
                  className="rounded border border-zinc-700 p-1 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40">
                  <Icone nome="mais" className="h-3.5 w-3.5" />
                </button>
              )}
              <span className="w-14 text-right text-xs tabular-nums text-zinc-300">
                {pendente === chave && mostrarSpinner ? <Spinner tamanho="sm" /> : `${atual}/${maximo}`}
              </span>
            </div>
          )
        })}
        {erro && <Alerta mensagem={erro} />}
      </div>

      <div>
        <div role="tablist" aria-label="Seções da ficha" className="flex gap-1 border-b border-zinc-800">
          {ABAS.map(([chave, rotulo]) => (
            <button key={chave} type="button" role="tab" aria-selected={aba === chave} onClick={() => setAba(chave)}
              className={`-mb-px border-b-2 px-2 py-2 text-xs font-medium ${aba === chave ? 'border-violet-500 text-violet-300' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>
              {rotulo}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="pt-3 text-sm">
          {aba === 'pericias' && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {ATRIBUTOS.map(([chave, rotulo]) => (
                  <div key={chave} className="rounded-lg border border-zinc-800 bg-zinc-900 py-2 text-center">
                    <p className="text-[10px] font-semibold tracking-wider text-zinc-500">{rotulo}</p>
                    <p className="text-xl font-semibold">{ficha[chave]}</p>
                  </div>
                ))}
              </div>
              {ficha.pericias.length === 0 ? (
                <p className="text-zinc-500">Nenhuma perícia treinada.</p>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {ficha.pericias.map((fp) => (
                    <li key={fp.id} className="flex justify-between py-1.5">
                      <span>{fp.pericia.nome} <span className="text-xs text-zinc-500">({fp.pericia.atributoBase})</span></span>
                      <span className="text-zinc-400">{NOME_NIVEL_TREINO[fp.nivel]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {aba === 'rituais' && <p className="text-zinc-500">Nenhum ritual conhecido.</p>}
          {aba === 'inventario' && (
            ficha.inventario?.trim()
              ? <p className="whitespace-pre-wrap text-zinc-300">{ficha.inventario}</p>
              : <p className="text-zinc-500">Inventário vazio.</p>
          )}
          {aba === 'caracteristicas' && <p className="text-zinc-500">Nenhuma habilidade registrada ainda.</p>}
        </div>
      </div>
    </div>
  )
}
