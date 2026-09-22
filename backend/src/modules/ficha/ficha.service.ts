import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { buscarSalaOuFalhar } from '../sala/sala.service.js'
import { calcularFicha, type AtributosOP1 } from '../../engine/calculoFicha.js'

type DadosFicha = {
  nome: string
  classe: string
  origem: string
  trilha: string
  nex?: number
  for: number
  agi: number
  int: number
  vig: number
  pre: number
  inventario?: string
  avatarUrl?: string
}

function validarCamposBasicos(dados: Partial<DadosFicha>) {
  if (dados.nome !== undefined && !dados.nome.trim()) {
    throw new AppError('Nome da ficha é obrigatório', 400)
  }
  if (dados.origem !== undefined && !dados.origem.trim()) {
    throw new AppError('Origem é obrigatória', 400)
  }
  if (dados.trilha !== undefined && !dados.trilha.trim()) {
    throw new AppError('Trilha é obrigatória', 400)
  }
}

async function carregarTabelasDeCalculo(classe: string) {
  const [formulas, habilidades] = await Promise.all([
    prisma.classeFormula.findMany(),
    prisma.progressaoClasse.findMany({ where: { classe: classe as never } }),
  ])
  return { formulas, habilidades }
}

// Dono da ficha ou mestre da sala podem editar. Estar autenticado não basta.
async function garantirAutorizacaoEdicao(
  ficha: { usuario_id: string; salaId: string },
  usuarioId: string,
) {
  if (ficha.usuario_id === usuarioId) return

  const membro = await prisma.membroSala.findUnique({
    where: { usuarioId_salaId: { usuarioId, salaId: ficha.salaId } },
  })
  if (membro?.papel === 'MESTRE') return

  throw new AppError('Você não tem permissão para editar esta ficha', 403)
}

export async function criarFicha(usuarioId: string, salaId: string, dados: DadosFicha) {
  const sala = await buscarSalaOuFalhar(salaId, usuarioId)
  if (sala.sistema !== 'ORDEM_PARANORMAL_1') {
    throw new AppError(
      'Esta sala usa Ordem Paranormal RPG II — crie a ficha pelo endpoint de FichaOP2',
      400,
    )
  }

  validarCamposBasicos(dados)

  const nex = dados.nex ?? 5
  const atributos: AtributosOP1 = {
    for: dados.for,
    agi: dados.agi,
    int: dados.int,
    vig: dados.vig,
    pre: dados.pre,
  }

  const { formulas, habilidades } = await carregarTabelasDeCalculo(dados.classe)
  const resultado = calcularFicha({ classe: dados.classe, nex, atributos }, habilidades, formulas)

  const ficha = await prisma.ficha.create({
    data: {
      usuario_id: usuarioId,
      salaId,
      nome: dados.nome.trim(),
      classe: dados.classe as never,
      origem: dados.origem.trim(),
      trilha: dados.trilha.trim(),
      nex,
      for: dados.for,
      agi: dados.agi,
      int: dados.int,
      vig: dados.vig,
      pre: dados.pre,
      pv_atual: resultado.pv_maximo,
      pv_maximo_cache: resultado.pv_maximo,
      pe_atual: resultado.pe_maximo,
      pe_maximo_cache: resultado.pe_maximo,
      san_atual: resultado.san_maximo,
      san_maximo_cache: resultado.san_maximo,
      inventario: dados.inventario,
      avatarUrl: dados.avatarUrl,
    },
  })

  return { ficha, habilidadesDesbloqueadas: resultado.habilidadesDesbloqueadas }
}

export async function listarFichasDaSala(salaId: string, usuarioId: string) {
  await buscarSalaOuFalhar(salaId, usuarioId)
  return prisma.ficha.findMany({ where: { salaId }, orderBy: { createdAt: 'asc' } })
}

// Qualquer membro da sala pode ver a ficha (não só o dono dela) — a mesa
// toda enxerga as fichas uns dos outros. Não-membro recebe 404.
export async function buscarFichaOuFalhar(fichaId: string, usuarioId: string) {
  const ficha = await prisma.ficha.findUnique({ where: { id: fichaId } })
  if (!ficha) {
    throw new AppError('Ficha não encontrada', 404)
  }

  await buscarSalaOuFalhar(ficha.salaId, usuarioId)
  return ficha
}

