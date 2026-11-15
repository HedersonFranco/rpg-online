import { prisma, semIndefinidos } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { garantirMestre } from '../sala/sala.service.js'
import { criarNoLimite, LIMITES, nomeObrigatorio, travar } from '../../lib/limites.js'
import type { Prisma } from '../../generated/prisma/client.js'

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
async function garantirSemCiclo(tx: Prisma.TransactionClient, pastaId: string, novoPaiId: string) {
  let atual: string | null = novoPaiId
  while (atual) {
    if (atual === pastaId) {
      throw new AppError('Não é possível mover uma pasta para dentro dela mesma', 400)
    }
    const pai: { paiId: string | null } | null = await tx.pasta.findUnique({
      where: { id: atual },
      select: { paiId: true },
    })
    atual = pai?.paiId ?? null
  }
}

export async function criarPasta(usuarioId: string, salaId: string, nome: string, paiId?: string | null) {
  await garantirMestre(salaId, usuarioId)
  const nomePasta = nomeObrigatorio(nome, 'Nome da pasta é obrigatório')
  if (paiId) {
    await validarPastaDaSala(paiId, salaId)
  }

  return criarNoLimite(salaId, LIMITES.pastasPorMesa, `Esta mesa já tem ${LIMITES.pastasPorMesa} pastas, o máximo.`,
    (tx) => tx.pasta.count({ where: { salaId } }),
    (tx) => tx.pasta.create({ data: { salaId, nome: nomePasta, paiId: paiId ?? null } }))
}

// paiId: undefined = não mexe; null = move pra raiz; string = move pra essa pasta.
export async function atualizarPasta(
  usuarioId: string,
  pastaId: string,
  dados: { nome?: string; paiId?: string | null },
) {
  const pasta = await buscarPastaComoMestre(pastaId, usuarioId)

  const nome = dados.nome === undefined ? undefined : nomeObrigatorio(dados.nome, 'Nome da pasta é obrigatório')
  if (dados.paiId) {
    await validarPastaDaSala(dados.paiId, pasta.salaId)
  }

  // Trava por mesa: dois movimentos ao mesmo tempo (A para dentro de B e B para dentro de A) passariam
  // os dois pela checagem e fechariam um ciclo.
  return prisma.$transaction(async (tx) => {
    await travar(tx, `pastas:${pasta.salaId}`)
    if (dados.paiId) await garantirSemCiclo(tx, pastaId, dados.paiId)
    return tx.pasta.update({ where: { id: pastaId }, data: semIndefinidos({ nome, paiId: dados.paiId }) })
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
