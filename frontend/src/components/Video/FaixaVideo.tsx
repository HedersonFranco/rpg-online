import { useEffect, useRef, useState } from 'react'
import { useSalaSocket } from '../../hooks/useSocket'
import { useVideoChamada, type ModoCamera } from '../../hooks/useVideoChamada'
import type { EstadoPar } from '../../services/malhaVideo'
import type { SalaDetalhe, Usuario } from '../../services/tipos'
import { Icone } from '../ui/Icone'
import { classeBotaoArquivo, classeBotaoIconeArquivo, condensado } from '../ui/estilosArquivo'

function VideoAoVivo({ stream, silenciado, nome }: { stream: MediaStream; silenciado: boolean; nome: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [somBloqueado, setSomBloqueado] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.srcObject = stream
    // Navegadores bloqueiam autoplay COM som sem interação (NotAllowedError): cai
    // pro mudo e oferece o botão. Outras rejeições (ex.: AbortError quando a fonte é
    // reatribuída) não são bloqueio — tratar como bloqueio silenciaria o áudio à toa.
    el.play().catch((erro: unknown) => {
      if (silenciado || !(erro instanceof DOMException) || erro.name !== 'NotAllowedError') return
      el.muted = true
      setSomBloqueado(true)
      el.play().catch(() => {})
    })
  }, [stream, silenciado])

  return (
    <>
      <video ref={ref} autoPlay playsInline muted={silenciado} aria-label={`Vídeo de ${nome}`}
        className={`absolute inset-0 h-full w-full object-cover ${silenciado ? '-scale-x-100' : ''}`} />
      {somBloqueado && (
        <button type="button" onClick={() => { if (ref.current) { ref.current.muted = false; ref.current.play().catch(() => {}) } setSomBloqueado(false) }}
          className="absolute top-1 right-1 rounded-[2px] bg-arquivo-950/85 px-1.5 py-0.5 text-xs text-grafite-100 hover:text-kraft-300">
          Ativar som
        </button>
      )}
    </>
  )
}

const TEXTO_MODO: Partial<Record<ModoCamera, string>> = {
  negada: 'Câmera/microfone bloqueados no navegador — você continua na mesa em texto e mapa.',
  indisponivel: 'Nenhuma câmera disponível — você continua na mesa em texto e mapa.',
}

const TEXTO_ESTADO: Record<EstadoPar, string> = {
  conectando: 'Conectando...',
  conectado: '',
  reconectando: 'Reconectando...',
  falhou: 'Sem sinal',
}

// Aviso de câmera fora da régua (a régua não tem altura pra texto): a moldura mostra acima dela.
export function AvisoCamera({ video }: { video: ReturnType<typeof useVideoChamada> }) {
  const texto = video.erro ?? TEXTO_MODO[video.modo]
  if (!texto) return null
  return (
    <p role="status" className="border-t border-kraft-700/60 bg-arquivo-850 px-4 py-1.5 text-center text-xs text-kraft-300">{texto}</p>
  )
}

