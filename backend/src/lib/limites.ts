import { prisma } from './prisma.js'
import { AppError } from '../errors/AppError.js'
import type { Prisma } from '../generated/prisma/client.js'

// Quanto cabe em cada mesa. Números escolhidos medindo (05/11/2026) — ver "Limites por mesa" no CLAUDE.md da raiz.
export const LIMITES = {
  mapasPorMesa: 10,
  tokensPorMapa: 100,
  fichasPorMesa: 40,
  entradasPorFicha: 100,
  npcsPorMesa: 200,
  pastasPorMesa: 100,
  montariasPorMesa: 20,
} as const

type Tx = Prisma.TransactionClient

export function garantirVaga(quantidade: number, limite: number, mensagem: string) {
  if (quantidade >= limite) throw new AppError(mensagem, 400)
}

// Nome de mesa, agente, NPC, pasta, mapa ou objeto no mapa. Sem teto, um nome de 100 KB iria para
// todos da mesa em cada lista e em cada token. Devolve o nome sem espaço nas pontas.
export const LIMITE_NOME = 100
export function nomeObrigatorio(valor: unknown, mensagem: string): string {
  const nome = typeof valor === 'string' ? valor.trim() : ''
  if (!nome || nome.length > LIMITE_NOME) throw new AppError(`${mensagem} (até ${LIMITE_NOME} caracteres)`, 400)
  return nome
}

// Trava do Postgres por `chave` até o fim da transação: quem pedir a mesma chave espera.
export const travar = (tx: Tx, chave: string) => tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${chave}))`

// Conta e cria na mesma transação, com a trava por `chave` (a mesa, o mapa, a ficha):
// sem ela, dois pedidos ao mesmo tempo contariam 9 de 10 e os dois criariam.
export function criarNoLimite<T>(
  chave: string,
  limite: number,
  mensagem: string,
  contar: (tx: Tx) => Promise<number>,
  criar: (tx: Tx) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await travar(tx, chave)
    garantirVaga(await contar(tx), limite, mensagem)
    return criar(tx)
  })
}
