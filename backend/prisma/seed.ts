// Seed PARCIAL — só ClasseFormula (base+incremento de PV/PE/San por classe),
// dado confirmado no livro (Ordem Paranormal RPG v1.3) e necessário pro
// motor de cálculo funcionar. Pericia, Ritual e ProgressaoClasse (habilidades
// por tier) ainda não foram levantados — ver bloqueio no CLAUDE.md.
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

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
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
