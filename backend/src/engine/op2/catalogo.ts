// Catálogo extraído literalmente do PDF (Ordem Paranormal RPG II, Playtest
// Alpha, Ago/2026) — não é cálculo, é referência de dados pra quando o
// schema/seed de OP2 for desenhado. NÃO existe fórmula de PV/PD publicada
// neste playtest (fichas são pré-prontas); por isso não há motor de cálculo
// de OP2 equivalente ao calculoFicha.ts de OP1.

export const ATRIBUTOS_OP2 = ['FISICO', 'MENTE', 'EMOCAO'] as const
export type AtributoOP2 = (typeof ATRIBUTOS_OP2)[number]

export const PERICIAS_OP2: { nome: string; atributoBase: AtributoOP2 }[] = [
  { nome: 'Acrobacia', atributoBase: 'FISICO' },
  { nome: 'Aptidão', atributoBase: 'MENTE' },
  { nome: 'Atletismo', atributoBase: 'FISICO' },
  { nome: 'Crime', atributoBase: 'FISICO' },
  { nome: 'Disciplina', atributoBase: 'EMOCAO' },
  { nome: 'Enganação', atributoBase: 'EMOCAO' },
  { nome: 'Furtividade', atributoBase: 'FISICO' },
  { nome: 'Intimidar', atributoBase: 'EMOCAO' },
  { nome: 'Intuição', atributoBase: 'EMOCAO' },
  { nome: 'Luta', atributoBase: 'FISICO' },
  { nome: 'Máquinas', atributoBase: 'MENTE' },
  { nome: 'Medicina', atributoBase: 'MENTE' },
  { nome: 'Ocultismo', atributoBase: 'MENTE' },
  { nome: 'Percepção', atributoBase: 'MENTE' },
  { nome: 'Persuasão', atributoBase: 'EMOCAO' },
  { nome: 'Pesquisar', atributoBase: 'MENTE' },
  { nome: 'Pontaria', atributoBase: 'FISICO' },
  { nome: 'Sobrevivência', atributoBase: 'MENTE' },
  { nome: 'Tecnologia', atributoBase: 'MENTE' },
  { nome: 'Vigor', atributoBase: 'FISICO' },
]
