import {
  CLASSES_VALIDAS,
  NEX_TIERS,
  indiceTier,
  habilidadesAcumuladas,
  type ProgressaoClasseEntry,
  type ClasseFormulaEntry,
} from './progressaoClasse.js'

export type AtributosOP1 = {
  for: number
  agi: number
  int: number
  vig: number
  pre: number
}

export type NivelTreinoPericia = 'DESTREINADO' | 'TREINADO' | 'VETERANO' | 'EXPERT'

export type PericiaParaCalculo = {
  nome: string
  atributoBase: keyof AtributosOP1
  nivel: NivelTreinoPericia
}

export type EntradaCalculoFicha = {
  classe: string
  nex: number
  atributos: AtributosOP1
  pericias?: PericiaParaCalculo[]
}

export type ResultadoCalculoFicha = {
  pv_maximo: number
  pe_maximo: number
  san_maximo: number
  bonusPericias: Record<string, number>
  habilidadesDesbloqueadas: string[]
}

// Bônus por grau de treino — confirmado no livro (Ordem Paranormal RPG
// v1.3, Cap. 2 "Testes e Treinamento"): Destreinado 0, Treinado +5,
// Veterano +10, Expert +15.
const BONUS_TREINO: Record<NivelTreinoPericia, number> = {
  DESTREINADO: 0,
  TREINADO: 5,
  VETERANO: 10,
  EXPERT: 15,
}

export function calcularFicha(
  entrada: EntradaCalculoFicha,
  tabelaHabilidades: ProgressaoClasseEntry[],
  formulas: ClasseFormulaEntry[],
): ResultadoCalculoFicha {
  if (!CLASSES_VALIDAS.includes(entrada.classe as (typeof CLASSES_VALIDAS)[number])) {
    throw new Error(`Classe inexistente: ${entrada.classe}`)
  }

  const tier = indiceTier(entrada.nex)
  if (tier === -1) {
    throw new Error(
      `NEX inválido: ${entrada.nex} (deve ser um dos tiers do jogo: ${NEX_TIERS.join(', ')})`,
    )
  }

  const formula = formulas.find((f) => f.classe === entrada.classe)
  if (!formula) {
    throw new Error(`Fórmula de progressão não encontrada para classe ${entrada.classe}`)
  }

  const bonusPericias: Record<string, number> = {}
  for (const pericia of entrada.pericias ?? []) {
    bonusPericias[pericia.nome] = entrada.atributos[pericia.atributoBase] + BONUS_TREINO[pericia.nivel]
  }

  return {
    pv_maximo: formula.pvBase + entrada.atributos.vig + formula.pvPorTier * tier,
    pe_maximo: formula.peBase + entrada.atributos.pre + formula.pePorTier * tier,
    san_maximo: formula.sanBase + formula.sanPorTier * tier,
    bonusPericias,
    habilidadesDesbloqueadas: habilidadesAcumuladas(tabelaHabilidades, entrada.classe, entrada.nex),
  }
}
