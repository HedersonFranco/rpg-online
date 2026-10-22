-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "escala" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "montariaId" TEXT;

-- CreateTable
CREATE TABLE "Montaria" (
    "id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "imagemUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Montaria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_montariaId_fkey" FOREIGN KEY ("montariaId") REFERENCES "Montaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Montaria" ADD CONSTRAINT "Montaria_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Montaria" ADD CONSTRAINT "Montaria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Token tem no máximo um vínculo: ficha, NPC ou montaria (nenhum = objeto). Substitui token_ficha_xor_npc.
ALTER TABLE "Token" DROP CONSTRAINT "token_ficha_xor_npc";
ALTER TABLE "Token" ADD CONSTRAINT "token_um_vinculo" CHECK (num_nonnulls("fichaId", "npcId", "montariaId") <= 1);
