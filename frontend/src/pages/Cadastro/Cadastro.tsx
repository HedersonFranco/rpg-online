import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useAtrasado } from '../../hooks/useAtrasado'
import { mensagemDeErro } from '../../services/api'
import { Alerta, Spinner } from '../../components/ui/Feedback'
import { Icone } from '../../components/ui/Icone'
import { classeBotaoTinta, classeCampo, classeLinkPapel, classeRotulo, condensado } from '../../components/ui/estilosArquivo'
import { LayoutAuth } from '../Login/LayoutAuth'

// Mesmo checklist de usuario.service.ts no backend (que é quem barra de verdade); aqui ele só aparece.
// Símbolo é qualquer coisa fora de letra, acento combinado ou número — espaço conta.
const REGRAS_SENHA = [
  { texto: '8 caracteres ou mais', atende: (s: string) => s.length >= 8 },
  { texto: 'Uma letra maiúscula', atende: (s: string) => /\p{Lu}/u.test(s) },
  { texto: 'Uma letra minúscula', atende: (s: string) => /\p{Ll}/u.test(s) },
  { texto: 'Um número', atende: (s: string) => /\p{N}/u.test(s) },
  { texto: 'Um símbolo (!@#...)', atende: (s: string) => /[^\p{L}\p{M}\p{N}]/u.test(s) },
]

export default function Cadastro() {
  const { cadastrar } = useAuth()
  const location = useLocation()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  // Tentou enviar com a senha fora do checklist: o que falta passa a aparecer como erro.
  const [tentou, setTentou] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const campoSenha = useRef<HTMLInputElement>(null)
  const mostrarSpinner = useAtrasado(enviando)
  const senhaValida = REGRAS_SENHA.every((regra) => regra.atende(senha))

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!senhaValida) {
      // Volta o foco para a senha: o leitor de tela lê o checklist junto (aria-describedby).
      setTentou(true)
      campoSenha.current?.focus()
      return
    }
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
          <div className="flex items-center gap-2">
            <input id="senha" ref={campoSenha} type={mostrarSenha ? 'text' : 'password'} autoComplete="new-password" required
              maxLength={72} value={senha} onChange={(e) => setSenha(e.target.value)} disabled={enviando} className={classeCampo}
              aria-describedby="regras-senha" aria-invalid={tentou && !senhaValida} />
            <button type="button" onClick={() => setMostrarSenha((v) => !v)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              className={`w-18 shrink-0 rounded-sm py-2 text-center text-xs font-bold tracking-[0.12em] text-tinta-700 uppercase hover:text-tinta-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900 ${condensado}`}>
              {mostrarSenha ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <ul id="regras-senha" className="mt-2 space-y-1 text-xs">
            {REGRAS_SENHA.map(({ texto, atende }) => {
              const ok = atende(senha)
              return (
                <li key={texto} className={`flex items-center gap-1.5 ${ok ? 'text-tinta-900' : tentou ? 'font-bold text-carimbo-800' : 'text-tinta-600'}`}>
                  <Icone nome={ok ? 'certo' : 'errado'} className="h-3.5 w-3.5 shrink-0" />
                  {texto}
                  <span className="sr-only">{ok ? ': ok' : ': falta'}</span>
                </li>
              )
            })}
          </ul>
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
