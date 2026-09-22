import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { io } from 'socket.io-client'
import { BASE_URL, lerToken } from '../services/api'
import type { Combate, Rolagem } from '../services/tipos'
import { useAuth } from './useAuth'
import { SalaSocketContext, type StatusConexao } from './salaSocketContext'

type Resposta = { ok: boolean; erro?: string } & Record<string, unknown>
type EstadoSala = { instancia: string; combate: Combate | null; ultimaRolagem: Rolagem | null }

export function SalaSocketProvider({ salaId, children }: { salaId: string; children: ReactNode }) {
  const { sair } = useAuth()
  // Criado desligado; o efeito conecta e desconecta (sobrevive ao duplo efeito do StrictMode).
  const [socket] = useState(() =>
    io(BASE_URL, {
      autoConnect: false,
      transports: ['websocket'],
      auth: (cb) => cb({ token: lerToken() }),
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    }),
  )
  const [status, setStatus] = useState<StatusConexao>('conectando')
  const [sincronia, setSincronia] = useState(0)
  const [combate, setCombate] = useState<Combate | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [rolagens, setRolagens] = useState<Rolagem[]>([])
  const combateRef = useRef<Combate | null>(null)
  const instanciaRef = useRef<string | null>(null)

  const emitir = useCallback(
    <T,>(evento: string, dados?: unknown) =>
      new Promise<T>((resolver, rejeitar) => {
        socket.timeout(8000).emit(evento, dados ?? {}, (erro: Error | null, resposta: Resposta) => {
          if (erro) return rejeitar(new Error('Sem resposta do servidor. Verifique sua conexão.'))
          if (!resposta.ok) return rejeitar(new Error(resposta.erro ?? 'Erro desconhecido'))
          resolver(resposta as T)
        })
      }),
    [socket],
  )

  useEffect(() => {
    function aplicarCombate(novo: Combate | null) {
      combateRef.current = novo
      setCombate(novo)
      if (novo) setAviso(null)
    }

    function adicionarRolagem(rolagem: Rolagem) {
      setRolagens((atuais) => (atuais.some((r) => r.id === rolagem.id) ? atuais : [...atuais.slice(-49), rolagem]))
    }

    async function aoConectar() {
      setStatus('conectado')
      try {
        await emitir('sala:entrar', { salaId })
        // Pedido explícito de estado ao (re)conectar — o que perdemos offline volta aqui.
        const estado = await emitir<EstadoSala>('turno:estadoSolicitado')
        const servidorReiniciou = instanciaRef.current !== null && estado.instancia !== instanciaRef.current
        if (combateRef.current && !estado.combate && servidorReiniciou) {
          setAviso('Sessão reiniciada — reinicie o combate.')
        }
        instanciaRef.current = estado.instancia
        aplicarCombate(estado.combate)
        if (estado.ultimaRolagem) adicionarRolagem(estado.ultimaRolagem)
        setSincronia((s) => s + 1)
      } catch {
        setStatus('reconectando')
      }
    }

    const aoDesconectar = () => setStatus('reconectando')
    const aoErroConexao = (erro: Error) => {
      // Middleware recusou o token (expirou): o socket.io não tenta de novo sozinho nesse caso.
      if (erro.message === 'nao_autenticado') sair()
      else setStatus('reconectando')
    }
    const aoEstadoTurno = ({ combate: novo }: { combate: Combate | null }) => aplicarCombate(novo)

    socket.on('connect', aoConectar)
    socket.on('disconnect', aoDesconectar)
    socket.on('connect_error', aoErroConexao)
    socket.on('turno:estado', aoEstadoTurno)
    socket.on('rolagem:resultado', adicionarRolagem)
    socket.connect()

    return () => {
      socket.off('connect', aoConectar)
      socket.off('disconnect', aoDesconectar)
      socket.off('connect_error', aoErroConexao)
      socket.off('turno:estado', aoEstadoTurno)
      socket.off('rolagem:resultado', adicionarRolagem)
      socket.disconnect()
    }
  }, [socket, salaId, sair, emitir])

  const limparAviso = useCallback(() => setAviso(null), [])

  const valor = useMemo(
    () => ({ socket, status, sincronia, combate, aviso, limparAviso, rolagens, emitir }),
    [socket, status, sincronia, combate, aviso, limparAviso, rolagens, emitir],
  )

  return <SalaSocketContext.Provider value={valor}>{children}</SalaSocketContext.Provider>
}
