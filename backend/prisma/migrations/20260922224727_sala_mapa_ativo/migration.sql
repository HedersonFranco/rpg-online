-- AlterTable
ALTER TABLE "Sala" ADD COLUMN     "mapaAtivoId" TEXT;

-- AddForeignKey
ALTER TABLE "Sala" ADD CONSTRAINT "Sala_mapaAtivoId_fkey" FOREIGN KEY ("mapaAtivoId") REFERENCES "Mapa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

