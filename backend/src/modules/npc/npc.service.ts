import { prisma, semIndefinidos } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { removerArquivo, salvarImagemEnviada } from '../../lib/armazenamento.js'
import { garantirMestre } from '../sala/sala.service.js'
import { validarPastaDaSala } from '../pasta/pasta.service.js'
import { criarNoLimite, LIMITES, nomeObrigatorio } from '../../lib/limites.js'
import { emitirParaSala } from '../../sockets/emissor.js'

type DadosNpc = {
  nome?: string
  pv?: number | null
  pe?: number | null
  san?: number | null
  pd?: number | null
  atributos?: string | null
  pastaId?: string | null
}

const CAMPOS_POR_SISTEMA = {
  ORDEM_PARANORMAL_1: { permitidos: ['pv', 'pe', 'san'], proibidos: ['pd'] },
  ORDEM_PARANORMAL_2: { permitidos: ['pv', 'pd'], proibidos: ['pe', 'san'] },
} as const

const LIMITE_ATRIBUTOS = 4000 // o mesmo da descrição de uma entrada da ficha

function validarEstatisticas(dados: DadosNpc, sistema: keyof typeof CAMPOS_POR_SISTEMA) {
  if (dados.atributos != null && (typeof dados.atributos !== 'string' || dados.atributos.length > LIMITE_ATRIBUTOS)) {
    throw new AppError(`Atributos devem ser um texto de até ${LIMITE_ATRIBUTOS} caracteres`, 400)
  }
  for (const campo of CAMPOS_POR_SISTEMA[sistema].proibidos) {
    if (dados[campo] !== undefined && dados[campo] !== null) {
      throw new AppError(`Campo "${campo}" não existe no sistema desta sala`, 400)
    }
  }
  for (const campo of CAMPOS_POR_SISTEMA[sistema].permitidos) {
    const valor = dados[campo]
    if (valor !== undefined && valor !== null && (!Number.isInteger(valor) || valor < 0)) {
      throw new AppError(`Campo "${campo}" deve ser um inteiro maior ou igual a 0`, 400)
    }
  }
}

async function buscarNpcComoMestre(npcId: string, usuarioId: string) {
  const npc = await prisma.npc.findUnique({ where: { id: npcId } })
  if (!npc) {
    throw new AppError('NPC não encontrado', 404)
  }
  const sala = await garantirMestre(npc.salaId, usuarioId)
  return { npc, sala }
}

export async function criarNpc(usuarioId: string, salaId: string, dados: DadosNpc) {
  const sala = await garantirMestre(salaId, usuarioId)
  const nome = nomeObrigatorio(dados.nome, 'Nome do NPC é obrigatório')
  validarEstatisticas(dados, sala.sistema)
  if (dados.pastaId) {
    await validarPastaDaSala(dados.pastaId, salaId)
  }

  return criarNoLimite(salaId, LIMITES.npcsPorMesa,
    `Esta mesa já tem ${LIMITES.npcsPorMesa} NPCs, o máximo. Apague um NPC para criar outro.`,
    (tx) => tx.npc.count({ where: { salaId } }),
    (tx) => tx.npc.create({
      data: {
        salaId,
        nome,
        pv: dados.pv ?? null,
        pe: dados.pe ?? null,
        san: dados.san ?? null,
        pd: dados.pd ?? null,
        atributos: dados.atributos ?? null,
        pastaId: dados.pastaId ?? null,
      },
    }))
}

// Todos os NPCs da sala, sem olhar pasta — pra montar o combate.
export async function listarNpcs(usuarioId: string, salaId: string) {
  await garantirMestre(salaId, usuarioId)
  return prisma.npc.findMany({ where: { salaId }, orderBy: { nome: 'asc' } })
}

export async function buscarNpc(usuarioId: string, npcId: string) {
  const { npc } = await buscarNpcComoMestre(npcId, usuarioId)
  return npc
}

// pastaId: undefined = não mexe; null = move pra raiz; string = move pra essa pasta.
export async function atualizarNpc(usuarioId: string, npcId: string, dados: DadosNpc) {
  const { npc, sala } = await buscarNpcComoMestre(npcId, usuarioId)

  const nome = dados.nome === undefined ? undefined : nomeObrigatorio(dados.nome, 'Nome do NPC é obrigatório')
  validarEstatisticas(dados, sala.sistema)
  if (dados.pastaId) {
    await validarPastaDaSala(dados.pastaId, npc.salaId)
  }

  const atualizado = await prisma.npc.update({
    where: { id: npcId },
    data: semIndefinidos({
      nome,
      pv: dados.pv,
      pe: dados.pe,
      san: dados.san,
      pd: dados.pd,
      atributos: dados.atributos,
      pastaId: dados.pastaId,
    }),
  })
  await avisarTokens(atualizado, sala.mapaAtivoId)
  return atualizado
}

// O token de NPC mostra nome e foto a todos: se o NPC está no mapa da mesa, a mudança vai para a mesa.
// Fora dele, ninguém é avisado — a lista de NPCs é material de preparo do mestre (pode ter spoiler).
async function avisarTokens(npc: { id: string; salaId: string; nome: string; avatarUrl: string | null }, mapaAtivoId: string | null) {
  if (!mapaAtivoId || !(await prisma.token.count({ where: { npcId: npc.id, mapaId: mapaAtivoId } }))) return
  emitirParaSala(npc.salaId, 'npc:atualizado', { npc: { id: npc.id, nome: npc.nome, avatarUrl: npc.avatarUrl } })
}

// Tokens que apontavam pro NPC continuam no mapa como objeto genérico
// (FK com onDelete: SetNull) — o registro de mapa não quebra.
export async function deletarNpc(usuarioId: string, npcId: string) {
  const { npc } = await buscarNpcComoMestre(npcId, usuarioId)
  await prisma.npc.delete({ where: { id: npcId } })
  if (npc.avatarUrl) await removerArquivo(npc.avatarUrl)
}

// Avatar (RNF10): só pelo envio, nunca pelo PATCH — mesma regra e mesmo motivo da ficha (ficha.service.ts).
export async function garantirMestreDoNpc(usuarioId: string, npcId: string) {
  await buscarNpcComoMestre(npcId, usuarioId)
}

async function gravarAvatar(usuarioId: string, npcId: string, novo: () => Promise<string | null>) {
  const { npc, sala } = await buscarNpcComoMestre(npcId, usuarioId)
  const avatarUrl = await novo()
  const atualizado = await prisma.npc.update({ where: { id: npcId }, data: { avatarUrl } }).catch(async (erro) => {
    if (avatarUrl) await removerArquivo(avatarUrl)
    throw erro
  })
  if (npc.avatarUrl) await removerArquivo(npc.avatarUrl)
  await avisarTokens(atualizado, sala.mapaAtivoId)
  return atualizado
}

export function trocarAvatarNpc(usuarioId: string, npcId: string, arquivo?: Express.Multer.File) {
  return gravarAvatar(usuarioId, npcId, () => salvarImagemEnviada(arquivo))
}

export function removerAvatarNpc(usuarioId: string, npcId: string) {
  return gravarAvatar(usuarioId, npcId, async () => null)
}
