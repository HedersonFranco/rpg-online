import type { Rolagem } from '../../services/tipos'
import { Icone } from '../ui/Icone'
import { condensado } from '../ui/estilosArquivo'

const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

// O d20 visto de cima: hexágono com a quantidade de dados (-1 = atributo 0, rola dois e fica com o pior).
function HexagonoD20({ quantidade }: { quantidade: number }) {
  return (
    <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" className="absolute inset-0 h-full w-full">
        <path d="M12 2.5 20.25 7.25v9.5L12 21.5l-8.25-4.75v-9.5z" />
      </svg>
      <span className="relative font-datilo text-xs leading-none font-bold">{quantidade}</span>
    </span>
  )
}

// Rolagem: um bilhete de papel com o resultado (quem rolou é o servidor). Usado no chat e na ficha.
// Da ficha, a primeira linha é compacta ("INV (INT) · Franco" ⬡3 +5); o nome por extenso fica no título
// e no leitor de tela. Rolagem livre continua dizendo quem rolou e a expressão.
export function BilheteRolagem({ rolagem, onFechar }: { rolagem: Rolagem; onFechar?: () => void }) {
  const { teste } = rolagem
  const fechar = onFechar && (
    <button type="button" onClick={onFechar} aria-label="Dispensar rolagem" className="-mr-1 shrink-0 rounded-[2px] px-1 text-tinta-700 hover:text-tinta-900">×</button>
  )
  return (
    <div className="textura-fibra rounded-[2px] bg-papel-100 px-3 py-2 text-tinta-900 shadow-[0_6px_14px_-8px_rgb(0_0_0/0.9)]">
      {teste ? (
        <p className="flex items-center gap-2" title={`${rolagem.rotulo} — ${rolagem.autor.nome} rolou ${rolagem.expressao}`}>
          <span className="sr-only">{rolagem.rotulo}: {rolagem.autor.nome} rolou {rolagem.expressao}</span>
          <span aria-hidden="true" className={`min-w-0 flex-1 truncate text-sm tracking-[0.04em] ${condensado}`}>
            <span className="font-extrabold">{teste.sigla}{teste.atributo && ` (${teste.atributo})`}</span> · {teste.ficha}
          </span>
          <span aria-hidden="true" className="flex shrink-0 items-center gap-1 font-datilo text-sm">
            <HexagonoD20 quantidade={teste.d20} />
            {teste.bonus !== 0 && (teste.bonus > 0 ? `+${teste.bonus}` : teste.bonus)}
          </span>
          <span className="shrink-0 font-datilo text-xs text-tinta-700">{hora(rolagem.criadoEm)}</span>
          {fechar}
        </p>
      ) : (
        <>
          {rolagem.rotulo && <p className={`truncate text-sm font-extrabold tracking-[0.04em] uppercase ${condensado}`}>{rolagem.rotulo}</p>}
          <p className="flex items-center gap-1.5 text-xs text-tinta-700">
            <Icone nome="dados" className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 truncate"><span className="font-bold">{rolagem.autor.nome}</span> rolou <span className="font-datilo text-tinta-900">{rolagem.expressao}</span></span>
            <span className="ml-auto shrink-0 font-datilo">{hora(rolagem.criadoEm)}</span>
            {fechar}
          </p>
        </>
      )}
      <p className="mt-1 flex items-baseline justify-between gap-3">
        <span className="min-w-0 font-datilo text-sm break-words text-tinta-700">{rolagem.detalhe}</span>
        <strong className={`shrink-0 text-3xl leading-none font-extrabold ${condensado}`}>{rolagem.total}</strong>
      </p>
    </div>
  )
}
