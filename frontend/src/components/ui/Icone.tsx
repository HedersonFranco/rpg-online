import type { ReactNode } from 'react'

export type NomeIcone =
  | 'mesa' | 'mapa' | 'fichas' | 'biblioteca' | 'notas' | 'npcs'
  | 'sair' | 'voltar' | 'copiar' | 'microfoneDesligado'
  | 'cursor' | 'mover' | 'zoomMais' | 'zoomMenos' | 'telaCheia'
  | 'mais' | 'menos' | 'dados'

const caminhos: Record<NomeIcone, ReactNode> = {
  mesa: (<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>),
  mapa: (<><path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" /><path d="M9 3v16M15 5v16" /></>),
  fichas: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>),
  biblioteca: (<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></>),
  notas: (<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>),
  npcs: (<><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 3.5a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3" /></>),
  sair: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>),
  voltar: <path d="M19 12H5M12 19l-7-7 7-7" />,
  copiar: (<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>),
  microfoneDesligado: (<><path d="M2 2l20 20" /><path d="M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V5a3 3 0 0 0-5.7-1.3" /><path d="M19 11a7 7 0 0 1-1.2 3.9M5 11a7 7 0 0 0 11.3 5.5M12 18v4" /></>),
  cursor: <path d="M4 3l7 17 2.5-7.5L21 10z" />,
  mover: (<><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3" /><path d="M2 12h20M12 2v20" /></>),
  zoomMais: (<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></>),
  zoomMenos: (<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M8 11h6" /></>),
  telaCheia: <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />,
  mais: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  dados: (<><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1" /><circle cx="15.5" cy="15.5" r="1" /><circle cx="12" cy="12" r="1" /></>),
}

export function Icone({ nome, className = 'h-5 w-5' }: { nome: NomeIcone; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {caminhos[nome]}
    </svg>
  )
}
