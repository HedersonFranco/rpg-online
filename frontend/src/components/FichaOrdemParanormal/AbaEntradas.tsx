import { useState, type FormEvent, type ReactNode } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { chaveDoAlvo, type AlvoTeste } from '../../hooks/useRolarTeste'
import { api, mensagemDeErro } from '../../services/api'
import {
  CATEGORIAS_EQUIPAMENTO,
  NOME_ELEMENTO,
  NOME_TIPO_ARMA,
  type ElementoRitual,
  type EntradaFicha,
  type Ficha,
  type TipoArma,
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
const TIPOS_ARMA = Object.keys(NOME_TIPO_ARMA) as TipoArma[]
// Campo numérico estreito (margem, multiplicador): sem as setinhas do navegador, que no Firefox cobriam o valor
// em 320px. As setas do teclado continuam mudando o número.
const semSetas = '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

type Rascunho = {
  nome: string
  descricao: string
  circulo: string
  elemento: ElementoRitual
  preRequisito: string
  categoria: string
  espacos: string
  tipoArma: TipoArma | ''
  dano: string
  danoExtra: string
  bonusAtaque: string
  margemAmeaca: string
  multiplicadorCritico: string
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
    tipoArma: entrada?.tipoArma ?? '',
    dano: entrada?.dano ?? '',
    danoExtra: entrada?.danoExtra ?? '',
    bonusAtaque: String(entrada?.bonusAtaque ?? 0),
    margemAmeaca: String(entrada?.margemAmeaca ?? 20),
    multiplicadorCritico: String(entrada?.multiplicadorCritico ?? 2),
  }
}

// Só manda os campos do tipo — o backend rejeita campo de outro tipo.
function corpoDe(tipo: TipoEntrada, r: Rascunho) {
  const base = { nome: r.nome.trim(), descricao: r.descricao }
  if (tipo === 'RITUAL') return { ...base, circulo: Number(r.circulo), elemento: r.elemento }
  if (tipo === 'PODER') return { ...base, preRequisito: r.preRequisito.trim() || null }
  if (tipo === 'EQUIPAMENTO') {
    const equipamento = { ...base, categoria: Number(r.categoria), espacos: Number(r.espacos) }
    // tipoArma null: deixa de ser arma (o backend limpa o resto da arma).
    if (!r.tipoArma) return { ...equipamento, tipoArma: null }
    return {
      ...equipamento,
      tipoArma: r.tipoArma,
      dano: r.dano.trim(),
      danoExtra: r.danoExtra.trim() || null,
      bonusAtaque: Number(r.bonusAtaque),
      margemAmeaca: Number(r.margemAmeaca),
      multiplicadorCritico: Number(r.multiplicadorCritico),
    }
  }
  return base
}

