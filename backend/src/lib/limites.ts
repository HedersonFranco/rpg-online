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

// Conta e cria na mesma transação, com uma trava do Postgres por `chave` (a mesa, o mapa, a ficha):
// sem ela, dois pedidos ao mesmo tempo contariam 9 de 10 e os dois criariam.
export function criarNoLimite<T>(
  chave: string,
  limite: number,
  mensagem: string,
  contar: (tx: Tx) => Promise<number>,
  criar: (tx: Tx) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${chave}))`
    garantirVaga(await contar(tx), limite, mensagem)
    return criar(tx)
  })
}
