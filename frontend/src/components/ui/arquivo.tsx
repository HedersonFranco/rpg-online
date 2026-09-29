import type { ReactNode } from 'react'
import type { Papel } from '../../services/tipos'
import { condensado } from './estilosArquivo'

// Peças do mundo "Dossiê de caso" (o produto inteiro).

// Placa de metal da gaveta com a etiqueta do produto.
export function PlacaGaveta() {
  return (
    <span className="inline-flex rounded-[3px] bg-arquivo-600 p-[3px]">
      <span className={`textura-fibra rounded-[2px] bg-papel-100 px-2.5 py-0.5 text-sm font-extrabold tracking-[0.16em] text-tinta-900 uppercase ${condensado}`}>
        RPG Online
      </span>
    </span>
  )
}

// Folha de papel onde se preenche algo.
export function Folha({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`textura-fibra rounded-sm bg-papel-100 p-5 text-tinta-900 shadow-[0_10px_24px_-12px_rgb(0_0_0/0.8)] sm:p-6 ${className}`}>
      {children}
    </div>
  )
}

const ROTULO_PAPEL: Record<Papel, string> = { MESTRE: 'Mestre', JOGADOR: 'Jogador' }

// Carimbo de estado. Tinta vermelha escura (≥4.5:1 sobre kraft e papel), com falhas de entintamento.
// tom 'escuro': sobre o arquivo quase preto a tinta escura some — usa o carimbo claro (≥4.5:1 sobre arquivo-900).
export function Carimbo({ children, tom = 'papel' }: { children: ReactNode; tom?: 'papel' | 'escuro' }) {
  const cor = tom === 'escuro' ? 'border-carimbo-300 text-carimbo-300' : 'border-carimbo-900 text-carimbo-900'
  return (
    <span className={`tinta-carimbo inline-block shrink-0 -rotate-[4deg] whitespace-nowrap rounded-[3px] border-[3px] border-double px-2 py-0.5 text-base leading-tight font-extrabold tracking-[0.12em] uppercase ${cor} ${condensado}`}>
      {children}
    </span>
  )
}

export function CarimboPapel({ papel }: { papel: Papel }) {
  return <Carimbo>{ROTULO_PAPEL[papel]}</Carimbo>
}

// Pasta kraft com aba. A aba leva a classificação (ex.: o sistema da mesa).
export function Pasta({ aba, children, className = '' }: { aba: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`relative pt-6 ${className}`}>
      <span className={`textura-fibra aba-pasta absolute top-0 left-0 flex h-7 max-w-[85%] items-center rounded-tl-[5px] bg-kraft-500 pl-3 text-xs font-bold tracking-[0.12em] text-tinta-900 uppercase ${condensado}`}>
        <span className="truncate">{aba}</span>
      </span>
      <div className="textura-fibra relative h-full rounded-[5px] rounded-tl-none bg-kraft-500 text-tinta-900 shadow-[0_12px_24px_-14px_rgb(0_0_0/0.9)]">
        {children}
      </div>
    </div>
  )
}

// Gaveta sem nenhuma pasta: o contorno vazio de uma pasta, no mesmo desenho das cheias.
export function PastaVazia({ children }: { children: ReactNode }) {
  return (
    <div className="relative pt-6">
      <span className="absolute top-0 left-0 h-7 w-40 rounded-t-[5px] border-2 border-b-0 border-dashed border-kraft-700" aria-hidden="true" />
      <div className="rounded-[5px] rounded-tl-none border-2 border-dashed border-kraft-700 px-6 py-10 text-center">
        {children}
      </div>
    </div>
  )
}
