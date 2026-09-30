import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth, useUsuarioLogado } from '../../hooks/useAuth'
import { useRecurso } from '../../hooks/useRecurso'
import { useVideoChamada } from '../../hooks/useVideoChamada'
import { preferenciaBooleana, preferenciaNumero, usePreferencia } from '../../hooks/usePreferencia'
import { AlcaRedimensionar } from '../../components/ui/AlcaRedimensionar'
import { NOME_SISTEMA, type Membro, type SalaDetalhe, type Usuario } from '../../services/tipos'
import { Alerta, Carregando } from '../../components/ui/Feedback'
import { Abas, type Aba } from '../../components/ui/Abas'
import { ConfirmacaoProvider } from '../../components/ui/ConfirmacaoProvider'
import { PastaDeFolhas, type Folha } from '../../components/ui/PastaDeFolhas'
import { Icone, type NomeIcone } from '../../components/ui/Icone'
import {
  classeAbaPasta,
  classeBotaoArquivo,
  classeBotaoIconeArquivo,
  classeLinkArquivo,
  condensado,
} from '../../components/ui/estilosArquivo'
import { AreaMapa } from '../../components/MapaToken/AreaMapa'
import { GerenciarMapas } from '../../components/MapaToken/GerenciarMapas'
import { AvisoCamera, ControlesCamera, FaixaVideo } from '../../components/Video/FaixaVideo'
import { BarraTurno } from '../../components/TurnoTracker/BarraTurno'
import { PainelFicha, type VisaoPainelFicha } from '../../components/FichaOrdemParanormal/PainelFicha'
import { PainelChat } from '../../components/Chat/PainelChat'
import { PainelNpcs } from '../../components/Npc/PainelNpcs'
import { PainelMembros } from '../../components/Membros/PainelMembros'
import { SalaSocketProvider } from '../../hooks/SalaSocketProvider'
import { useEventoSocket, useSalaSocket } from '../../hooks/useSocket'
import { BotaoConvite } from './BotaoConvite'

const ROTULO_CONEXAO = {
  conectando: { texto: 'Conectando...', cor: 'bg-grafite-400' },
  conectado: { texto: 'Ao vivo', cor: 'bg-sinal-vivo' },
  reconectando: { texto: 'Reconectando...', cor: 'bg-kraft-400 animate-pulse motion-reduce:animate-none' },
} as const

function IndicadorConexao() {
  const { status } = useSalaSocket()
  const { texto, cor } = ROTULO_CONEXAO[status]
  return (
    <span role="status" aria-label={`Conexão: ${texto}`} className="inline-flex items-center gap-1.5 text-xs text-grafite-300">
      <span className={`h-2 w-2 rounded-full ${cor}`} aria-hidden="true" />
      {texto}
    </span>
  )
}

type AbaPainel = 'ficha' | 'chat' | 'npcs' | 'membros'

const ABAS_PAINEL: (Aba<AbaPainel> & { icone: NomeIcone; texto: string })[] = [
  { chave: 'ficha', rotulo: 'Ficha', texto: 'Ficha', icone: 'fichas' },
  { chave: 'chat', rotulo: 'Chat', texto: 'Chat', icone: 'chat' },
  { chave: 'npcs', rotulo: 'NPCs', texto: 'NPCs', icone: 'npcs' },
  { chave: 'membros', rotulo: 'Membros', texto: 'Membros', icone: 'membros' },
]

// NPCs são ferramenta do mestre; Membros (expulsar/banir/papel) é só do dono.
const abasDoPainel = (souMestre: boolean, souDono: boolean) =>
  ABAS_PAINEL.filter((a) => (a.chave !== 'npcs' || souMestre) && (a.chave !== 'membros' || souDono))

// Tamanhos ajustáveis (px). O mínimo da régua é o tamanho de sempre; para sumir com ela há o botão de recolher.
const PAINEL = { min: 320, max: 560, padrao: 380 }
const REGUA = { min: 96, max: 300, padrao: 96 }
// O centro (mapa + régua) nunca fica mais estreito que isto: é o que cabe do turno em combate + uma foto.
// Em 1280px o painel fica no máximo em 380px; em telas maiores, ele pode ir até 560px.
const CENTRO_MIN = 828
const BARRA_ESQUERDA = 72

const larguraMaxPainel = () =>
  Math.max(PAINEL.min, Math.min(PAINEL.max, Math.max(window.innerWidth, 1280) - BARRA_ESQUERDA - CENTRO_MIN))

