// Seed PARCIAL — ClasseFormula (base+incremento de PV/PE/San por classe) e o
// catálogo das 28 perícias, ambos confirmados no livro (Ordem Paranormal RPG v1.3).
// Falta ProgressaoClasse (habilidades por tier). Ritual não é mais catálogo:
// cada ficha cadastra os seus (FichaEntrada) — ver CLAUDE.md.
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { PERICIAS_OP1 } from '../src/engine/pericias.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const FORMULAS = [
  { classe: 'COMBATENTE', pvBase: 20, pvPorTier: 4, peBase: 2, pePorTier: 2, sanBase: 12, sanPorTier: 3 },
  { classe: 'ESPECIALISTA', pvBase: 16, pvPorTier: 3, peBase: 3, pePorTier: 3, sanBase: 16, sanPorTier: 4 },
  { classe: 'OCULTISTA', pvBase: 12, pvPorTier: 2, peBase: 4, pePorTier: 4, sanBase: 20, sanPorTier: 5 },
] as const

async function main() {
  for (const formula of FORMULAS) {
    await prisma.classeFormula.upsert({
      where: { classe: formula.classe },
      create: formula,
      update: formula,
    })
  }
  console.log(`ClasseFormula: ${FORMULAS.length} linhas (upsert, idempotente)`)

  for (const { nome, atributoBase } of PERICIAS_OP1) {
    const dados = { nome, atributoBase: atributoBase.toUpperCase() as 'FOR' | 'AGI' | 'INT' | 'VIG' | 'PRE' }
    await prisma.pericia.upsert({ where: { nome }, create: dados, update: dados })
  }
  console.log(`Pericia: ${PERICIAS_OP1.length} linhas (upsert, idempotente)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
