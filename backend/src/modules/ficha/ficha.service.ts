import { prisma, semIndefinidos } from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { removerArquivo, salvarImagemEnviada } from '../../lib/armazenamento.js'
import { buscarSalaOuFalhar } from '../sala/sala.service.js'
import { calcularDefesa, calcularFicha, montarTestesPericias, pedidoDeTeste, type AtributosOP1, type NivelTreinoPericia } from '../../engine/calculoFicha.js'
import { calcularArma, TIPOS_ARMA, type DadosArma } from '../../engine/arma.js'
import { lerExpressao, PedidoRolagemInvalido } from '../../engine/rolagem.js'
import { PERICIAS_OP1 } from '../../engine/pericias.js'
import { habilidadesAcumuladas, motivoClasseNexInvalidos, type ProgressaoClasseEntry } from '../../engine/progressaoClasse.js'
import { emitirParaSala } from '../../sockets/emissor.js'
import { criarNoLimite, LIMITES } from '../../lib/limites.js'

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
}

const ATRIBUTOS = ['for', 'agi', 'int', 'vig', 'pre'] as const
const LIMITE_INVENTARIO = 10000
// Vida e Sanidade podem passar do máximo (há habilidades que concedem isso); o teto só barra valor absurdo.
const TETO_RECURSO = 999
const LIMITE_DEFESA_BONUS = 50
const INCLUIR_PERICIAS = {
  pericias: { include: { pericia: true } },
  entradas: { orderBy: { createdAt: 'asc' } },
} as const

type FichaComRelacoes = NonNullable<Awaited<ReturnType<typeof carregarFicha>>>

function carregarFicha(fichaId: string) {
  return prisma.ficha.findUnique({ where: { id: fichaId }, include: INCLUIR_PERICIAS })
}

// Tabela de habilidades por NEX (seed, 60 linhas) — passada ao motor, nunca lida dentro dele.
function tabelaProgressao() {
  return prisma.progressaoClasse.findMany()
}

// O que sai pra API/socket: a ficha + o teste de cada uma das 28 perícias e as habilidades de
// classe desbloqueadas até o NEX atual (tudo calculado aqui — o frontend só exibe). Perícia sem
// linha em FichaPericia conta como Destreinado.
function testesDa(ficha: FichaComRelacoes) {
  const nivelPorNome = new Map(ficha.pericias.map((fp) => [fp.pericia.nome, fp.nivel as NivelTreinoPericia]))
  return montarTestesPericias(
    { for: ficha.for, agi: ficha.agi, int: ficha.int, vig: ficha.vig, pre: ficha.pre },
    PERICIAS_OP1.map((p) => ({ ...p, nivel: nivelPorNome.get(p.nome) ?? 'DESTREINADO' })),
  )
}

type CamposArma = Pick<FichaComRelacoes['entradas'][number], 'tipoArma' | 'dano' | 'danoExtra' | 'bonusAtaque' | 'margemAmeaca' | 'multiplicadorCritico'>

// Equipamento que é arma, nos valores gravados (null = não é arma).
function dadosArma(entrada: CamposArma): DadosArma | null {
  if (!entrada.tipoArma || !entrada.dano) return null
  return {
    tipoArma: entrada.tipoArma,
    dano: entrada.dano,
    danoExtra: entrada.danoExtra,
    bonusAtaque: entrada.bonusAtaque ?? 0,
    margemAmeaca: entrada.margemAmeaca ?? 20,
    multiplicadorCritico: entrada.multiplicadorCritico ?? 2,
  }
}

function apresentar(ficha: FichaComRelacoes, progressao: ProgressaoClasseEntry[]) {
  const testesPericias = testesDa(ficha)
  return {
    ...ficha,
    // Cada arma sai com ataque, dano e crítico já calculados (a tela só exibe e pede para rolar).
    entradas: ficha.entradas.map((entrada) => {
      const arma = dadosArma(entrada)
      return { ...entrada, arma: arma && calcularArma(arma, ficha, testesPericias) }
    }),
    testesPericias,
    habilidadesDesbloqueadas: habilidadesAcumuladas(progressao, ficha.classe, ficha.nex),
    defesa: calcularDefesa(ficha.agi, ficha.defesa_bonus, testesPericias),
  }
}

async function emitirFicha(ficha: FichaComRelacoes) {
  const apresentada = apresentar(ficha, await tabelaProgressao())
  emitirParaSala(ficha.salaId, 'ficha:atualizada', { ficha: apresentada })
  return apresentada
}

