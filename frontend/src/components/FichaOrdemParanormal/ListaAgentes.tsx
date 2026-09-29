import { NOME_CLASSE, type Ficha } from '../../services/tipos'
import { Pasta, PastaVazia } from '../ui/arquivo'
import { Icone } from '../ui/Icone'
import { classeBotaoKraft, classeTituloArquivo, condensado } from '../ui/estilosArquivo'

const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// Agentes da mesa (referência: C.R.I.S. /agentes), restritos a esta mesa. Cada agente é uma pasta.
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className={`text-2xl leading-none ${classeTituloArquivo}`}>
          Agentes <span className="font-arquivo text-base font-normal tracking-normal text-grafite-300 normal-case [font-stretch:100%]">{fichas.length}</span>
        </h3>
        <button type="button" onClick={onNova} className={classeBotaoKraft}>
          <Icone nome="mais" className="h-4 w-4" /> Novo agente
        </button>
      </div>

      {fichas.length === 0 ? (
        <PastaVazia>
          <p className={`text-xl text-kraft-300 ${classeTituloArquivo}`}>Nenhum agente nesta mesa</p>
          <p className="mt-2 text-sm text-grafite-300">Crie o primeiro com "Novo agente".</p>
        </PastaVazia>
      ) : (
        <ul className="space-y-6">
          {fichas.map((f) => (
            <li key={f.id}>
              <button type="button" onClick={() => onAbrir(f.id)} aria-label={`Acessar ficha de ${f.nome.trim() || 'agente sem nome'}`}
                className="pasta-gaveta block w-full rounded-[5px] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kraft-300">
                <Pasta aba={`${NOME_CLASSE[f.classe]} · NEX ${f.nex}%`}>
                  <div className="space-y-3 p-3">
                    <p className={`rounded-[2px] bg-papel-50 px-3 py-2 text-lg leading-tight font-bold break-words text-tinta-900 shadow-[0_1px_2px_rgb(0_0_0/0.25)] ${condensado}`}>
                      {f.nome.trim() || '[Sem nome]'}
                    </p>
                    <p className="text-sm leading-snug text-tinta-700">
                      Jogador: <span className="font-datilo text-tinta-900">{nomeDono(f.usuario_id)}</span><br />
                      Registrado em <span className="font-datilo text-tinta-900">{formatoData.format(new Date(f.createdAt))}</span>
                    </p>
                  </div>
                </Pasta>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
