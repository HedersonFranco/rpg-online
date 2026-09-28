import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth, useUsuarioLogado } from '../../hooks/useAuth'
import { useAtrasado } from '../../hooks/useAtrasado'
import { useRecurso } from '../../hooks/useRecurso'
import { api, mensagemDeErro } from '../../services/api'
import { NOME_SISTEMA, type SalaDetalhe, type SalaNaLista, type SalaResumo, type Sistema } from '../../services/tipos'
import { Alerta, Carregando, Spinner } from '../../components/ui/Feedback'
import { Icone } from '../../components/ui/Icone'
import { CarimboPapel, Folha, Pasta, PastaVazia, PlacaGaveta } from '../../components/ui/arquivo'
import {
  classeBotaoArquivo,
  classeBotaoContorno,
  classeBotaoTinta,
  classeCampo,
  classeRotulo,
  classeSelect,
  classeTituloArquivo,
  condensado,
} from '../../components/ui/estilosArquivo'

// Aceita tanto o código puro quanto o link inteiro (…/convite/<código>).
function extrairCodigoConvite(texto: string) {
  const limpo = texto.trim()
  const marcador = '/convite/'
  const indice = limpo.lastIndexOf(marcador)
  return indice >= 0 ? limpo.slice(indice + marcador.length).replace(/\/+$/, '') : limpo
}

function FormCriarMesa({ mesasComoDono }: { mesasComoDono: number | null }) {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [sistema, setSistema] = useState<Sistema | ''>('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(enviando)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const sala = await api<SalaResumo>('/salas', { method: 'POST', body: { nome: nome.trim(), sistema } })
      navigate(`/salas/${sala.id}`)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="nome-mesa" className={classeRotulo}>Nome da mesa</label>
        <input id="nome-mesa" required value={nome} onChange={(e) => setNome(e.target.value)}
          disabled={enviando} className={classeCampo} placeholder="Ex.: Operação Casarão" />
      </div>
      <div>
        <label htmlFor="sistema" className={classeRotulo}>Sistema de regras</label>
        <select id="sistema" required value={sistema} onChange={(e) => setSistema(e.target.value as Sistema)}
          disabled={enviando} className={classeSelect(sistema === '')}>
          <option value="" disabled>Escolha o sistema</option>
          <option value="ORDEM_PARANORMAL_1">{NOME_SISTEMA.ORDEM_PARANORMAL_1}</option>
          <option value="ORDEM_PARANORMAL_2">{NOME_SISTEMA.ORDEM_PARANORMAL_2}</option>
        </select>
        <p className="mt-1 text-xs text-tinta-700">Não dá pra trocar depois — as fichas herdam o sistema da mesa.</p>
      </div>
      {mesasComoDono !== null && (
        <p className="text-sm text-tinta-700">
          {mesasComoDono === 0 ? 'Você pode criar até 3 mesas.' : `Você é dono de ${mesasComoDono} de 3 mesas possíveis.`}
        </p>
      )}
      {erro && <Alerta tom="papel" mensagem={erro} />}
      <button type="submit" disabled={enviando} className={`${classeBotaoTinta} w-full sm:w-auto`}>
        {mostrarSpinner && <Spinner tamanho="sm" />}
        {enviando ? 'Criando...' : 'Criar mesa'}
      </button>
    </form>
  )
}

function FormEntrarComConvite() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(enviando)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const { sala } = await api<{ sala: SalaDetalhe }>('/salas/entrar', {
        method: 'POST',
        body: { token: extrairCodigoConvite(codigo) },
      })
      navigate(`/salas/${sala.id}`)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="convite" className={classeRotulo}>Link ou código do convite</label>
        <input id="convite" required value={codigo} onChange={(e) => setCodigo(e.target.value)}
          disabled={enviando} className={classeCampo} placeholder="Cole aqui o que o mestre te enviou" />
      </div>
      {erro && <Alerta tom="papel" mensagem={erro} />}
      <button type="submit" disabled={enviando} className={`${classeBotaoContorno} w-full sm:w-auto`}>
        {mostrarSpinner && <Spinner tamanho="sm" />}
        {enviando ? 'Entrando...' : 'Entrar na mesa'}
      </button>
    </form>
  )
}

