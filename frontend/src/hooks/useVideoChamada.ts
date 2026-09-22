import { useCallback, useEffect, useRef, useState } from 'react'
import { api, BASE_URL } from '../services/api'
import { MalhaVideo, type EstadoPar } from '../services/malhaVideo'
import type { ParticipanteVideo } from '../services/tipos'
import { useAoResincronizar, useEventoSocket, useSalaSocket } from './useSocket'

export type ModoCamera = 'desligada' | 'pedindo' | 'ligada' | 'negada' | 'indisponivel'

function configDaSinalizacao(iceServers: RTCIceServer[]) {
  const url = new URL(BASE_URL)
  const secure = url.protocol === 'https:'
  return { host: url.hostname, port: Number(url.port || (secure ? 443 : 80)), path: '/peerjs', secure, iceServers }
}

// Vídeo nunca é requisito: sem câmera (recusada ou inexistente) a pessoa
// continua na mesa em texto+mapa e ainda vê o vídeo de quem tem câmera.
export function useVideoChamada() {
  const { emitir } = useSalaSocket()
  const malha = useRef<MalhaVideo | null>(null)
  const streamLocalRef = useRef<MediaStream | null>(null)
  const [participantes, setParticipantes] = useState<ParticipanteVideo[]>([])
  const [streams, setStreams] = useState<Record<string, MediaStream>>({})
  const [estados, setEstados] = useState<Record<string, EstadoPar>>({})
  const [streamLocal, setStreamLocal] = useState<MediaStream | null>(null)
  const [modo, setModo] = useState<ModoCamera>('desligada')
  const [microfoneLigado, setMicrofoneLigado] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const anunciar = useCallback(
    (temCamera: boolean) => {
      const m = malha.current
      if (m) emitir('video:entrar', { peerId: m.peerId, temCamera }).catch(() => {})
    },
    [emitir],
  )

  useEffect(() => {
    let cancelado = false
    const nova = new MalhaVideo()
    nova.aoMudar = (s, e) => {
      setStreams(s)
      setEstados(e)
    }
    nova.aoAbrir = () => emitir('video:entrar', { peerId: nova.peerId, temCamera: nova.temCamera }).catch(() => {})
    nova.aoPedirReconexao = (peerId) => emitir('video:pedirReconexao', { peerId }).catch(() => {})
    malha.current = nova

    api<{ iceServers: RTCIceServer[] }>('/rtc/config')
      .then(({ iceServers }) => {
        if (cancelado) return
        nova.iniciar(configDaSinalizacao(iceServers))
        if (import.meta.env.DEV) {
          // Gancho só de desenvolvimento pra testar queda de vídeo sem derrubar a sala.
          ;(window as unknown as Record<string, unknown>).__rpgVideo = {
            derrubar: () => nova.derrubarSinalizacao(),
            restaurar: () => nova.restaurarSinalizacao(),
            diagnostico: () => nova.diagnostico(),
          }
        }
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível iniciar o vídeo. A mesa continua funcionando em texto e mapa.')
      })

    return () => {
      cancelado = true
      nova.destruir()
      malha.current = null
      emitir('video:sair').catch(() => {})
      streamLocalRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [emitir])

  useEventoSocket<{ participantes: ParticipanteVideo[] }>('video:participantes', ({ participantes: lista }) => {
    setParticipantes(lista)
    malha.current?.atualizarParticipantes(lista)
  })
  useEventoSocket<{ peerId: string }>('video:reconexaoPedida', ({ peerId }) => malha.current?.aoPedidoDeReconexao(peerId))
  // O socket novo (pós-queda) não sabe que esta aba está no vídeo: anuncia de novo.
  useAoResincronizar(() => anunciar(malha.current?.temCamera ?? false))

  async function ligarCamera() {
    setErro(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setModo('indisponivel')
      return
    }
    setModo('pedindo')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: true })
      streamLocalRef.current = stream
      setStreamLocal(stream)
      setMicrofoneLigado(true)
      setModo('ligada')
      malha.current?.usarCamera(stream)
      anunciar(true)
    } catch (e) {
      const nome = e instanceof DOMException ? e.name : ''
      setModo(nome === 'NotAllowedError' || nome === 'SecurityError' ? 'negada' : 'indisponivel')
    }
  }

  function desligarCamera() {
    streamLocalRef.current?.getTracks().forEach((t) => t.stop())
    streamLocalRef.current = null
    setStreamLocal(null)
    setModo('desligada')
    malha.current?.usarCamera(null)
    anunciar(false)
  }

  function alternarMicrofone() {
    const faixa = streamLocalRef.current?.getAudioTracks()[0]
    if (!faixa) return
    faixa.enabled = !faixa.enabled
    setMicrofoneLigado(faixa.enabled)
  }

  const reconectar = (peerId: string) => malha.current?.reconectarManual(peerId)

  return {
    participantes, streams, estados, streamLocal, modo, microfoneLigado, erro,
    ligarCamera, desligarCamera, alternarMicrofone, reconectar,
  }
}
