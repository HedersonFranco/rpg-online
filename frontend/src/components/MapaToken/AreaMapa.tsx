import { Icone, type NomeIcone } from '../ui/Icone'

function BotaoFerramenta({ icone, rotulo, ativo = false }: { icone: NomeIcone; rotulo: string; ativo?: boolean }) {
  return (
    <button type="button" aria-label={rotulo} title={rotulo} aria-pressed={ativo}
      className={`rounded-md p-2 ${ativo ? 'bg-violet-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}>
      <Icone nome={icone} />
    </button>
  )
}

// Estrutura final da área do mapa (toolbar, zoom, seletor de piso) já no
// lugar; carregar mapa e tokens é da etapa de mapa — até lá, estado vazio.
export function AreaMapa() {
  const semMapa = 'Nenhum mapa carregado'
  return (
    <section aria-label="Mapa" className="relative flex-1 overflow-hidden bg-zinc-950"
      style={{ backgroundImage: 'radial-gradient(rgb(63 63 70 / 0.6) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="absolute top-3 left-3 flex flex-col gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 p-1">
        <BotaoFerramenta icone="cursor" rotulo="Selecionar" ativo />
        <BotaoFerramenta icone="mover" rotulo="Mover mapa" />
      </div>

      <div className="absolute top-3 right-3">
        <select disabled aria-label="Piso" className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-400">
          <option>Piso 1</option>
        </select>
      </div>

      <div className="absolute bottom-3 left-3 flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 p-1">
        {(['zoomMenos', 'zoomMais', 'telaCheia'] as const).map((icone) => (
          <button key={icone} type="button" disabled aria-label={icone === 'telaCheia' ? 'Tela cheia' : icone === 'zoomMais' ? 'Aumentar zoom' : 'Diminuir zoom'}
            title={semMapa} className="rounded-md p-2 text-zinc-500 disabled:cursor-not-allowed">
            <Icone nome={icone} />
          </button>
        ))}
      </div>

      <div className="flex h-full flex-col items-center justify-center text-center">
        <Icone nome="mapa" className="h-10 w-10 text-zinc-700" />
        <p className="mt-3 font-medium text-zinc-300">{semMapa}</p>
        <p className="mt-1 text-sm text-zinc-500">Quando o mestre carregar um mapa, ele aparece aqui.</p>
      </div>
    </section>
  )
}
