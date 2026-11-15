import { describe, expect, it } from 'vitest'
import { LIMITE_NOME, nomeObrigatorio } from './limites.js'

describe('nomeObrigatorio', () => {
  it('devolve o nome sem espaço nas pontas, até o limite', () => {
    expect(nomeObrigatorio('  Galpão  ', 'Nome')).toBe('Galpão')
    expect(nomeObrigatorio(` ${'x'.repeat(LIMITE_NOME)} `, 'Nome')).toHaveLength(LIMITE_NOME)
  })

  it('recusa com 400 o vazio, o longo demais e o que não é texto (antes, número virava 500)', () => {
    for (const valor of [undefined, null, '   ', 'x'.repeat(LIMITE_NOME + 1), 123, {}]) {
      expect(() => nomeObrigatorio(valor, 'Nome da sala é obrigatório')).toThrow(expect.objectContaining({ statusCode: 400 }))
    }
  })
})
