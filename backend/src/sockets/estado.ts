import { randomUUID } from 'node:crypto'
import type { Combate } from '../engine/combate.js'
import type { ResultadoRolagem } from '../engine/rolagem.js'

// Muda a cada processo: é como o cliente descobre que o servidor reiniciou
// (e que o combate que ele tinha na tela não existe mais).
export const INSTANCIA_SERVIDOR = randomUUID()

export type Rolagem = ResultadoRolagem & {
  id: string
  autor: { id: string; nome: string }
  criadoEm: string
}

// Estado efêmero por sala — some se o processo reiniciar (decisão de v1, sem Redis).
export const combates = new Map<string, Combate>()
export const ultimasRolagens = new Map<string, Rolagem>()

export const nomeSalaSocket = (salaId: string) => `sala:${salaId}`

export function estadoDaSala(salaId: string) {
  return {
    instancia: INSTANCIA_SERVIDOR,
    combate: combates.get(salaId) ?? null,
    ultimaRolagem: ultimasRolagens.get(salaId) ?? null,
  }
}
