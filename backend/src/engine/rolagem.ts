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

// `detalhe` é o que a mesa lê ao lado do total: os dados de cada grupo e o modificador,
// já formatados no servidor (o cliente só exibe).
export type ResultadoRolagem = {
  quantidade: number
  faces: number
  modificador: number
  modo: ModoRolagem
  dados: number[]
  total: number
  expressao: string
  detalhe: string
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
  // Com um dado só, "fica com o melhor/pior" não muda nada — não polui a expressão.
  const sufixoModo = modo === 'soma' || quantidade === 1 ? '' : ` (${modo})`
  const sufixoMod = modificador === 0 ? '' : modificador > 0 ? ` + ${modificador}` : ` - ${-modificador}`

  return {
    quantidade,
    faces,
    modificador,
    modo,
    dados,
    total: base + modificador,
    expressao: `${quantidade}d${faces}${sufixoModo}${sufixoMod}`,
    detalhe: `[${dados.join(', ')}]${sufixoMod}`,
  }
}

// Expressão livre (dano de arma/ritual): termos `NdF`, `dF` ou número, somados ou subtraídos.
// Ex.: "2d6 + 1d8 + 3", "1d12-1". Sempre soma — "fica com o melhor" é só do teste (rolar()).
export const LIMITE_TERMOS = 10
export const LIMITE_DADOS_EXPRESSAO = 50
const TERMO = /^(\d*)d(\d+)$|^(\d+)$/

export type GrupoRolado = { sinal: 1 | -1; quantidade: number; faces: number; dados: number[] }

export type ResultadoExpressao = Omit<ResultadoRolagem, 'quantidade' | 'faces'> & { grupos: GrupoRolado[] }

export function rolarExpressao(
  texto: unknown,
  aleatorio: (faces: number) => number = (faces) => randomInt(1, faces + 1),
): ResultadoExpressao {
  if (typeof texto !== 'string' || !texto.trim()) throw new PedidoRolagemInvalido('Escreva uma expressão, como 2d6+3')
  const limpo = texto.toLowerCase().replace(/\s+/g, '')
  if (limpo.length > 60) throw new PedidoRolagemInvalido('Expressão longa demais')
  // "2d6-1d4+3" → ["2d6", "-1d4", "+3"]
  const pedacos = limpo.match(/[+-]?[^+-]+/g)
  if (!pedacos || pedacos.join('') !== limpo) throw new PedidoRolagemInvalido('Expressão inválida — use algo como 2d6+1d8+3')
  if (pedacos.length > LIMITE_TERMOS) throw new PedidoRolagemInvalido(`Use no máximo ${LIMITE_TERMOS} termos`)

  const grupos: GrupoRolado[] = []
  let modificador = 0
  let totalDados = 0
  for (const pedaco of pedacos) {
    const sinal = pedaco.startsWith('-') ? -1 : 1
    const corpo = pedaco.replace(/^[+-]/, '')
    const m = TERMO.exec(corpo)
    if (!m) throw new PedidoRolagemInvalido(`Termo inválido: "${corpo}" — use algo como 2d6, d20 ou 3`)
    if (m[3] !== undefined) {
      modificador += sinal * Number(m[3])
      continue
    }
    const quantidade = m[1] === '' ? 1 : Number(m[1])
    const faces = Number(m[2])
    if (quantidade < 1) throw new PedidoRolagemInvalido('Cada grupo precisa de pelo menos 1 dado')
    if (!FACES_VALIDAS.includes(faces as (typeof FACES_VALIDAS)[number])) {
      throw new PedidoRolagemInvalido(`Dado inválido: d${faces} — use d${FACES_VALIDAS.join(', d')}`)
    }
    totalDados += quantidade
    if (totalDados > LIMITE_DADOS_EXPRESSAO) throw new PedidoRolagemInvalido(`Use no máximo ${LIMITE_DADOS_EXPRESSAO} dados`)
    grupos.push({ sinal, quantidade, faces, dados: [] })
  }
  if (grupos.length === 0) throw new PedidoRolagemInvalido('A expressão precisa de pelo menos um dado')
  if (Math.abs(modificador) > 100) throw new PedidoRolagemInvalido('Modificador deve ficar entre -100 e 100')

  for (const g of grupos) g.dados = Array.from({ length: g.quantidade }, () => aleatorio(g.faces))
  const total = grupos.reduce((s, g) => s + g.sinal * g.dados.reduce((a, b) => a + b, 0), 0) + modificador
  const juntar = (partes: string[]) => partes.map((p, i) => (i === 0 ? p.replace(/^\+ /, '') : p)).join(' ')
  const sufixoMod = modificador === 0 ? [] : [modificador > 0 ? `+ ${modificador}` : `- ${-modificador}`]

  return {
    modificador,
    modo: 'soma',
    grupos,
    dados: grupos.flatMap((g) => g.dados),
    total,
    expressao: juntar([...grupos.map((g) => `${g.sinal < 0 ? '-' : '+'} ${g.quantidade}d${g.faces}`), ...sufixoMod]),
    detalhe: juntar([...grupos.map((g) => `${g.sinal < 0 ? '-' : '+'} [${g.dados.join(', ')}]`), ...sufixoMod]),
  }
}
