import Peer, { type MediaConnection } from 'peerjs'
import type { ParticipanteVideo } from './tipos'

export type EstadoPar = 'conectando' | 'conectado' | 'reconectando' | 'falhou'

export type ConfigSinalizacao = {
  host: string
  port: number
  path: string
  secure: boolean
  iceServers: RTCIceServer[]
}

const MAX_FALHAS = 3
const ESPERA_CONEXAO_MS = 8_000
const ESPERA_QUEM_ATENDE_MS = 20_000

// Trilhas "vazias" (vídeo preto 2×2, áudio mudo) pra quem está sem câmera: a
// chamada sempre tem as duas trilhas, e ligar/desligar a câmera vira só trocar
// a trilha (replaceTrack) — sem fechar e refazer a conexão.
function criarSaidaVazia(): MediaStream {
  const canvas = Object.assign(document.createElement('canvas'), { width: 2, height: 2 })
  canvas.getContext('2d')?.fillRect(0, 0, 2, 2)
  const saida = canvas.captureStream(1)
  try {
    const audio = new AudioContext()
    const destino = audio.createMediaStreamDestination()
    const faixa = destino.stream.getAudioTracks()[0]
    if (faixa) saida.addTrack(faixa)
  } catch {
    // sem Web Audio: a chamada segue só com vídeo
  }
  return saida
}

// Malha P2P: uma chamada por par, criada UMA vez e sempre pelo participante de
// peerId menor (com ou sem câmera). A câmera só troca trilhas nas chamadas
// existentes. Queda: quem ligou tenta de novo com espera crescente; na 3ª falha
// para e a tela oferece "Reconectar". Quem atende espera 20s e oferece o mesmo botão.
const novoPeerId = () => `p-${crypto.randomUUID()}`

export class MalhaVideo {
  // Muda se a sinalização precisar ser recriada: o servidor PeerJS segura o id
  // antigo por um tempo depois de uma queda ("ID is taken"), então volta com um
  // id novo e se reanuncia — os outros reconectam sozinhos a esse novo par.
  private id = novoPeerId()
  get peerId() {
    return this.id
  }
  aoMudar: (streams: Record<string, MediaStream>, estados: Record<string, EstadoPar>) => void = () => {}
  aoAbrir: () => void = () => {}
  aoPedirReconexao: (peerId: string) => void = () => {}

  private config: ConfigSinalizacao | null = null
  private peer: Peer | null = null
  private saidaVazia: MediaStream | null = null
  private camera: MediaStream | null = null
  private participantes: ParticipanteVideo[] = []
  private chamadas = new Map<string, MediaConnection>()
  private streams = new Map<string, MediaStream>()
  private estados = new Map<string, EstadoPar>()
  private falhas = new Map<string, number>()
  private timers = new Map<string, ReturnType<typeof setTimeout>>()
  private destruida = false
  private ultimoErroSinalizacao: string | null = null

  get temCamera() {
    return this.camera !== null
  }

  private get saida(): MediaStream {
    if (this.camera) return this.camera
    this.saidaVazia ??= criarSaidaVazia()
    return this.saidaVazia
  }

  iniciar(config: ConfigSinalizacao) {
    this.config = config
    this.criarPeer()
  }

  atualizarParticipantes(lista: ParticipanteVideo[]) {
    this.participantes = lista
    this.reconciliar()
  }

  usarCamera(camera: MediaStream | null) {
    this.camera = camera
    const saida = this.saida
    for (const chamada of this.chamadas.values()) {
      for (const sender of chamada.peerConnection?.getSenders() ?? []) {
        const nova = saida.getTracks().find((t) => t.kind === sender.track?.kind)
        if (nova && sender.track !== nova) sender.replaceTrack(nova).catch(() => {})
      }
    }
  }

  reconectarManual(peerId: string) {
    if (!this.participantes.some((p) => p.peerId === peerId)) return
    this.falhas.delete(peerId)
    this.encerrar(peerId)
    if (this.souQuemLiga(peerId)) {
      this.ligar(peerId)
    } else {
      this.definirEstado(peerId, 'reconectando')
      this.aoPedirReconexao(peerId)
      this.agendar(peerId, () => this.estados.get(peerId) !== 'conectado' && this.definirEstado(peerId, 'falhou'), ESPERA_QUEM_ATENDE_MS)
    }
  }

