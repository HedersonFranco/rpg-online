import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useAtrasado } from '../../hooks/useAtrasado'
import { mensagemDeErro } from '../../services/api'
import { Alerta, Spinner } from '../../components/ui/Feedback'
import { classeBotaoTinta, classeCampo, classeLinkPapel, classeRotulo } from '../../components/ui/estilosArquivo'
import { LayoutAuth } from '../Login/LayoutAuth'

export default function Cadastro() {
  const { cadastrar } = useAuth()
  const location = useLocation()
  const [nome, setNome] = useState('')
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
      await cadastrar(nome.trim(), email.trim(), senha)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <LayoutAuth titulo="Criar conta" subtitulo="Leva menos de um minuto." rodape={
      <>
        Já tem conta?{' '}
        <Link to="/login" state={location.state} className={classeLinkPapel}>Entrar</Link>
      </>
    }>
      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label htmlFor="nome" className={classeRotulo}>Nome</label>
          <input id="nome" autoComplete="name" required maxLength={60} value={nome}
            onChange={(e) => setNome(e.target.value)} disabled={enviando} className={classeCampo} />
        </div>
        <div>
          <label htmlFor="email" className={classeRotulo}>Email</label>
          <input id="email" type="email" autoComplete="email" required maxLength={254} value={email}
            onChange={(e) => setEmail(e.target.value)} disabled={enviando} className={classeCampo} />
        </div>
        <div>
          <label htmlFor="senha" className={classeRotulo}>Senha</label>
          <input id="senha" type="password" autoComplete="new-password" required minLength={6} value={senha}
            onChange={(e) => setSenha(e.target.value)} disabled={enviando} className={classeCampo}
            aria-describedby="dica-senha" />
          <p id="dica-senha" className="mt-1 text-xs text-tinta-700">Mínimo de 6 caracteres.</p>
        </div>
        {erro && <Alerta tom="papel" mensagem={erro} />}
        <button type="submit" disabled={enviando} className={`${classeBotaoTinta} w-full`}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </LayoutAuth>
  )
}
