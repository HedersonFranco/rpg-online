import type { Rolagem } from '../../services/tipos'
import { Icone } from '../ui/Icone'
import { condensado } from '../ui/estilosArquivo'

const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

// Rolagem: um bilhete de papel com o resultado (quem rolou é o servidor). Usado no chat e na ficha.
export function BilheteRolagem({ rolagem, onFechar }: { rolagem: Rolagem; onFechar?: () => void }) {
  return (
    <div className="textura-fibra rounded-[2px] bg-papel-100 px-3 py-2 text-tinta-900 shadow-[0_6px_14px_-8px_rgb(0_0_0/0.9)]">
      {rolagem.rotulo && <p className={`truncate text-sm font-extrabold tracking-[0.04em] uppercase ${condensado}`}>{rolagem.rotulo}</p>}
      <p className="flex items-center gap-1.5 text-xs text-tinta-700">
        <Icone nome="dados" className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 truncate"><span className="font-bold">{rolagem.autor.nome}</span> rolou <span className="font-datilo text-tinta-900">{rolagem.expressao}</span></span>
        <span className="ml-auto shrink-0 font-datilo">{hora(rolagem.criadoEm)}</span>
        {onFechar && (
          <button type="button" onClick={onFechar} aria-label="Dispensar rolagem" className="-mr-1 shrink-0 rounded-[2px] px-1 text-tinta-700 hover:text-tinta-900">×</button>
        )}
      </p>
      <p className="mt-1 flex items-baseline justify-between gap-3">
        <span className="min-w-0 font-datilo text-sm break-words text-tinta-700">{rolagem.detalhe}</span>
        <strong className={`shrink-0 text-3xl leading-none font-extrabold ${condensado}`}>{rolagem.total}</strong>
      </p>
    </div>
  )
}
