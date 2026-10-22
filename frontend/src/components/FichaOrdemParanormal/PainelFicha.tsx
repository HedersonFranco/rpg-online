import { useState } from 'react'
import { useAtrasado } from '../../hooks/useAtrasado'
import { useRecurso } from '../../hooks/useRecurso'
import { useAoResincronizar, useEventoSocket } from '../../hooks/useSocket'
import { api, mensagemDeErro } from '../../services/api'
import type { Ficha, SalaDetalhe, Usuario } from '../../services/tipos'
import { useConfirmar } from '../ui/confirmacaoContext'
import { Alerta, Carregando, Spinner } from '../ui/Feedback'
import { Icone } from '../ui/Icone'
import { classeBotaoIconeArquivo, classeLinkArquivo } from '../ui/estilosArquivo'
import { FormNovaFicha } from './FormNovaFicha'
import { ListaAgentes } from './ListaAgentes'
import { VisaoFicha } from './VisaoFicha'

// O que o painel mostra: a lista de agentes, o formulário de criação ou uma ficha (pelo id).
// `null` = ainda não escolhido: abre direto na ficha do próprio usuário, se ele tiver uma.
export type VisaoPainelFicha = 'lista' | 'nova' | { fichaId: string } | null

type PropsPainel = {
  sala: SalaDetalhe
  usuario: Usuario
  visao: VisaoPainelFicha
  onVisao: (visao: VisaoPainelFicha) => void
}

export function PainelFicha(props: PropsPainel) {
  if (props.sala.sistema === 'ORDEM_PARANORMAL_2') {
    return (
      <p className="text-sm text-grafite-300">
        Fichas de Ordem Paranormal RPG II ainda não estão disponíveis: o playtest oficial ainda não publicou
        as regras de criação de personagem.
      </p>
    )
  }
  return <PainelFichaOP1 {...props} />
}

function PainelFichaOP1({ sala, usuario, visao, onVisao }: PropsPainel) {
  const { estado, recarregar, revalidar, atualizar } = useRecurso<Ficha[]>(`/salas/${sala.id}/fichas`)

  // Qualquer alteração de ficha na sala (inclusive de outra aba/jogador) chega aqui já calculada pelo backend.
  useEventoSocket<{ ficha: Ficha }>('ficha:atualizada', ({ ficha }) =>
    atualizar((lista) =>
      lista.some((f) => f.id === ficha.id) ? lista.map((f) => (f.id === ficha.id ? ficha : f)) : [...lista, ficha],
    ),
  )
  // Agente apagado (nesta aba ou em outra): sai da lista; quem estava com ele aberto cai na lista.
  useEventoSocket<{ fichaId: string }>('ficha:removida', ({ fichaId }) =>
    atualizar((lista) => lista.filter((f) => f.id !== fichaId)),
  )
  // Voltou de uma queda de conexão: o que mudou enquanto offline vem do REST.
  useAoResincronizar(revalidar)

  if (estado.tipo === 'carregando') return <Carregando texto="Carregando fichas..." />
  if (estado.tipo === 'erro') return <Alerta tom="arquivo" mensagem={estado.mensagem} onTentarNovamente={recarregar} />

  const fichas = estado.dados
  const souMestre = sala.membros.some((m) => m.usuarioId === usuario.id && m.papel === 'MESTRE')
  const nomeDono = (usuarioId: string) =>
    usuarioId === usuario.id ? 'você' : sala.membros.find((m) => m.usuarioId === usuarioId)?.usuario.nome ?? '—'

  const propria = fichas.find((f) => f.usuario_id === usuario.id)
  const efetiva = visao ?? (propria ? { fichaId: propria.id } : 'lista')
  // Ficha selecionada que deixou de existir → volta pra lista em vez de tela vazia.
  const fichaAtiva = typeof efetiva === 'object' ? fichas.find((f) => f.id === efetiva.fichaId) : undefined

  if (efetiva === 'nova') {
    return (
      <FormNovaFicha
        salaId={sala.id}
        onCriada={(nova) => {
          atualizar((lista) => (lista.some((f) => f.id === nova.id) ? lista : [...lista, nova]))
          onVisao({ fichaId: nova.id })
        }}
        onCancelar={() => onVisao('lista')}
      />
    )
  }

  if (!fichaAtiva) {
    return <ListaAgentes fichas={fichas} nomeDono={nomeDono} onAbrir={(fichaId) => onVisao({ fichaId })} onNova={() => onVisao('nova')} />
  }

  const podeEditar = fichaAtiva.usuario_id === usuario.id || souMestre
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => onVisao('lista')}
          className={`inline-flex items-center gap-1 text-sm no-underline ${classeLinkArquivo}`}>
          <Icone nome="voltar" className="h-4 w-4" /> Agentes da mesa
        </button>
        {podeEditar && (
          <ApagarAgente key={fichaAtiva.id} ficha={fichaAtiva} onApagado={(fichaId) => {
            atualizar((lista) => lista.filter((f) => f.id !== fichaId))
            onVisao('lista')
          }} />
        )}
      </div>
      <VisaoFicha
        key={fichaAtiva.id}
        ficha={fichaAtiva}
        podeEditar={podeEditar}
        onAtualizada={(nova) => atualizar((lista) => lista.map((f) => (f.id === nova.id ? nova : f)))}
      />
    </div>
  )
}

// Quem pode editar pode apagar: o dono da ficha ou o mestre. Sempre com confirmação.
function ApagarAgente({ ficha, onApagado }: { ficha: Ficha; onApagado: (fichaId: string) => void }) {
  const confirmar = useConfirmar()
  const [apagando, setApagando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const mostrarSpinner = useAtrasado(apagando)

  async function apagar() {
    const ok = await confirmar({
      titulo: `Apagar "${ficha.nome.trim() || '[Sem nome]'}"?`,
      mensagem: 'O agente some para a mesa toda: ficha, perícias, rituais, habilidades, poderes, equipamentos e inventário. O token dele sai dos mapas. Isso não pode ser desfeito.',
      confirmar: 'Apagar agente',
    })
    if (!ok) return
    setErro(null)
    setApagando(true)
    try {
      await api(`/fichas/${ficha.id}`, { method: 'DELETE' })
      onApagado(ficha.id)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setApagando(false)
    }
  }

  return (
    <>
      <button type="button" onClick={apagar} disabled={apagando} className={`${classeBotaoIconeArquivo} h-8 w-auto gap-1.5 px-2.5 text-xs`}>
        {mostrarSpinner ? <Spinner tamanho="sm" /> : <Icone nome="lixeira" className="h-4 w-4" />} Apagar agente
      </button>
      {erro && <div className="basis-full"><Alerta tom="arquivo" mensagem={erro} /></div>}
    </>
  )
}