function useLarguraMaxPainel() {
  const [max, setMax] = useState(larguraMaxPainel)
  useEffect(() => {
    const aoRedimensionar = () => setMax(larguraMaxPainel())
    window.addEventListener('resize', aoRedimensionar)
    return () => window.removeEventListener('resize', aoRedimensionar)
  }, [])
  return max
}

// Coluna direita: uma pasta aberta com abas. Recolhida, sobra uma faixa com os atalhos.
function PainelDireito({ sala, usuario, souMestre, aberto, aba, onAbrir, onRecolher, visaoFicha, onVisaoFicha }: {
  sala: SalaDetalhe
  souMestre: boolean
  usuario: Usuario
  aberto: boolean
  aba: AbaPainel
  onAbrir: (aba: AbaPainel) => void
  onRecolher: () => void
  visaoFicha: VisaoPainelFicha
  onVisaoFicha: (visao: VisaoPainelFicha) => void
}) {
  const [larguraSalva, setLargura] = usePreferencia('mesa:larguraPainel', preferenciaNumero(PAINEL.padrao, PAINEL.min, PAINEL.max))
  // A preferência fica guardada inteira; numa tela menor ela só é limitada na exibição.
  const max = useLarguraMaxPainel()
  const largura = Math.min(larguraSalva, max)
  if (!aberto) {
    return (
      <PastaDeFolhas lado="direita" rotulo="Painel lateral (recolhido)" onEscolher={onAbrir}
        folhas={abasDoPainel(souMestre, sala.donoId === usuario.id).map(({ chave, texto, icone }) => ({ chave, rotulo: texto, icone }))} />
    )
  }
  const abas = abasDoPainel(souMestre, sala.donoId === usuario.id)
  const abaAtiva = abas.find((a) => a.chave === aba) ?? abas[0]
  return (
    <aside aria-label="Painel lateral" style={{ width: largura }} className="relative flex shrink-0 flex-col border-l border-arquivo-700 bg-arquivo-850">
      <AlcaRedimensionar eixo="x" rotulo="Largura do painel" valor={largura} onMudar={setLargura} {...PAINEL} max={max} />
      <div className="flex shrink-0 items-end gap-1 border-b-2 border-kraft-500 px-2 pt-2">
        <button type="button" onClick={onRecolher} aria-label="Recolher painel" title="Recolher painel"
          className="mb-1 flex h-8 w-8 items-center justify-center rounded-[3px] text-grafite-300 hover:bg-arquivo-800 hover:text-kraft-300 focus-visible:outline-2 focus-visible:outline-kraft-400">
          <Icone nome="recolher" className="h-4 w-4" />
        </button>
        <Abas abas={abas} ativa={abaAtiva.chave} onTrocar={onAbrir} rotulo="Painel lateral" idBase="painel" classeAba={classeAbaPasta} />
      </div>
      <div role="tabpanel" id="painel-painel" aria-labelledby={`painel-aba-${abaAtiva.chave}`} className="min-h-0 flex-1 overflow-y-auto p-4">
        {abaAtiva.chave === 'ficha' && <PainelFicha sala={sala} usuario={usuario} visao={visaoFicha} onVisao={onVisaoFicha} />}
        {abaAtiva.chave === 'chat' && <PainelChat salaId={sala.id} />}
        {abaAtiva.chave === 'npcs' && <PainelNpcs salaId={sala.id} sistema={sala.sistema} />}
        {abaAtiva.chave === 'membros' && <PainelMembros sala={sala} usuario={usuario} />}
      </div>
    </aside>
  )
}

// Régua recolhida: uma faixa fina que ainda diz de quem é a vez, para o combate não sumir junto.
function ReguaRecolhida({ onAbrir }: { onAbrir: () => void }) {
  const { combate } = useSalaSocket()
  const ativo = combate?.ordem[combate.indiceAtivo]
  return (
    <div className="flex h-9 shrink-0 items-center gap-3 border-t border-arquivo-700 bg-arquivo-950 px-3">
      <button type="button" onClick={onAbrir} className={`${classeBotaoIconeArquivo} h-7 w-auto gap-1.5 px-2 text-xs`}>
        <Icone nome="recolher" className="h-4 w-4 -rotate-90" /> Vídeo e turno
      </button>
      {combate && ativo && (
        <p aria-live="polite" className="truncate text-xs text-grafite-100">
          Rodada {combate.rodada} · vez de <strong className="font-bold text-kraft-300">{ativo.nome}</strong>
        </p>
      )}
    </div>
  )
}