// Aba da pasta: o sistema da mesa, curto o bastante para caber.
const ABA_SISTEMA: Record<Sistema, string> = {
  ORDEM_PARANORMAL_1: 'Ordem Paranormal',
  ORDEM_PARANORMAL_2: 'Ordem Paranormal II · playtest',
}

function PastaDaMesa({ sala, souDono }: { sala: SalaNaLista; souDono: boolean }) {
  return (
    <Link to={`/salas/${sala.id}`} aria-label={`${sala.nome} — ${NOME_SISTEMA[sala.sistema]}`}
      className="pasta-gaveta block h-full rounded-[5px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kraft-300">
      <Pasta aba={ABA_SISTEMA[sala.sistema]} className="h-full">
        <div className="flex h-full min-h-44 flex-col justify-between gap-4 p-4">
          <p className={`rounded-[2px] bg-papel-50 px-3 py-2.5 text-xl leading-tight font-bold break-words text-tinta-900 shadow-[0_1px_2px_rgb(0_0_0/0.25)] ${condensado}`}>
            {sala.nome}
          </p>
          <div className="flex items-end justify-between gap-3">
            <p className="font-datilo text-sm leading-tight text-tinta-900">
              Aberta em {new Date(sala.createdAt).toLocaleDateString('pt-BR')}
              {souDono && <><br />Criada por você</>}
            </p>
            {sala.papel && <CarimboPapel papel={sala.papel} />}
          </div>
        </div>
      </Pasta>
    </Link>
  )
}

export default function ListaSalas() {
  const usuario = useUsuarioLogado()
  const { sair } = useAuth()
  const { estado, recarregar } = useRecurso<SalaNaLista[]>('/salas')
  const mesasComoDono = estado.tipo === 'ok' ? estado.dados.filter((s) => s.donoId === usuario.id).length : null

  return (
    <div className="mundo-arquivo">
      <header className="border-b border-arquivo-700 bg-arquivo-950/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <PlacaGaveta />
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-sm text-grafite-300">{usuario.nome}</span>
            <button type="button" onClick={sair} className={classeBotaoArquivo}>
              <Icone nome="sair" className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-4 pt-8 pb-16 sm:pt-12">
        <section aria-labelledby="titulo-mesas">
          <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1 id="titulo-mesas" className={`text-5xl leading-none sm:text-6xl ${classeTituloArquivo}`}>Suas mesas</h1>
            {estado.tipo === 'ok' && estado.dados.length > 0 && (
              <p className="text-sm text-grafite-300">
                {estado.dados.length === 1 ? '1 mesa no arquivo' : `${estado.dados.length} mesas no arquivo`}
              </p>
            )}
          </div>
          {estado.tipo === 'carregando' && <Carregando texto="Carregando suas mesas..." />}
          {estado.tipo === 'erro' && <Alerta tom="arquivo" mensagem={estado.mensagem} onTentarNovamente={recarregar} />}
          {estado.tipo === 'ok' && estado.dados.length === 0 && (
            <PastaVazia>
              <p className={`text-2xl text-kraft-300 ${classeTituloArquivo}`}>Nenhuma mesa nesta gaveta</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-grafite-300">
                Você ainda não está em nenhuma mesa. Crie uma abaixo ou entre com o convite do seu mestre.
              </p>
            </PastaVazia>
          )}
          {estado.tipo === 'ok' && estado.dados.length > 0 && (
            <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {estado.dados.map((sala) => (
                <li key={sala.id}>
                  <PastaDaMesa sala={sala} souDono={sala.donoId === usuario.id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid items-start gap-6 md:grid-cols-2">
          <section aria-labelledby="titulo-criar">
            <Folha>
              <h2 id="titulo-criar" className={`mb-5 text-3xl leading-none ${classeTituloArquivo}`}>Criar mesa</h2>
              <FormCriarMesa mesasComoDono={mesasComoDono} />
            </Folha>
          </section>
          <section aria-labelledby="titulo-entrar">
            <Folha>
              <h2 id="titulo-entrar" className={`mb-5 text-3xl leading-none ${classeTituloArquivo}`}>Entrar com convite</h2>
              <FormEntrarComConvite />
            </Folha>
          </section>
        </div>
      </main>
    </div>
  )
}
