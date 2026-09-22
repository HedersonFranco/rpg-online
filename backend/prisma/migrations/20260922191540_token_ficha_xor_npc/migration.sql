-- Regra de negócio fechada: Token = Ficha, NPC ou objeto genérico,
-- nunca Ficha e NPC ao mesmo tempo.
ALTER TABLE "Token"
  ADD CONSTRAINT "token_ficha_xor_npc"
  CHECK (NOT ("fichaId" IS NOT NULL AND "npcId" IS NOT NULL));
