import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { detectarTipoImagem, removerArquivo, salvarArquivo } from '../../lib/armazenamento.js'
import { buscarSalaOuFalhar } from '../sala/sala.service.js'
import { coordenadaValida, INCLUIR_DADOS_TOKEN } from '../mapa/mapa.service.js'
import { emitirParaSala } from '../../sockets/emissor.js'

const LIMITE_NOME = 60
const COM_AUTOR = { usuario: { select: { id: true, nome: true } } } as const

// A biblioteca de montarias é da mesa toda: qualquer membro vê.
export async function listarMontarias(salaId: string, usuarioId: string) {
  await buscarSalaOuFalhar(salaId, usuarioId)
  return prisma.montaria.findMany({ where: { salaId }, include: COM_AUTOR, orderBy: { createdAt: 'asc' } })
}

// Qualquer membro salva: nome + imagem (PNG/JPEG/WebP detectado pelos bytes, até 2MB — ver upload.ts).
export async function criarMontaria(usuarioId: string, salaId: string, nome: unknown, arquivo?: Express.Multer.File) {
  await buscarSalaOuFalhar(salaId, usuarioId)
  if (typeof nome !== 'string' || !nome.trim() || nome.trim().length > LIMITE_NOME) {
    throw new AppError(`Nome da montaria é obrigatório (até ${LIMITE_NOME} caracteres)`, 400)
  }
  if (!arquivo) throw new AppError('Envie a imagem da montaria', 400)
  const tipo = detectarTipoImagem(arquivo.buffer)
  if (!tipo) throw new AppError('A imagem precisa ser PNG, JPEG ou WebP', 400)

  const imagemUrl = await salvarArquivo(arquivo.buffer, tipo)
  const montaria = await prisma.montaria.create({ data: { salaId, usuarioId, nome: nome.trim(), imagemUrl }, include: COM_AUTOR })
  emitirParaSala(salaId, 'montaria:criada', { montaria })
  return montaria
}

// Apaga quem salvou ou o mestre. Os tokens dela saem dos mapas (cascata no banco) e a imagem sai do disco.
export async function apagarMontaria(usuarioId: string, montariaId: string) {
  const montaria = await prisma.montaria.findUnique({ where: { id: montariaId } })
  if (!montaria) throw new AppError('Montaria não encontrada', 404)
  const sala = await buscarSalaOuFalhar(montaria.salaId, usuarioId)
  const souMestre = sala.membros.some((m) => m.usuarioId === usuarioId && m.papel === 'MESTRE')
  if (montaria.usuarioId !== usuarioId && !souMestre) {
    throw new AppError('Só quem salvou a montaria ou o mestre pode apagá-la', 403)
  }

  const tokens = await prisma.token.findMany({ where: { montariaId }, select: { id: true } })
  // deleteMany: dois pedidos ao mesmo tempo → o segundo recebe 404, não 500.
  const { count } = await prisma.montaria.deleteMany({ where: { id: montariaId } })
  if (count === 0) throw new AppError('Montaria não encontrada', 404)
  for (const { id } of tokens) emitirParaSala(montaria.salaId, 'token:removido', { tokenId: id })
  emitirParaSala(montaria.salaId, 'montaria:removida', { montariaId })
  await removerArquivo(montaria.imagemUrl)
}

// Põe a montaria no mapa que está na mesa (qualquer membro). x/y em pixels da imagem do mapa.
export async function porMontariaNoMapa(usuarioId: string, montariaId: string, dados: { x?: unknown; y?: unknown }) {
  const montaria = await prisma.montaria.findUnique({ where: { id: montariaId } })
  if (!montaria) throw new AppError('Montaria não encontrada', 404)
  const sala = await buscarSalaOuFalhar(montaria.salaId, usuarioId)
  if (!coordenadaValida(dados.x) || !coordenadaValida(dados.y)) throw new AppError('x e y devem ser números válidos', 400)
  if (!sala.mapaAtivoId) throw new AppError('Nenhum mapa na mesa — o mestre precisa mostrar um mapa antes', 400)

  const token = await prisma.token.create({
    data: { mapaId: sala.mapaAtivoId, montariaId, x: dados.x, y: dados.y },
    include: INCLUIR_DADOS_TOKEN,
  })
  emitirParaSala(sala.id, 'token:criado', { token })
  return token
}
