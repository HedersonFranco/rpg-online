import { describe, it, expect } from 'vitest'
import { calcularFicha } from './calculoFicha.js'
import type { ProgressaoClasseEntry, ClasseFormulaEntry } from './progressaoClasse.js'

// Dados confirmados no livro (Ordem Paranormal RPG v1.3, Cap. 1 — Combatente
// p.24-25, Especialista p.28-29, Ocultista p.32-33). Isso fecha o critério
// "conferir contra o livro" da Etapa 5 (e o bloqueio equivalente da Etapa 2
// pra essa parte específica — a lista de Perícia/Ritual completa ainda não
// virou seed).
const FORMULAS: ClasseFormulaEntry[] = [
  { classe: 'COMBATENTE', pvBase: 20, pvPorTier: 4, peBase: 2, pePorTier: 2, sanBase: 12, sanPorTier: 3 },
  { classe: 'ESPECIALISTA', pvBase: 16, pvPorTier: 3, peBase: 3, pePorTier: 3, sanBase: 16, sanPorTier: 4 },
  { classe: 'OCULTISTA', pvBase: 12, pvPorTier: 2, peBase: 4, pePorTier: 4, sanBase: 20, sanPorTier: 5 },
]

const TIERS_COMBATENTE = [
  '5% Ataque especial (2 PE, +5)',
  '10% Habilidade de trilha',
  '15% Poder de combatente',
  '20% Aumento de atributo',
  '25% Ataque especial (3 PE, +10)',
  '30% Poder de combatente',
  '35% Grau de treinamento',
  '40% Habilidade de trilha',
  '45% Poder de combatente',
  '50% Aumento de atributo; versatilidade',
  '55% Ataque especial (4 PE, +15)',
  '60% Poder de combatente',
  '65% Habilidade de trilha',
  '70% Grau de treinamento',
  '75% Poder de combatente',
  '80% Aumento de atributo',
  '85% Ataque especial (5 PE, +20)',
  '90% Poder de combatente',
  '95% Aumento de atributo',
  '99% Habilidade de trilha',
]

function paraTabela(classe: 'COMBATENTE' | 'ESPECIALISTA' | 'OCULTISTA', linhas: string[]): ProgressaoClasseEntry[] {
  return linhas.map((linha) => {
    const [nexTexto, ...resto] = linha.split(' ')
    return { classe, nex: Number(nexTexto!.replace('%', '')), habilidades: resto.join(' ') }
  })
}

const TABELA_HABILIDADES: ProgressaoClasseEntry[] = paraTabela('COMBATENTE', TIERS_COMBATENTE)

const ATRIBUTOS_BASE = { for: 2, agi: 1, int: 1, vig: 3, pre: 0 }

