import { describe, it, expect, vi } from 'vitest'
import { AppError } from '../errors/AppError.js'
import { tratar } from './salaSocket.js'

// Quem decide o que vai no lugar do ack é o cliente. O que não for função é ignorado:
// chamar outra coisa lançava dentro do catch, e a rejeição solta derrubava o processo.
describe('tratar — ack', () => {
  const sucesso = tratar(async () => ({ valor: 1 }))
  const falha = tratar(async () => {
    throw new AppError('Entre na sala antes', 400)
  })

  it('responde pelo ack quando ele é função (com ou sem dados antes)', async () => {
    const ack = vi.fn()
    await sucesso({}, ack)
    await falha(ack)
    expect(ack).toHaveBeenNthCalledWith(1, { ok: true, valor: 1 })
    expect(ack).toHaveBeenNthCalledWith(2, { ok: false, erro: 'Entre na sala antes', status: 400 })
  })

  it('ack que não é função é ignorado, sem rejeitar', async () => {
    for (const naoFuncao of ['x', 42, null]) {
      await expect(sucesso({}, naoFuncao)).resolves.toBeUndefined()
      await expect(falha({}, naoFuncao)).resolves.toBeUndefined()
    }
  })
})
