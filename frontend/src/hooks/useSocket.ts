import { useContext, useEffect, useRef } from 'react'
import { SalaSocketContext } from './salaSocketContext'

export function useSalaSocket() {
  const valor = useContext(SalaSocketContext)
  if (!valor) throw new Error('useSalaSocket precisa estar dentro de <SalaSocketProvider>')
  return valor
}

// Chama `aoResincronizar` sempre que a conexão (re)entra na sala DEPOIS da
// montagem — é o momento de rebuscar o que pode ter mudado enquanto offline.
export function useAoResincronizar(aoResincronizar: () => void) {
  const { sincronia } = useSalaSocket()
  const sincroniaNaMontagem = useRef(sincronia)
  const callback = useRef(aoResincronizar)

  useEffect(() => {
    callback.current = aoResincronizar
  })

  useEffect(() => {
    if (sincronia !== sincroniaNaMontagem.current) callback.current()
  }, [sincronia])
}

// Assina um evento do socket enquanto o componente estiver montado.
export function useEventoSocket<T>(evento: string, tratar: (dados: T) => void) {
  const { socket } = useSalaSocket()
  const tratarRef = useRef(tratar)

  useEffect(() => {
    tratarRef.current = tratar
  })

  useEffect(() => {
    const ouvinte = (dados: T) => tratarRef.current(dados)
    socket.on(evento, ouvinte)
    return () => {
      socket.off(evento, ouvinte)
    }
  }, [socket, evento])
}
