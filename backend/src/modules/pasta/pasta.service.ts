import { prisma, semIndefinidos } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { garantirMestre } from '../sala/sala.service.js'

async function buscarPastaComoMestre(pastaId: string, usuarioId: string) {
  const pasta = await prisma.pasta.findUnique({ where: { id: pastaId } })
  if (!pasta) {
    throw new AppError('Pasta não encontrada', 404)
  }
  await garantirMestre(pasta.salaId, usuarioId)
  return pasta
}

export async function validarPastaDaSala(pastaId: string, salaId: string) {
  const pasta = await prisma.pasta.findUnique({ where: { id: pastaId } })
  if (!pasta || pasta.salaId !== salaId) {
    throw new AppError('Pasta de destino não existe nesta sala', 400)
  }
}

// Mover P pra dentro de um descendente dela criaria um ciclo (P some da árvore).
async function garantirSemCiclo(pastaId: string, novoPaiId: string) {
  let atual: string | null = novoPaiId
  while (atual) {
    if (atual === pastaId) {
      throw new AppError('Não é possível mover uma pasta para dentro dela mesma', 400)
    }
    const pai: { paiId: string | null } | null = await prisma.pasta.findUnique({
      where: { id: atual },
      select: { paiId: true },
    })
    atual = pai?.paiId ?? null
  }
}

export async function criarPasta(usuarioId: string, salaId: string, nome: string, paiId?: string | null) {
  await garantirMestre(salaId, usuarioId)
  if (!nome?.trim()) {
    throw new AppError('Nome da pasta é obrigatório', 400)
  }
  if (paiId) {
    await validarPastaDaSala(paiId, salaId)
  }

  return prisma.pasta.create({ data: { salaId, nome: nome.trim(), paiId: paiId ?? null } })
}

// paiId: undefined = não mexe; null = move pra raiz; string = move pra essa pasta.
export async function atualizarPasta(
  usuarioId: string,
  pastaId: string,
  dados: { nome?: string; paiId?: string | null },
) {
  const pasta = await buscarPastaComoMestre(pastaId, usuarioId)

  if (dados.nome !== undefined && !dados.nome.trim()) {
    throw new AppError('Nome da pasta é obrigatório', 400)
  }
  if (dados.paiId) {
    await validarPastaDaSala(dados.paiId, pasta.salaId)
    await garantirSemCiclo(pastaId, dados.paiId)
  }

  return prisma.pasta.update({
    where: { id: pastaId },
    data: semIndefinidos({ nome: dados.nome?.trim(), paiId: dados.paiId }),
  })
}

// Deletar pasta NUNCA apaga conteúdo: NPCs, documentos, mapas e subpastas
// sobem pra pasta-pai (ou raiz, se ela era de raiz). Tudo numa transação.
export async function deletarPasta(usuarioId: string, pastaId: string) {
  const pasta = await buscarPastaComoMestre(pastaId, usuarioId)
  const destino = pasta.paiId

  const [npcs, documentos, mapas, subpastas] = await prisma.$transaction([
    prisma.npc.updateMany({ where: { pastaId }, data: { pastaId: destino } }),
    prisma.documento.updateMany({ where: { pastaId }, data: { pastaId: destino } }),
    prisma.mapa.updateMany({ where: { pastaId }, data: { pastaId: destino } }),
    prisma.pasta.updateMany({ where: { paiId: pastaId }, data: { paiId: destino } }),
    prisma.pasta.delete({ where: { id: pastaId } }),
  ])

  return {
    movidosPara: destino,
    npcs: npcs.count,
    documentos: documentos.count,
    mapas: mapas.count,
    subpastas: subpastas.count,
  }
}

// Conteúdo de um nível da árvore. Sem pastaId = raiz (NPCs/pastas sem pai).
export async function listarBiblioteca(usuarioId: string, salaId: string, pastaId?: string) {
  await garantirMestre(salaId, usuarioId)
  if (pastaId) {
    await validarPastaDaSala(pastaId, salaId)
  }

  const nivel = pastaId ?? null
  const [pastas, npcs] = await Promise.all([
    prisma.pasta.findMany({ where: { salaId, paiId: nivel }, orderBy: { nome: 'asc' } }),
    prisma.npc.findMany({ where: { salaId, pastaId: nivel }, orderBy: { nome: 'asc' } }),
  ])

  return { pastaId: nivel, pastas, npcs }
}
