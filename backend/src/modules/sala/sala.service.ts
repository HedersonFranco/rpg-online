import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { gerarConvite, validarConvite } from '../../engine/convite.js'

const LIMITE_SALAS_POR_DONO = 3
const SISTEMAS_VALIDOS = ['ORDEM_PARANORMAL_1', 'ORDEM_PARANORMAL_2'] as const

function mensagemMotivoConvite(motivo: 'convite_inexistente' | 'token_invalido' | 'convite_expirado') {
  switch (motivo) {
    case 'convite_expirado':
      return 'Convite expirado. Peça um novo link para o dono da sala.'
    default:
      return 'Convite inválido'
  }
}

export async function criarSala(usuarioId: string, nome: string, sistema: string) {
  if (!nome?.trim()) {
    throw new AppError('Nome da sala é obrigatório', 400)
  }
  if (!SISTEMAS_VALIDOS.includes(sistema as (typeof SISTEMAS_VALIDOS)[number])) {
    throw new AppError(`Sistema inválido — use um de: ${SISTEMAS_VALIDOS.join(', ')}`, 400)
  }

  const salasComoDono = await prisma.sala.count({ where: { donoId: usuarioId } })
  if (salasComoDono >= LIMITE_SALAS_POR_DONO) {
    throw new AppError(`Limite de ${LIMITE_SALAS_POR_DONO} salas por dono atingido`, 400)
  }

  const convite = gerarConvite()

  const sala = await prisma.sala.create({
    data: {
      nome: nome.trim(),
      sistema: sistema as (typeof SISTEMAS_VALIDOS)[number],
      donoId: usuarioId,
      conviteToken: convite.token,
      conviteExpiraEm: convite.expiraEm,
      membros: {
        create: { usuarioId, papel: 'MESTRE' },
      },
    },
  })

  return sala
}

export async function listarSalasDoUsuario(usuarioId: string) {
  return prisma.sala.findMany({
    where: {
      OR: [{ donoId: usuarioId }, { membros: { some: { usuarioId } } }],
    },
    orderBy: { createdAt: 'desc' },
  })
}

// Não-membro recebe 404 (não 403) para não confirmar que a sala existe.
export async function buscarSalaOuFalhar(salaId: string, usuarioId: string) {
  const sala = await prisma.sala.findUnique({
    where: { id: salaId },
    include: { membros: { include: { usuario: { select: { id: true, nome: true } } } } },
  })

  const souMembro =
    !!sala && (sala.donoId === usuarioId || sala.membros.some((m) => m.usuarioId === usuarioId))

  if (!sala || !souMembro) {
    throw new AppError('Sala não encontrada', 404)
  }

  return sala
}

// Membro que não é mestre recebe 403; não-membro recebe 404 (via buscarSalaOuFalhar).
export async function garantirMestre(salaId: string, usuarioId: string) {
  const sala = await buscarSalaOuFalhar(salaId, usuarioId)
  const membro = sala.membros.find((m) => m.usuarioId === usuarioId)
  if (membro?.papel !== 'MESTRE') {
    throw new AppError('Apenas o mestre da sala pode fazer isso', 403)
  }
  return sala
}

export async function deletarSala(salaId: string, usuarioId: string) {
  const sala = await buscarSalaOuFalhar(salaId, usuarioId)

  if (sala.donoId !== usuarioId) {
    throw new AppError('Apenas o dono pode deletar a sala', 403)
  }

  await prisma.sala.delete({ where: { id: salaId } })
}

export async function regenerarConvite(salaId: string, usuarioId: string) {
  const sala = await buscarSalaOuFalhar(salaId, usuarioId)

  if (sala.donoId !== usuarioId) {
    throw new AppError('Apenas o dono pode gerar convites', 403)
  }

  const convite = gerarConvite()
  await prisma.sala.update({
    where: { id: salaId },
    data: { conviteToken: convite.token, conviteExpiraEm: convite.expiraEm },
  })

  return convite
}

export async function entrarComConvite(usuarioId: string, token: string) {
  if (!token) {
    throw new AppError('Token de convite é obrigatório', 400)
  }

  const sala = await prisma.sala.findUnique({ where: { conviteToken: token } })

  const resultado = validarConvite(
    sala ? { token: sala.conviteToken!, expiraEm: sala.conviteExpiraEm } : null,
    token,
  )

  if (!resultado.valido) {
    throw new AppError(mensagemMotivoConvite(resultado.motivo), 400)
  }

  const membroExistente = await prisma.membroSala.findUnique({
    where: { usuarioId_salaId: { usuarioId, salaId: sala!.id } },
  })

  const membro =
    membroExistente ??
    (await prisma.membroSala.create({
      data: { usuarioId, salaId: sala!.id, papel: 'JOGADOR' },
    }))

  return { sala: sala!, membro }
}

export async function promoverMembro(
  salaId: string,
  membroId: string,
  usuarioId: string,
  novoPapel: string,
) {
  if (novoPapel !== 'MESTRE' && novoPapel !== 'JOGADOR') {
    throw new AppError('Papel inválido — use MESTRE ou JOGADOR', 400)
  }

  const sala = await buscarSalaOuFalhar(salaId, usuarioId)

  if (sala.donoId !== usuarioId) {
    throw new AppError('Apenas o dono pode alterar papéis', 403)
  }

  const membro = await prisma.membroSala.findFirst({ where: { id: membroId, salaId } })
  if (!membro) {
    throw new AppError('Membro não encontrado', 404)
  }

  return prisma.membroSala.update({ where: { id: membro.id }, data: { papel: novoPapel } })
}
