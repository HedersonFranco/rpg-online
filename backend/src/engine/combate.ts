// Estado de combate é efêmero (memória do processo) — estas funções só
// transformam o estado; guardar e distribuir é do socket.
import { randomUUID } from 'node:crypto'

export type Participante = {
  id: string
  nome: string
  iniciativa: number
  tipo: 'FICHA' | 'NPC'
  refId: string
  usuarioId: string | null
}

export type Combate = {
  id: string
  rodada: number
  indiceAtivo: number
  ordem: Participante[]
}

type NovoParticipante = Omit<Participante, 'id'>

// Maior iniciativa age primeiro; empate mantém a ordem em que o mestre informou (sort estável).
export function criarCombate(participantes: NovoParticipante[], gerarId: () => string = randomUUID): Combate {
  if (participantes.length === 0) {
    throw new Error('Combate precisa de pelo menos um participante')
  }
  const ordem = participantes
    .map((p) => ({ ...p, id: gerarId() }))
    .sort((a, b) => b.iniciativa - a.iniciativa)
  return { id: gerarId(), rodada: 1, indiceAtivo: 0, ordem }
}

export function avancarTurno(combate: Combate): Combate {
  const proximo = combate.indiceAtivo + 1
  if (proximo >= combate.ordem.length) {
    return { ...combate, indiceAtivo: 0, rodada: combate.rodada + 1 }
  }
  return { ...combate, indiceAtivo: proximo }
}

// Só o jogador dono do participante da vez, ou o mestre, encerram o turno.
export function podeEncerrarTurno(combate: Combate, usuarioId: string, ehMestre: boolean): boolean {
  if (ehMestre) return true
  return combate.ordem[combate.indiceAtivo]?.usuarioId === usuarioId
}
