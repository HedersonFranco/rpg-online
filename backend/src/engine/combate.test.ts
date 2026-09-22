import { describe, expect, it } from 'vitest'
import { avancarTurno, criarCombate, podeEncerrarTurno } from './combate.js'

let seq = 0
const gerarId = () => `id-${++seq}`

const base = [
  { nome: 'Bianca', iniciativa: 12, tipo: 'FICHA' as const, refId: 'f1', usuarioId: 'u1' },
  { nome: 'Zumbi', iniciativa: 18, tipo: 'NPC' as const, refId: 'n1', usuarioId: null },
  { nome: 'Caio', iniciativa: 12, tipo: 'FICHA' as const, refId: 'f2', usuarioId: 'u2' },
]

describe('combate', () => {
  it('ordena por iniciativa decrescente, empate mantém a ordem informada', () => {
    const c = criarCombate(base, gerarId)
    expect(c.ordem.map((p) => p.nome)).toEqual(['Zumbi', 'Bianca', 'Caio'])
    expect(c.rodada).toBe(1)
    expect(c.indiceAtivo).toBe(0)
  })

  it('avança o turno e vira a rodada ao passar do último', () => {
    let c = criarCombate(base, gerarId)
    c = avancarTurno(c)
    expect(c.indiceAtivo).toBe(1)
    c = avancarTurno(avancarTurno(c))
    expect(c.indiceAtivo).toBe(0)
    expect(c.rodada).toBe(2)
  })

  it('não muta o estado anterior', () => {
    const c = criarCombate(base, gerarId)
    avancarTurno(c)
    expect(c.indiceAtivo).toBe(0)
  })

  it('só o jogador da vez ou o mestre podem encerrar', () => {
    const c = avancarTurno(criarCombate(base, gerarId)) // vez da Bianca (u1)
    expect(podeEncerrarTurno(c, 'u1', false)).toBe(true)
    expect(podeEncerrarTurno(c, 'u2', false)).toBe(false)
    expect(podeEncerrarTurno(c, 'u2', true)).toBe(true)
  })

  it('turno de NPC: só o mestre encerra', () => {
    const c = criarCombate(base, gerarId) // vez do Zumbi
    expect(podeEncerrarTurno(c, 'u1', false)).toBe(false)
    expect(podeEncerrarTurno(c, 'u1', true)).toBe(true)
  })

  it('rejeita combate vazio', () => {
    expect(() => criarCombate([], gerarId)).toThrow()
  })
})
