import { useEffect, useRef, useState } from 'react'
import { useVideoChamada, type ModoCamera } from '../../hooks/useVideoChamada'
import type { EstadoPar } from '../../services/malhaVideo'
import type { SalaDetalhe, Usuario } from '../../services/tipos'
import { Icone } from '../ui/Icone'
import { classeBotaoSecundario } from '../ui/estilos'

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
        className={`absolute inset-0 h-full w-full rounded-lg object-cover ${silenciado ? '-scale-x-100' : ''}`} />
      {somBloqueado && (
        <button type="button" onClick={() => { if (ref.current) { ref.current.muted = false; ref.current.play().catch(() => {}) } setSomBloqueado(false) }}
          className="absolute top-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-zinc-100">
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

export function FaixaVideo({ sala, usuario }: { sala: SalaDetalhe; usuario: Usuario }) {
  const video = useVideoChamada()

  return (
    <section aria-label="Participantes" className="flex h-32 shrink-0 gap-2 overflow-x-auto border-b border-zinc-800 bg-zinc-900/60 p-2">
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
          <div key={membro.id} data-membro={membro.usuario.nome}
            className={`relative flex w-44 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800 ${online ? '' : 'opacity-50'}`}>
            {stream ? (
              <VideoAoVivo stream={stream} silenciado={souEu} nome={membro.usuario.nome} />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-700 text-lg font-semibold text-zinc-200">
                  {membro.usuario.nome.charAt(0).toUpperCase()}
                </span>
                {legenda && <span className="text-[10px] text-zinc-400">{legenda}</span>}
                {!souEu && estado === 'falhou' && principal && (
                  <button type="button" onClick={() => video.reconectar(principal.peerId)}
                    className="rounded bg-violet-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-violet-500">
                    Reconectar
                  </button>
                )}
              </div>
            )}
            {stream && estado === 'reconectando' && (
              <span className="absolute inset-x-0 top-1/2 text-center text-xs text-amber-200">Reconectando...</span>
            )}
            {/* pointer-events-none: a faixa do nome fica por cima do botão "Reconectar" */}
            <div className="pointer-events-none absolute inset-x-2 bottom-1.5 flex items-center justify-between gap-1">
              <span className="truncate rounded bg-black/50 px-1 text-xs text-zinc-100">
                {membro.usuario.nome}{souEu && ' (você)'}
              </span>
              <span className="text-zinc-300" title={souEu && !video.microfoneLigado ? 'Microfone desligado' : undefined}>
                <Icone nome={stream && (!souEu || video.microfoneLigado) ? 'microfone' : 'microfoneDesligado'} className="h-3.5 w-3.5" />
              </span>
            </div>
            {membro.papel === 'MESTRE' && (
              <span className="pointer-events-none absolute top-1.5 left-1.5 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Mestre</span>
            )}
          </div>
        )
      })}

      <div className="ml-auto flex shrink-0 flex-col justify-center gap-1.5 pl-2">
        {video.streamLocal ? (
          <>
            <button type="button" onClick={video.desligarCamera} className={`${classeBotaoSecundario} px-2 py-1 text-xs`}>
              <Icone nome="cameraDesligada" className="h-4 w-4" /> Desligar câmera
            </button>
            <button type="button" onClick={video.alternarMicrofone} aria-pressed={!video.microfoneLigado} className={`${classeBotaoSecundario} px-2 py-1 text-xs`}>
              <Icone nome={video.microfoneLigado ? 'microfone' : 'microfoneDesligado'} className="h-4 w-4" />
              {video.microfoneLigado ? 'Silenciar' : 'Ativar microfone'}
            </button>
          </>
        ) : (
          <button type="button" onClick={video.ligarCamera} disabled={video.modo === 'pedindo'} className={`${classeBotaoSecundario} px-2 py-1 text-xs`}>
            <Icone nome="camera" className="h-4 w-4" /> Entrar com câmera
          </button>
        )}
        {(TEXTO_MODO[video.modo] || video.erro) && (
          <p role="status" className="max-w-52 text-[11px] leading-tight text-amber-200">{video.erro ?? TEXTO_MODO[video.modo]}</p>
        )}
      </div>
    </section>
  )
}