export async function atualizarFicha(
  fichaId: string,
  usuarioId: string,
  dados: Partial<DadosFicha> & { pv_atual?: number; pe_atual?: number; san_atual?: number },
) {
  const ficha = await buscarFichaOuFalhar(fichaId, usuarioId)
  await garantirAutorizacaoEdicao(ficha, usuarioId)
  validarCamposBasicos(dados)

  const nex = dados.nex ?? ficha.nex
  const atributos: AtributosOP1 = {
    for: dados.for ?? ficha.for,
    agi: dados.agi ?? ficha.agi,
    int: dados.int ?? ficha.int,
    vig: dados.vig ?? ficha.vig,
    pre: dados.pre ?? ficha.pre,
  }
  const classe = dados.classe ?? ficha.classe

  const precisaRecalcular =
    dados.nex !== undefined ||
    dados.classe !== undefined ||
    dados.for !== undefined ||
    dados.agi !== undefined ||
    dados.int !== undefined ||
    dados.vig !== undefined ||
    dados.pre !== undefined

  let pv_maximo_cache = ficha.pv_maximo_cache
  let pe_maximo_cache = ficha.pe_maximo_cache
  let san_maximo_cache = ficha.san_maximo_cache
  let habilidadesDesbloqueadas: string[] = []

  if (precisaRecalcular) {
    const { formulas, habilidades } = await carregarTabelasDeCalculo(classe)
    const resultado = calcularFicha({ classe, nex, atributos }, habilidades, formulas)
    pv_maximo_cache = resultado.pv_maximo
    pe_maximo_cache = resultado.pe_maximo
    san_maximo_cache = resultado.san_maximo
    habilidadesDesbloqueadas = resultado.habilidadesDesbloqueadas
  }

  const pv_atual = dados.pv_atual ?? ficha.pv_atual
  const pe_atual = dados.pe_atual ?? ficha.pe_atual
  const san_atual = dados.san_atual ?? ficha.san_atual

  if (pv_atual < 0 || pv_atual > pv_maximo_cache) {
    throw new AppError(`pv_atual deve estar entre 0 e ${pv_maximo_cache}`, 400)
  }
  if (pe_atual < 0 || pe_atual > pe_maximo_cache) {
    throw new AppError(`pe_atual deve estar entre 0 e ${pe_maximo_cache}`, 400)
  }
  if (san_atual < 0 || san_atual > san_maximo_cache) {
    throw new AppError(`san_atual deve estar entre 0 e ${san_maximo_cache}`, 400)
  }

  const atualizado = await prisma.ficha.update({
    where: { id: fichaId },
    data: {
      nome: dados.nome?.trim(),
      classe: dados.classe as never,
      origem: dados.origem?.trim(),
      trilha: dados.trilha?.trim(),
      nex: dados.nex,
      for: dados.for,
      agi: dados.agi,
      int: dados.int,
      vig: dados.vig,
      pre: dados.pre,
      pv_atual,
      pv_maximo_cache,
      pe_atual,
      pe_maximo_cache,
      san_atual,
      san_maximo_cache,
      inventario: dados.inventario,
      avatarUrl: dados.avatarUrl,
    },
  })

  return { ficha: atualizado, habilidadesDesbloqueadas }
}

export async function treinarPericia(
  fichaId: string,
  usuarioId: string,
  periciaNome: string,
  nivel: string,
) {
  const NIVEIS_VALIDOS = ['DESTREINADO', 'TREINADO', 'VETERANO', 'EXPERT']
  if (!NIVEIS_VALIDOS.includes(nivel)) {
    throw new AppError(`Nível de treino inválido — use um de: ${NIVEIS_VALIDOS.join(', ')}`, 400)
  }

  const ficha = await buscarFichaOuFalhar(fichaId, usuarioId)
  await garantirAutorizacaoEdicao(ficha, usuarioId)

  const pericia = await prisma.pericia.findUnique({ where: { nome: periciaNome } })
  if (!pericia) {
    throw new AppError(`Perícia "${periciaNome}" não encontrada`, 404)
  }

  return prisma.fichaPericia.upsert({
    where: { fichaId_periciaId: { fichaId, periciaId: pericia.id } },
    create: { fichaId, periciaId: pericia.id, nivel: nivel as never },
    update: { nivel: nivel as never },
    include: { pericia: true },
  })
}
