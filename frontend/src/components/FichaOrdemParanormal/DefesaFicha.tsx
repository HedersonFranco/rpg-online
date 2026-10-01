import { useState } from 'react'
import type { Ficha } from '../../services/tipos'
import { classeRotulo, condensado } from '../ui/estilosArquivo'

// Defesa e reações (livro p. 42 e p. 87). Os três números vêm do backend (`ficha.defesa`);
// aqui só se edita o bônus de Defesa, que é informação do jogador (equipamento, habilidades).
export function DefesaFicha({ ficha, podeEditar, pendente, onBonus }: {
  ficha: Ficha
  podeEditar: boolean
  pendente: boolean
  onBonus: (bonus: number) => void
}) {
  const { defesa, esquiva, bloqueio } = ficha.defesa
  const [rascunho, setRascunho] = useState(String(ficha.defesa_bonus))
  const [editando, setEditando] = useState(false)
  // Fora de edição, o campo mostra o que o servidor tem (inclusive mudanças vindas de outra aba).
  const valorCampo = editando ? rascunho : String(ficha.defesa_bonus)

  function salvar() {
    setEditando(false)
    const bonus = Number(rascunho)
    if (rascunho.trim() !== '' && Number.isInteger(bonus) && bonus !== ficha.defesa_bonus) onBonus(bonus)
  }

  return (
    <section aria-labelledby={`defesa-${ficha.id}`} className="space-y-2">
      <h4 id={`defesa-${ficha.id}`} className={`text-sm font-extrabold tracking-[0.12em] uppercase ${condensado}`}>Defesa</h4>
      {/* Folha larga: três caixas lado a lado. Estreita (painel perto de 320px): uma por linha, valor à direita. */}
      <dl className="grid gap-1.5 @min-[18.5rem]:grid-cols-3">
        <Valor rotulo="Defesa" valor={defesa} nota="10 + AGI + bônus" destaque />
        <Valor rotulo="Esquiva" valor={esquiva} nota={esquiva === null ? 'treine Reflexos' : 'Defesa + Reflexos'} />
        <Valor rotulo="Bloqueio" valor={bloqueio === null ? null : `RD ${bloqueio}`} nota={bloqueio === null ? 'treine Fortitude' : 'só corpo a corpo'} />
      </dl>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs leading-snug text-tinta-700">Uma reação por rodada, declarada antes do ataque ser rolado.</p>
        {podeEditar ? (
          <label className="flex shrink-0 items-center gap-1.5">
            <span className={`${classeRotulo} mb-0`}>Bônus</span>
            <input type="number" inputMode="numeric" min={-50} max={50} step={1} value={valorCampo} disabled={pendente}
              title="Bônus de Defesa de equipamento, habilidades ou condições"
              onFocus={() => { setRascunho(String(ficha.defesa_bonus)); setEditando(true) }}
              onChange={(e) => setRascunho(e.target.value)}
              onBlur={salvar}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
              className="h-9 w-14 rounded-sm border-2 border-tinta-900 bg-papel-50 px-1.5 text-center font-datilo text-base text-tinta-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900 disabled:opacity-50" />
          </label>
        ) : (
          ficha.defesa_bonus !== 0 && <span className="shrink-0 font-datilo text-sm text-tinta-700">bônus {ficha.defesa_bonus > 0 ? '+' : ''}{ficha.defesa_bonus}</span>
        )}
      </div>
    </section>
  )
}

function Valor({ rotulo, valor, nota, destaque = false }: { rotulo: string; valor: number | string | null; nota: string; destaque?: boolean }) {
  return (
    <div className={`grid min-w-0 grid-cols-[1fr_auto] items-center gap-x-3 rounded-sm border-2 px-2 py-1.5 @min-[18.5rem]:grid-cols-1 @min-[18.5rem]:text-center ${valor === null ? 'border-dashed border-tinta-900/40' : destaque ? 'border-tinta-900' : 'border-tinta-900/40'}`}>
      <dt className={`col-start-1 row-start-1 text-xs font-bold tracking-[0.1em] text-tinta-700 uppercase ${condensado}`}>{rotulo}</dt>
      <dd className="col-start-2 row-span-2 row-start-1 font-datilo text-xl leading-tight text-tinta-900 @min-[18.5rem]:col-start-1 @min-[18.5rem]:row-span-1 @min-[18.5rem]:row-start-2">{valor ?? '—'}</dd>
      <dd className="col-start-1 row-start-2 text-xs leading-tight text-balance text-tinta-600 @min-[18.5rem]:row-start-3">{nota}</dd>
    </div>
  )
}