  aoPedidoDeReconexao(peerId: string) {
    if (!this.participantes.some((p) => p.peerId === peerId) || !this.souQuemLiga(peerId)) return
    this.falhas.delete(peerId)
    this.encerrar(peerId)
    this.ligar(peerId)
  }

  destruir() {
    this.destruida = true
    for (const timer of this.timers.values()) clearTimeout(timer)
    this.timers.clear()
    for (const chamada of this.chamadas.values()) chamada.close()
    this.chamadas.clear()
    this.saidaVazia?.getTracks().forEach((t) => t.stop())
    this.peer?.destroy()
    this.peer = null
  }

  // Só pra teste em desenvolvimento: simula a sinalização deste participante
  // sumindo (e voltando) enquanto ele continua na sala.
  derrubarSinalizacao() {
    this.peer?.destroy()
    this.peer = null
  }

  restaurarSinalizacao() {
    if (this.peer) return
    this.id = novoPeerId()
    // Com id novo, TODO par é novo pro outro lado: estado antigo (ex.: 'falhou')
    // faria o reconciliar pular o par pra sempre quando for a nossa vez de ligar.
    for (const peerId of new Set([...this.estados.keys(), ...this.chamadas.keys()])) this.esquecer(peerId)
    this.criarPeer()
  }

  // Só desenvolvimento: fotografia do estado interno pra depurar a malha.
  diagnostico() {
    return {
      eu: this.peerId,
      temCamera: this.temCamera,
      sinalizacaoAberta: this.peer?.open ?? false,
      ultimoErroSinalizacao: this.ultimoErroSinalizacao,
      pares: this.participantes
        .filter((p) => p.peerId !== this.peerId)
        .map((p) => {
          const pc = this.chamadas.get(p.peerId)?.peerConnection
          return {
            nome: p.nome,
            euLigo: this.souQuemLiga(p.peerId),
            estado: this.estados.get(p.peerId),
            falhas: this.falhas.get(p.peerId) ?? 0,
            temStream: this.streams.has(p.peerId),
            ice: pc?.iceConnectionState ?? null,
          }
        }),
    }
  }

  private souQuemLiga(peerId: string) {
    return this.peerId < peerId
  }

  private criarPeer() {
    if (!this.config || this.destruida) return
    const { host, port, path, secure, iceServers } = this.config
    const peer = new Peer(this.peerId, { host, port, path, secure, config: { iceServers }, debug: 0 })
    peer.on('open', () => {
      this.aoAbrir()
      this.reconciliar()
    })
    peer.on('call', (chamada) => this.receber(chamada))
    peer.on('disconnected', () => {
      if (!this.destruida && this.peer === peer && !peer.destroyed) peer.reconnect()
    })
    peer.on('error', (erro) => {
      this.ultimoErroSinalizacao = `${erro.type}: ${erro.message}`
      if (erro.type === 'unavailable-id' && this.peer === peer) {
        peer.destroy()
        this.peer = null
        this.restaurarSinalizacao()
        return
      }
      // "Could not connect to peer <id>": o outro lado não está na sinalização.
      if (erro.type === 'peer-unavailable') {
        const alvo = /(\S+)$/.exec(erro.message)?.[1]
        if (alvo && this.chamadas.has(alvo)) this.falhou(alvo)
      }
    })
    this.peer = peer
  }

  private reconciliar() {
    if (this.destruida) return
    const outros = this.participantes.filter((p) => p.peerId !== this.peerId)
    const presentes = new Set(outros.map((p) => p.peerId))
    for (const peerId of new Set([...this.chamadas.keys(), ...this.estados.keys()])) {
      if (!presentes.has(peerId)) this.esquecer(peerId)
    }
    if (this.peer?.open) {
      for (const outro of outros) {
        if (this.estados.has(outro.peerId)) continue // par já em andamento (ou esperando botão)
        if (this.souQuemLiga(outro.peerId)) this.ligar(outro.peerId)
        else this.definirEstado(outro.peerId, 'conectando')
      }
    }
    this.notificar()
  }

  private ligar(peerId: string) {
    // Sinalização fora do ar também conta como tentativa que falhou — senão o par
    // ficaria "reconectando" pra sempre, sem nunca chegar no botão manual.
    if (!this.peer?.open) return this.falhou(peerId)
    this.definirEstado(peerId, this.falhas.has(peerId) ? 'reconectando' : 'conectando')
    this.acompanhar(this.peer.call(peerId, this.saida))
  }