function validarAtributos(dados: Partial<DadosFicha>, obrigatorio: boolean) {
  for (const atributo of ATRIBUTOS) {
    const valor = dados[atributo]
    if (valor === undefined && !obrigatorio) continue
    if (!Number.isInteger(valor) || (valor as number) < 0) {
      throw new AppError(`Atributo "${atributo}" deve ser um inteiro maior ou igual a 0`, 400)
    }
  }
}

// obrigatorio=true na criação (campo ausente é erro); false no PATCH (ausente = não mexe).
function validarCamposBasicos(dados: Partial<DadosFicha>, obrigatorio: boolean) {
  const textos = [
    ['nome', 'Nome da ficha é obrigatório'],
    ['origem', 'Origem é obrigatória'],
    ['trilha', 'Trilha é obrigatória'],
  ] as const
  for (const [campo, mensagem] of textos) {
    const valor = dados[campo]
    if (valor === undefined && !obrigatorio) continue
    if (typeof valor !== 'string' || !valor.trim()) {
      throw new AppError(mensagem, 400)
    }
  }
  validarAtributos(dados, obrigatorio)
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
      'Esta sala usa Ordem Paranormal RPG II — a ficha desse sistema ainda não está disponível (o playtest não publicou a criação de personagem)',
      400,
    )
  }

  validarCamposBasicos(dados, true)

  const nex = dados.nex ?? 5
  const atributos: AtributosOP1 = {
    for: dados.for,
    agi: dados.agi,
    int: dados.int,
    vig: dados.vig,
    pre: dados.pre,
  }

  const invalido = motivoClasseNexInvalidos(dados.classe, nex)
  if (invalido) throw new AppError(invalido, 400)
  const { formulas, habilidades } = await carregarTabelasDeCalculo(dados.classe)
  const resultado = calcularFicha({ classe: dados.classe, nex, atributos }, habilidades, formulas)

  const ficha = await criarNoLimite(salaId, LIMITES.fichasPorMesa,
    `Esta mesa já tem ${LIMITES.fichasPorMesa} agentes, o máximo. Apague um agente para criar outro.`,
    (tx) => tx.ficha.count({ where: { salaId } }),
    (tx) => tx.ficha.create({
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
      inventario: dados.inventario ?? null,
    },
    include: INCLUIR_PERICIAS,
  }))

  return { ficha: await emitirFicha(ficha), habilidadesDesbloqueadas: resultado.habilidadesDesbloqueadas }
}

export async function listarFichasDaSala(salaId: string, usuarioId: string) {
  await buscarSalaOuFalhar(salaId, usuarioId)
  const fichas = await prisma.ficha.findMany({
    where: { salaId },
    orderBy: { createdAt: 'asc' },
    include: INCLUIR_PERICIAS,
  })
  const progressao = await tabelaProgressao()
  return fichas.map((ficha) => apresentar(ficha, progressao))
}

// Qualquer membro da sala pode ver a ficha (não só o dono dela) — a mesa
// toda enxerga as fichas uns dos outros. Não-membro recebe 404.
async function buscarFichaInterna(fichaId: string, usuarioId: string) {
  const ficha = await carregarFicha(fichaId)
  if (!ficha) {
    throw new AppError('Ficha não encontrada', 404)
  }

  await buscarSalaOuFalhar(ficha.salaId, usuarioId)
  return ficha
}

// Rolar da ficha: o cliente diz só QUAL teste; quantidade de dados e bônus saem da ficha no banco
// (ninguém infla o próprio bônus). Rola quem pode editar a ficha — o dono ou o mestre.
export async function montarTesteDaFicha(salaId: string, usuarioId: string, { fichaId, tipo, nome }: Record<string, unknown>) {
  if (typeof fichaId !== 'string' || (tipo !== 'pericia' && tipo !== 'atributo') || typeof nome !== 'string') {
    throw new AppError('Informe fichaId, tipo ("pericia" ou "atributo") e nome', 400)
  }
  const ficha = await buscarFichaInterna(fichaId, usuarioId)
  if (ficha.salaId !== salaId) throw new AppError('Ficha não encontrada', 404)
  await garantirAutorizacaoEdicao(ficha, usuarioId)
  const pedido = pedidoDeTeste(ficha, testesDa(ficha), { tipo, nome })
  if (!pedido) throw new AppError(tipo === 'pericia' ? `Perícia "${nome}" não existe` : `Atributo "${nome}" não existe`, 400)
  return { pedido, fichaNome: ficha.nome }
}

