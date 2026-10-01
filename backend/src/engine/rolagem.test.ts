import { describe, expect, it } from 'vitest'
import { rolar, rolarExpressao } from './rolagem.js'

function sequencia(...valores: number[]) {
  let i = 0
  return () => valores[i++]!
}

describe('rolagem', () => {
  it('soma os dados e aplica o modificador', () => {
    const r = rolar({ quantidade: 3, faces: 6, modificador: 2 }, sequencia(1, 4, 6))
    expect(r.dados).toEqual([1, 4, 6])
    expect(r.total).toBe(13)
    expect(r.expressao).toBe('3d6 + 2')
  })

  it('modo maior (teste de OP1): fica com o melhor d20', () => {
    const r = rolar({ quantidade: 3, faces: 20, modificador: 5, modo: 'maior' }, sequencia(5, 11, 12))
    expect(r.total).toBe(17)
    expect(r.expressao).toBe('3d20 (maior) + 5')
  })

  it('modo menor (OP1, atributo 0): fica com o pior', () => {
    const r = rolar({ quantidade: 2, faces: 20, modo: 'menor' }, sequencia(15, 3))
    expect(r.total).toBe(3)
  })

  it('modificador negativo aparece na expressão', () => {
    expect(rolar({ quantidade: 1, faces: 20, modificador: -2 }, sequencia(10)).expressao).toBe('1d20 - 2')
  })

  it('usa o gerador padrão dentro do intervalo do dado', () => {
    const r = rolar({ quantidade: 20, faces: 4 })
    expect(r.dados.every((d) => d >= 1 && d <= 4)).toBe(true)
  })

  it.each([
    [{ quantidade: 0, faces: 20 }, /Quantidade/],
    [{ quantidade: 21, faces: 20 }, /Quantidade/],
    [{ quantidade: 1, faces: 7 }, /Dado inválido/],
    [{ quantidade: 1, faces: 20, modificador: 1.5 }, /Modificador/],
    [{ quantidade: 1, faces: 20, modo: 'explosivo' }, /Modo inválido/],
  ])('rejeita pedido inválido %o', (pedido, erro) => {
    expect(() => rolar(pedido)).toThrow(erro)
  })
})

describe('rolarExpressao (dano: vários dados numa rolagem só)', () => {
  it('soma grupos de faces diferentes e o modificador', () => {
    const r = rolarExpressao('2d6 + 1d8 + 3', sequencia(3, 5, 7))
    expect(r.total).toBe(18)
    expect(r.expressao).toBe('2d6 + 1d8 + 3')
    expect(r.detalhe).toBe('[3, 5] + [7] + 3')
    expect(r.dados).toEqual([3, 5, 7])
  })

  it('aceita "d20" sem quantidade, subtração e espaços/maiúsculas', () => {
    const r = rolarExpressao(' D20 - 1d4 -2 ', sequencia(15, 3))
    expect(r.total).toBe(10)
    expect(r.expressao).toBe('1d20 - 1d4 - 2')
  })

  it('rejeita expressão vazia, sem dado, termo estranho e dado inválido', () => {
    for (const ruim of ['', '   ', '5', '2d6+abc', '2d7', '2d', 'd', '2d6++3', '0d6', null]) {
      expect(() => rolarExpressao(ruim)).toThrow()
    }
  })

  it('limita termos, quantidade de dados e modificador', () => {
    expect(() => rolarExpressao(Array(11).fill('1d6').join('+'))).toThrow(/10 termos/)
    expect(() => rolarExpressao('51d6')).toThrow(/50 dados/)
    expect(() => rolarExpressao('30d6+21d6')).toThrow(/50 dados/)
    expect(() => rolarExpressao('1d6+101')).toThrow(/-100 e 100/)
  })

  it('rolar() também traz o detalhe formatado', () => {
    expect(rolar({ quantidade: 3, faces: 20, modificador: 5, modo: 'maior' }, sequencia(5, 11, 12)).detalhe).toBe('[5, 11, 12] + 5')
  })
})

describe('expressão do teste com um dado só', () => {
  it('1d20 "maior" não mostra "(maior)" — com um dado não muda nada', () => {
    expect(rolar({ quantidade: 1, faces: 20, modificador: 10, modo: 'maior' }, sequencia(7)).expressao).toBe('1d20 + 10')
  })
})
