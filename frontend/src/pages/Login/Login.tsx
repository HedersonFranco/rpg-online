import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useAtrasado } from '../../hooks/useAtrasado'
import { mensagemDeErro } from '../../services/api'
import { Alerta, Spinner } from '../../components/ui/Feedback'
import { classeBotaoTinta, classeCampo, classeLinkPapel, classeRotulo } from '../../components/ui/estilosArquivo'
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
    <LayoutAuth titulo="Entrar" subtitulo="Acesse suas mesas de Ordem Paranormal." rodape={
      <>
        Não tem conta?{' '}
        <Link to="/cadastro" state={location.state} className={classeLinkPapel}>Criar conta</Link>
      </>
    }>
      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label htmlFor="email" className={classeRotulo}>Email</label>
          <input id="email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} disabled={enviando} className={classeCampo} />
        </div>
        <div>
          <label htmlFor="senha" className={classeRotulo}>Senha</label>
          <input id="senha" type="password" autoComplete="current-password" required value={senha}
            onChange={(e) => setSenha(e.target.value)} disabled={enviando} className={classeCampo} />
        </div>
        {erro && <Alerta tom="papel" mensagem={erro} />}
        <button type="submit" disabled={enviando} className={`${classeBotaoTinta} w-full`}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </LayoutAuth>
  )
}
