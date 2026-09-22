import { CLASSES_VALIDAS, buscarProgressao, type ProgressaoClasseEntry } from './progressaoClasse.js'

export type AtributosOP1 = {
  for: number
  agi: number
  int: number
  vig: number
  pre: number
}

export type NivelTreinoPericia = 'LEIGO' | 'TREINADO' | 'VETERANO' | 'EXPERT'

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

// Bônus por nível de treino — mecânica conhecida de Ordem Paranormal 1ª ed.
// Os VALORES da tabela de progressão em si (pv/pe/san por classe×NEX) ainda
// não foram conferidos contra o livro/C.R.I.S. — ver bloqueio no CLAUDE.md.
const BONUS_TREINO: Record<NivelTreinoPericia, number> = {
  LEIGO: 0,
  TREINADO: 5,
  VETERANO: 10,
  EXPERT: 15,
}

export function calcularFicha(
  entrada: EntradaCalculoFicha,
  tabelaProgressao: ProgressaoClasseEntry[],
): ResultadoCalculoFicha {
  if (!CLASSES_VALIDAS.includes(entrada.classe as (typeof CLASSES_VALIDAS)[number])) {
    throw new Error(`Classe inexistente: ${entrada.classe}`)
  }

  if (!Number.isInteger(entrada.nex) || entrada.nex <= 0 || entrada.nex > 99) {
    throw new Error(`NEX inválido: ${entrada.nex} (deve ser um inteiro entre 1 e 99)`)
  }

  const progressao = buscarProgressao(tabelaProgressao, entrada.classe, entrada.nex)
  if (!progressao) {
    throw new Error(`Progressão não encontrada para classe ${entrada.classe} e NEX ${entrada.nex}`)
  }

  const bonusPericias: Record<string, number> = {}
  for (const pericia of entrada.pericias ?? []) {
    bonusPericias[pericia.nome] = entrada.atributos[pericia.atributoBase] + BONUS_TREINO[pericia.nivel]
  }

  return {
    pv_maximo: progressao.pvMaximo,
    pe_maximo: progressao.peMaximo,
    san_maximo: progressao.sanMaximo,
    bonusPericias,
    habilidadesDesbloqueadas: progressao.habilidades
      ? progressao.habilidades.split(',').map((h) => h.trim())
      : [],
  }
}
