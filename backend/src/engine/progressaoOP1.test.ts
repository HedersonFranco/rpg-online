import { describe, it, expect } from 'vitest'
import { PROGRESSAO_OP1 } from './progressaoOP1.js'
import { CLASSES_VALIDAS, NEX_TIERS, habilidadesAcumuladas } from './progressaoClasse.js'

// Conferido contra as Tabelas 1.3, 1.4 e 1.5 do livro (Ordem Paranormal RPG v1.3).
describe('progressão de classe (OP1)', () => {
  it('tem uma linha por classe × NEX, nos 20 degraus, sem buraco nem repetição', () => {
    expect(PROGRESSAO_OP1).toHaveLength(60)
    for (const classe of CLASSES_VALIDAS) {
      const nexDaClasse = PROGRESSAO_OP1.filter((p) => p.classe === classe).map((p) => p.nex)
      expect(nexDaClasse).toEqual([...NEX_TIERS])
    }
    expect(PROGRESSAO_OP1.every((p) => p.habilidades && p.habilidades.trim() !== '')).toBe(true)
  })

  it('combatente em NEX 50% acumula os 10 primeiros degraus, separando as duas de 50%', () => {
    expect(habilidadesAcumuladas(PROGRESSAO_OP1, 'COMBATENTE', 50)).toEqual([
      'Ataque especial (2 PE, +5)',
      'Habilidade de trilha',
      'Poder de combatente',
      'Aumento de atributo',
      'Ataque especial (3 PE, +10)',
      'Poder de combatente',
      'Grau de treinamento',
      'Habilidade de trilha',
      'Poder de combatente',
      'Aumento de atributo',
      'Versatilidade',
    ])
  })

  it('especialista começa com Eclético e Perito, e em 40% ganha Engenhosidade (veterano) + trilha', () => {
    expect(habilidadesAcumuladas(PROGRESSAO_OP1, 'ESPECIALISTA', 5)).toEqual(['Eclético', 'Perito (2 PE, +1d6)'])
    const em40 = habilidadesAcumuladas(PROGRESSAO_OP1, 'ESPECIALISTA', 40)
    expect(em40.slice(-2)).toEqual(['Engenhosidade (veterano)', 'Habilidade de trilha'])
  })

  it('ocultista em NEX 99% tem os quatro círculos de "Escolhido pelo Outro Lado"', () => {
    const tudo = habilidadesAcumuladas(PROGRESSAO_OP1, 'OCULTISTA', 99)
    expect(tudo.filter((h) => h.startsWith('Escolhido pelo Outro Lado'))).toEqual([
      'Escolhido pelo Outro Lado (1º círculo)',
      'Escolhido pelo Outro Lado (2º círculo)',
      'Escolhido pelo Outro Lado (3º círculo)',
      'Escolhido pelo Outro Lado (4º círculo)',
    ])
  })
})
