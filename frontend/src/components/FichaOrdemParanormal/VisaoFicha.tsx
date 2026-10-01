import { useState } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { api, mensagemDeErro } from '../../services/api'
import { NEX_TIERS, NOME_CLASSE, type Ficha, type TipoEntrada } from '../../services/tipos'
import { Alerta, Spinner } from '../ui/Feedback'
import { Abas, type Aba } from '../ui/Abas'
import { Folha } from '../ui/arquivo'
import { Icone } from '../ui/Icone'
import { classeAbaFolha, classeBotaoIconeFolha, classeRotulo, classeSelect, condensado } from '../ui/estilosArquivo'
import { AbaEntradas } from './AbaEntradas'
import { AbaInventario } from './AbaInventario'
import { AbaPericias } from './AbaPericias'
import { DefesaFicha } from './DefesaFicha'
import { HabilidadesDeClasse } from './HabilidadesDeClasse'
import { PentagonoAtributos } from './PentagonoAtributos'

type Recurso = 'pv' | 'pe' | 'san'

// Mesmo teto do servidor (ficha.service.ts, TETO_RECURSO) — só evita pedir o que ele recusaria.
const TETO_RECURSO = 999

// Ordem e nomes da ficha oficial: Vida, Sanidade, Esforço. Cada recurso tem a sua tinta.
// `passaDoMaximo`: habilidades do sistema dão Vida/Sanidade acima do máximo (o servidor aceita);
// Esforço para no máximo. `passo5`: botões de −5/+5 (dano e gasto de PE vêm em blocos).
const RECURSOS: { chave: Recurso; rotulo: string; cor: string; passaDoMaximo: boolean; passo5: boolean }[] = [
  { chave: 'pv', rotulo: 'Vida', cor: 'bg-recurso-vida', passaDoMaximo: true, passo5: true },
  { chave: 'san', rotulo: 'Sanidade', cor: 'bg-recurso-sanidade', passaDoMaximo: true, passo5: false },
  { chave: 'pe', rotulo: 'Esforço', cor: 'bg-recurso-esforco', passaDoMaximo: false, passo5: true },
]

const ABAS: Aba<AbaFicha>[] = [
  { chave: 'pericias', rotulo: 'Perícias' },
  { chave: 'RITUAL', rotulo: 'Rituais' },
  { chave: 'HABILIDADE', rotulo: 'Habilidades' },
  { chave: 'PODER', rotulo: 'Poderes' },
  { chave: 'EQUIPAMENTO', rotulo: 'Equipamentos' },
  { chave: 'inventario', rotulo: 'Inventário' },
]

type AbaFicha = 'pericias' | TipoEntrada | 'inventario'

const TIPOS_ENTRADA: readonly string[] = ['RITUAL', 'HABILIDADE', 'PODER', 'EQUIPAMENTO'] satisfies TipoEntrada[]

function atualDe(ficha: Ficha, recurso: Recurso) {
  return ficha[`${recurso}_atual`]
}

function maximoDe(ficha: Ficha, recurso: Recurso) {
  return ficha[`${recurso}_maximo_cache`]
}