// Metade esquerda da régua inferior: uma foto por membro da mesa, com borda de papel impresso.
export function FaixaVideo({ sala, usuario, video }: { sala: SalaDetalhe; usuario: Usuario; video: ReturnType<typeof useVideoChamada> }) {
  // Em combate o turno precisa de espaço na régua: as fotos cedem e rolam para o lado.
  const { combate } = useSalaSocket()
  return (
    <section aria-label="Participantes" className={`flex min-w-0 shrink items-center gap-2 ${combate ? 'max-w-[30%]' : 'max-w-[45%]'}`}>
      <ul className="flex min-w-0 items-center gap-2 overflow-x-auto py-1">
        {sala.membros.map((membro) => {
          const souEu = membro.usuarioId === usuario.id
          const dele = video.participantes.filter((p) => p.usuarioId === membro.usuarioId)
          // Sem câmera, a conexão existe mas transporta trilha preta — só mostra vídeo de quem tem câmera.
          const comCamera = dele.find((p) => p.temCamera && video.streams[p.peerId])
          const principal = comCamera ?? dele.find((p) => p.temCamera) ?? dele[0]
          const stream = souEu ? video.streamLocal : comCamera ? video.streams[comCamera.peerId] : undefined
          const estado = principal ? video.estados[principal.peerId] : undefined
          const online = souEu || dele.length > 0

          let legenda = ''
          if (souEu && !video.streamLocal) legenda = video.modo === 'pedindo' ? 'Pedindo permissão...' : 'Câmera desligada'
          else if (!souEu && !online) legenda = 'Fora da mesa'
          else if (!souEu && !stream) {
            legenda = estado && estado !== 'conectado' ? TEXTO_ESTADO[estado] : principal?.temCamera ? 'Conectando...' : 'Sem câmera'
          }

          return (
            <li key={membro.id} data-membro={membro.usuario.nome}
              className={`relative h-[72px] w-32 shrink-0 overflow-hidden rounded-[2px] border-[3px] border-papel-100 bg-arquivo-800 shadow-[0_6px_12px_-8px_rgb(0_0_0/0.9)] ${online ? '' : 'opacity-50'}`}>
              {stream ? (
                <VideoAoVivo stream={stream} silenciado={souEu} nome={membro.usuario.nome} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-0.5 pt-2 pb-5">
                  <span aria-hidden="true" className={`text-2xl leading-none font-extrabold text-grafite-300 ${condensado}`}>
                    {membro.usuario.nome.charAt(0).toUpperCase()}
                  </span>
                  {!souEu && estado === 'falhou' && principal ? (
                    <button type="button" onClick={() => video.reconectar(principal.peerId)}
                      className="rounded-[2px] bg-kraft-400 px-1.5 text-xs font-bold text-tinta-900 hover:bg-kraft-300">
                      Reconectar
                    </button>
                  ) : (
                    legenda && <span className="text-xs leading-none text-grafite-300">{legenda}</span>
                  )}
                </div>
              )}
              {stream && estado === 'reconectando' && (
                <span className="absolute inset-x-0 top-1 text-center text-xs text-kraft-300">Reconectando...</span>
              )}
              {/* pointer-events-none: a faixa do nome fica por cima do botão "Reconectar" */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-arquivo-950/80 px-1.5 py-0.5">
                <span className="truncate text-xs text-grafite-100">
                  {membro.usuario.nome}{souEu && ' (você)'}
                </span>
                <span className="text-grafite-300" title={souEu && !video.microfoneLigado ? 'Microfone desligado' : undefined}>
                  <Icone nome={stream && (!souEu || video.microfoneLigado) ? 'microfone' : 'microfoneDesligado'} className="h-3.5 w-3.5" />
                </span>
              </div>
              {membro.papel === 'MESTRE' && (
                <span className={`pointer-events-none absolute top-0 left-0 bg-kraft-500 px-1.5 text-xs font-bold tracking-[0.08em] text-tinta-900 uppercase ${condensado}`}>
                  Mestre
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <div className="flex shrink-0 items-center gap-1.5">
        {video.streamLocal ? (
          <>
            <button type="button" onClick={video.desligarCamera} aria-label="Desligar câmera" title="Desligar câmera" className={classeBotaoIconeArquivo}>
              <Icone nome="cameraDesligada" className="h-4 w-4" />
            </button>
            <button type="button" onClick={video.alternarMicrofone} aria-pressed={!video.microfoneLigado}
              aria-label={video.microfoneLigado ? 'Silenciar microfone' : 'Ativar microfone'}
              title={video.microfoneLigado ? 'Silenciar microfone' : 'Ativar microfone'} className={classeBotaoIconeArquivo}>
              <Icone nome={video.microfoneLigado ? 'microfone' : 'microfoneDesligado'} className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button type="button" onClick={video.ligarCamera} disabled={video.modo === 'pedindo'} className={classeBotaoArquivo}
            aria-label="Entrar com câmera" title="Entrar com câmera (opcional)">
            <Icone nome="camera" className="h-4 w-4" /> Câmera
          </button>
        )}
      </div>
    </section>
  )
}