function TelaCentral({ children }: { children: ReactNode }) {
  return <main className="mundo-arquivo flex items-center justify-center px-4"><div className="w-full max-w-md">{children}</div></main>
}

export default function Sala() {
  const { id } = useParams()
  const { estado, recarregar } = useRecurso<SalaDetalhe>(`/salas/${id}`)

  if (estado.tipo === 'carregando') return <TelaCentral><Carregando texto="Abrindo a mesa..." /></TelaCentral>
  if (estado.tipo === 'erro') {
    return (
      <TelaCentral>
        {estado.status === 404 ? (
          <Alerta tom="arquivo" mensagem="Mesa não encontrada — ou você não faz parte dela." />
        ) : (
          <Alerta tom="arquivo" mensagem={estado.mensagem} onTentarNovamente={recarregar} />
        )}
        <Link to="/salas" className={`mt-4 inline-block text-sm ${classeLinkArquivo}`}>Voltar para suas mesas</Link>
      </TelaCentral>
    )
  }
  return (
    <SalaSocketProvider salaId={estado.dados.id}>
      <ConfirmacaoProvider>
        <Mesa sala={estado.dados} />
      </ConfirmacaoProvider>
    </SalaSocketProvider>
  )
}

type Vista = 'mesa' | 'mapas'
const VISTAS: Folha<Vista>[] = [
  { chave: 'mesa', rotulo: 'Mesa', icone: 'mesa' },
  { chave: 'mapas', rotulo: 'Mapas', icone: 'mapa' },
]

