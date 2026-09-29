import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { detectarTipoImagem, removerArquivo, salvarArquivo } from '../../lib/armazenamento.js'
import { buscarSalaOuFalhar, garantirMestre } from '../sala/sala.service.js'
import { emitirParaSala } from '../../sockets/emissor.js'

// O que vai pro token é público pra mesa toda: da ficha, nome e PV (fichas já
// são visíveis a todos os membros); do NPC, só nome e avatar — as estatísticas
// do NPC continuam segredo do mestre (biblioteca).
export const INCLUIR_DADOS_TOKEN = {
  ficha: { select: { id: true, nome: true, usuario_id: true, avatarUrl: true, pv_atual: true, pv_maximo_cache: true } },
  npc: { select: { id: true, nome: true, avatarUrl: true } },
} as const

const LIMITE_COORDENADA = 100_000

export function coordenadaValida(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor) && Math.abs(valor) <= LIMITE_COORDENADA
}

async function buscarMapaComoMestre(mapaId: string, usuarioId: string) {
  const mapa = await prisma.mapa.findUnique({ where: { id: mapaId } })
  if (!mapa) throw new AppError('Mapa não encontrado', 404)
  await garantirMestre(mapa.salaId, usuarioId)
  return mapa
}

async function estadoDoMapa(mapaId: string | null) {
  if (!mapaId) return { mapa: null, tokens: [] }
  const mapa = await prisma.mapa.findUnique({ where: { id: mapaId } })
  const tokens = await prisma.token.findMany({ where: { mapaId }, include: INCLUIR_DADOS_TOKEN, orderBy: { createdAt: 'asc' } })
  return { mapa, tokens }
}

export async function criarMapa(usuarioId: string, salaId: string, nome: unknown, arquivo?: Express.Multer.File) {
  await garantirMestre(salaId, usuarioId)
  if (typeof nome !== 'string' || !nome.trim()) throw new AppError('Nome do mapa é obrigatório', 400)
  if (!arquivo) throw new AppError('Envie a imagem do mapa', 400)

  const tipo = detectarTipoImagem(arquivo.buffer)
  if (!tipo) throw new AppError('Formato não suportado — envie PNG, JPG ou WebP', 400)

  const imagemUrl = await salvarArquivo(arquivo.buffer, tipo)
  return prisma.mapa.create({ data: { salaId, nome: nome.trim(), imagemUrl } })
}

// Lista completa é material de preparo do mestre (pode ter spoiler) — jogador só vê o mapa ativo.
export async function listarMapas(usuarioId: string, salaId: string) {
  await garantirMestre(salaId, usuarioId)
  return prisma.mapa.findMany({ where: { salaId }, orderBy: { createdAt: 'desc' } })
}

export async function buscarMapaAtivo(usuarioId: string, salaId: string) {
  const sala = await buscarSalaOuFalhar(salaId, usuarioId)
  return estadoDoMapa(sala.mapaAtivoId)
}

export async function definirMapaAtivo(usuarioId: string, salaId: string, mapaId: unknown) {
  await garantirMestre(salaId, usuarioId)
  if (mapaId !== null) {
    if (typeof mapaId !== 'string') throw new AppError('mapaId deve ser o id de um mapa ou null', 400)
    const mapa = await prisma.mapa.findUnique({ where: { id: mapaId } })
    if (!mapa || mapa.salaId !== salaId) throw new AppError('Mapa não existe nesta sala', 400)
  }
  await prisma.sala.update({ where: { id: salaId }, data: { mapaAtivoId: mapaId } })
  const estado = await estadoDoMapa(mapaId)
  emitirParaSala(salaId, 'mapa:ativo', estado)
  return estado
}

export async function deletarMapa(usuarioId: string, mapaId: string) {
  const mapa = await buscarMapaComoMestre(mapaId, usuarioId)
  const sala = await prisma.sala.findUnique({ where: { id: mapa.salaId }, select: { mapaAtivoId: true } })
  await prisma.mapa.delete({ where: { id: mapaId } })
  await removerArquivo(mapa.imagemUrl)
  if (sala?.mapaAtivoId === mapaId) emitirParaSala(mapa.salaId, 'mapa:ativo', { mapa: null, tokens: [] })
}

export async function criarToken(
  usuarioId: string,
  mapaId: string,
  dados: { fichaId?: unknown; npcId?: unknown; nome?: unknown; x?: unknown; y?: unknown },
) {
  const mapa = await buscarMapaComoMestre(mapaId, usuarioId)
  if (!coordenadaValida(dados.x) || !coordenadaValida(dados.y)) throw new AppError('x e y devem ser números válidos', 400)
  if (dados.fichaId && dados.npcId) throw new AppError('Um token é de uma ficha OU de um NPC, nunca dos dois', 400)

  if (typeof dados.fichaId === 'string') {
    const ficha = await prisma.ficha.findUnique({ where: { id: dados.fichaId } })
    if (!ficha || ficha.salaId !== mapa.salaId) throw new AppError('Ficha não existe nesta sala', 400)
  } else if (typeof dados.npcId === 'string') {
    const npc = await prisma.npc.findUnique({ where: { id: dados.npcId } })
    if (!npc || npc.salaId !== mapa.salaId) throw new AppError('NPC não existe nesta sala', 400)
  } else if (typeof dados.nome !== 'string' || !dados.nome.trim()) {
    throw new AppError('Objeto sem ficha nem NPC precisa de um nome', 400)
  }

  const token = await prisma.token.create({
    data: {
      mapaId,
      fichaId: typeof dados.fichaId === 'string' ? dados.fichaId : null,
      npcId: typeof dados.npcId === 'string' ? dados.npcId : null,
      nome: typeof dados.nome === 'string' && dados.nome.trim() ? dados.nome.trim() : null,
      x: dados.x,
      y: dados.y,
    },
    include: INCLUIR_DADOS_TOKEN,
  })
  emitirParaSala(mapa.salaId, 'token:criado', { token })
  return token
}

export async function deletarToken(usuarioId: string, tokenId: string) {
  const token = await prisma.token.findUnique({ where: { id: tokenId }, include: { mapa: { select: { salaId: true } } } })
  if (!token) throw new AppError('Token não encontrado', 404)
  await garantirMestre(token.mapa.salaId, usuarioId)
  await prisma.token.delete({ where: { id: tokenId } })
  emitirParaSala(token.mapa.salaId, 'token:removido', { tokenId })
}

// Mestre move qualquer token; jogador só o token da própria ficha.
export async function podeMoverToken(usuarioId: string, salaId: string, tokenId: string) {
  const token = await prisma.token.findUnique({
    where: { id: tokenId },
    include: { mapa: { select: { salaId: true } }, ficha: { select: { usuario_id: true } } },
  })
  if (!token || token.mapa.salaId !== salaId) return false
  const membro = await prisma.membroSala.findUnique({ where: { usuarioId_salaId: { usuarioId, salaId } } })
  if (!membro) return false // quem saiu (ou foi removido) da mesa não move nada, nem o token da própria ficha
  if (membro.papel === 'MESTRE') return true
  return token.ficha?.usuario_id === usuarioId
}

// updateMany: se o mestre apagou o token no meio do arrasto, soltar não vira erro 500.
export async function salvarPosicaoToken(tokenId: string, x: unknown, y: unknown) {
  if (!coordenadaValida(x) || !coordenadaValida(y)) throw new AppError('x e y devem ser números válidos', 400)
  await prisma.token.updateMany({ where: { id: tokenId }, data: { x, y } })
}

