import { describe, it, expect } from 'vitest'
import { calcularFicha } from './calculoFicha.js'
import type { ProgressaoClasseEntry } from './progressaoClasse.js'

// Valores MOCK — não são os valores reais do livro/C.R.I.S. Servem só pra
// testar a lógica do motor (lookup, combinação, casos de erro). O critério
// "≥ 3 resultados conferidos contra o livro" segue em aberto até os dados
// reais da tabela de progressão serem levantados (mesmo bloqueio da Etapa 2).
const TABELA_MOCK: ProgressaoClasseEntry[] = [
  { classe: 'COMBATENTE', nex: 5, pvMaximo: 20, peMaximo: 4, sanMaximo: 20, habilidades: 'Ataque Especial' },
  { classe: 'COMBATENTE', nex: 50, pvMaximo: 80, peMaximo: 20, sanMaximo: 40, habilidades: 'Ataque Especial, Fúria' },
  { classe: 'COMBATENTE', nex: 99, pvMaximo: 160, peMaximo: 40, sanMaximo: 60, habilidades: 'Ataque Especial, Fúria, Avatar' },
  { classe: 'ESPECIALISTA', nex: 5, pvMaximo: 16, peMaximo: 6, sanMaximo: 20, habilidades: 'Faro' },
  { classe: 'ESPECIALISTA', nex: 50, pvMaximo: 60, peMaximo: 28, sanMaximo: 40, habilidades: 'Faro, Golpe de Sorte' },
  { classe: 'ESPECIALISTA', nex: 99, pvMaximo: 120, peMaximo: 56, sanMaximo: 60, habilidades: 'Faro, Golpe de Sorte, Improviso Genial' },
  { classe: 'OCULTISTA', nex: 5, pvMaximo: 14, peMaximo: 8, sanMaximo: 20, habilidades: 'Ritual Iniciante' },
  { classe: 'OCULTISTA', nex: 50, pvMaximo: 50, peMaximo: 36, sanMaximo: 40, habilidades: 'Ritual Iniciante, Ritual Avançado' },
  { classe: 'OCULTISTA', nex: 99, pvMaximo: 100, peMaximo: 72, sanMaximo: 60, habilidades: 'Ritual Iniciante, Ritual Avançado, Arcano Supremo' },
]

const ATRIBUTOS_BASE = { for: 2, agi: 1, int: 1, vig: 3, pre: 0 }

describe('calcularFicha', () => {
  const classes = ['COMBATENTE', 'ESPECIALISTA', 'OCULTISTA'] as const
  const tiers = [5, 50, 99] as const

  for (const classe of classes) {
    for (const nex of tiers) {
      it(`calcula pv/pe/san para ${classe} no NEX ${nex}`, () => {
        const esperado = TABELA_MOCK.find((p) => p.classe === classe && p.nex === nex)!
        const resultado = calcularFicha({ classe, nex, atributos: ATRIBUTOS_BASE }, TABELA_MOCK)

        expect(resultado.pv_maximo).toBe(esperado.pvMaximo)
        expect(resultado.pe_maximo).toBe(esperado.peMaximo)
        expect(resultado.san_maximo).toBe(esperado.sanMaximo)
        expect(resultado.habilidadesDesbloqueadas).toEqual(esperado.habilidades!.split(', '))
      })
    }
  }

  it('cobre a borda NEX 5', () => {
    const resultado = calcularFicha({ classe: 'COMBATENTE', nex: 5, atributos: ATRIBUTOS_BASE }, TABELA_MOCK)
    expect(resultado.pv_maximo).toBe(20)
  })

  it('cobre a borda NEX 99', () => {
    const resultado = calcularFicha({ classe: 'COMBATENTE', nex: 99, atributos: ATRIBUTOS_BASE }, TABELA_MOCK)
    expect(resultado.pv_maximo).toBe(160)
  })

  it('roda sem banco — tabela de progressão é só um parâmetro', () => {
    const resultado = calcularFicha({ classe: 'OCULTISTA', nex: 5, atributos: ATRIBUTOS_BASE }, TABELA_MOCK)
    expect(resultado).toBeDefined()
  })

  it('calcula bônus de perícia como atributo-base + bônus de treino', () => {
    const resultado = calcularFicha(
      {
        classe: 'OCULTISTA',
        nex: 50,
        atributos: ATRIBUTOS_BASE,
        pericias: [
          { nome: 'Ocultismo', atributoBase: 'int', nivel: 'EXPERT' },
          { nome: 'Luta', atributoBase: 'for', nivel: 'LEIGO' },
        ],
      },
      TABELA_MOCK,
    )

    expect(resultado.bonusPericias.Ocultismo).toBe(ATRIBUTOS_BASE.int + 15)
    expect(resultado.bonusPericias.Luta).toBe(ATRIBUTOS_BASE.for + 0)
  })

  it('rejeita NEX negativo sem crashar', () => {
    expect(() => calcularFicha({ classe: 'COMBATENTE', nex: -5, atributos: ATRIBUTOS_BASE }, TABELA_MOCK)).toThrow(
      /NEX inválido/,
    )
  })

  it('rejeita NEX zero sem crashar', () => {
    expect(() => calcularFicha({ classe: 'COMBATENTE', nex: 0, atributos: ATRIBUTOS_BASE }, TABELA_MOCK)).toThrow(
      /NEX inválido/,
    )
  })

  it('rejeita NEX acima de 99 sem crashar', () => {
    expect(() => calcularFicha({ classe: 'COMBATENTE', nex: 100, atributos: ATRIBUTOS_BASE }, TABELA_MOCK)).toThrow(
      /NEX inválido/,
    )
  })

  it('rejeita classe inexistente sem crashar', () => {
    expect(() =>
      calcularFicha({ classe: 'MAGO', nex: 5, atributos: ATRIBUTOS_BASE }, TABELA_MOCK),
    ).toThrow(/Classe inexistente/)
  })

  it('rejeita NEX sem linha correspondente na tabela sem crashar', () => {
    expect(() => calcularFicha({ classe: 'COMBATENTE', nex: 7, atributos: ATRIBUTOS_BASE }, TABELA_MOCK)).toThrow(
      /Progressão não encontrada/,
    )
  })
})
