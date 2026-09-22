import { describe, it, expect } from 'vitest'
import { aumentarPasso, diminuirPasso } from './escalaDados.js'

describe('escala de dados (Ordem Paranormal RPG II)', () => {
  it('aumenta um passo dentro da escala normal', () => {
    expect(aumentarPasso('d6')).toBe('d8')
  })

  it('não aumenta além de d12 por padrão', () => {
    expect(aumentarPasso('d12')).toBe('d12')
  })

  it('permite d12 -> d20 quando explicitamente permitido', () => {
    expect(aumentarPasso('d12', true)).toBe('d20')
  })

  it('diminui um passo dentro da escala normal', () => {
    expect(diminuirPasso('d10')).toBe('d8')
  })

  it('não diminui abaixo de d4', () => {
    expect(diminuirPasso('d4')).toBe('d4')
  })
})
