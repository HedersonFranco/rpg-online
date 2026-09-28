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

// Teste de perícia em OP1 = rolar `dados` d20 (quantidade = valor do atributo-base),
// ficar com o melhor, e somar `bonus` (só o grau de treino). Atributo 0 rola 2d20 e
// fica com o PIOR (`modo: 'menor'`). Ex.: Vigor 3 + Fortitude Treinado = 3d20+5.
export type TestePericia = {
  nome: string
  atributoBase: keyof AtributosOP1
  nivel: NivelTreinoPericia
  dados: number
  bonus: number
  modo: 'maior' | 'menor'
}

export type ResultadoCalculoFicha = {
  pv_maximo: number
  pe_maximo: number
  san_maximo: number
  testesPericias: TestePericia[]
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

export function montarTestesPericias(atributos: AtributosOP1, pericias: PericiaParaCalculo[]): TestePericia[] {
  return pericias.map((pericia) => {
    const atributo = atributos[pericia.atributoBase]
    return {
      ...pericia,
      dados: atributo > 0 ? atributo : 2,
      bonus: BONUS_TREINO[pericia.nivel],
      modo: atributo > 0 ? 'maior' : 'menor',
    }
  })
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

  return {
    pv_maximo: formula.pvBase + entrada.atributos.vig + formula.pvPorTier * tier,
    pe_maximo: formula.peBase + entrada.atributos.pre + formula.pePorTier * tier,
    san_maximo: formula.sanBase + formula.sanPorTier * tier,
    testesPericias: montarTestesPericias(entrada.atributos, entrada.pericias ?? []),
    habilidadesDesbloqueadas: habilidadesAcumuladas(tabelaHabilidades, entrada.classe, entrada.nex),
  }
}
