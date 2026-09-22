import { useAtrasado } from '../../hooks/useAtrasado'
import { classeBotaoSecundario } from './estilos'

export function Spinner({ tamanho = 'md' }: { tamanho?: 'sm' | 'md' }) {
  const dimensao = tamanho === 'sm' ? 'h-4 w-4 border-2' : 'h-8 w-8 border-[3px]'
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={`inline-block animate-spin rounded-full border-violet-400 border-t-transparent ${dimensao}`}
    />
  )
}

// Estado de carregamento de uma tela/seção: não mostra nada nos primeiros
// 300ms (evita piscar), depois spinner com texto.
export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  const visivel = useAtrasado(true)
  if (!visivel) return null
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-zinc-400">
      <Spinner />
      <span className="text-sm">{texto}</span>
    </div>
  )
}

export function Alerta({ mensagem, onTentarNovamente }: { mensagem: string; onTentarNovamente?: () => void }) {
  return (
    <div role="alert" className="rounded-md border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
      <p>{mensagem}</p>
      {onTentarNovamente && (
        <button type="button" onClick={onTentarNovamente} className={`${classeBotaoSecundario} mt-3 text-xs`}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
