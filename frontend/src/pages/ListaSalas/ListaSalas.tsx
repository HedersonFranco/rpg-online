import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth, useUsuarioLogado } from '../../hooks/useAuth'
import { useAtrasado } from '../../hooks/useAtrasado'
import { useRecurso } from '../../hooks/useRecurso'
import { api, mensagemDeErro } from '../../services/api'
import { NOME_SISTEMA, type SalaDetalhe, type SalaResumo, type Sistema } from '../../services/tipos'
import { Alerta, Carregando, Spinner } from '../../components/ui/Feedback'
import { Icone } from '../../components/ui/Icone'
import { classeBotaoPrimario, classeBotaoSecundario, classeInput, classeLabel } from '../../components/ui/estilos'

// Aceita tanto o código puro quanto o link inteiro (…/convite/<código>).
function extrairCodigoConvite(texto: string) {
  const limpo = texto.trim()
  const marcador = '/convite/'
  const indice = limpo.lastIndexOf(marcador)
  return indice >= 0 ? limpo.slice(indice + marcador.length).replace(/\/+$/, '') : limpo
}

function FormCriarMesa() {
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
    <form onSubmit={enviar} className="space-y-3">
      <div>
        <label htmlFor="nome-mesa" className={classeLabel}>Nome da mesa</label>
        <input id="nome-mesa" required value={nome} onChange={(e) => setNome(e.target.value)}
          disabled={enviando} className={classeInput} placeholder="Ex.: Operação Casarão" />
      </div>
      <div>
        <label htmlFor="sistema" className={classeLabel}>Sistema de regras</label>
        <select id="sistema" required value={sistema} onChange={(e) => setSistema(e.target.value as Sistema)}
          disabled={enviando} className={classeInput}>
          <option value="" disabled>Escolha o sistema</option>
          <option value="ORDEM_PARANORMAL_1">{NOME_SISTEMA.ORDEM_PARANORMAL_1}</option>
          <option value="ORDEM_PARANORMAL_2">{NOME_SISTEMA.ORDEM_PARANORMAL_2}</option>
        </select>
        <p className="mt-1 text-xs text-zinc-500">Não dá pra trocar depois — as fichas herdam o sistema da mesa.</p>
      </div>
      {erro && <Alerta mensagem={erro} />}
      <button type="submit" disabled={enviando} className={`${classeBotaoPrimario} w-full sm:w-auto`}>
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
    <form onSubmit={enviar} className="space-y-3">
      <div>
        <label htmlFor="convite" className={classeLabel}>Link ou código do convite</label>
        <input id="convite" required value={codigo} onChange={(e) => setCodigo(e.target.value)}
          disabled={enviando} className={classeInput} placeholder="Cole aqui o que o mestre te enviou" />
      </div>
      {erro && <Alerta mensagem={erro} />}
      <button type="submit" disabled={enviando} className={`${classeBotaoSecundario} w-full sm:w-auto`}>
        {mostrarSpinner && <Spinner tamanho="sm" />}
        {enviando ? 'Entrando...' : 'Entrar na mesa'}
      </button>
    </form>
  )
}

export default function ListaSalas() {
  const usuario = useUsuarioLogado()
  const { sair } = useAuth()
  const { estado, recarregar } = useRecurso<SalaResumo[]>('/salas')

  return (
    <div className="min-h-full">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <span className="text-sm font-semibold tracking-widest text-violet-400 uppercase">RPG Online</span>
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-sm text-zinc-400">{usuario.nome}</span>
            <button type="button" onClick={sair} className={`${classeBotaoSecundario} px-2 py-1.5 text-sm`}>
              <Icone nome="sair" className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6">
        <section aria-labelledby="titulo-mesas">
          <h1 id="titulo-mesas" className="mb-4 text-xl font-semibold">Suas mesas</h1>
          {estado.tipo === 'carregando' && <Carregando texto="Carregando suas mesas..." />}
          {estado.tipo === 'erro' && <Alerta mensagem={estado.mensagem} onTentarNovamente={recarregar} />}
          {estado.tipo === 'ok' && estado.dados.length === 0 && (
            <p className="rounded-lg border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-400">
              Você ainda não está em nenhuma mesa. Crie uma abaixo ou entre com o convite do seu mestre.
            </p>
          )}
          {estado.tipo === 'ok' && estado.dados.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {estado.dados.map((sala) => (
                <li key={sala.id}>
                  <Link to={`/salas/${sala.id}`}
                    className="block rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 hover:border-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                    <p className="truncate font-medium text-zinc-100">{sala.nome}</p>
                    <p className="mt-1 text-xs text-zinc-400">{NOME_SISTEMA[sala.sistema]}</p>
                    {sala.donoId === usuario.id && (
                      <span className="mt-2 inline-block rounded bg-violet-950 px-2 py-0.5 text-xs text-violet-300">Você é o dono</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <section aria-labelledby="titulo-criar" className="rounded-lg border border-zinc-800 p-4">
            <h2 id="titulo-criar" className="mb-3 font-semibold">Criar mesa</h2>
            <FormCriarMesa />
          </section>
          <section aria-labelledby="titulo-entrar" className="rounded-lg border border-zinc-800 p-4">
            <h2 id="titulo-entrar" className="mb-3 font-semibold">Entrar com convite</h2>
            <FormEntrarComConvite />
          </section>
        </div>
      </main>
    </div>
  )
}
