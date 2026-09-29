import { describe, it, expect } from 'vitest'
import { gerarConvite, ocultarConvite, validarConvite } from './convite.js'

describe('convite', () => {
  it('gera convite válido por 7 dias a partir de agora', () => {
    const agora = new Date('2026-01-01T00:00:00Z')
    const convite = gerarConvite(agora)

    expect(convite.expiraEm?.toISOString()).toBe('2026-01-08T00:00:00.000Z')
  })

  it('aceita convite com token correto e dentro da validade', () => {
    const agora = new Date('2026-01-01T00:00:00Z')
    const convite = gerarConvite(agora)

    const resultado = validarConvite(convite, convite.token, agora)

    expect(resultado.valido).toBe(true)
  })

  it('rejeita convite vencido', () => {
    const agora = new Date('2026-01-01T00:00:00Z')
    const convite = gerarConvite(agora)
    const oitoDiasDepois = new Date('2026-01-09T00:00:01Z')

    const resultado = validarConvite(convite, convite.token, oitoDiasDepois)

    expect(resultado).toEqual({ valido: false, motivo: 'convite_expirado' })
  })

  it('rejeita token incorreto', () => {
    const agora = new Date('2026-01-01T00:00:00Z')
    const convite = gerarConvite(agora)

    const resultado = validarConvite(convite, 'token-errado', agora)

    expect(resultado).toEqual({ valido: false, motivo: 'token_invalido' })
  })

  it('rejeita quando não há convite', () => {
    const resultado = validarConvite(null, 'qualquer-token')

    expect(resultado).toEqual({ valido: false, motivo: 'convite_inexistente' })
  })

  describe('ocultarConvite', () => {
    const sala = { id: 's1', donoId: 'dono', conviteToken: 'abc', conviteExpiraEm: new Date('2026-01-08T00:00:00Z') }

    it('mantém o token para o dono', () => {
      expect(ocultarConvite(sala, 'dono')).toEqual(sala)
    })

    it('esconde token e validade de quem não é dono, sem mexer no resto', () => {
      const vista = ocultarConvite(sala, 'jogador')
      expect(vista.conviteToken).toBeNull()
      expect(vista.conviteExpiraEm).toBeNull()
      expect(vista.id).toBe('s1')
      expect(sala.conviteToken).toBe('abc') // não altera o objeto original
    })
  })
})
