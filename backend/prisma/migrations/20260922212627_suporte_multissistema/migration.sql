-- CreateEnum
CREATE TYPE "Sistema" AS ENUM ('ORDEM_PARANORMAL_1', 'ORDEM_PARANORMAL_2');

-- CreateEnum
CREATE TYPE "PerfilOP2" AS ENUM ('EXECUTOR', 'ANALISTA', 'VIGILANTE');

-- CreateEnum
CREATE TYPE "DadoOP2" AS ENUM ('d4', 'd6', 'd8', 'd10', 'd12', 'd20');

-- AlterEnum
BEGIN;
CREATE TYPE "NivelTreinoPericia_new" AS ENUM ('DESTREINADO', 'TREINADO', 'VETERANO', 'EXPERT');
ALTER TABLE "public"."FichaPericia" ALTER COLUMN "nivel" DROP DEFAULT;
ALTER TABLE "FichaPericia" ALTER COLUMN "nivel" TYPE "NivelTreinoPericia_new" USING ("nivel"::text::"NivelTreinoPericia_new");
ALTER TYPE "NivelTreinoPericia" RENAME TO "NivelTreinoPericia_old";
ALTER TYPE "NivelTreinoPericia_new" RENAME TO "NivelTreinoPericia";
DROP TYPE "public"."NivelTreinoPericia_old";
ALTER TABLE "FichaPericia" ALTER COLUMN "nivel" SET DEFAULT 'DESTREINADO';
COMMIT;

-- AlterTable
ALTER TABLE "FichaPericia" ALTER COLUMN "nivel" SET DEFAULT 'DESTREINADO';

-- AlterTable
ALTER TABLE "ProgressaoClasse" DROP COLUMN "peMaximo",
DROP COLUMN "pvMaximo",
DROP COLUMN "sanMaximo";

-- AlterTable
ALTER TABLE "Sala" ADD COLUMN     "sistema" "Sistema" NOT NULL;

-- CreateTable
CREATE TABLE "FichaOP2" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "perfil" "PerfilOP2" NOT NULL,
    "ocupacao" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "fisico" "DadoOP2" NOT NULL,
    "mente" "DadoOP2" NOT NULL,
    "emocao" "DadoOP2" NOT NULL,
    "pericias" JSONB,
    "pv_atual" INTEGER NOT NULL,
    "pv_maximo" INTEGER NOT NULL,
    "pd_atual" INTEGER NOT NULL,
    "pd_maximo" INTEGER NOT NULL,
    "habilidades" JSONB,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FichaOP2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClasseFormula" (
    "classe" "ClasseOrdemParanormal" NOT NULL,
    "pvBase" INTEGER NOT NULL,
    "pvPorTier" INTEGER NOT NULL,
    "peBase" INTEGER NOT NULL,
    "pePorTier" INTEGER NOT NULL,
    "sanBase" INTEGER NOT NULL,
    "sanPorTier" INTEGER NOT NULL,

    CONSTRAINT "ClasseFormula_pkey" PRIMARY KEY ("classe")
);

-- AddForeignKey
ALTER TABLE "FichaOP2" ADD CONSTRAINT "FichaOP2_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaOP2" ADD CONSTRAINT "FichaOP2_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

