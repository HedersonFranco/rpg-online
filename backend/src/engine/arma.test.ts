import { describe, expect, it } from 'vitest'
import { ameacaDeCritico, calcularArma, type DadosArma } from './arma.js'
import { montarTestesPericias, type AtributosOP1 } from './calculoFicha.js'
import { PERICIAS_OP1 } from './pericias.js'
import { escreverExpressao, lerExpressao, PedidoRolagemInvalido } from './rolagem.js'

const atributos: AtributosOP1 = { for: 2, agi: 3, int: 1, vig: 1, pre: 1 }
const testes = (a: AtributosOP1, treinadas: Record<string, 'TREINADO' | 'VETERANO'> = {}) =>
  montarTestesPericias(a, PERICIAS_OP1.map((p) => ({ ...p, nivel: treinadas[p.nome] ?? 'DESTREINADO' })))
const arma = (campos: Partial<DadosArma>): DadosArma => ({
  tipoArma: 'CORPO_A_CORPO', dano: '1d8', danoExtra: null, bonusAtaque: 0, margemAmeaca: 20, multiplicadorCritico: 2, ...campos,
})

describe('arma da ficha', () => {
  it('exemplo do livro: 1d8+3 vira 2d8+3 no crítico (só os dados multiplicam)', () => {
    const r = calcularArma(arma({ tipoArma: 'DISPARO', dano: '1d8+3' }), atributos, testes(atributos))
    expect(r.dano).toBe('1d8+3')
    expect(r.danoCritico).toBe('2d8+3')
    expect(r.critico).toBe('x2')
  })

  it('corpo a corpo: ataque de Luta + bônus da arma, Força no dano e fora da multiplicação', () => {
    const r = calcularArma(arma({ bonusAtaque: 2, margemAmeaca: 19, multiplicadorCritico: 3 }), atributos, testes(atributos, { Luta: 'TREINADO' }))
    expect(r.pericia).toBe('Luta')
    expect(r.ataque).toMatchObject({ quantidade: 2, modificador: 7, modo: 'maior', sigla: 'LUT', atributo: 'FOR' })
    expect(r.dano).toBe('1d8+2')
    expect(r.danoCritico).toBe('3d8+2')
    expect(r.critico).toBe('19/x3')
  })

  it('arremesso soma a Força mas ataca com Pontaria; disparo e fogo não somam atributo', () => {
    const t = testes(atributos, { Pontaria: 'VETERANO' })
    const arremesso = calcularArma(arma({ tipoArma: 'ARREMESSO', dano: '1d4' }), atributos, t)
    expect(arremesso.pericia).toBe('Pontaria')
    expect(arremesso.ataque).toMatchObject({ quantidade: 3, modificador: 10, sigla: 'PON', atributo: 'AGI' })
    expect(arremesso.dano).toBe('1d4+2')
    expect(calcularArma(arma({ tipoArma: 'FOGO', dano: '2d10' }), atributos, t).dano).toBe('2d10')
  })

  it('dano extra entra no dano e no crítico sem multiplicar', () => {
    const r = calcularArma(arma({ dano: '1d6', danoExtra: '1d6+1', multiplicadorCritico: 4 }), atributos, testes(atributos))
    expect(r.dano).toBe('1d6+1d6+3')
    expect(r.danoCritico).toBe('4d6+1d6+3')
  })

  it('Força 0 com corpo a corpo: rola 2d20 e fica com o pior, sem somar nada ao dano', () => {
    const fraco = { ...atributos, for: 0 }
    const r = calcularArma(arma({}), fraco, testes(fraco))
    expect(r.ataque).toMatchObject({ quantidade: 2, modo: 'menor' })
    expect(r.dano).toBe('1d8')
  })

  it('ameaça de crítico olha o d20 que valeu', () => {
    expect(ameacaDeCritico({ dados: [5, 19, 12], modo: 'maior' }, 19)).toBe(true)
    expect(ameacaDeCritico({ dados: [5, 18], modo: 'maior' }, 19)).toBe(false)
    // Atributo 0: vale o pior — um 20 e um 3 não ameaçam.
    expect(ameacaDeCritico({ dados: [20, 3], modo: 'menor' }, 19)).toBe(false)
  })
})

describe('ler e escrever expressão', () => {
  it('ida e volta no formato digitado', () => {
    expect(escreverExpressao(lerExpressao('2d6 + 1d8 - 1d4 + 3'))).toBe('2d6+1d8-1d4+3')
    expect(escreverExpressao(lerExpressao('d20-2'))).toBe('1d20-2')
  })

  it('valida sem rolar', () => {
    expect(() => lerExpressao('1d7')).toThrow(PedidoRolagemInvalido)
    expect(() => lerExpressao('51d6')).toThrow(PedidoRolagemInvalido)
  })
})
