import { useRef, useState, type PointerEvent } from 'react'
import { useRecurso } from '../../hooks/useRecurso'
import { useAoResincronizar, useEventoSocket, useSalaSocket } from '../../hooks/useSocket'
import { api, BASE_URL, mensagemDeErro } from '../../services/api'
import type { EstadoMapa, Ficha, Token } from '../../services/tipos'
import { Alerta, Carregando } from '../ui/Feedback'
import { Icone, type NomeIcone } from '../ui/Icone'
import { AdicionarToken } from './AdicionarToken'
import { TokenNoMapa } from './TokenNoMapa'
import { nomeDoToken, tipoDoToken } from './token'
import { useViewport } from './useViewport'
import { useConfirmar } from '../ui/confirmacaoContext'
import { Folha } from '../ui/arquivo'
import { condensado } from '../ui/estilosArquivo'

type Ferramenta = 'selecionar' | 'mover'
type Arraste = {
  tokenId: string
  pointerId: number
  inicio: { x: number; y: number }
  origem: { x: number; y: number }
  atual: { x: number; y: number }
  ultimoEnvio: number
}

const INTERVALO_ENVIO_MS = 33 // ~30 atualizações/s durante o arrasto

function BotaoBarra({ icone, rotulo, onClick, ativo = false, desabilitado = false }: {
  icone: NomeIcone; rotulo: string; onClick?: () => void; ativo?: boolean; desabilitado?: boolean
}) {
  return (
    <button type="button" aria-label={rotulo} title={rotulo} aria-pressed={ativo} onClick={onClick} disabled={desabilitado}
      className={`flex h-10 w-10 items-center justify-center rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kraft-300 disabled:cursor-not-allowed disabled:opacity-40 ${ativo ? 'bg-kraft-400 text-tinta-900' : 'text-grafite-100 hover:bg-arquivo-800 hover:text-kraft-300'}`}>
      <Icone nome={icone} />
    </button>
  )
}

