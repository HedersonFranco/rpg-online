import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { garantirMestre } from '../sala/sala.service.js'
import { validarPastaDaSala } from '../pasta/pasta.service.js'

type DadosNpc = {
  nome?: string
  pv?: number | null
  pe?: number | null
  san?: number | null
  pd?: number | null
  atributos?: string | null
  avatarUrl?: string | null
  pastaId?: string | null
}

const CAMPOS_POR_SISTEMA = {
  ORDEM_PARANORMAL_1: { permitidos: ['pv', 'pe', 'san'], proibidos: ['pd'] },
  ORDEM_PARANORMAL_2: { permitidos: ['pv', 'pd'], proibidos: ['pe', 'san'] },
} as const

function validarEstatisticas(dados: DadosNpc, sistema: keyof typeof CAMPOS_POR_SISTEMA) {
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
  if (!dados.nome?.trim()) {
    throw new AppError('Nome do NPC é obrigatório', 400)
  }
  validarEstatisticas(dados, sala.sistema)
  if (dados.pastaId) {
    await validarPastaDaSala(dados.pastaId, salaId)
  }

  return prisma.npc.create({
    data: {
      salaId,
      nome: dados.nome.trim(),
      pv: dados.pv ?? null,
      pe: dados.pe ?? null,
      san: dados.san ?? null,
      pd: dados.pd ?? null,
      atributos: dados.atributos ?? null,
      avatarUrl: dados.avatarUrl ?? null,
      pastaId: dados.pastaId ?? null,
    },
  })
}

export async function buscarNpc(usuarioId: string, npcId: string) {
  const { npc } = await buscarNpcComoMestre(npcId, usuarioId)
  return npc
}

// pastaId: undefined = não mexe; null = move pra raiz; string = move pra essa pasta.
export async function atualizarNpc(usuarioId: string, npcId: string, dados: DadosNpc) {
  const { npc, sala } = await buscarNpcComoMestre(npcId, usuarioId)

  if (dados.nome !== undefined && !dados.nome?.trim()) {
    throw new AppError('Nome do NPC é obrigatório', 400)
  }
  validarEstatisticas(dados, sala.sistema)
  if (dados.pastaId) {
    await validarPastaDaSala(dados.pastaId, npc.salaId)
  }

  return prisma.npc.update({
    where: { id: npcId },
    data: {
      nome: dados.nome?.trim(),
      pv: dados.pv,
      pe: dados.pe,
      san: dados.san,
      pd: dados.pd,
      atributos: dados.atributos,
      avatarUrl: dados.avatarUrl,
      pastaId: dados.pastaId,
    },
  })
}

// Tokens que apontavam pro NPC continuam no mapa como objeto genérico
// (FK com onDelete: SetNull) — o registro de mapa não quebra.
export async function deletarNpc(usuarioId: string, npcId: string) {
  await buscarNpcComoMestre(npcId, usuarioId)
  await prisma.npc.delete({ where: { id: npcId } })
}