  private receber(chamada: MediaConnection) {
    if (!this.participantes.some((p) => p.peerId === chamada.peer)) {
      chamada.close() // só atende quem está na lista da sala
      return
    }
    this.encerrar(chamada.peer)
    this.definirEstado(chamada.peer, this.falhas.has(chamada.peer) ? 'reconectando' : 'conectando')
    chamada.answer(this.saida)
    this.acompanhar(chamada)
  }

  private acompanhar(chamada: MediaConnection) {
    const peerId = chamada.peer
    this.chamadas.set(peerId, chamada)
    const vigente = () => this.chamadas.get(peerId) === chamada
    let remoto: MediaStream | null = null
    let confirmada = false

    // 'stream' chega na negociação, antes de haver conexão: sucesso é ICE conectado.
    const confirmarSePronto = () => {
      const ice = chamada.peerConnection?.iceConnectionState
      if (confirmada || !vigente() || !remoto || (ice !== 'connected' && ice !== 'completed')) return
      confirmada = true
      this.cancelarTimer(peerId)
      this.falhas.delete(peerId)
      this.streams.set(peerId, remoto)
      this.definirEstado(peerId, 'conectado')
    }
    this.agendar(peerId, () => vigente() && !confirmada && this.falhou(peerId), ESPERA_CONEXAO_MS)

    chamada.on('stream', (stream) => {
      remoto = stream
      confirmarSePronto()
    })
    chamada.on('close', () => vigente() && this.falhou(peerId))
    chamada.on('error', () => vigente() && this.falhou(peerId))

    // Queda real passa por 'disconnected' (o navegador pode levar ~30s pra dizer
    // 'failed'): desconectado por 5s já conta como falha.
    let verificacao: ReturnType<typeof setTimeout> | undefined
    chamada.peerConnection?.addEventListener('iceconnectionstatechange', () => {
      const ice = chamada.peerConnection?.iceConnectionState
      clearTimeout(verificacao)
      if (ice === 'connected' || ice === 'completed') confirmarSePronto()
      else if (ice === 'failed' && vigente()) this.falhou(peerId)
      else if (ice === 'disconnected') {
        verificacao = setTimeout(() => {
          const agora = chamada.peerConnection?.iceConnectionState
          if (agora !== 'connected' && agora !== 'completed' && vigente()) this.falhou(peerId)
        }, 5000)
      }
    })
  }

  private falhou(peerId: string) {
    this.encerrar(peerId)
    if (this.destruida || !this.participantes.some((p) => p.peerId === peerId)) return this.esquecer(peerId)

    if (this.souQuemLiga(peerId)) {
      const n = (this.falhas.get(peerId) ?? 0) + 1
      this.falhas.set(peerId, n)
      if (n >= MAX_FALHAS) {
        this.definirEstado(peerId, 'falhou')
      } else {
        this.definirEstado(peerId, 'reconectando')
        this.agendar(peerId, () => this.ligar(peerId), 1000 * 2 ** (n - 1))
      }
    } else {
      // Quem atende espera quem liga tentar de novo; sem sinal em 20s, oferece o botão.
      this.definirEstado(peerId, 'reconectando')
      this.agendar(peerId, () => this.estados.get(peerId) !== 'conectado' && this.definirEstado(peerId, 'falhou'), ESPERA_QUEM_ATENDE_MS)
    }
  }

  private encerrar(peerId: string) {
    this.cancelarTimer(peerId)
    const chamada = this.chamadas.get(peerId)
    this.chamadas.delete(peerId) // tira antes de fechar: o 'close' dela não conta como falha
    chamada?.close()
    this.streams.delete(peerId)
  }

  private esquecer(peerId: string) {
    this.encerrar(peerId)
    this.estados.delete(peerId)
    this.falhas.delete(peerId)
    this.notificar()
  }

  private agendar(peerId: string, acao: () => unknown, ms: number) {
    this.cancelarTimer(peerId)
    this.timers.set(peerId, setTimeout(() => {
      this.timers.delete(peerId)
      acao()
    }, ms))
  }

  private cancelarTimer(peerId: string) {
    const timer = this.timers.get(peerId)
    if (timer) clearTimeout(timer)
    this.timers.delete(peerId)
  }

  private definirEstado(peerId: string, estado: EstadoPar) {
    this.estados.set(peerId, estado)
    this.notificar()
  }

  private notificar() {
    this.aoMudar(Object.fromEntries(this.streams), Object.fromEntries(this.estados))
  }
}
