import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth, useUsuarioLogado } from '../../hooks/useAuth'
import { useRecurso } from '../../hooks/useRecurso'
import { useVideoChamada } from '../../hooks/useVideoChamada'
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
import { AvisoCamera, FaixaVideo } from '../../components/Video/FaixaVideo'
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

const CHAVE_PAINEL_ABERTO = 'mesa:painelAberto'

// Preferência só deste navegador; sem storage (aba privada etc.) o painel simplesmente nasce aberto.
function lerPainelAberto() {
  try {
    return localStorage.getItem(CHAVE_PAINEL_ABERTO) !== 'nao'
  } catch {
    return true
  }
}

function gravarPainelAberto(aberto: boolean) {
  try {
    localStorage.setItem(CHAVE_PAINEL_ABERTO, aberto ? 'sim' : 'nao')
  } catch {
    // sem storage: vale só até recarregar
  }
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
  if (!aberto) {
    return (
      <PastaDeFolhas lado="direita" rotulo="Painel lateral (recolhido)" onEscolher={onAbrir}
        folhas={abasDoPainel(souMestre, sala.donoId === usuario.id).map(({ chave, texto, icone }) => ({ chave, rotulo: texto, icone }))} />
    )
  }
  const abas = abasDoPainel(souMestre, sala.donoId === usuario.id)
  const abaAtiva = abas.find((a) => a.chave === aba) ?? abas[0]
  return (
    <aside aria-label="Painel lateral" className="flex w-[380px] shrink-0 flex-col border-l border-arquivo-700 bg-arquivo-850">
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
  // Expulso ou banido pelo dono: volta pra lista de mesas com o aviso.
  useEventoSocket<{ salaId: string; motivo: 'expulso' | 'banido' }>('sala:removido', ({ salaId, motivo }) => {
    if (salaId !== salaInicial.id) return
    navigate('/salas', {
      replace: true,
      state: { aviso: motivo === 'banido' ? `Você foi banido de "${salaInicial.nome}" pelo dono da mesa.` : `Você foi removido de "${salaInicial.nome}" pelo dono da mesa.` },
    })
  })
  const video = useVideoChamada()
  const [vista, setVista] = useState<Vista>('mesa')
  const [painelAberto, setPainelAberto] = useState(lerPainelAberto)
  const [abaPainel, setAbaPainel] = useState<AbaPainel>('ficha')
  const [visaoFicha, setVisaoFicha] = useState<VisaoPainelFicha>(null)

  function abrirPainel(aba: AbaPainel) {
    setAbaPainel(aba)
    setPainelAberto(true)
    gravarPainelAberto(true)
  }
  function recolherPainel() {
    setPainelAberto(false)
    gravarPainelAberto(false)
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
              <div className="flex h-24 shrink-0 items-center gap-4 border-t border-arquivo-700 bg-arquivo-950 px-3">
                <FaixaVideo sala={sala} usuario={usuario} video={video} />
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
