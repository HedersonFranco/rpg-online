import { describe, it, expect } from 'vitest'
import { cadastrar, normalizarEmail, NOME_MAX, EMAIL_MAX } from './usuario.service.js'

describe('normalizarEmail', () => {
  it('tira espaços e passa para minúsculas', () => {
    expect(normalizarEmail('  Joao.Silva@Exemplo.COM ')).toBe('joao.silva@exemplo.com')
  })

  it('valor que não é texto vira vazio (não quebra)', () => {
    expect(normalizarEmail(undefined)).toBe('')
    expect(normalizarEmail(42)).toBe('')
  })
})

// Estas rejeições acontecem antes de qualquer consulta — não precisam do banco.
describe('cadastrar — validação de entrada', () => {
  const email = 'a@b.com'
  const senha = '123456'

  it(`nome acima de ${NOME_MAX} caracteres → 400`, async () => {
    await expect(cadastrar('x'.repeat(NOME_MAX + 1), email, senha)).rejects.toMatchObject({ statusCode: 400 })
  })

  it(`email acima de ${EMAIL_MAX} caracteres → 400`, async () => {
    const longo = 'a'.repeat(EMAIL_MAX) + '@b.com'
    await expect(cadastrar('Nome', longo, senha)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('nome que não é texto → 400, não 500', async () => {
    await expect(cadastrar(123 as unknown as string, email, senha)).rejects.toMatchObject({ statusCode: 400 })
  })
})
