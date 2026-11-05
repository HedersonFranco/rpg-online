-- CreateIndex
CREATE INDEX "Ficha_salaId_idx" ON "Ficha"("salaId");

-- CreateIndex
CREATE INDEX "Mapa_salaId_idx" ON "Mapa"("salaId");

-- CreateIndex
CREATE INDEX "Mensagem_salaId_createdAt_idx" ON "Mensagem"("salaId", "createdAt");

-- CreateIndex
CREATE INDEX "Montaria_salaId_idx" ON "Montaria"("salaId");

-- CreateIndex
CREATE INDEX "Npc_salaId_idx" ON "Npc"("salaId");

-- CreateIndex
CREATE INDEX "Pasta_salaId_idx" ON "Pasta"("salaId");

-- CreateIndex
CREATE INDEX "Sala_donoId_idx" ON "Sala"("donoId");

-- CreateIndex
CREATE INDEX "Token_mapaId_idx" ON "Token"("mapaId");