function Mesa({ sala: salaInicial }: { sala: SalaDetalhe }) {
  const usuario = useUsuarioLogado()
  const { sair } = useAuth()
  const { aviso, limparAviso } = useSalaSocket()
  const navigate = useNavigate()
  // Membros ao vivo: entrou alguém, trocou papel, saiu alguém — a mesa inteira (vídeo, ficha, turno) acompanha.
  const [membros, setMembros] = useState<Membro[]>(salaInicial.membros)
  const sala = { ...salaInicial, membros }
  useEventoSocket<{ membros: Membro[] }>('sala:membros', ({ membros: novos }) => setMembros(novos))
  // Expulso, banido ou mesa apagada: volta pra lista de mesas com o aviso.
  useEventoSocket<{ salaId: string; motivo: 'expulso' | 'banido' | 'apagada' }>('sala:removido', ({ salaId, motivo }) => {
    if (salaId !== salaInicial.id) return
    navigate('/salas', {
      replace: true,
      state: {
        aviso: motivo === 'apagada'
          ? `A mesa "${salaInicial.nome}" foi apagada${salaInicial.donoId === usuario.id ? '' : ' pelo dono'}.`
          : motivo === 'banido'
            ? `Você foi banido de "${salaInicial.nome}" pelo dono da mesa.`
            : `Você foi removido de "${salaInicial.nome}" pelo dono da mesa.`,
      },
    })
  })
  const video = useVideoChamada()
  const [vista, setVista] = useState<Vista>('mesa')
  const [painelAberto, setPainelAberto] = usePreferencia('mesa:painelAberto', preferenciaBooleana(true))
  const [reguaAberta, setReguaAberta] = usePreferencia('mesa:reguaAberta', preferenciaBooleana(true))
  const [alturaRegua, setAlturaRegua] = usePreferencia('mesa:alturaRegua', preferenciaNumero(REGUA.padrao, REGUA.min, REGUA.max))
  const [abaPainel, setAbaPainel] = useState<AbaPainel>('ficha')
  const [visaoFicha, setVisaoFicha] = useState<VisaoPainelFicha>(null)

  function abrirPainel(aba: AbaPainel) {
    setAbaPainel(aba)
    setPainelAberto(true)
  }
  function recolherPainel() {
    setPainelAberto(false)
  }
  const souMestre = sala.membros.some((m) => m.usuarioId === usuario.id && m.papel === 'MESTRE')
  // Só o mestre alterna para os mapas (material de preparo); o jogador sempre vê a mesa.
  const vistaEfetiva = souMestre ? vista : 'mesa'

  return (
    <div className="mundo-arquivo flex h-full flex-col">
      <p className="bg-kraft-700 px-4 py-1.5 text-center text-xs text-papel-50 xl:hidden">
        A mesa foi feita para telas a partir de 1280px de largura. Em telas menores, role para os lados.
      </p>
      <div className="min-h-0 flex-1 overflow-x-auto">
        <div className="flex h-full min-w-[1280px] flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-arquivo-700 bg-arquivo-950 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link to="/salas" className={`inline-flex shrink-0 items-center gap-1 text-sm ${classeLinkArquivo} no-underline`}>
                <Icone nome="voltar" className="h-4 w-4" /> Mesas
              </Link>
              <h1 className={`textura-fibra min-w-0 truncate rounded-[2px] bg-papel-50 px-3 py-1 text-lg leading-tight font-extrabold text-tinta-900 ${condensado}`}>
                {sala.nome}
              </h1>
              <span className={`shrink-0 text-xs font-bold tracking-[0.12em] text-grafite-300 uppercase ${condensado}`}>{NOME_SISTEMA[sala.sistema]}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <IndicadorConexao />
              <ControlesCamera video={video} />
              {sala.donoId === usuario.id && <BotaoConvite sala={sala} />}
              <span className="max-w-40 truncate text-sm text-grafite-300">{usuario.nome}</span>
              <button type="button" onClick={sair} className={classeBotaoArquivo}>
                <Icone nome="sair" className="h-4 w-4" /> Sair
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1">
            {/* Só o mestre tem mais de uma vista; pro jogador a pasta teria uma folha só. */}
            {souMestre && (
              <PastaDeFolhas lado="esquerda" rotulo="Vistas da mesa" comoNavegacao folhas={VISTAS} ativa={vista} onEscolher={setVista} />
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <main className="flex min-h-0 flex-1 flex-col" aria-label={vistaEfetiva === 'mesa' ? 'Mapa da mesa' : 'Mapas'}>
                {vistaEfetiva === 'mesa' ? (
                  <AreaMapa salaId={sala.id} usuarioId={usuario.id} souMestre={souMestre} />
                ) : (
                  <GerenciarMapas salaId={sala.id} souMestre={souMestre} onMostrado={() => setVista('mesa')} />
                )}
              </main>

              {aviso && (
                <div role="alert" className="flex items-center justify-between gap-3 border-t border-carimbo-300/50 bg-carimbo-800/25 px-4 py-2 text-sm text-carimbo-100">
                  <span>{aviso}</span>
                  <button type="button" onClick={limparAviso} className={`${classeBotaoIconeArquivo} h-8 w-auto px-3 text-xs`}>Dispensar</button>
                </div>
              )}
              <AvisoCamera video={video} />
              {!reguaAberta && <ReguaRecolhida onAbrir={() => setReguaAberta(true)} />}
              {/* Recolhida, a régua só some da vista: desmontar cortaria o áudio dos outros participantes. */}
              <div style={{ height: alturaRegua }}
                className={`relative shrink-0 items-center gap-3 border-t border-arquivo-700 bg-arquivo-950 px-3 ${reguaAberta ? 'flex' : 'hidden'}`}>
                <AlcaRedimensionar eixo="y" rotulo="Altura do vídeo e turno" valor={alturaRegua} onMudar={setAlturaRegua} {...REGUA} />
                {/* Aba sobre a borda, fora da linha: a régua não tem largura sobrando. */}
                <button type="button" onClick={() => setReguaAberta(false)} aria-label="Recolher vídeo e turno" title="Recolher vídeo e turno"
                  className="absolute right-3 bottom-full z-30 flex h-5 w-9 items-center justify-center rounded-t-[3px] border border-b-0 border-arquivo-700 bg-arquivo-950 text-grafite-300 hover:text-kraft-300 focus-visible:outline-2 focus-visible:outline-kraft-400">
                  <Icone nome="recolher" className="h-3.5 w-3.5 rotate-90" />
                </button>
                <FaixaVideo sala={sala} usuario={usuario} video={video} alturaFoto={alturaRegua - 24} />
                <BarraTurno salaId={sala.id} usuarioId={usuario.id} souMestre={souMestre} />
              </div>
            </div>

            <PainelDireito sala={sala} usuario={usuario} souMestre={souMestre} aberto={painelAberto} aba={abaPainel}
              onAbrir={abrirPainel} onRecolher={recolherPainel} visaoFicha={visaoFicha} onVisaoFicha={setVisaoFicha} />
          </div>
        </div>
      </div>
    </div>
  )
}