// Rolar uma arma da ficha: mesma regra do teste — o cliente diz só qual arma e qual botão; ataque, dano e
// crítico saem do banco, calculados aqui. Rola quem pode editar a ficha.
const ACOES_ARMA = ['ataque', 'dano', 'critico'] as const

export async function montarRolagemDeArma(salaId: string, usuarioId: string, { fichaId, entradaId, tipo }: Record<string, unknown>) {
  if (typeof fichaId !== 'string' || typeof entradaId !== 'string' || !ACOES_ARMA.includes(tipo as never)) {
    throw new AppError('Informe fichaId, entradaId e tipo ("ataque", "dano" ou "critico")', 400)
  }
  const ficha = await buscarFichaInterna(fichaId, usuarioId)
  if (ficha.salaId !== salaId) throw new AppError('Ficha não encontrada', 404)
  await garantirAutorizacaoEdicao(ficha, usuarioId)
  const entrada = ficha.entradas.find((e) => e.id === entradaId)
  if (!entrada) throw new AppError('Entrada não encontrada nesta ficha', 404)
  const dados = dadosArma(entrada)
  if (!dados) throw new AppError(`"${entrada.nome}" não é uma arma`, 400)
  return {
    acao: tipo as (typeof ACOES_ARMA)[number],
    arma: calcularArma(dados, ficha, testesDa(ficha)),
    margem: dados.margemAmeaca,
    armaNome: entrada.nome,
    fichaNome: ficha.nome,
  }
}

// Iniciativa automática: o teste da perícia Iniciativa de cada ficha pedida (só fichas desta sala).
export async function montarIniciativas(salaId: string, fichaIds: unknown) {
  if (!Array.isArray(fichaIds) || fichaIds.length === 0 || fichaIds.length > 50 || !fichaIds.every((id) => typeof id === 'string')) {
    throw new AppError('Informe de 1 a 50 fichas', 400)
  }
  const fichas = await prisma.ficha.findMany({ where: { salaId, id: { in: fichaIds as string[] } }, include: INCLUIR_PERICIAS })
  return fichas.map((ficha) => ({
    fichaId: ficha.id,
    fichaNome: ficha.nome,
    pedido: pedidoDeTeste(ficha, testesDa(ficha), { tipo: 'pericia', nome: 'Iniciativa' })!,
  }))
}

export async function buscarFichaOuFalhar(fichaId: string, usuarioId: string) {
  return apresentar(await buscarFichaInterna(fichaId, usuarioId), await tabelaProgressao())
}

export async function atualizarFicha(
  fichaId: string,
  usuarioId: string,
  dados: Partial<DadosFicha> & { pv_atual?: number; pe_atual?: number; san_atual?: number; defesa_bonus?: number },
) {
  const ficha = await buscarFichaInterna(fichaId, usuarioId)
  await garantirAutorizacaoEdicao(ficha, usuarioId)
  validarCamposBasicos(dados, false)
  if (dados.inventario !== undefined && (typeof dados.inventario !== 'string' || dados.inventario.length > LIMITE_INVENTARIO)) {
    throw new AppError(`Inventário deve ser um texto de até ${LIMITE_INVENTARIO} caracteres`, 400)
  }

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
    const invalido = motivoClasseNexInvalidos(classe, nex)
    if (invalido) throw new AppError(invalido, 400)
    const { formulas, habilidades } = await carregarTabelasDeCalculo(classe)
    const resultado = calcularFicha({ classe, nex, atributos }, habilidades, formulas)
    pv_maximo_cache = resultado.pv_maximo
    pe_maximo_cache = resultado.pe_maximo
    san_maximo_cache = resultado.san_maximo
    habilidadesDesbloqueadas = resultado.habilidadesDesbloqueadas
  }

  const pv_atual = dados.pv_atual ?? ficha.pv_atual
  const san_atual = dados.san_atual ?? ficha.san_atual
  // Esforço não passa do máximo. Se o máximo caiu (NEX/atributo menor) e o cliente não mandou
  // um PE novo, o atual desce junto — antes, baixar o NEX com PE cheio dava 400.
  const pe_atual = dados.pe_atual ?? Math.min(ficha.pe_atual, pe_maximo_cache)

  const recursos = [
    ['pv_atual', pv_atual, TETO_RECURSO],
    ['pe_atual', pe_atual, pe_maximo_cache],
    ['san_atual', san_atual, TETO_RECURSO],
  ] as const
  for (const [campo, atual, limite] of recursos) {
    if (!Number.isInteger(atual) || atual < 0 || atual > limite) {
      throw new AppError(`${campo} deve ser um inteiro entre 0 e ${limite}`, 400)
    }
  }
  if (dados.defesa_bonus !== undefined && (!Number.isInteger(dados.defesa_bonus) || Math.abs(dados.defesa_bonus) > LIMITE_DEFESA_BONUS)) {
    throw new AppError(`Bônus de Defesa deve ser um inteiro entre -${LIMITE_DEFESA_BONUS} e ${LIMITE_DEFESA_BONUS}`, 400)
  }

  const atualizado = await prisma.ficha.update({
    where: { id: fichaId },
    data: semIndefinidos({
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
      defesa_bonus: dados.defesa_bonus,
      inventario: dados.inventario,
    }),
    include: INCLUIR_PERICIAS,
  })

  return { ficha: await emitirFicha(atualizado), habilidadesDesbloqueadas }
}

