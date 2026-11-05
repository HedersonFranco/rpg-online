-- CreateEnum
CREATE TYPE "TipoArma" AS ENUM ('CORPO_A_CORPO', 'ARREMESSO', 'DISPARO', 'FOGO');

-- AlterTable
ALTER TABLE "FichaEntrada" ADD COLUMN     "bonusAtaque" INTEGER,
ADD COLUMN     "dano" TEXT,
ADD COLUMN     "danoExtra" TEXT,
ADD COLUMN     "margemAmeaca" INTEGER,
ADD COLUMN     "multiplicadorCritico" INTEGER,
ADD COLUMN     "tipoArma" "TipoArma";

