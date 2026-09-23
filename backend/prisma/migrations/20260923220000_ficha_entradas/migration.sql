-- CreateEnum
CREATE TYPE "TipoEntradaFicha" AS ENUM ('RITUAL', 'HABILIDADE', 'PODER', 'EQUIPAMENTO');

-- CreateEnum
CREATE TYPE "ElementoRitual" AS ENUM ('SANGUE', 'MORTE', 'CONHECIMENTO', 'ENERGIA', 'MEDO', 'VARIA');

-- DropForeignKey
ALTER TABLE "FichaRitual" DROP CONSTRAINT "FichaRitual_fichaId_fkey";

-- DropForeignKey
ALTER TABLE "FichaRitual" DROP CONSTRAINT "FichaRitual_ritualId_fkey";

-- DropTable
DROP TABLE "FichaRitual";

-- DropTable
DROP TABLE "Ritual";

-- CreateTable
CREATE TABLE "FichaEntrada" (
    "id" TEXT NOT NULL,
    "fichaId" TEXT NOT NULL,
    "tipo" "TipoEntradaFicha" NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "circulo" INTEGER,
    "elemento" "ElementoRitual",
    "preRequisito" TEXT,
    "categoria" INTEGER,
    "espacos" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FichaEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FichaEntrada_fichaId_tipo_idx" ON "FichaEntrada"("fichaId", "tipo");

-- AddForeignKey
ALTER TABLE "FichaEntrada" ADD CONSTRAINT "FichaEntrada_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "Ficha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