function detalhes(entrada: EntradaFicha) {
  if (entrada.tipo === 'RITUAL' && entrada.circulo && entrada.elemento) {
    return `${ROMANO[entrada.circulo - 1]} círculo · ${NOME_ELEMENTO[entrada.elemento]}`
  }
  if (entrada.tipo === 'PODER' && entrada.preRequisito) return `Pré-requisito: ${entrada.preRequisito}`
  if (entrada.tipo === 'EQUIPAMENTO' && entrada.categoria !== null) {
    const espacos = entrada.espacos === 1 ? '1 espaço' : `${entrada.espacos} espaços`
    const arma = entrada.tipoArma ? `${NOME_TIPO_ARMA[entrada.tipoArma]} · ` : ''
    return `${arma}Categoria ${CATEGORIAS_EQUIPAMENTO[entrada.categoria]} · ${espacos}`
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

      {tipo === 'EQUIPAMENTO' && (
        <div>
          <label htmlFor={id('tipo-arma')} className={classeRotulo}>Arma</label>
          <select id={id('tipo-arma')} value={r.tipoArma} onChange={campo('tipoArma')} disabled={enviando} className={classeSelect(false)}>
            <option value="">Não é arma</option>
            {TIPOS_ARMA.map((t) => <option key={t} value={t}>{NOME_TIPO_ARMA[t]}</option>)}
          </select>
        </div>
      )}

      {tipo === 'EQUIPAMENTO' && r.tipoArma && (
        <fieldset className="space-y-3">
          <legend className="sr-only">Dados da arma</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={id('dano')} className={classeRotulo}>Dano</label>
              <input id={id('dano')} required maxLength={60} value={r.dano} onChange={campo('dano')} disabled={enviando}
                autoComplete="off" spellCheck={false} placeholder="1d8" className={classeCampo} />
            </div>
            <div>
              <label htmlFor={id('dano-extra')} className={classeRotulo}>Dano extra <span className="font-normal normal-case tracking-normal text-tinta-600">(opcional)</span></label>
              <input id={id('dano-extra')} maxLength={60} value={r.danoExtra} onChange={campo('danoExtra')} disabled={enviando}
                autoComplete="off" spellCheck={false} placeholder="1d6" className={classeCampo} />
            </div>
          </div>
          {/* items-end: "Bônus de ataque" quebra em duas linhas em 320px; os campos ficam alinhados pelo pé. */}
          <div className="grid grid-cols-2 items-end gap-3">
            <div>
              <label htmlFor={id('bonus-ataque')} className={classeRotulo}>Bônus de ataque</label>
              <input id={id('bonus-ataque')} type="number" min={-50} max={50} required value={r.bonusAtaque} onChange={campo('bonusAtaque')}
                disabled={enviando} className={`${classeCampo} ${semSetas}`} />
            </div>
            <fieldset>
              <legend className={classeRotulo}>Crítico</legend>
              <div className="flex items-center gap-1">
                <input type="number" min={2} max={20} required value={r.margemAmeaca} onChange={campo('margemAmeaca')} disabled={enviando}
                  aria-label="Margem de ameaça" className={`${classeCampo} ${semSetas} px-1 text-center`} />
                <span aria-hidden="true" className="font-datilo text-sm">/x</span>
                <input type="number" min={2} max={10} required value={r.multiplicadorCritico} onChange={campo('multiplicadorCritico')}
                  disabled={enviando} aria-label="Multiplicador de crítico" className={`${classeCampo} ${semSetas} px-1 text-center`} />
              </div>
            </fieldset>
          </div>
          <p className="text-xs text-tinta-700">
            A Força entra sozinha no dano de corpo a corpo e arremesso. O dano extra não multiplica no crítico.
            Poder ou modificação que muda a margem, o multiplicador ou o bônus: ajuste aqui.
          </p>
        </fieldset>
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
  onRolar,
  rolando = null,
}: {
  ficha: Ficha
  tipo: TipoEntrada
  podeEditar: boolean
  onAtualizada: (ficha: Ficha) => void
  // Sem onRolar (quem não pode editar a ficha), os valores da arma aparecem só como texto.
  onRolar?: (alvo: AlvoTeste) => void
  rolando?: string | null
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
                <CartaoEntrada entrada={entrada} onRolar={onRolar} rolando={rolando} acoes={podeEditar && (
                  <>
                    <BotaoFavorito fichaId={ficha.id} entrada={entrada} onAtualizada={onAtualizada} onErro={setErro} />
                    <button type="button" onClick={() => setEditando(entrada.id)} disabled={removendo !== null}
                      aria-label={`Editar ${singular} ${entrada.nome}`} title="Editar" className={classeAcaoEntrada}>
                      <Icone nome="notas" className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remover(entrada)} disabled={removendo !== null}
                      aria-label={`Apagar ${singular} ${entrada.nome}`} title="Apagar" className={classeAcaoEntrada}>
                      {removendo === entrada.id && mostrarSpinner ? <Spinner tamanho="sm" /> : <Icone nome="lixeira" className="h-4 w-4" />}
                    </button>
                  </>
                )} />
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}

const classeAcaoEntrada =
  'inline-flex h-10 w-10 items-center justify-center rounded-sm text-tinta-700 hover:bg-tinta-900/10 hover:text-tinta-900 ' +
  'focus-visible:outline-2 focus-visible:outline-tinta-900 disabled:opacity-40'

// Uma entrada da ficha: nome, detalhes do tipo e descrição; `acoes` fica à direita do nome. Arma: os três botões.
function CartaoEntrada({ entrada, acoes, onRolar, rolando }: {
  entrada: EntradaFicha
  acoes?: ReactNode
  onRolar?: (alvo: AlvoTeste) => void
  rolando: string | null
}) {
  return (
    <>
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
        {acoes && <div className="flex shrink-0 gap-1">{acoes}</div>}
      </div>
      {entrada.arma && <BotoesArma entrada={entrada} onRolar={onRolar} rolando={rolando} />}
      {entrada.descricao && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-tinta-900">{entrada.descricao}</p>}
    </>
  )
}

// Ataque, dano e crítico da arma — os textos vêm prontos do servidor; o botão só pede a rolagem.
function BotoesArma({ entrada, onRolar, rolando }: {
  entrada: EntradaFicha
  onRolar?: (alvo: AlvoTeste) => void
  rolando: string | null
}) {
  const arma = entrada.arma!
  const { quantidade, modificador, modo } = arma.ataque
  const ataque = `${quantidade}d20${modificador > 0 ? `+${modificador}` : modificador < 0 ? modificador : ''}`
  const botoes = [
    { tipo: 'ataque', valor: ataque, nome: 'Ataque', leitor: `Rolar ataque com ${entrada.nome} (${arma.pericia}, ${ataque}${modo === 'menor' ? ', fica com o pior' : ''})` },
    { tipo: 'dano', valor: arma.dano, nome: 'Dano', leitor: `Rolar dano de ${entrada.nome} (${arma.dano})` },
    { tipo: 'critico', valor: arma.critico, nome: 'Crítico', leitor: `Rolar dano crítico de ${entrada.nome} (${arma.danoCritico})` },
  ] as const
  const titulo = (tipo: string) =>
    tipo === 'ataque' ? `${arma.pericia}${modo === 'menor' ? ' — atributo 0: rola 2d20 e fica com o pior' : ''}` : tipo === 'critico' ? `Rola ${arma.danoCritico}` : undefined
  const classe = 'flex min-w-0 flex-col items-start rounded-[2px] border border-tinta-900/40 px-2 py-1 text-left'
  const conteudo = (b: (typeof botoes)[number]) => (
    <>
      <span className="flex max-w-full items-center gap-1 truncate font-datilo text-sm">
        {rolando === chaveDoAlvo({ tipo: b.tipo, entradaId: entrada.id }) && <Spinner tamanho="sm" />}
        {b.valor}
      </span>
      <span className={`text-xs font-bold tracking-[0.12em] text-tinta-700 uppercase ${condensado}`}>{b.nome}</span>
    </>
  )
  return (
    <div role="group" aria-label={`Rolagens de ${entrada.nome}`} className="mt-2 grid grid-cols-3 gap-1.5">
      {botoes.map((b) => onRolar ? (
        <button key={b.tipo} type="button" onClick={() => onRolar({ tipo: b.tipo, entradaId: entrada.id })} disabled={rolando !== null}
          aria-label={b.leitor} title={titulo(b.tipo)}
          className={`${classe} hover:bg-tinta-900/10 focus-visible:outline-2 focus-visible:outline-tinta-900 disabled:cursor-wait disabled:opacity-60`}>
          {conteudo(b)}
        </button>
      ) : (
        <div key={b.tipo} title={titulo(b.tipo)} className={classe}>{conteudo(b)}</div>
      ))}
    </div>
  )
}

// Estrela: põe ou tira a entrada da aba Favoritos (quem pode editar a ficha).
function BotaoFavorito({ fichaId, entrada, onAtualizada, onErro }: {
  fichaId: string
  entrada: EntradaFicha
  onAtualizada: (ficha: Ficha) => void
  onErro: (erro: string | null) => void
}) {
  const [salvando, setSalvando] = useState(false)
  const mostrarSpinner = useAtrasado(salvando)

  async function alternar() {
    onErro(null)
    setSalvando(true)
    try {
      const { ficha } = await api<{ ficha: Ficha }>(`/fichas/${fichaId}/entradas/${entrada.id}`, { method: 'PATCH', body: { favorito: !entrada.favorito } })
      onAtualizada(ficha)
    } catch (e) {
      onErro(mensagemDeErro(e))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <button type="button" onClick={alternar} disabled={salvando} aria-pressed={entrada.favorito} aria-label={`Favorito: ${entrada.nome}`}
      title={entrada.favorito ? 'Tirar dos favoritos' : 'Pôr nos favoritos'} className={classeAcaoEntrada}>
      {mostrarSpinner ? <Spinner tamanho="sm" /> : <Icone nome={entrada.favorito ? 'estrelaCheia' : 'estrela'} className="h-4 w-4" />}
    </button>
  )
}

const TITULO_TIPO: Record<TipoEntrada, string> = { RITUAL: 'Rituais', HABILIDADE: 'Habilidades', PODER: 'Poderes', EQUIPAMENTO: 'Equipamentos' }

// Aba Favoritos: o que o jogador marcou com a estrela, agrupado por tipo, sem precisar procurar nas abas.
// Editar e apagar continuam na aba do tipo; aqui só se tira dos favoritos.
export function AbaFavoritos({ ficha, podeEditar, onAtualizada, onRolar, rolando = null }: {
  ficha: Ficha
  podeEditar: boolean
  onAtualizada: (ficha: Ficha) => void
  onRolar?: (alvo: AlvoTeste) => void
  rolando?: string | null
}) {
  const [erro, setErro] = useState<string | null>(null)
  const favoritas = ficha.entradas.filter((e) => e.favorito)

  if (favoritas.length === 0) {
    return (
      <p className="py-4 text-center text-tinta-700">
        {podeEditar ? 'Nenhum favorito ainda. Marque a estrela de um ritual, habilidade, poder ou equipamento para ele aparecer aqui.' : 'Nenhum favorito nesta ficha.'}
      </p>
    )
  }
  return (
    <div className="space-y-4">
      {erro && <Alerta tom="papel" mensagem={erro} />}
      {(Object.keys(TITULO_TIPO) as TipoEntrada[]).map((tipo) => {
        const doTipo = favoritas.filter((e) => e.tipo === tipo)
        if (doTipo.length === 0) return null
        return (
          <section key={tipo} aria-labelledby={`favoritos-${tipo}`}>
            <h3 id={`favoritos-${tipo}`} className={`text-xs font-bold tracking-[0.12em] text-tinta-700 uppercase ${condensado}`}>{TITULO_TIPO[tipo]}</h3>
            <ul className="divide-y divide-papel-300">
              {doTipo.map((entrada) => (
                <li key={entrada.id} className="py-3">
                  <CartaoEntrada entrada={entrada} onRolar={onRolar} rolando={rolando} acoes={podeEditar && (
                    <BotaoFavorito fichaId={ficha.id} entrada={entrada} onAtualizada={onAtualizada} onErro={setErro} />
                  )} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
