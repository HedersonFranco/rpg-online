import { NOME_CLASSE, type Ficha } from '../../services/tipos'
import { Icone } from '../ui/Icone'
import { classeBotaoPrimario } from '../ui/estilos'

const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })

// Lista de agentes da sala (referência: C.R.I.S. /agentes), restrita a esta mesa.
export function ListaAgentes({
  fichas,
  nomeDono,
  onAbrir,
  onNova,
}: {
  fichas: Ficha[]
  nomeDono: (usuarioId: string) => string
  onAbrir: (fichaId: string) => void
  onNova: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Agentes da mesa: {fichas.length}</h3>
        <button type="button" onClick={onNova} className={`${classeBotaoPrimario} px-3 py-1.5 text-sm`}>
          <Icone nome="mais" className="h-4 w-4" /> Novo agente
        </button>
      </div>

      {fichas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-400">
          Nenhum agente nesta mesa ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {fichas.map((f) => (
            <li key={f.id} className="rounded-lg bg-zinc-900 p-3 ring-1 ring-zinc-800">
              <p className="truncate text-lg" title={f.nome}>{f.nome.trim() || '[Sem nome]'}</p>
              <p className="text-sm text-zinc-300">{NOME_CLASSE[f.classe]} · NEX {f.nex}%</p>
              <p className="mt-1 text-xs text-zinc-500">
                Jogador: {nomeDono(f.usuario_id)} · Registrado em {formatoData.format(new Date(f.createdAt))}
              </p>
              <div className="mt-2 flex justify-end">
                <button type="button" onClick={() => onAbrir(f.id)} className={`${classeBotaoPrimario} px-3 py-1 text-sm`}>
                  Acessar ficha
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