// Tudo que aparece aqui vem do backend. Os botões +/− só PEDEM um novo valor
// atual; o servidor valida (≥ 0; Esforço ≤ máximo) e a tela exibe o que ele devolver.
export function VisaoFicha({
  ficha,
  podeEditar,
  onAtualizada,
}: {
  ficha: Ficha
  podeEditar: boolean
  onAtualizada: (ficha: Ficha) => void
}) {
  const [aba, setAba] = useState<AbaFicha>('pericias')
  const [pendente, setPendente] = useState<Recurso | 'nex' | 'defesa' | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(pendente !== null)

  async function enviar(campo: Recurso | 'nex' | 'defesa', corpo: Record<string, number>) {
    setErro(null)
    setPendente(campo)
    try {
      const { ficha: atualizada } = await api<{ ficha: Ficha }>(`/fichas/${ficha.id}`, { method: 'PATCH', body: corpo })
      onAtualizada(atualizada)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setPendente(null)
    }
  }

  // −5 com 3 de Vida pede 0; +5 de Esforço com 33/35 pede 35 — o botão não pede o que o servidor recusaria.
  const ajustar = (recurso: Recurso, delta: number, teto: number) =>
    enviar(recurso, { [`${recurso}_atual`]: Math.min(teto, Math.max(0, atualDe(ficha, recurso) + delta)) })

  return (
    // @container: o painel tem largura ajustável (320–560px) — as divisórias e a Defesa se ajustam
    // à largura da FOLHA, não da janela. Abaixo de 18.5rem de conteúdo, "Equipamentos" não cabe em 3 colunas.
    <Folha className="@container space-y-6 p-4 sm:p-4">
      <div className="flex items-center gap-3">
        {ficha.avatarUrl ? (
          <img src={ficha.avatarUrl} alt="" className="h-16 w-14 shrink-0 rounded-[2px] border-[3px] border-papel-50 object-cover shadow-[0_2px_4px_rgb(0_0_0/0.3)]" />
        ) : (
          <div aria-hidden="true" className={`flex h-16 w-14 shrink-0 items-center justify-center rounded-[2px] border-[3px] border-papel-50 bg-arquivo-800 text-2xl font-extrabold text-grafite-300 shadow-[0_2px_4px_rgb(0_0_0/0.3)] ${condensado}`}>
            {ficha.nome.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className={`truncate text-2xl leading-tight font-extrabold ${condensado}`}>{ficha.nome}</h3>
          <p className="text-sm text-tinta-700">
            {ficha.origem} · {NOME_CLASSE[ficha.classe]} · {ficha.trilha}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          {podeEditar ? (
            <label htmlFor={`nex-${ficha.id}`} className={`${classeRotulo} mb-0`}>NEX</label>
          ) : (
            <span className={`${classeRotulo} mb-0`}>NEX</span>
          )}
          {podeEditar ? (
            <div className="w-24">
              <select id={`nex-${ficha.id}`} value={ficha.nex} disabled={pendente !== null}
                onChange={(e) => enviar('nex', { nex: Number(e.target.value) })} className={`${classeSelect(false)} py-1`}>
                {NEX_TIERS.map((n) => <option key={n} value={n}>{n}%</option>)}
              </select>
            </div>
          ) : (
            <span className="font-datilo text-base">{ficha.nex}%</span>
          )}
        </div>
        <div className="h-2 rounded-[2px] bg-papel-300/70" aria-hidden="true">
          <div className="h-2 rounded-[2px] bg-tinta-900" style={{ width: `${ficha.nex}%` }} />
        </div>
      </div>

      <PentagonoAtributos atributos={ficha} />

      <DefesaFicha ficha={ficha} podeEditar={podeEditar} pendente={pendente !== null}
        onBonus={(bonus) => enviar('defesa', { defesa_bonus: bonus })} />

      <div className="space-y-4" role="group" aria-label="Recursos">
        {RECURSOS.map(({ chave, rotulo, cor, passaDoMaximo, passo5 }) => {
          const atual = atualDe(ficha, chave)
          const maximo = maximoDe(ficha, chave)
          const acima = atual > maximo
          const teto = passaDoMaximo ? TETO_RECURSO : maximo
          const bloqueado = pendente !== null
          return (
            <div key={chave}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <p className={`text-sm font-extrabold tracking-[0.12em] uppercase ${condensado}`}>{rotulo}</p>
                <p className="flex items-baseline gap-1.5 font-datilo text-base" aria-live="polite">
                  {pendente === chave && mostrarSpinner ? <Spinner tamanho="sm" /> : (
                    <>
                      {acima && <span className={`rounded-[2px] bg-tinta-900 px-1 font-arquivo text-xs font-bold tracking-[0.08em] text-papel-50 uppercase ${condensado}`}>acima do máx.</span>}
                      <span>{atual}<span className="text-tinta-600">/{maximo}</span></span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {podeEditar && passo5 && (
                  <button type="button" aria-label={`Diminuir 5 de ${rotulo}`} title={`−5 de ${rotulo}`} onClick={() => ajustar(chave, -5, teto)}
                    disabled={bloqueado || atual <= 0} className={`${classeBotaoIconeFolha} font-datilo text-sm`}>
                    −5
                  </button>
                )}
                {podeEditar && (
                  <button type="button" aria-label={`Diminuir ${rotulo}`} onClick={() => ajustar(chave, -1, teto)}
                    disabled={bloqueado || atual <= 0} className={classeBotaoIconeFolha}>
                    <Icone nome="menos" className="h-4 w-4" />
                  </button>
                )}
                {/* Acima do máximo: barra cheia com tracejado de tinta por cima (o excedente não cabe na régua). */}
                <div className="relative h-3 min-w-6 flex-1 overflow-hidden rounded-[2px] bg-papel-300/70" aria-hidden="true">
                  <div className={`h-full ${cor} transition-[width] duration-200 motion-reduce:transition-none`} style={{ width: `${maximo > 0 ? Math.min(100, (atual / maximo) * 100) : 0}%` }} />
                  {acima && <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_4px,rgb(255_255_255/0.45)_4px_6px)]" />}
                </div>
                {podeEditar && (
                  <button type="button" aria-label={`Aumentar ${rotulo}`} onClick={() => ajustar(chave, 1, teto)}
                    disabled={bloqueado || atual >= teto} className={classeBotaoIconeFolha}>
                    <Icone nome="mais" className="h-4 w-4" />
                  </button>
                )}
                {podeEditar && passo5 && (
                  <button type="button" aria-label={`Aumentar 5 de ${rotulo}`} title={`+5 de ${rotulo}`} onClick={() => ajustar(chave, 5, teto)}
                    disabled={bloqueado || atual >= teto} className={`${classeBotaoIconeFolha} font-datilo text-sm`}>
                    +5
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {erro && <Alerta tom="papel" mensagem={erro} />}
      </div>

      <div>
        <Abas abas={ABAS} ativa={aba} onTrocar={setAba} rotulo="Seções da ficha" idBase={`ficha-${ficha.id}`}
          classeAba={classeAbaFolha} classeLista="grid grid-cols-2 gap-1.5 @min-[18.5rem]:grid-cols-3" />
        <div role="tabpanel" id={`ficha-${ficha.id}-painel`} aria-labelledby={`ficha-${ficha.id}-aba-${aba}`} className="pt-4 text-sm">
          {aba === 'pericias' && <AbaPericias ficha={ficha} podeEditar={podeEditar} onAtualizada={onAtualizada} />}
          {aba === 'HABILIDADE' && <HabilidadesDeClasse ficha={ficha} />}
          {TIPOS_ENTRADA.includes(aba) && (
            <AbaEntradas key={aba} ficha={ficha} tipo={aba as TipoEntrada} podeEditar={podeEditar} onAtualizada={onAtualizada} />
          )}
          {aba === 'inventario' && <AbaInventario ficha={ficha} podeEditar={podeEditar} onAtualizada={onAtualizada} />}
        </div>
      </div>
    </Folha>
  )
}
