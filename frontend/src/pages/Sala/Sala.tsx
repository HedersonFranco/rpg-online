import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth, useUsuarioLogado } from '../../hooks/useAuth'
import { useRecurso } from '../../hooks/useRecurso'
import { NOME_SISTEMA, type SalaDetalhe, type Usuario } from '../../services/tipos'
import { Alerta, Carregando } from '../../components/ui/Feedback'
import { Icone, type NomeIcone } from '../../components/ui/Icone'
import { classeBotaoSecundario } from '../../components/ui/estilos'
import { AreaMapa } from '../../components/MapaToken/AreaMapa'
import { BarraTurno } from '../../components/TurnoTracker/BarraTurno'
import { PainelFicha } from '../../components/FichaOrdemParanormal/PainelFicha'
import { BotaoConvite } from './BotaoConvite'

type Secao = 'mesa' | 'mapa' | 'fichas' | 'biblioteca' | 'notas' | 'npcs'

const SECOES: { chave: Secao; rotulo: string; icone: NomeIcone }[] = [
  { chave: 'mesa', rotulo: 'Mesa', icone: 'mesa' },
  { chave: 'mapa', rotulo: 'Mapa', icone: 'mapa' },
  { chave: 'fichas', rotulo: 'Fichas', icone: 'fichas' },
  { chave: 'biblioteca', rotulo: 'Biblioteca', icone: 'biblioteca' },
  { chave: 'notas', rotulo: 'Notas', icone: 'notas' },
  { chave: 'npcs', rotulo: 'NPCs', icone: 'npcs' },
]

function TelaCentral({ children }: { children: ReactNode }) {
  return <main className="flex min-h-full items-center justify-center px-4"><div className="w-full max-w-md">{children}</div></main>
}

export default function Sala() {
  const { id } = useParams()
  const { estado, recarregar } = useRecurso<SalaDetalhe>(`/salas/${id}`)

  if (estado.tipo === 'carregando') return <TelaCentral><Carregando texto="Abrindo a mesa..." /></TelaCentral>
  if (estado.tipo === 'erro') {
    return (
      <TelaCentral>
        {estado.status === 404 ? (
          <Alerta mensagem="Mesa não encontrada — ou você não faz parte dela." />
        ) : (
          <Alerta mensagem={estado.mensagem} onTentarNovamente={recarregar} />
        )}
        <Link to="/salas" className="mt-4 inline-block text-sm text-violet-400 hover:text-violet-300">Voltar para suas mesas</Link>
      </TelaCentral>
    )
  }
  return <Mesa sala={estado.dados} />
}

function FaixaVideo({ sala, usuario }: { sala: SalaDetalhe; usuario: Usuario }) {
  return (
    <section aria-label="Participantes" className="flex h-28 shrink-0 gap-2 overflow-x-auto border-b border-zinc-800 bg-zinc-900/60 p-2">
      {sala.membros.map((membro) => (
        <div key={membro.id} className="relative flex w-40 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
          <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-lg font-semibold text-zinc-200">
            {membro.usuario.nome.charAt(0).toUpperCase()}
          </span>
          <div className="absolute inset-x-2 bottom-1.5 flex items-center justify-between gap-1">
            <span className="truncate text-xs text-zinc-200">
              {membro.usuario.nome}{membro.usuarioId === usuario.id && ' (você)'}
            </span>
            <span title="Áudio ainda não disponível" className="text-zinc-500">
              <Icone nome="microfoneDesligado" className="h-3.5 w-3.5" />
            </span>
          </div>
          {membro.papel === 'MESTRE' && (
            <span className="absolute top-1.5 left-1.5 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Mestre</span>
          )}
        </div>
      ))}
    </section>
  )
}

function Mesa({ sala }: { sala: SalaDetalhe }) {
  const usuario = useUsuarioLogado()
  const { sair } = useAuth()
  const [secao, setSecao] = useState<Secao>('mesa')

  return (
    <div className="flex h-full flex-col">
      <p className="bg-amber-950/60 px-4 py-1.5 text-center text-xs text-amber-200 xl:hidden">
        A mesa foi feita para telas a partir de 1280px de largura. Em telas menores, role para os lados.
      </p>
      <div className="min-h-0 flex-1 overflow-x-auto">
        <div className="flex h-full min-w-[1280px] flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-800 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link to="/salas" className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200">
                <Icone nome="voltar" className="h-4 w-4" /> Mesas
              </Link>
              <span className="text-zinc-700">|</span>
              <h1 className="truncate font-semibold">{sala.nome}</h1>
              <span className="text-sm text-zinc-500">· Sem sessão ativa</span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{NOME_SISTEMA[sala.sistema]}</span>
            </div>
            <div className="flex items-center gap-3">
              {sala.donoId === usuario.id && <BotaoConvite sala={sala} />}
              <span className="text-sm text-zinc-400">{usuario.nome}</span>
              <button type="button" onClick={sair} className={`${classeBotaoSecundario} py-1.5 text-sm`}>
                <Icone nome="sair" className="h-4 w-4" /> Sair
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1">
            <nav aria-label="Seções da mesa" className="flex w-24 shrink-0 flex-col gap-1 border-r border-zinc-800 p-2">
              {SECOES.map(({ chave, rotulo, icone }) => (
                <button key={chave} type="button" onClick={() => setSecao(chave)} aria-current={secao === chave ? 'page' : undefined}
                  className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs ${secao === chave ? 'bg-violet-600/20 text-violet-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}>
                  <Icone nome={icone} />
                  {rotulo}
                </button>
              ))}
            </nav>

            <div className="flex min-w-0 flex-1 flex-col">
              <FaixaVideo sala={sala} usuario={usuario} />
              {secao === 'mesa' ? (
                <AreaMapa />
              ) : (
                <section className="flex flex-1 items-center justify-center text-sm text-zinc-500">
                  Esta seção ainda não está disponível nesta versão.
                </section>
              )}
              <BarraTurno />
            </div>

            <aside aria-label="Ficha de personagem" className="w-[380px] shrink-0 overflow-y-auto border-l border-zinc-800 p-4">
              <PainelFicha sala={sala} usuario={usuario} />
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
