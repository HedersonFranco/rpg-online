import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useAtrasado } from '../../hooks/useAtrasado'
import { mensagemDeErro } from '../../services/api'
import { Alerta, Spinner } from '../../components/ui/Feedback'
import { classeBotaoPrimario, classeInput, classeLabel } from '../../components/ui/estilos'
import { LayoutAuth } from './LayoutAuth'

export default function Login() {
  const { entrar } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(enviando)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await entrar(email.trim(), senha)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <LayoutAuth titulo="Entrar" subtitulo="Acesse suas mesas de Ordem Paranormal.">
      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label htmlFor="email" className={classeLabel}>Email</label>
          <input id="email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} disabled={enviando} className={classeInput} />
        </div>
        <div>
          <label htmlFor="senha" className={classeLabel}>Senha</label>
          <input id="senha" type="password" autoComplete="current-password" required value={senha}
            onChange={(e) => setSenha(e.target.value)} disabled={enviando} className={classeInput} />
        </div>
        {erro && <Alerta mensagem={erro} />}
        <button type="submit" disabled={enviando} className={`${classeBotaoPrimario} w-full`}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Não tem conta?{' '}
        <Link to="/cadastro" state={location.state} className="font-medium text-violet-400 hover:text-violet-300">
          Criar conta
        </Link>
      </p>
    </LayoutAuth>
  )
}
