import type { Token } from '../../services/tipos'

export function nomeDoToken(token: Token) {
  return token.ficha?.nome ?? token.npc?.nome ?? token.nome ?? 'Objeto'
}

export function tipoDoToken(token: Token): 'Ficha' | 'NPC' | 'Objeto' {
  return token.ficha ? 'Ficha' : token.npc ? 'NPC' : 'Objeto'
}
