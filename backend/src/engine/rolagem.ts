import { randomInt } from 'node:crypto'

export const FACES_VALIDAS = [4, 6, 8, 10, 12, 20, 100] as const
export const MODOS_VALIDOS = ['soma', 'maior', 'menor'] as const

// soma: rolagem comum. maior: teste de OP1 (N d20, fica com o melhor).
// menor: OP1 com atributo 0 (rola 2d20 e fica com o pior).
export type ModoRolagem = (typeof MODOS_VALIDOS)[number]

export type PedidoRolagem = {
  quantidade: number
  faces: number
  modificador?: number
  modo?: string
}

export type ResultadoRolagem = {
  quantidade: number
  faces: number
  modificador: number
  modo: ModoRolagem
  dados: number[]
  total: number
  expressao: string
}

export class PedidoRolagemInvalido extends Error {}

export function rolar(
  pedido: PedidoRolagem,
  aleatorio: (faces: number) => number = (faces) => randomInt(1, faces + 1),
): ResultadoRolagem {
  const { quantidade, faces } = pedido
  const modificador = pedido.modificador ?? 0
  const modo = (pedido.modo ?? 'soma') as ModoRolagem

  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 20) {
    throw new PedidoRolagemInvalido('Quantidade de dados deve ser um inteiro entre 1 e 20')
  }
  if (!FACES_VALIDAS.includes(faces as (typeof FACES_VALIDAS)[number])) {
    throw new PedidoRolagemInvalido(`Dado inválido — use d${FACES_VALIDAS.join(', d')}`)
  }
  if (!Number.isInteger(modificador) || modificador < -100 || modificador > 100) {
    throw new PedidoRolagemInvalido('Modificador deve ser um inteiro entre -100 e 100')
  }
  if (!MODOS_VALIDOS.includes(modo)) {
    throw new PedidoRolagemInvalido(`Modo inválido — use ${MODOS_VALIDOS.join(', ')}`)
  }

  const dados = Array.from({ length: quantidade }, () => aleatorio(faces))
  const base = modo === 'soma' ? dados.reduce((a, b) => a + b, 0) : modo === 'maior' ? Math.max(...dados) : Math.min(...dados)
  const sufixoModo = modo === 'soma' ? '' : ` (${modo})`
  const sufixoMod = modificador === 0 ? '' : modificador > 0 ? ` + ${modificador}` : ` - ${-modificador}`

  return {
    quantidade,
    faces,
    modificador,
    modo,
    dados,
    total: base + modificador,
    expressao: `${quantidade}d${faces}${sufixoModo}${sufixoMod}`,
  }
}
