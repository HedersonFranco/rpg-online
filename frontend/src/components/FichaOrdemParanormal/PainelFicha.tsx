import { useState } from 'react'
import { useRecurso } from '../../hooks/useRecurso'
import { useAoResincronizar, useEventoSocket } from '../../hooks/useSocket'
import type { Ficha, SalaDetalhe, Usuario } from '../../services/tipos'
import { Alerta, Carregando } from '../ui/Feedback'
import { classeInput } from '../ui/estilos'
import { FormNovaFicha } from './FormNovaFicha'
import { VisaoFicha } from './VisaoFicha'

const NOVA = 'nova'

export function PainelFicha({ sala, usuario }: { sala: SalaDetalhe; usuario: Usuario }) {
  if (sala.sistema === 'ORDEM_PARANORMAL_2') {
    return (
      <p className="text-sm text-zinc-400">
        Fichas de Ordem Paranormal RPG II ainda não estão disponíveis: o playtest oficial ainda não publicou
        as regras de criação de personagem.
      </p>
    )
  }
  return <PainelFichaOP1 sala={sala} usuario={usuario} />
}

function PainelFichaOP1({ sala, usuario }: { sala: SalaDetalhe; usuario: Usuario }) {
  const { estado, recarregar, revalidar, atualizar } = useRecurso<Ficha[]>(`/salas/${sala.id}/fichas`)
  const [selecionada, setSelecionada] = useState<string | null>(null)

  // Qualquer alteração de ficha na sala (inclusive de outra aba/jogador) chega aqui já calculada pelo backend.
  useEventoSocket<{ ficha: Ficha }>('ficha:atualizada', ({ ficha }) =>
    atualizar((lista) =>
      lista.some((f) => f.id === ficha.id) ? lista.map((f) => (f.id === ficha.id ? ficha : f)) : [...lista, ficha],
    ),
  )
  // Voltou de uma queda de conexão: o que mudou enquanto offline vem do REST.
  useAoResincronizar(revalidar)

  if (estado.tipo === 'carregando') return <Carregando texto="Carregando fichas..." />
  if (estado.tipo === 'erro') return <Alerta mensagem={estado.mensagem} onTentarNovamente={recarregar} />

  const fichas = estado.dados
  const souMestre = sala.membros.some((m) => m.usuarioId === usuario.id && m.papel === 'MESTRE')
  const nomeDono = (usuarioId: string) =>
    usuarioId === usuario.id ? 'você' : sala.membros.find((m) => m.usuarioId === usuarioId)?.usuario.nome ?? '—'

  const idAtivo =
    selecionada ?? fichas.find((f) => f.usuario_id === usuario.id)?.id ?? fichas[0]?.id ?? NOVA
  const fichaAtiva = fichas.find((f) => f.id === idAtivo)

  return (
    <div className="space-y-4">
      {fichas.length > 0 && (
        <div>
          <label htmlFor="seletor-ficha" className="sr-only">Ficha exibida</label>
          <select id="seletor-ficha" value={idAtivo} onChange={(e) => setSelecionada(e.target.value)} className={`${classeInput} py-1.5 text-sm`}>
            {fichas.map((f) => <option key={f.id} value={f.id}>{f.nome} ({nomeDono(f.usuario_id)})</option>)}
            <option value={NOVA}>+ Nova ficha</option>
          </select>
        </div>
      )}

      {fichaAtiva ? (
        <VisaoFicha
          key={fichaAtiva.id}
          ficha={fichaAtiva}
          podeEditar={fichaAtiva.usuario_id === usuario.id || souMestre}
          onAtualizada={(nova) => atualizar((lista) => lista.map((f) => (f.id === nova.id ? nova : f)))}
        />
      ) : (
        <FormNovaFicha
          salaId={sala.id}
          onCriada={(nova) => {
            atualizar((lista) => [...lista, nova])
            setSelecionada(nova.id)
          }}
          onCancelar={fichas.length > 0 ? () => setSelecionada(fichas[0].id) : undefined}
        />
      )}
    </div>
  )
}
