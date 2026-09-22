import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { buscarSalaOuFalhar } from '../sala/sala.service.js'

const LIMITE_HISTORICO = 50
const TAMANHO_MAXIMO = 1000

const INCLUIR_AUTOR = { usuario: { select: { id: true, nome: true } } } as const

// Últimas mensagens em ordem cronológica — usado ao abrir a mesa e ao reconectar.
export async function listarMensagens(usuarioId: string, salaId: string) {
  await buscarSalaOuFalhar(salaId, usuarioId)
  const recentes = await prisma.mensagem.findMany({
    where: { salaId },
    orderBy: { createdAt: 'desc' },
    take: LIMITE_HISTORICO,
    include: INCLUIR_AUTOR,
  })
  return recentes.reverse()
}

// Texto é guardado como veio (só trim); o escape contra XSS é do render — o
// React não interpreta HTML em texto. Nunca renderizar com dangerouslySetInnerHTML.
export async function criarMensagem(usuarioId: string, salaId: string, conteudo: unknown) {
  if (typeof conteudo !== 'string' || !conteudo.trim()) {
    throw new AppError('Mensagem vazia', 400)
  }
  const texto = conteudo.trim()
  if (texto.length > TAMANHO_MAXIMO) {
    throw new AppError(`Mensagem muito longa (máximo de ${TAMANHO_MAXIMO} caracteres)`, 400)
  }
  return prisma.mensagem.create({
    data: { salaId, usuarioId, conteudo: texto },
    include: INCLUIR_AUTOR,
  })
}
