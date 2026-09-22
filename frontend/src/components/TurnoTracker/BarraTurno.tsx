import { Icone } from '../ui/Icone'

// Sem combate ativo → barra recolhida (regra do layout). Combate/turno em tempo real é a etapa de Socket.IO.
export function BarraTurno() {
  return (
    <section aria-label="Turno" className="flex h-11 shrink-0 items-center justify-between border-t border-zinc-800 bg-zinc-900 px-4">
      <p className="text-sm text-zinc-500">Nenhum combate em andamento</p>
      <button type="button" disabled title="Rolagem de dados ainda não disponível"
        className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-500 disabled:cursor-not-allowed">
        <Icone nome="dados" className="h-4 w-4" />
        Rolagem
      </button>
    </section>
  )
}