// Apagar agente: dono da ficha ou mestre. Perícias e entradas vão junto (cascata no banco) e os tokens
// dele saem dos mapas — sem a ficha, o token viraria um objeto sem nome.
export async function removerFicha(fichaId: string, usuarioId: string) {
  const ficha = await fichaEditavel(fichaId, usuarioId)
  const tokens = await prisma.token.findMany({ where: { fichaId }, select: { id: true } })
  const [, apagadas] = await prisma.$transaction([
    prisma.token.deleteMany({ where: { fichaId } }),
    prisma.ficha.deleteMany({ where: { id: fichaId } }),
  ])
  // Dono e mestre apagando ao mesmo tempo: o segundo não acha mais a ficha.
  if (apagadas.count === 0) throw new AppError('Ficha não encontrada', 404)
  for (const { id } of tokens) emitirParaSala(ficha.salaId, 'token:removido', { tokenId: id })
  emitirParaSala(ficha.salaId, 'ficha:removida', { fichaId })
  if (ficha.avatarUrl) await removerArquivo(ficha.avatarUrl)
}

// ── Avatar (RNF10) ───────────────────────────────────────────────────────────
// Só entra por aqui, nunca pelo PATCH: cada avatar é um arquivo só desta ficha, então trocar ou
// tirar apaga o antigo do disco sem risco de levar junto a imagem de um mapa ou de outra ficha.

// Antes do upload: quem não pode editar a ficha nem chega a mandar o arquivo para a memória.
export async function garantirPodeEditarFicha(fichaId: string, usuarioId: string) {
  await fichaEditavel(fichaId, usuarioId)
}

async function gravarAvatar(fichaId: string, usuarioId: string, novo: () => Promise<string | null>) {
  const ficha = await fichaEditavel(fichaId, usuarioId)
  const avatarUrl = await novo()
  const atualizada = await prisma.ficha.update({ where: { id: fichaId }, data: { avatarUrl }, include: INCLUIR_PERICIAS })
    .catch(async (erro) => {
      if (avatarUrl) await removerArquivo(avatarUrl)
      throw erro
    })
  // ponytail: dois envios ao mesmo tempo na mesma ficha podem deixar um arquivo órfão no disco (só espaço, não aparece).
  if (ficha.avatarUrl) await removerArquivo(ficha.avatarUrl)
  return { ficha: await emitirFicha(atualizada) }
}

export function trocarAvatar(fichaId: string, usuarioId: string, arquivo?: Express.Multer.File) {
  return gravarAvatar(fichaId, usuarioId, () => salvarImagemEnviada(arquivo))
}

export function removerAvatar(fichaId: string, usuarioId: string) {
  return gravarAvatar(fichaId, usuarioId, async () => null)
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

  const ficha = await buscarFichaInterna(fichaId, usuarioId)
  await garantirAutorizacaoEdicao(ficha, usuarioId)

  const pericia = await prisma.pericia.findUnique({ where: { nome: periciaNome } })
  if (!pericia) {
    throw new AppError(`Perícia "${periciaNome}" não encontrada`, 404)
  }

  const fichaPericia = await prisma.fichaPericia.upsert({
    where: { fichaId_periciaId: { fichaId, periciaId: pericia.id } },
    create: { fichaId, periciaId: pericia.id, nivel: nivel as never },
    update: { nivel: nivel as never },
    include: { pericia: true },
  })

  return { fichaPericia, ficha: await emitirFicha((await carregarFicha(fichaId))!) }
}