describe('calcularFicha', () => {
  it('Combatente NEX 5%: PV = 20+Vigor, PE = 2+Presença, San = 12 (base, tier 0)', () => {
    const r = calcularFicha({ classe: 'COMBATENTE', nex: 5, atributos: ATRIBUTOS_BASE }, TABELA_HABILIDADES, FORMULAS)
    expect(r.pv_maximo).toBe(20 + ATRIBUTOS_BASE.vig)
    expect(r.pe_maximo).toBe(2 + ATRIBUTOS_BASE.pre)
    expect(r.san_maximo).toBe(12)
    expect(r.habilidadesDesbloqueadas).toEqual(['Ataque especial (2 PE, +5)'])
  })

  it('Combatente NEX 50%: tier 9 (9 avanços desde o 5%) — acumula habilidades de todos os tiers anteriores', () => {
    const r = calcularFicha({ classe: 'COMBATENTE', nex: 50, atributos: ATRIBUTOS_BASE }, TABELA_HABILIDADES, FORMULAS)
    expect(r.pv_maximo).toBe(20 + ATRIBUTOS_BASE.vig + 9 * 4)
    expect(r.pe_maximo).toBe(2 + ATRIBUTOS_BASE.pre + 9 * 2)
    expect(r.san_maximo).toBe(12 + 9 * 3)
    // 10 linhas (5% a 50%), mas a linha de 50% tem 2 itens separados por
    // ";" ("Aumento de atributo" + "versatilidade") -> 11 no total.
    expect(r.habilidadesDesbloqueadas).toHaveLength(11)
    expect(r.habilidadesDesbloqueadas).toContain('versatilidade')
    expect(r.habilidadesDesbloqueadas).toContain('Ataque especial (2 PE, +5)')
  })

  it('Combatente NEX 99%: tier 19 (borda superior)', () => {
    const r = calcularFicha({ classe: 'COMBATENTE', nex: 99, atributos: ATRIBUTOS_BASE }, TABELA_HABILIDADES, FORMULAS)
    expect(r.pv_maximo).toBe(20 + ATRIBUTOS_BASE.vig + 19 * 4)
    expect(r.pe_maximo).toBe(2 + ATRIBUTOS_BASE.pre + 19 * 2)
    expect(r.san_maximo).toBe(12 + 19 * 3)
    // 20 linhas no total, mas a de 50% carrega 2 itens -> 21 no total.
    expect(r.habilidadesDesbloqueadas).toHaveLength(21)
  })

  it('Especialista e Ocultista usam a mesma lógica de tier com a própria fórmula', () => {
    const especialista = calcularFicha(
      { classe: 'ESPECIALISTA', nex: 50, atributos: ATRIBUTOS_BASE },
      [],
      FORMULAS,
    )
    expect(especialista.pv_maximo).toBe(16 + ATRIBUTOS_BASE.vig + 9 * 3)
    expect(especialista.pe_maximo).toBe(3 + ATRIBUTOS_BASE.pre + 9 * 3)
    expect(especialista.san_maximo).toBe(16 + 9 * 4)

    const ocultista = calcularFicha({ classe: 'OCULTISTA', nex: 50, atributos: ATRIBUTOS_BASE }, [], FORMULAS)
    expect(ocultista.pv_maximo).toBe(12 + ATRIBUTOS_BASE.vig + 9 * 2)
    expect(ocultista.pe_maximo).toBe(4 + ATRIBUTOS_BASE.pre + 9 * 4)
    expect(ocultista.san_maximo).toBe(20 + 9 * 5)
  })

  it('calcula bônus de perícia como atributo-base + bônus de treino (0/5/10/15)', () => {
    const r = calcularFicha(
      {
        classe: 'OCULTISTA',
        nex: 50,
        atributos: ATRIBUTOS_BASE,
        pericias: [
          { nome: 'Ocultismo', atributoBase: 'int', nivel: 'EXPERT' },
          { nome: 'Luta', atributoBase: 'for', nivel: 'DESTREINADO' },
        ],
      },
      [],
      FORMULAS,
    )

    expect(r.bonusPericias.Ocultismo).toBe(ATRIBUTOS_BASE.int + 15)
    expect(r.bonusPericias.Luta).toBe(ATRIBUTOS_BASE.for + 0)
  })

  it('rejeita NEX que não é um tier válido (ex.: 7) sem crashar', () => {
    expect(() =>
      calcularFicha({ classe: 'COMBATENTE', nex: 7, atributos: ATRIBUTOS_BASE }, TABELA_HABILIDADES, FORMULAS),
    ).toThrow(/NEX inválido/)
  })

  it('rejeita NEX negativo sem crashar', () => {
    expect(() =>
      calcularFicha({ classe: 'COMBATENTE', nex: -5, atributos: ATRIBUTOS_BASE }, TABELA_HABILIDADES, FORMULAS),
    ).toThrow(/NEX inválido/)
  })

  it('rejeita NEX acima de 99 sem crashar', () => {
    expect(() =>
      calcularFicha({ classe: 'COMBATENTE', nex: 100, atributos: ATRIBUTOS_BASE }, TABELA_HABILIDADES, FORMULAS),
    ).toThrow(/NEX inválido/)
  })

  it('rejeita classe inexistente sem crashar', () => {
    expect(() =>
      calcularFicha({ classe: 'MAGO', nex: 5, atributos: ATRIBUTOS_BASE }, TABELA_HABILIDADES, FORMULAS),
    ).toThrow(/Classe inexistente/)
  })

  it('roda sem banco — tabelas são só parâmetros', () => {
    const r = calcularFicha({ classe: 'OCULTISTA', nex: 5, atributos: ATRIBUTOS_BASE }, [], FORMULAS)
    expect(r).toBeDefined()
  })
})
