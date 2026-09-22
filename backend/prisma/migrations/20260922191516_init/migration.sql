-- CreateEnum
CREATE TYPE "PapelSala" AS ENUM ('MESTRE', 'JOGADOR');

-- CreateEnum
CREATE TYPE "ClasseOrdemParanormal" AS ENUM ('COMBATENTE', 'ESPECIALISTA', 'OCULTISTA');

-- CreateEnum
CREATE TYPE "AtributoOrdemParanormal" AS ENUM ('FOR', 'AGI', 'INT', 'VIG', 'PRE');

-- CreateEnum
CREATE TYPE "NivelTreinoPericia" AS ENUM ('LEIGO', 'TREINADO', 'VETERANO', 'EXPERT');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "donoId" TEXT NOT NULL,
    "conviteToken" TEXT,
    "conviteExpiraEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembroSala" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "papel" "PapelSala" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembroSala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "titulo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ficha" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "classe" "ClasseOrdemParanormal" NOT NULL,
    "origem" TEXT NOT NULL,
    "trilha" TEXT NOT NULL,
    "nex" INTEGER NOT NULL DEFAULT 5,
    "for" INTEGER NOT NULL,
    "agi" INTEGER NOT NULL,
    "int" INTEGER NOT NULL,
    "vig" INTEGER NOT NULL,
    "pre" INTEGER NOT NULL,
    "pv_atual" INTEGER NOT NULL,
    "pv_maximo_cache" INTEGER NOT NULL,
    "pe_atual" INTEGER NOT NULL,
    "pe_maximo_cache" INTEGER NOT NULL,
    "san_atual" INTEGER NOT NULL,
    "san_maximo_cache" INTEGER NOT NULL,
    "inventario" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ficha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressaoClasse" (
    "id" TEXT NOT NULL,
    "classe" "ClasseOrdemParanormal" NOT NULL,
    "nex" INTEGER NOT NULL,
    "pvMaximo" INTEGER NOT NULL,
    "peMaximo" INTEGER NOT NULL,
    "sanMaximo" INTEGER NOT NULL,
    "habilidades" TEXT,

    CONSTRAINT "ProgressaoClasse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pericia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "atributoBase" "AtributoOrdemParanormal" NOT NULL,

    CONSTRAINT "Pericia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FichaPericia" (
    "id" TEXT NOT NULL,
    "fichaId" TEXT NOT NULL,
    "periciaId" TEXT NOT NULL,
    "nivel" "NivelTreinoPericia" NOT NULL DEFAULT 'LEIGO',

    CONSTRAINT "FichaPericia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ritual" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "elemento" TEXT,
    "circulo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "Ritual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FichaRitual" (
    "id" TEXT NOT NULL,
    "fichaId" TEXT NOT NULL,
    "ritualId" TEXT NOT NULL,

    CONSTRAINT "FichaRitual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Npc" (
    "id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "pastaId" TEXT,
    "nome" TEXT NOT NULL,
    "pv" INTEGER,
    "pe" INTEGER,
    "san" INTEGER,
    "atributos" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Npc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pasta" (
    "id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "paiId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pasta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "pastaId" TEXT,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mapa" (
    "id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "pastaId" TEXT,
    "nome" TEXT NOT NULL,
    "imagemUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "mapaId" TEXT NOT NULL,
    "fichaId" TEXT,
    "npcId" TEXT,
    "nome" TEXT,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Sala_conviteToken_key" ON "Sala"("conviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "MembroSala_usuarioId_salaId_key" ON "MembroSala"("usuarioId", "salaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressaoClasse_classe_nex_key" ON "ProgressaoClasse"("classe", "nex");

-- CreateIndex
CREATE UNIQUE INDEX "Pericia_nome_key" ON "Pericia"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "FichaPericia_fichaId_periciaId_key" ON "FichaPericia"("fichaId", "periciaId");

-- CreateIndex
CREATE UNIQUE INDEX "Ritual_nome_key" ON "Ritual"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "FichaRitual_fichaId_ritualId_key" ON "FichaRitual"("fichaId", "ritualId");

-- AddForeignKey
ALTER TABLE "Sala" ADD CONSTRAINT "Sala_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroSala" ADD CONSTRAINT "MembroSala_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroSala" ADD CONSTRAINT "MembroSala_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ficha" ADD CONSTRAINT "Ficha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ficha" ADD CONSTRAINT "Ficha_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaPericia" ADD CONSTRAINT "FichaPericia_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "Ficha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaPericia" ADD CONSTRAINT "FichaPericia_periciaId_fkey" FOREIGN KEY ("periciaId") REFERENCES "Pericia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaRitual" ADD CONSTRAINT "FichaRitual_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "Ficha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaRitual" ADD CONSTRAINT "FichaRitual_ritualId_fkey" FOREIGN KEY ("ritualId") REFERENCES "Ritual"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_pastaId_fkey" FOREIGN KEY ("pastaId") REFERENCES "Pasta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pasta" ADD CONSTRAINT "Pasta_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pasta" ADD CONSTRAINT "Pasta_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES "Pasta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_pastaId_fkey" FOREIGN KEY ("pastaId") REFERENCES "Pasta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mapa" ADD CONSTRAINT "Mapa_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mapa" ADD CONSTRAINT "Mapa_pastaId_fkey" FOREIGN KEY ("pastaId") REFERENCES "Pasta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_mapaId_fkey" FOREIGN KEY ("mapaId") REFERENCES "Mapa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "Ficha"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "Npc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