// ── Entradas da ficha: rituais, habilidades, poderes, equipamentos ──────────
// Cada ficha cadastra as suas (não há catálogo). Cada tipo aceita só os campos
// dele; campo de outro tipo é rejeitado em vez de ignorado, pra não gravar lixo.

const TIPOS_ENTRADA = ['RITUAL', 'HABILIDADE', 'PODER', 'EQUIPAMENTO'] as const
const ELEMENTOS = ['SANGUE', 'MORTE', 'CONHECIMENTO', 'ENERGIA', 'MEDO', 'VARIA'] as const
const CAMPOS_POR_TIPO: Record<(typeof TIPOS_ENTRADA)[number], readonly string[]> = {
  RITUAL: ['circulo', 'elemento'],
  HABILIDADE: [],
  PODER: ['preRequisito'],
  EQUIPAMENTO: ['categoria', 'espacos', 'tipoArma', 'dano', 'danoExtra', 'bonusAtaque', 'margemAmeaca', 'multiplicadorCritico'],
}
// Campos da arma além do tipo: só valem com `tipoArma` preenchido.
const CAMPOS_ARMA = ['dano', 'danoExtra', 'bonusAtaque', 'margemAmeaca', 'multiplicadorCritico'] as const
const CAMPOS_ESPECIFICOS = ['circulo', 'elemento', 'preRequisito', 'categoria', 'espacos', 'tipoArma', ...CAMPOS_ARMA] as const
const LIMITE_NOME = 100
const LIMITE_DESCRICAO = 4000
const LIMITE_PRE_REQUISITO = 200
const LIMITE_EXPRESSAO = 60
const LIMITE_BONUS_ATAQUE = 50

type DadosEntrada = {
  tipo?: string
  nome?: unknown
  descricao?: unknown
  circulo?: unknown
  elemento?: unknown
  preRequisito?: unknown
  categoria?: unknown
  espacos?: unknown
  favorito?: unknown
  tipoArma?: unknown
  dano?: unknown
  danoExtra?: unknown
  bonusAtaque?: unknown
  margemAmeaca?: unknown
  multiplicadorCritico?: unknown
}

const vazio = (valor: unknown) => valor === undefined || valor === null || valor === ''

// Dano da arma: expressão de dados que o painel de rolagem aceitaria (mesmos limites).
function validarExpressao(rotulo: string, valor: unknown, obrigatoria: boolean) {
  if (vazio(valor)) {
    if (obrigatoria) throw new AppError(`${rotulo} da arma é obrigatório (ex.: 1d8)`, 400)
    return
  }
  if (typeof valor !== 'string' || valor.trim().length > LIMITE_EXPRESSAO) {
    throw new AppError(`${rotulo} deve ter até ${LIMITE_EXPRESSAO} caracteres`, 400)
  }
  try {
    lerExpressao(valor)
  } catch (erro) {
    if (erro instanceof PedidoRolagemInvalido) throw new AppError(`${rotulo}: ${erro.message}`, 400)
    throw erro
  }
}

function inteiroEntre(valor: unknown, min: number, max: number) {
  return Number.isInteger(valor) && (valor as number) >= min && (valor as number) <= max
}

