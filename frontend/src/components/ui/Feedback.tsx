import { useAtrasado } from '../../hooks/useAtrasado'
import { classeBotaoSecundario } from './estilos'
import { classeBotaoArquivo, classeBotaoContorno } from './estilosArquivo'

// Herda a cor do texto em volta: serve no botão, na mesa e nas folhas do arquivo.
export function Spinner({ tamanho = 'md' }: { tamanho?: 'sm' | 'md' }) {
  const dimensao = tamanho === 'sm' ? 'h-4 w-4 border-2' : 'h-8 w-8 border-[3px]'
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent opacity-80 ${dimensao}`}
    />
  )
}

// Estado de carregamento de uma tela/seção: não mostra nada nos primeiros
// 300ms (evita piscar), depois spinner com texto.
export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  const visivel = useAtrasado(true)
  if (!visivel) return null
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-zinc-400 [.mundo-arquivo_&]:text-grafite-300">
      <Spinner />
      <span className="text-sm">{texto}</span>
    </div>
  )
}

// tom: 'mesa' (zinc, padrão), 'papel' (dentro de uma folha) ou 'arquivo' (sobre o fundo escuro do arquivo).
const TOM_ALERTA = {
  mesa: { caixa: 'rounded-md border border-red-900/60 bg-red-950/40 text-red-200', botao: classeBotaoSecundario },
  papel: { caixa: 'rounded-sm border-2 border-carimbo-800 bg-carimbo-100 text-carimbo-800', botao: classeBotaoContorno },
  arquivo: { caixa: 'rounded-sm border border-carimbo-300/50 bg-carimbo-800/25 text-carimbo-100', botao: classeBotaoArquivo },
} as const

export function Alerta({ mensagem, onTentarNovamente, tom = 'mesa' }: {
  mensagem: string
  onTentarNovamente?: () => void
  tom?: keyof typeof TOM_ALERTA
}) {
  const { caixa, botao } = TOM_ALERTA[tom]
  return (
    <div role="alert" className={`${caixa} px-4 py-3 text-sm`}>
      <p>{mensagem}</p>
      {onTentarNovamente && (
        <button type="button" onClick={onTentarNovamente} className={`${botao} mt-3 text-xs`}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
