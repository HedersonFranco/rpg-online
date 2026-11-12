import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { detectarTipoImagem, removerArquivo, salvarArquivo } from '../../lib/armazenamento.js'
import { buscarSalaOuFalhar, garantirMestre } from '../sala/sala.service.js'
import { emitirParaSala } from '../../sockets/emissor.js'
import { criarNoLimite, garantirVaga, LIMITES, nomeObrigatorio } from '../../lib/limites.js'
import type { Prisma } from '../../generated/prisma/client.js'

// O que vai pro token é público pra mesa toda: da ficha, nome e PV (fichas já
// são visíveis a todos os membros); do NPC, só nome e avatar — as estatísticas
// do NPC continuam segredo do mestre (biblioteca).
export const INCLUIR_DADOS_TOKEN = {
  ficha: { select: { id: true, nome: true, usuario_id: true, avatarUrl: true, pv_atual: true, pv_maximo_cache: true } },
  npc: { select: { id: true, nome: true, avatarUrl: true } },
  montaria: { select: { id: true, nome: true, imagemUrl: true } },
} as const

const LIMITE_COORDENADA = 100_000
// Tamanho da montaria em relação ao padrão: de um quarto (skate de longe) a dez vezes (caminhão).
const ESCALA_MINIMA = 0.25
const ESCALA_MAXIMA = 10

export function coordenadaValida(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor) && Math.abs(valor) <= LIMITE_COORDENADA
}

export function escalaValida(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= ESCALA_MINIMA && valor <= ESCALA_MAXIMA
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

const LIMITE_MAPAS = `Esta mesa já tem ${LIMITES.mapasPorMesa} mapas, o máximo. Apague um mapa para enviar outro.`
const LIMITE_TOKENS = `Este mapa já tem ${LIMITES.tokensPorMapa} tokens, o máximo. Tire um do mapa para pôr outro.`

// Antes do upload: quem não é mestre, ou a mesa já no limite, nem chega a mandar os 10MB para a memória.
export async function garantirPodeEnviarMapa(usuarioId: string, salaId: string) {
  await garantirMestre(salaId, usuarioId)
  garantirVaga(await prisma.mapa.count({ where: { salaId } }), LIMITES.mapasPorMesa, LIMITE_MAPAS)
}

export async function criarMapa(usuarioId: string, salaId: string, nomeEnviado: unknown, arquivo?: Express.Multer.File) {
  await garantirMestre(salaId, usuarioId)
  const nome = nomeObrigatorio(nomeEnviado, 'Nome do mapa é obrigatório')
  if (!arquivo) throw new AppError('Envie a imagem do mapa', 400)

  const tipo = detectarTipoImagem(arquivo.buffer)
  if (!tipo) throw new AppError('Formato não suportado — envie PNG, JPG ou WebP', 400)

  return criarNoLimite(salaId, LIMITES.mapasPorMesa, LIMITE_MAPAS,
    (tx) => tx.mapa.count({ where: { salaId } }),
    async (tx) => tx.mapa.create({ data: { salaId, nome, imagemUrl: await salvarArquivo(arquivo.buffer, tipo) } }))
}

// Montaria conta junto com os outros tokens: é a quantidade no mapa que pesa ao arrastar.
export function criarTokenNoMapa(mapaId: string, dados: Omit<Prisma.TokenUncheckedCreateInput, 'mapaId'>) {
  return criarNoLimite(mapaId, LIMITES.tokensPorMapa, LIMITE_TOKENS,
    (tx) => tx.token.count({ where: { mapaId } }),
    (tx) => tx.token.create({ data: { ...dados, mapaId }, include: INCLUIR_DADOS_TOKEN }))
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
  const nome = typeof dados.nome === 'string' && dados.nome.trim() ? nomeObrigatorio(dados.nome, 'Nome do objeto') : null

  if (typeof dados.fichaId === 'string') {
    const ficha = await prisma.ficha.findUnique({ where: { id: dados.fichaId } })
    if (!ficha || ficha.salaId !== mapa.salaId) throw new AppError('Ficha não existe nesta sala', 400)
  } else if (typeof dados.npcId === 'string') {
    const npc = await prisma.npc.findUnique({ where: { id: dados.npcId } })
    if (!npc || npc.salaId !== mapa.salaId) throw new AppError('NPC não existe nesta sala', 400)
  } else if (!nome) {
    throw new AppError('Objeto sem ficha nem NPC precisa de um nome', 400)
  }

  const token = await criarTokenNoMapa(mapaId, {
    fichaId: typeof dados.fichaId === 'string' ? dados.fichaId : null,
    npcId: typeof dados.npcId === 'string' ? dados.npcId : null,
    nome,
    x: dados.x,
    y: dados.y,
  })
  emitirParaSala(mapa.salaId, 'token:criado', { token })
  return token
}

export async function deletarToken(usuarioId: string, tokenId: string) {
  const token = await prisma.token.findUnique({ where: { id: tokenId }, include: { mapa: { select: { salaId: true } } } })
  if (!token) throw new AppError('Token não encontrado', 404)
  // Montaria qualquer membro põe e tira do mapa; os outros tokens, só o mestre.
  if (token.montariaId) await buscarSalaOuFalhar(token.mapa.salaId, usuarioId)
  else await garantirMestre(token.mapa.salaId, usuarioId)
  await prisma.token.delete({ where: { id: tokenId } })
  emitirParaSala(token.mapa.salaId, 'token:removido', { tokenId })
}

// Mestre move qualquer token; jogador, o token da própria ficha e qualquer montaria.
export async function podeMoverToken(usuarioId: string, salaId: string, tokenId: string) {
  const token = await prisma.token.findUnique({
    where: { id: tokenId },
    include: { mapa: { select: { salaId: true } }, ficha: { select: { usuario_id: true } } },
  })
  if (!token || token.mapa.salaId !== salaId) return false
  const membro = await prisma.membroSala.findUnique({ where: { usuarioId_salaId: { usuarioId, salaId } } })
  if (!membro) return false // quem saiu (ou foi removido) da mesa não move nada, nem o token da própria ficha
  if (membro.papel === 'MESTRE' || token.montariaId) return true
  return token.ficha?.usuario_id === usuarioId
}

// Só montaria muda de tamanho, e qualquer membro da mesa pode mudar.
export async function podeEscalarToken(usuarioId: string, salaId: string, tokenId: string) {
  const token = await prisma.token.findUnique({ where: { id: tokenId }, include: { mapa: { select: { salaId: true } } } })
  if (!token || token.mapa.salaId !== salaId || !token.montariaId) return false
  return (await prisma.membroSala.findUnique({ where: { usuarioId_salaId: { usuarioId, salaId } } })) !== null
}

export async function salvarEscalaToken(tokenId: string, escala: unknown) {
  if (!escalaValida(escala)) throw new AppError(`Tamanho deve ser de ${ESCALA_MINIMA} a ${ESCALA_MAXIMA}`, 400)
  await prisma.token.updateMany({ where: { id: tokenId }, data: { escala } })
}

// updateMany: se o mestre apagou o token no meio do arrasto, soltar não vira erro 500.
export async function salvarPosicaoToken(tokenId: string, x: unknown, y: unknown) {
  if (!coordenadaValida(x) || !coordenadaValida(y)) throw new AppError('x e y devem ser números válidos', 400)
  await prisma.token.updateMany({ where: { id: tokenId }, data: { x, y } })
}

