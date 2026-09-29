import type { NomeIcone } from './Icone'
import { Icone } from './Icone'
import { condensado } from './estilosArquivo'

export type Folha<T extends string> = { chave: T; rotulo: string; icone: NomeIcone }

// Barra lateral como uma pasta em pé: cada item é uma folha saindo da boca da pasta.
// Em repouso só a ponta da folha (o ícone) aparece; no hover/foco ela desliza para fora
// e mostra o nome. A folha passa por trás do corpo da pasta, que fica sempre na frente.
//
// Geometria (lado esquerdo; o direito é o espelho): trilho de 72px, corpo da pasta com 32px,
// folha de 208px encostada na borda do trilho — 40px aparecem além da pasta.
const DESLIZE = 'hover:translate-x-[136px] focus-visible:translate-x-[136px]'
const DESLIZE_DIR = 'hover:-translate-x-[136px] focus-visible:-translate-x-[136px]'

export function PastaDeFolhas<T extends string>({ lado, folhas, ativa, onEscolher, rotulo, comoNavegacao = false }: {
  lado: 'esquerda' | 'direita'
  folhas: Folha<T>[]
  ativa?: T
  onEscolher: (chave: T) => void
  rotulo: string
  // true = navegação entre vistas (aria-current); false = atalhos que abrem algo.
  comoNavegacao?: boolean
}) {
  const esquerda = lado === 'esquerda'
  const Recipiente = comoNavegacao ? 'nav' : 'div'
  return (
    <Recipiente aria-label={rotulo}
      className={`relative z-20 w-[72px] shrink-0 bg-arquivo-900 ${esquerda ? 'border-r' : 'border-l'} border-arquivo-700`}>
      <div className="relative mt-6">
      {/* corpo da pasta, do tamanho das folhas: fica na frente delas. O vinco marca a boca da pasta. */}
      <div aria-hidden="true"
        className={`textura-fibra pointer-events-none absolute -inset-y-4 z-10 w-8 bg-kraft-600 shadow-[0_0_14px_-2px_rgb(0_0_0/0.8)] ${esquerda ? 'left-0 rounded-r-[5px]' : 'right-0 rounded-l-[5px]'}`}>
        <span className={`absolute inset-y-2 w-px bg-kraft-400/60 ${esquerda ? 'right-1.5' : 'left-1.5'}`} />
      </div>
      <ul className="relative flex flex-col gap-2">
        {folhas.map(({ chave, rotulo: nome, icone }) => {
          const eAtiva = chave === ativa
          return (
            <li key={chave} className="relative h-12">
              <button type="button" onClick={() => onEscolher(chave)}
                aria-current={comoNavegacao && eAtiva ? 'page' : undefined}
                // O botão inteiro desliza (não só o desenho), senão o mouse perde a folha no meio do caminho.
                className={`group absolute top-0 h-12 w-[208px] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none focus-visible:outline-none ${esquerda ? `-left-[136px] ${eAtiva ? 'translate-x-2' : ''} ${DESLIZE}` : `-right-[136px] ${eAtiva ? '-translate-x-2' : ''} ${DESLIZE_DIR}`}`}>
                <span className={`textura-fibra flex h-full w-full items-center gap-6 rounded-[3px] px-3 text-tinta-900 shadow-[0_4px_10px_-6px_rgb(0_0_0/0.9)] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-kraft-300 ${esquerda ? 'justify-end' : 'flex-row-reverse justify-end'} ${eAtiva ? 'bg-papel-50' : 'bg-papel-200 group-hover:bg-papel-100'}`}>
                  <span className={`text-sm font-bold tracking-[0.12em] uppercase ${condensado}`}>{nome}</span>
                  <Icone nome={icone} className="h-5 w-5 shrink-0" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      </div>
    </Recipiente>
  )
}