export function AreaMapa({ salaId, usuarioId, souMestre }: { salaId: string; usuarioId: string; souMestre: boolean }) {
  const { estado, recarregar, revalidar, atualizar } = useRecurso<EstadoMapa>(`/salas/${salaId}/mapa-ativo`)
  const { socket, emitir } = useSalaSocket()
  const confirmar = useConfirmar()
  const container = useRef<HTMLDivElement>(null)
  const { visao, zoomNoCentro, ajustar, telaParaMapa, relativo, manipuladores } = useViewport(container)
  const [ferramenta, setFerramenta] = useState<Ferramenta>('selecionar')
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [novoTokenEm, setNovoTokenEm] = useState<{ x: number; y: number } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [tamanho, setTamanho] = useState<{ largura: number; altura: number } | null>(null)
  const [arrastandoId, setArrastandoId] = useState<string | null>(null)
  const arraste = useRef<Arraste | null>(null)

  const moverLocal = (tokenId: string, x: number, y: number) =>
    atualizar((e) => ({ ...e, tokens: e.tokens.map((t) => (t.id === tokenId ? { ...t, x, y } : t)) }))

  useAoResincronizar(revalidar)
  useEventoSocket<EstadoMapa>('mapa:ativo', (novo) => {
    atualizar(() => novo)
    setSelecionado(null)
    setTamanho(null)
  })
  useEventoSocket<{ token: Token }>('token:criado', ({ token }) =>
    atualizar((e) => (e.mapa?.id === token.mapaId && !e.tokens.some((t) => t.id === token.id) ? { ...e, tokens: [...e.tokens, token] } : e)),
  )
  useEventoSocket<{ tokenId: string }>('token:removido', ({ tokenId }) =>
    atualizar((e) => ({ ...e, tokens: e.tokens.filter((t) => t.id !== tokenId) })),
  )
  useEventoSocket<{ tokenId: string; x: number; y: number }>('token:movido', ({ tokenId, x, y }) => {
    if (arraste.current?.tokenId === tokenId) return // quem arrasta manda na posição local
    moverLocal(tokenId, x, y)
  })
  // Token de ficha mostra dados vivos da ficha (PV muda no painel → muda no mapa).
  useEventoSocket<{ ficha: Ficha }>('ficha:atualizada', ({ ficha }) =>
    atualizar((e) => ({
      ...e,
      tokens: e.tokens.map((t) =>
        t.ficha && t.fichaId === ficha.id
          ? { ...t, ficha: { ...t.ficha, nome: ficha.nome, avatarUrl: ficha.avatarUrl, pv_atual: ficha.pv_atual, pv_maximo_cache: ficha.pv_maximo_cache } }
          : t,
      ),
    })),
  )

  const podeMover = (token: Token) => souMestre || token.ficha?.usuario_id === usuarioId

  function aoPressionarToken(e: PointerEvent<HTMLButtonElement>, token: Token) {
    if (ferramenta === 'mover') return // deixa o evento subir: arrastar o mapa por cima do token
    e.stopPropagation()
    setSelecionado(token.id)
    if (!podeMover(token)) return
    e.currentTarget.setPointerCapture(e.pointerId)
    arraste.current = {
      tokenId: token.id,
      pointerId: e.pointerId,
      inicio: relativo(e.clientX, e.clientY),
      origem: { x: token.x, y: token.y },
      atual: { x: token.x, y: token.y },
      ultimoEnvio: 0,
    }
    setArrastandoId(token.id)
  }

  function aoMoverToken(e: PointerEvent<HTMLButtonElement>) {
    const a = arraste.current
    if (!a || a.pointerId !== e.pointerId) return
    const p = relativo(e.clientX, e.clientY)
    const x = a.origem.x + (p.x - a.inicio.x) / visao.escala
    const y = a.origem.y + (p.y - a.inicio.y) / visao.escala
    a.atual = { x, y }
    moverLocal(a.tokenId, x, y)
    const agora = performance.now()
    if (agora - a.ultimoEnvio >= INTERVALO_ENVIO_MS) {
      a.ultimoEnvio = agora
      // volatile: posição intermediária pode ser descartada se a rede engasgar; a final não.
      socket.volatile.emit('token:mover', { tokenId: a.tokenId, x, y, final: false })
    }
  }

  function aoSoltarToken(e: PointerEvent<HTMLButtonElement>) {
    const a = arraste.current
    if (!a || a.pointerId !== e.pointerId) return
    arraste.current = null
    setArrastandoId(null)
    if (a.atual.x === a.origem.x && a.atual.y === a.origem.y) return
    emitir('token:mover', { tokenId: a.tokenId, x: a.atual.x, y: a.atual.y, final: true }).catch((erroEnvio: unknown) => {
      setErro(mensagemDeErro(erroEnvio))
      moverLocal(a.tokenId, a.origem.x, a.origem.y)
    })
  }

  async function removerToken(token: Token) {
    const ok = await confirmar({
      titulo: 'Remover token?',
      mensagem: `"${nomeDoToken(token)}" sai do mapa para todos na mesa.`,
      confirmar: 'Remover token',
    })
    if (!ok) return
    try {
      await api(`/tokens/${token.id}`, { method: 'DELETE' })
      setSelecionado(null)
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  async function alternarTelaCheia() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await container.current?.requestFullscreen()
    } catch {
      setErro('O navegador não permitiu tela cheia.')
    }
  }

  const mapa = estado.tipo === 'ok' ? estado.dados.mapa : null
  const tokens = estado.tipo === 'ok' ? estado.dados.tokens : []
  const tokenSelecionado = tokens.find((t) => t.id === selecionado)
  // Chamado no clique (não no render): o token novo nasce no centro do que está
  // visível — deslocado pro lado se já houver token ali, pra não nascer escondido embaixo de outro.
  function alternarAdicionar() {
    if (novoTokenEm) return setNovoTokenEm(null)
    const r = container.current?.getBoundingClientRect()
    const posicao = telaParaMapa({ x: (r?.width ?? 0) / 2, y: (r?.height ?? 0) / 2 })
    // Em pixels de TELA: o que importa é não nascer visualmente em cima de outro no zoom atual.
    const ocupado = (p: { x: number; y: number }) => tokens.some((t) => Math.hypot(t.x - p.x, t.y - p.y) * visao.escala < 90)
    for (let tentativa = 0; tentativa < 20 && ocupado(posicao); tentativa++) posicao.x += 110 / visao.escala
    setNovoTokenEm(posicao)
  }
  const pararPropagacao = { onPointerDown: (e: PointerEvent) => e.stopPropagation() }

  return (
    <section
      ref={container}
      aria-label="Mapa"
      className={`relative flex-1 touch-none overflow-hidden bg-arquivo-950 select-none ${ferramenta === 'mover' ? 'cursor-move' : ''}`}
      // Tampo da mesa: pontos de grade discretos, como papel quadriculado no escuro.
      style={{ backgroundImage: 'radial-gradient(rgb(124 96 53 / 0.35) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      {...manipuladores}
      onPointerDown={(e) => {
        setSelecionado(null)
        manipuladores.onPointerDown(e)
      }}
    >
      {mapa && (
        <div data-testid="camada-mapa" className="absolute top-0 left-0" style={{ transform: `translate(${visao.x}px, ${visao.y}px)` }}>
          <img
            src={BASE_URL + mapa.imagemUrl}
            alt={`Mapa: ${mapa.nome}`}
            draggable={false}
            onLoad={(e) => {
              const { naturalWidth: largura, naturalHeight: altura } = e.currentTarget
              setTamanho({ largura, altura })
              ajustar(largura, altura)
            }}
            className="pointer-events-none block max-w-none shadow-[0_18px_40px_-18px_rgb(0_0_0/0.95)]"
            style={{ width: tamanho ? tamanho.largura * visao.escala : undefined }}
          />
          {tokens.map((token) => (
            <TokenNoMapa
              key={token.id}
              token={token}
              escala={visao.escala}
              selecionado={token.id === selecionado}
              podeMover={podeMover(token)}
              arrastando={token.id === arrastandoId}
              onPointerDown={(e) => aoPressionarToken(e, token)}
              onPointerMove={aoMoverToken}
              onPointerUp={aoSoltarToken}
            />
          ))}
        </div>
      )}

      {estado.tipo === 'carregando' && <div className="absolute inset-0 flex items-center justify-center"><Carregando texto="Carregando mapa..." /></div>}
      {estado.tipo === 'erro' && (
        <div className="absolute inset-0 flex items-center justify-center p-6" {...pararPropagacao}>
          <div className="w-full max-w-sm"><Alerta tom="arquivo" mensagem={estado.mensagem} onTentarNovamente={recarregar} /></div>
        </div>
      )}
      {estado.tipo === 'ok' && !mapa && (
        <div className="pointer-events-none flex h-full flex-col items-center justify-center px-6 text-center">
          <Icone nome="mapa" className="h-10 w-10 text-kraft-700" />
          <p className={`mt-3 text-2xl leading-none font-extrabold text-grafite-100 uppercase ${condensado}`}>Nenhum mapa na mesa</p>
          <p className="mt-2 text-sm text-grafite-300">
            {souMestre ? 'Envie um mapa na folha "Mapas", na pasta à esquerda, e mostre na mesa.' : 'Quando o mestre mostrar um mapa, ele aparece aqui.'}
          </p>
        </div>
      )}

      <div role="toolbar" aria-label="Ferramentas do mapa" aria-orientation="vertical" className="absolute top-3 left-3 flex flex-col gap-1 rounded-[4px] border border-arquivo-700 bg-arquivo-900/95 p-1 shadow-[0_8px_20px_-10px_rgb(0_0_0/0.9)]" {...pararPropagacao}>
        <BotaoBarra icone="cursor" rotulo="Selecionar e arrastar tokens" ativo={ferramenta === 'selecionar'} onClick={() => setFerramenta('selecionar')} />
        <BotaoBarra icone="mover" rotulo="Mover mapa" ativo={ferramenta === 'mover'} onClick={() => setFerramenta('mover')} />
        {souMestre && <BotaoBarra icone="mais" rotulo="Adicionar token" onClick={alternarAdicionar} desabilitado={!mapa} ativo={novoTokenEm !== null} />}
      </div>

      {novoTokenEm && mapa && (
        <AdicionarToken salaId={salaId} mapaId={mapa.id} posicao={novoTokenEm} onFechar={() => setNovoTokenEm(null)} />
      )}

      {tokenSelecionado && (
        <div role="dialog" aria-label={`Detalhes de ${nomeDoToken(tokenSelecionado)}`} {...pararPropagacao}
          className="absolute top-3 left-1/2 w-max max-w-[90%] -translate-x-1/2">
          <Folha className="flex items-center gap-4 px-4 py-2.5 sm:px-4 sm:py-2.5">
            <p className="min-w-0">
              <span className={`block truncate text-lg leading-tight font-extrabold ${condensado}`}>{nomeDoToken(tokenSelecionado)}</span>
              <span className="text-xs text-tinta-700">{tipoDoToken(tokenSelecionado)}</span>
            </p>
            {tokenSelecionado.ficha && (
              <p className="font-datilo text-sm">PV {tokenSelecionado.ficha.pv_atual}/{tokenSelecionado.ficha.pv_maximo_cache}</p>
            )}
            {souMestre && (
              <button type="button" onClick={() => removerToken(tokenSelecionado)} aria-label="Remover token" title="Remover token"
                className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-tinta-700 hover:bg-tinta-900/10 hover:text-tinta-900 focus-visible:outline-2 focus-visible:outline-tinta-900">
                <Icone nome="lixeira" className="h-4 w-4" />
              </button>
            )}
          </Folha>
        </div>
      )}

      {erro && (
        <div role="alert" className="absolute right-3 bottom-3 flex max-w-xs items-start gap-3 rounded-sm border border-carimbo-300/50 bg-carimbo-800/90 px-3 py-2 text-sm text-carimbo-100" {...pararPropagacao}>
          <span className="min-w-0 flex-1">{erro}</span>
          <button type="button" onClick={() => setErro(null)} className="shrink-0 text-xs font-bold text-carimbo-100 underline underline-offset-2">Dispensar</button>
        </div>
      )}

      <div role="toolbar" aria-label="Zoom" className="absolute bottom-3 left-3 flex items-center gap-1 rounded-[4px] border border-arquivo-700 bg-arquivo-900/95 p-1 shadow-[0_8px_20px_-10px_rgb(0_0_0/0.9)]" {...pararPropagacao}>
        <BotaoBarra icone="zoomMenos" rotulo="Diminuir zoom" onClick={() => zoomNoCentro(1 / 1.25)} desabilitado={!mapa} />
        <BotaoBarra icone="zoomMais" rotulo="Aumentar zoom" onClick={() => zoomNoCentro(1.25)} desabilitado={!mapa} />
        <BotaoBarra icone="ajustar" rotulo="Ajustar mapa à tela" onClick={() => tamanho && ajustar(tamanho.largura, tamanho.altura)} desabilitado={!tamanho} />
        <BotaoBarra icone="telaCheia" rotulo="Tela cheia" onClick={alternarTelaCheia} />
        <span className="px-2 font-datilo text-sm text-grafite-300" aria-label="Nível de zoom">{Math.round(visao.escala * 100)}%</span>
      </div>
    </section>
  )
}
