import { describe, it, expect } from 'vitest'
import { cadastrar, faltasNaSenha, normalizarEmail, NOME_MAX, EMAIL_MAX, SENHA_MIN, SENHA_MAX_BYTES } from './usuario.service.js'

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
  const senha = '12345678'

  it(`nome acima de ${NOME_MAX} caracteres → 400`, async () => {
    await expect(cadastrar('x'.repeat(NOME_MAX + 1), email, senha)).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('Nome') })
  })

  it(`email acima de ${EMAIL_MAX} caracteres → 400`, async () => {
    const longo = 'a'.repeat(EMAIL_MAX) + '@b.com'
    await expect(cadastrar('Nome', longo, senha)).rejects.toMatchObject({ statusCode: 400, message: 'Email inválido' })
  })

  it('nome que não é texto → 400, não 500', async () => {
    await expect(cadastrar(123 as unknown as string, email, senha)).rejects.toMatchObject({ statusCode: 400 })
  })

  it(`senha com menos de ${SENHA_MIN} caracteres → 400`, async () => {
    await expect(cadastrar('Nome', email, '1234567')).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('ao menos') })
  })

  it('senha que não é texto → 400, não 500', async () => {
    await expect(cadastrar('Nome', email, 12345678 as unknown as string)).rejects.toMatchObject({ statusCode: 400 })
    await expect(cadastrar('Nome', email, { length: 9 } as unknown as string)).rejects.toMatchObject({ statusCode: 400 })
  })

  // Acima de 72 bytes o bcrypt ignoraria o final: "a"×72 + qualquer coisa entraria na mesma conta.
  it(`senha acima de ${SENHA_MAX_BYTES} bytes → 400 (acento conta 2)`, async () => {
    await expect(cadastrar('Nome', email, 'a'.repeat(SENHA_MAX_BYTES + 1))).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('no máximo') })
    await expect(cadastrar('Nome', email, 'é'.repeat(37))).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('no máximo') })
  })

  it('senha fora do checklist → 400 dizendo o que falta', async () => {
    await expect(cadastrar('Nome', email, 'abcdefgh')).rejects.toMatchObject({
      statusCode: 400,
      message: 'A senha precisa de uma letra maiúscula, um número e um símbolo',
    })
  })
})

describe('faltasNaSenha — checklist clássico', () => {
  it('senha que atende a tudo não deixa falta (acento é letra, espaço é símbolo)', () => {
    expect(faltasNaSenha('Teste#2026')).toEqual([])
    expect(faltasNaSenha('Ação 2026 é')).toEqual([])
  })

  it('lista o que falta, na ordem do checklist', () => {
    expect(faltasNaSenha('abcdefgh')).toEqual(['uma letra maiúscula', 'um número', 'um símbolo'])
    expect(faltasNaSenha('ABCDEFG1!')).toEqual(['uma letra minúscula'])
    expect(faltasNaSenha('Abcdefgh1')).toEqual(['um símbolo'])
  })

  it('acento digitado separado da letra não conta como símbolo', () => {
    expect(faltasNaSenha('Café2026')).toEqual(['um símbolo'])
  })
})