// Valida o estado FINAL da entrada (na edição, já mesclado com o que estava gravado).
function validarEntrada(tipo: string, dados: DadosEntrada) {
  if (!TIPOS_ENTRADA.includes(tipo as never)) {
    throw new AppError(`Tipo inválido — use um de: ${TIPOS_ENTRADA.join(', ')}`, 400)
  }
  const permitidos = CAMPOS_POR_TIPO[tipo as (typeof TIPOS_ENTRADA)[number]]
  for (const campo of CAMPOS_ESPECIFICOS) {
    if (!permitidos.includes(campo) && dados[campo] !== undefined && dados[campo] !== null) {
      throw new AppError(`Campo "${campo}" não se aplica a ${tipo.toLowerCase()}`, 400)
    }
  }
  if (typeof dados.nome !== 'string' || !dados.nome.trim() || dados.nome.trim().length > LIMITE_NOME) {
    throw new AppError(`Nome é obrigatório (até ${LIMITE_NOME} caracteres)`, 400)
  }
  if (typeof dados.descricao !== 'string' || dados.descricao.length > LIMITE_DESCRICAO) {
    throw new AppError(`Descrição deve ter até ${LIMITE_DESCRICAO} caracteres`, 400)
  }
  if (dados.favorito !== undefined && typeof dados.favorito !== 'boolean') {
    throw new AppError('Favorito deve ser true ou false', 400)
  }
  if (tipo === 'RITUAL') {
    if (!inteiroEntre(dados.circulo, 1, 4)) throw new AppError('Círculo do ritual deve ser de 1 a 4', 400)
    if (!ELEMENTOS.includes(dados.elemento as never)) {
      throw new AppError(`Elemento inválido — use um de: ${ELEMENTOS.join(', ')}`, 400)
    }
  }
  if (tipo === 'PODER' && dados.preRequisito != null &&
      (typeof dados.preRequisito !== 'string' || dados.preRequisito.length > LIMITE_PRE_REQUISITO)) {
    throw new AppError(`Pré-requisito deve ter até ${LIMITE_PRE_REQUISITO} caracteres`, 400)
  }
  if (tipo === 'EQUIPAMENTO') {
    if (!inteiroEntre(dados.categoria, 0, 4)) throw new AppError('Categoria do equipamento deve ser de 0 a IV', 400)
    if (!inteiroEntre(dados.espacos, 0, 99)) throw new AppError('Espaços deve ser um inteiro de 0 a 99', 400)
    validarArma(dados)
  }
}

function validarArma(dados: DadosEntrada) {
  if (vazio(dados.tipoArma)) {
    const sobra = CAMPOS_ARMA.find((campo) => !vazio(dados[campo]))
    if (sobra) throw new AppError(`Campo "${sobra}" só vale para arma — escolha o tipo de arma`, 400)
    return
  }
  if (!TIPOS_ARMA.includes(dados.tipoArma as never)) {
    throw new AppError(`Tipo de arma inválido — use um de: ${TIPOS_ARMA.join(', ')}`, 400)
  }
  validarExpressao('Dano', dados.dano, true)
  validarExpressao('Dano extra', dados.danoExtra, false)
  if (!vazio(dados.bonusAtaque) && !inteiroEntre(dados.bonusAtaque, -LIMITE_BONUS_ATAQUE, LIMITE_BONUS_ATAQUE)) {
    throw new AppError(`Bônus de ataque deve ser um inteiro entre -${LIMITE_BONUS_ATAQUE} e ${LIMITE_BONUS_ATAQUE}`, 400)
  }
  if (!vazio(dados.margemAmeaca) && !inteiroEntre(dados.margemAmeaca, 2, 20)) {
    throw new AppError('Margem de ameaça deve ser um inteiro de 2 a 20', 400)
  }
  if (!vazio(dados.multiplicadorCritico) && !inteiroEntre(dados.multiplicadorCritico, 2, 10)) {
    throw new AppError('Multiplicador de crítico deve ser um inteiro de 2 a 10', 400)
  }
}

// Com a Força atual, o dano e o crítico ainda cabem no que se pode rolar (até 50 dados, 10 termos)?
function validarRolagensDaArma(ficha: FichaComRelacoes, gravaveis: CamposArma) {
  const arma = dadosArma(gravaveis)
  if (!arma) return
  const calculada = calcularArma(arma, ficha, testesDa(ficha))
  for (const [rotulo, expressao] of [['Dano', calculada.dano], ['Dano crítico', calculada.danoCritico]] as const) {
    try {
      lerExpressao(expressao)
    } catch (erro) {
      if (erro instanceof PedidoRolagemInvalido) throw new AppError(`${rotulo} (${expressao}): ${erro.message}`, 400)
      throw erro
    }
  }
}

