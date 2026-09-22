import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useAtrasado } from '../../hooks/useAtrasado'
import { mensagemDeErro } from '../../services/api'
import { Alerta, Spinner } from '../../components/ui/Feedback'
import { classeBotaoPrimario, classeInput, classeLabel } from '../../components/ui/estilos'
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
    <LayoutAuth titulo="Criar conta" subtitulo="Leva menos de um minuto.">
      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label htmlFor="nome" className={classeLabel}>Nome</label>
          <input id="nome" autoComplete="name" required value={nome}
            onChange={(e) => setNome(e.target.value)} disabled={enviando} className={classeInput} />
        </div>
        <div>
          <label htmlFor="email" className={classeLabel}>Email</label>
          <input id="email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} disabled={enviando} className={classeInput} />
        </div>
        <div>
          <label htmlFor="senha" className={classeLabel}>Senha</label>
          <input id="senha" type="password" autoComplete="new-password" required minLength={6} value={senha}
            onChange={(e) => setSenha(e.target.value)} disabled={enviando} className={classeInput}
            aria-describedby="dica-senha" />
          <p id="dica-senha" className="mt-1 text-xs text-zinc-500">Mínimo de 6 caracteres.</p>
        </div>
        {erro && <Alerta mensagem={erro} />}
        <button type="submit" disabled={enviando} className={`${classeBotaoPrimario} w-full`}>
          {mostrarSpinner && <Spinner tamanho="sm" />}
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Já tem conta?{' '}
        <Link to="/login" state={location.state} className="font-medium text-violet-400 hover:text-violet-300">
          Entrar
        </Link>
      </p>
    </LayoutAuth>
  )
}
