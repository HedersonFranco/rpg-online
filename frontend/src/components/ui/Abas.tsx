import { useRef, type KeyboardEvent, type ReactNode } from 'react'

export type Aba<T extends string> = { chave: T; rotulo: ReactNode }

// Lista de abas com o padrão de teclado do WAI-ARIA: setas trocam de aba, Home/End vão às pontas,
// só a aba ativa entra no Tab. `idBase` liga cada aba ao seu painel (aria-controls).
export function Abas<T extends string>({ abas, ativa, onTrocar, rotulo, idBase, classeAba, classeLista = 'flex' }: {
  abas: Aba<T>[]
  ativa: T
  onTrocar: (chave: T) => void
  rotulo: string
  idBase: string
  classeAba: (ativa: boolean) => string
  classeLista?: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function teclar(e: KeyboardEvent, indice: number) {
    const destino = { ArrowRight: indice + 1, ArrowLeft: indice - 1, Home: 0, End: abas.length - 1 }[e.key]
    if (destino === undefined) return
    e.preventDefault()
    const i = (destino + abas.length) % abas.length
    onTrocar(abas[i].chave)
    refs.current[i]?.focus()
  }

  return (
    <div role="tablist" aria-label={rotulo} className={classeLista}>
      {abas.map(({ chave, rotulo: texto }, i) => (
        <button key={chave} ref={(el) => { refs.current[i] = el }} type="button" role="tab"
          id={`${idBase}-aba-${chave}`} aria-controls={`${idBase}-painel`} aria-selected={ativa === chave}
          tabIndex={ativa === chave ? 0 : -1} onClick={() => onTrocar(chave)} onKeyDown={(e) => teclar(e, i)}
          className={classeAba(ativa === chave)}>
          {texto}
        </button>
      ))}
    </div>
  )
}
