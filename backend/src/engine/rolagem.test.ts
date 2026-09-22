import { describe, expect, it } from 'vitest'
import { rolar } from './rolagem.js'

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
