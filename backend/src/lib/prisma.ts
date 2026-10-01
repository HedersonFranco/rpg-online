import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma = new PrismaClient({ adapter })

// Com `exactOptionalPropertyTypes`, o Prisma não aceita `campo: undefined` — só o campo ausente.
// No PATCH, "ausente = não mexe": isto tira as chaves undefined antes do update.
export function semIndefinidos<T extends object>(dados: T): { [K in keyof T]?: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(dados).filter(([, valor]) => valor !== undefined)) as { [K in keyof T]?: Exclude<T[K], undefined> }
}
