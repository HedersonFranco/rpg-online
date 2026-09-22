// Tipos e lookup da tabela de progressão — desacoplados do Prisma de propósito
// (o motor de cálculo não pode depender do banco pra ser testável).

export const CLASSES_VALIDAS = ['COMBATENTE', 'ESPECIALISTA', 'OCULTISTA'] as const
export type ClasseOrdemParanormal = (typeof CLASSES_VALIDAS)[number]

export type ProgressaoClasseEntry = {
  classe: ClasseOrdemParanormal
  nex: number
  pvMaximo: number
  peMaximo: number
  sanMaximo: number
  habilidades: string | null
}

export function buscarProgressao(
  tabela: ProgressaoClasseEntry[],
  classe: string,
  nex: number,
): ProgressaoClasseEntry | undefined {
  return tabela.find((p) => p.classe === classe && p.nex === nex)
}