function camposGravaveis(tipo: string, dados: DadosEntrada) {
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined)
  const arma = tipo === 'EQUIPAMENTO' && !vazio(dados.tipoArma)
  const numero = (v: unknown, padrao: number) => (arma ? (vazio(v) ? padrao : (v as number)) : null)
  return {
    // Arma: os padrões do livro (margem 20, x2, sem bônus) quando o campo vem vazio.
    tipoArma: arma ? (dados.tipoArma as (typeof TIPOS_ARMA)[number]) : null,
    dano: arma ? texto(dados.dano)! : null,
    danoExtra: arma ? texto(dados.danoExtra) || null : null,
    bonusAtaque: numero(dados.bonusAtaque, 0),
    margemAmeaca: numero(dados.margemAmeaca, 20),
    multiplicadorCritico: numero(dados.multiplicadorCritico, 2),
    nome: texto(dados.nome)!,
    descricao: texto(dados.descricao) ?? '',
    circulo: tipo === 'RITUAL' ? (dados.circulo as number) : null,
    elemento: tipo === 'RITUAL' ? (dados.elemento as never) : null,
    preRequisito: tipo === 'PODER' ? texto(dados.preRequisito) || null : null,
    categoria: tipo === 'EQUIPAMENTO' ? (dados.categoria as number) : null,
    espacos: tipo === 'EQUIPAMENTO' ? (dados.espacos as number) : null,
    // Na edição, `dados` já vem mesclado com o gravado: sem `favorito` no pedido, fica como estava.
    favorito: dados.favorito === true,
  }
}

async function fichaEditavel(fichaId: string, usuarioId: string) {
  const ficha = await buscarFichaInterna(fichaId, usuarioId)
  await garantirAutorizacaoEdicao(ficha, usuarioId)
  return ficha
}

async function entradaDaFicha(fichaId: string, entradaId: string) {
  const entrada = await prisma.fichaEntrada.findUnique({ where: { id: entradaId } })
  if (!entrada || entrada.fichaId !== fichaId) throw new AppError('Entrada não encontrada nesta ficha', 404)
  return entrada
}

export async function criarEntrada(fichaId: string, usuarioId: string, dados: DadosEntrada) {
  const ficha = await fichaEditavel(fichaId, usuarioId)
  const tipo = String(dados.tipo ?? '')
  const completos = { ...dados, descricao: dados.descricao ?? '' }
  validarEntrada(tipo, completos)
  const gravaveis = camposGravaveis(tipo, completos)
  validarRolagensDaArma(ficha, gravaveis)
  // A ficha inteira vai para a mesa a cada mudança: 100 entradas no tamanho máximo já são ~440 KB por clique.
  await criarNoLimite(fichaId, LIMITES.entradasPorFicha,
    `Esta ficha já tem ${LIMITES.entradasPorFicha} rituais, habilidades, poderes e equipamentos somados, o máximo. Apague um para cadastrar outro.`,
    (tx) => tx.fichaEntrada.count({ where: { fichaId } }),
    (tx) => tx.fichaEntrada.create({ data: { fichaId, tipo: tipo as never, ...gravaveis } }))
  return { ficha: await emitirFicha((await carregarFicha(fichaId))!) }
}

export async function atualizarEntrada(fichaId: string, entradaId: string, usuarioId: string, dados: DadosEntrada) {
  const ficha = await fichaEditavel(fichaId, usuarioId)
  const atual = await entradaDaFicha(fichaId, entradaId)
  if (dados.tipo !== undefined && dados.tipo !== atual.tipo) {
    throw new AppError('O tipo de uma entrada não pode ser trocado — apague e crie outra', 400)
  }
  // Campos ausentes mantêm o valor gravado (os de outro tipo estão null no banco);
  // campo do tipo errado enviado em `dados` sobrescreve o null e é rejeitado.
  // Deixar de ser arma (`tipoArma: null`) limpa o resto da arma; mandar um campo de arma junto ainda é recusado.
  const base = dados.tipoArma === null ? { ...atual, ...Object.fromEntries(CAMPOS_ARMA.map((campo) => [campo, null])) } : atual
  const mesclados: DadosEntrada = { ...base, ...dados }
  validarEntrada(atual.tipo, mesclados)
  const gravaveis = camposGravaveis(atual.tipo, mesclados)
  validarRolagensDaArma(ficha, gravaveis)
  await prisma.fichaEntrada.update({ where: { id: entradaId }, data: gravaveis })
  return { ficha: await emitirFicha((await carregarFicha(fichaId))!) }
}

export async function removerEntrada(fichaId: string, entradaId: string, usuarioId: string) {
  await fichaEditavel(fichaId, usuarioId)
  await entradaDaFicha(fichaId, entradaId)
  await prisma.fichaEntrada.delete({ where: { id: entradaId } })
  return { ficha: await emitirFicha((await carregarFicha(fichaId))!) }
}
