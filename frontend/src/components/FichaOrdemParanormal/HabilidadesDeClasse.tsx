import { NOME_CLASSE, type Ficha } from '../../services/tipos'
import { classeRotulo, condensado } from '../ui/estilosArquivo'

// O que a classe dá até o NEX atual (Tabelas 1.3–1.5 do livro, calculado no backend). É só leitura:
// "Poder de combatente" ou "Habilidade de trilha" são vagas — a escolha o jogador cadastra
// logo abaixo (ou na divisória Poderes). Repetidas aparecem uma vez, com a contagem.
export function HabilidadesDeClasse({ ficha }: { ficha: Ficha }) {
  const contagem = new Map<string, number>()
  for (const h of ficha.habilidadesDesbloqueadas ?? []) contagem.set(h, (contagem.get(h) ?? 0) + 1)
  if (contagem.size === 0) return null

  return (
    <section aria-labelledby={`hab-classe-${ficha.id}`} className="mb-5 border-b border-papel-300 pb-4">
      <h4 id={`hab-classe-${ficha.id}`} className={classeRotulo}>
        Da classe · {NOME_CLASSE[ficha.classe]} até NEX {ficha.nex}%
      </h4>
      <ul className="mt-2 space-y-1.5">
        {[...contagem].map(([nome, vezes]) => (
          <li key={nome} className="flex items-baseline justify-between gap-3">
            <span className={`text-base leading-tight font-bold ${condensado}`}>{nome}</span>
            {vezes > 1 && <span className="shrink-0 font-datilo text-sm text-tinta-700" aria-label={`${vezes} vezes`}>×{vezes}</span>}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-tinta-700">As escolhas (qual poder, qual habilidade de trilha) você cadastra abaixo e na divisória Poderes.</p>
    </section>
  )
}
