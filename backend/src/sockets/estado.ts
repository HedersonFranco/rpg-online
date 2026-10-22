import { randomUUID } from 'node:crypto'
import type { Combate } from '../engine/combate.js'
import type { ResultadoExpressao, ResultadoRolagem } from '../engine/rolagem.js'

// Muda a cada processo: é como o cliente descobre que o servidor reiniciou
// (e que o combate que ele tinha na tela não existe mais).
export const INSTANCIA_SERVIDOR = randomUUID()

export type Rolagem = (ResultadoRolagem | ResultadoExpressao) & {
  rotulo?: string
  // Rolagem da ficha, para o bilhete compacto ("INV (INT) · Franco" ⬡3 +5); d20 = -1 quando o atributo é 0.
  teste?: { sigla: string; atributo: string | null; ficha: string; d20: number; bonus: number }
  // Rolagem do mestre: só os mestres a recebem (e ela não fica como "última rolagem" da sala).
  secreta?: true
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
