// Tipos e lookup da progressão — desacoplados do Prisma de propósito
// (o motor de cálculo não pode depender do banco pra ser testável).

export const CLASSES_VALIDAS = ['COMBATENTE', 'ESPECIALISTA', 'OCULTISTA'] as const
export type ClasseOrdemParanormal = (typeof CLASSES_VALIDAS)[number]

// NEX avança só nesses 20 degraus (Ordem Paranormal RPG v1.3) — o último
// salto (95% -> 99%) é de +4%, mas ainda conta como "um novo nível de
// exposição" pra fins de PV/PE/San e desbloqueio de habilidades.
export const NEX_TIERS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99,
] as const

export function indiceTier(nex: number): number {
  return NEX_TIERS.indexOf(nex as (typeof NEX_TIERS)[number])
}

// Habilidades desbloqueadas por classe em CADA tier (uma linha por
// classe+NEX, não cumulativa — a ficha acumula tudo que já passou).
export type ProgressaoClasseEntry = {
  classe: ClasseOrdemParanormal
  nex: number
  habilidades: string | null
}

// Separador é ";" (não ",") porque o texto de uma única habilidade já pode
// conter vírgula naturalmente — ex.: "Ataque especial (2 PE, +5)" é UMA
// habilidade só; "Aumento de atributo; versatilidade" são duas.
export function habilidadesAcumuladas(
  tabela: ProgressaoClasseEntry[],
  classe: string,
  nex: number,
): string[] {
  return tabela
    .filter((p) => p.classe === classe && p.nex <= nex)
    .sort((a, b) => a.nex - b.nex)
    .flatMap((p) => (p.habilidades ? p.habilidades.split(';').map((h) => h.trim()) : []))
}

// Base + incremento por tier, por classe — confirmado no livro (Ordem
// Paranormal RPG v1.3, capítulo 1). PV soma Vigor; PE soma Presença; San
// não soma atributo nenhum.
export type ClasseFormulaEntry = {
  classe: ClasseOrdemParanormal
  pvBase: number
  pvPorTier: number
  peBase: number
  pePorTier: number
  sanBase: number
  sanPorTier: number
}

// Por que (classe, nex) não serve para o motor — ou null se serve. Os services convertem em 400:
// o motor lança Error puro para entrada inválida, que viraria 500 se chegasse até lá.
export function motivoClasseNexInvalidos(classe: unknown, nex: unknown): string | null {
  if (typeof classe !== 'string' || !(CLASSES_VALIDAS as readonly string[]).includes(classe)) {
    return `Classe inválida — use uma de: ${CLASSES_VALIDAS.join(', ')}`
  }
  if (typeof nex !== 'number' || indiceTier(nex) === -1) {
    return `NEX inválido — use um dos degraus: ${NEX_TIERS.join(', ')}`
  }
  return null
}
