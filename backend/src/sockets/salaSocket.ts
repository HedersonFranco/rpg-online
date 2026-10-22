import { randomUUID } from 'node:crypto'
import type { Socket } from 'socket.io'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../errors/AppError.js'
import { buscarSalaOuFalhar, garantirMestre } from '../modules/sala/sala.service.js'
import { criarMensagem } from '../modules/mensagem/mensagem.service.js'
import { avancarTurno, criarCombate, podeEncerrarTurno } from '../engine/combate.js'
import type { PedidoDeTeste } from '../engine/calculoFicha.js'
import { PedidoRolagemInvalido, rolar, rolarExpressao, type ResultadoExpressao, type ResultadoRolagem } from '../engine/rolagem.js'
import { montarIniciativas, montarTesteDaFicha } from '../modules/ficha/ficha.service.js'
import { coordenadaValida, escalaValida, podeEscalarToken, podeMoverToken, salvarEscalaToken, salvarPosicaoToken } from '../modules/mapa/mapa.service.js'
import { combates, estadoDaSala, nomeSalaSocket, ultimasRolagens, type Rolagem } from './estado.js'

type Ack = (resposta: Record<string, unknown>) => void

// Todo evento responde por ack: { ok: true, ...dados } ou { ok: false, erro }.
// AppError vira mensagem pro usuário; qualquer outra coisa é logada e vira "erro interno".
export function tratar(fn: (dados: Record<string, unknown>) => Promise<Record<string, unknown> | void>) {
  return async (dadosOuAck: unknown, talvezAck?: unknown) => {
    // Só função vira ack: chamar outra coisa lançaria dentro do catch, e a rejeição solta derrubaria o processo.
    const ack = [dadosOuAck, talvezAck].find((a) => typeof a === 'function') as Ack | undefined
    const dados = (typeof dadosOuAck === 'object' && dadosOuAck !== null ? dadosOuAck : {}) as Record<string, unknown>
    try {
      const resultado = await fn(dados)
      ack?.({ ok: true, ...(resultado ?? {}) })
    } catch (erro) {
      if (erro instanceof AppError) {
        ack?.({ ok: false, erro: erro.message, status: erro.statusCode })
      } else {
        console.error(erro)
        ack?.({ ok: false, erro: 'Erro interno do servidor', status: 500 })
      }
    }
  }
}

type ResultadoRolagemBase = ResultadoRolagem | ResultadoExpressao

// Rolagem da ficha: o rótulo por extenso ("Investigação · Franco", para o título e o leitor de tela) e o
// resumo do bilhete compacto. d20 = quantos dados; -1 quando o atributo é 0 (rola dois e fica com o pior).
function daFicha(pedido: PedidoDeTeste, ficha: string): Pick<Rolagem, 'rotulo' | 'teste'> {
  return {
    rotulo: `${pedido.nomeTeste} · ${ficha}`,
    teste: { sigla: pedido.sigla, atributo: pedido.atributo, ficha, d20: pedido.modo === 'menor' ? -1 : pedido.quantidade, bonus: pedido.modificador },
  }
}

// Frases do aviso de rolagem secreta do mestre, escritas pelo Hederson. Para ter mais, é só acrescentar aqui
// — com texto próprio: a Licença da Comunidade não aceita texto gerado por IA em conteúdo comercial.
const FRASES_ROLAGEM_SECRETA = ['O mestre rolou dados.', 'O mundo está testando a sorte.']
const sortearFrase = () => FRASES_ROLAGEM_SECRETA[Math.floor(Math.random() * FRASES_ROLAGEM_SECRETA.length)]!

async function idsDosMestres(salaId: string) {
  const mestres = await prisma.membroSala.findMany({ where: { salaId, papel: 'MESTRE' }, select: { usuarioId: true } })
  return new Set(mestres.map((m) => m.usuarioId))
}

type NovoParticipante ={ tipo?: unknown; refId?: unknown; iniciativa?: unknown }

export function registrarEventosDaSala(socket: Socket) {
  const usuarioId = socket.data.usuarioId as string

  function salaAtual(): string {
    const salaId = socket.data.salaId as string | undefined
    if (!salaId) throw new AppError('Entre na sala antes', 400)
    return salaId
  }

  const emitir = (salaId: string, evento: string, dados: unknown) =>
    socket.nsp.to(nomeSalaSocket(salaId)).emit(evento, dados)

  // Arrastar gera ~30 eventos/s: a permissão por token é consultada uma vez e guardada.
  const permissaoToken = new Map<string, boolean>()
  const permissaoEscala = new Map<string, boolean>()

  async function transmitirParticipantesVideo(salaId: string) {
    const sockets = await socket.nsp.in(nomeSalaSocket(salaId)).fetchSockets()
    const participantes = sockets
      .filter((s) => s.data.video)
      .map((s) => ({
        usuarioId: s.data.usuarioId as string,
        nome: s.data.nome as string,
        peerId: s.data.video.peerId as string,
        temCamera: s.data.video.temCamera as boolean,
      }))
    emitir(salaId, 'video:participantes', { participantes })
  }

  socket.on('sala:entrar', tratar(async ({ salaId }) => {
    if (typeof salaId !== 'string') throw new AppError('salaId é obrigatório', 400)
    const sala = await buscarSalaOuFalhar(salaId, usuarioId)

    const anterior = socket.data.salaId as string | undefined
    if (anterior && anterior !== salaId) await socket.leave(nomeSalaSocket(anterior))
    await socket.join(nomeSalaSocket(salaId))
    socket.data.salaId = salaId
    permissaoToken.clear()
    permissaoEscala.clear()
    socket.data.nome = sala.membros.find((m) => m.usuarioId === usuarioId)?.usuario.nome ?? 'Alguém'

    return estadoDaSala(salaId)
  }))

  // Pedido explícito de estado (reconexão, ou quando o cliente desconfia que perdeu algo).
  socket.on('turno:estadoSolicitado', tratar(async () => estadoDaSala(salaAtual())))

  socket.on('chat:enviar', tratar(async ({ conteudo }) => {
    const salaId = salaAtual()
    const mensagem = await criarMensagem(usuarioId, salaId, conteudo)
    emitir(salaId, 'chat:mensagem', mensagem)
    return { mensagem }
  }))

  // O servidor rola (ninguém escolhe o próprio resultado). Não persiste — só a última rolagem aberta fica em
  // memória. `origem` diz o que foi rolado quando vem da ficha (ver daFicha). Rolagem do mestre é segredo: só
  // os mestres recebem o resultado e, com `avisar`, os jogadores recebem uma frase sem o número.
  // `aberta` = vai para todos mesmo vindo do mestre (a Iniciativa das fichas dos jogadores).
  async function publicarRolagem(
    salaId: string,
    rolarAgora: () => ResultadoRolagemBase,
    { origem, avisar = false, aberta = false }: { origem?: Pick<Rolagem, 'rotulo' | 'teste'>; avisar?: boolean; aberta?: boolean } = {},
  ) {
    let resultado
    try {
      resultado = rolarAgora()
    } catch (erro) {
      if (erro instanceof PedidoRolagemInvalido) throw new AppError(erro.message, 400)
      throw erro
    }
    const mestres = aberta ? null : await idsDosMestres(salaId)
    const secreta = mestres?.has(usuarioId) ?? false
    const rolagem: Rolagem = {
      ...resultado,
      ...origem,
      ...(secreta ? { secreta: true as const } : {}),
      id: randomUUID(),
      autor: { id: usuarioId, nome: socket.data.nome as string },
      criadoEm: new Date().toISOString(),
    }
    if (!secreta) {
      ultimasRolagens.set(salaId, rolagem)
      emitir(salaId, 'rolagem:resultado', rolagem)
      return rolagem
    }
    const aviso = avisar ? { id: rolagem.id, frase: sortearFrase(), criadoEm: rolagem.criadoEm } : null
    for (const s of await socket.nsp.in(nomeSalaSocket(salaId)).fetchSockets()) {
      if (mestres!.has(s.data.usuarioId as string)) s.emit('rolagem:resultado', rolagem)
      else if (aviso) s.emit('rolagem:aviso', aviso)
    }
    return rolagem
  }

  // Painel de rolagem: N dados de um tipo (com modo) ou uma expressão livre de dano ("2d6+1d8+3").
  socket.on('rolagem:rolar', tratar(async (pedido) => {
    const salaId = salaAtual()
    const rolagem = await publicarRolagem(salaId, () =>
      pedido.expressao !== undefined ? rolarExpressao(pedido.expressao) : rolar(pedido as Parameters<typeof rolar>[0]),
    { avisar: pedido.avisar === true })
    return { rolagem }
  }))

  // Teste de perícia ou atributo, montado no servidor a partir da ficha.
  socket.on('rolagem:teste', tratar(async (dados) => {
    const salaId = salaAtual()
    const { pedido, fichaNome } = await montarTesteDaFicha(salaId, usuarioId, dados)
    return { rolagem: await publicarRolagem(salaId, () => rolar(pedido), { origem: daFicha(pedido, fichaNome), avisar: dados.avisar === true }) }
  }))

  // Mestre: rola a Iniciativa das fichas escolhidas. Cada rolagem vai pra mesa toda, mesmo vindo do mestre
  // (transparência: são os personagens dos jogadores); os totais voltam no ack pra preencher o
  // "Iniciar combate" — o mestre ainda pode ajustar.
  socket.on('turno:rolarIniciativa', tratar(async ({ fichaIds }) => {
    const salaId = salaAtual()
    await garantirMestre(salaId, usuarioId)
    const iniciativas: Record<string, number> = {}
    for (const { fichaId, fichaNome, pedido } of await montarIniciativas(salaId, fichaIds)) {
      iniciativas[fichaId] = (await publicarRolagem(salaId, () => rolar(pedido), { origem: daFicha(pedido, fichaNome), aberta: true })).total
    }
    return { iniciativas }
  }))

  socket.on('turno:iniciar', tratar(async ({ participantes }) => {
    const salaId = salaAtual()
    await garantirMestre(salaId, usuarioId)

    if (!Array.isArray(participantes) || participantes.length === 0 || participantes.length > 50) {
      throw new AppError('Informe de 1 a 50 participantes', 400)
    }
    const lista = participantes as NovoParticipante[]
    for (const p of lista) {
      if ((p.tipo !== 'FICHA' && p.tipo !== 'NPC') || typeof p.refId !== 'string' || !Number.isInteger(p.iniciativa)) {
        throw new AppError('Cada participante precisa de tipo (FICHA ou NPC), refId e iniciativa inteira', 400)
      }
    }

    const idsDe = (tipo: string) => lista.filter((p) => p.tipo === tipo).map((p) => p.refId as string)
    const [fichas, npcs] = await Promise.all([
      prisma.ficha.findMany({ where: { salaId, id: { in: idsDe('FICHA') } }, select: { id: true, nome: true, usuario_id: true } }),
      prisma.npc.findMany({ where: { salaId, id: { in: idsDe('NPC') } }, select: { id: true, nome: true } }),
    ])

    // O mesmo NPC pode entrar várias vezes (três zumbis): numera pra fila não ficar ambígua.
    const repeticoes = new Map<string, number>()
    const totalPorRef = new Map<string, number>()
    for (const p of lista) totalPorRef.set(p.refId as string, (totalPorRef.get(p.refId as string) ?? 0) + 1)

    const novos = lista.map((p) => {
      const refId = p.refId as string
      const ficha = p.tipo === 'FICHA' ? fichas.find((f) => f.id === refId) : undefined
      const origem = ficha ?? (p.tipo === 'NPC' ? npcs.find((n) => n.id === refId) : undefined)
      if (!origem) throw new AppError('Participante não encontrado nesta sala', 400)
      const n = (repeticoes.get(refId) ?? 0) + 1
      repeticoes.set(refId, n)
      const nome = (totalPorRef.get(refId) ?? 1) > 1 ? `${origem.nome} ${n}` : origem.nome
      return {
        nome,
        iniciativa: p.iniciativa as number,
        tipo: p.tipo as 'FICHA' | 'NPC',
        refId,
        usuarioId: ficha?.usuario_id ?? null,
      }
    })

    const combate = criarCombate(novos)
    combates.set(salaId, combate)
    emitir(salaId, 'turno:estado', { combate })
    return { combate }
  }))

  // indiceAtivo/rodada esperados evitam que dois cliques simultâneos (jogador + mestre) pulem um turno.
  socket.on('turno:encerrar', tratar(async ({ indiceAtivo, rodada }) => {
    const salaId = salaAtual()
    const combate = combates.get(salaId)
    if (!combate) throw new AppError('Nenhum combate em andamento', 400)

    const membro = await prisma.membroSala.findUnique({ where: { usuarioId_salaId: { usuarioId, salaId } } })
    if (!podeEncerrarTurno(combate, usuarioId, membro?.papel === 'MESTRE')) {
      throw new AppError('Só o jogador da vez ou o mestre podem encerrar o turno', 403)
    }
    if (indiceAtivo !== combate.indiceAtivo || rodada !== combate.rodada) {
      throw new AppError('O turno já avançou — a tela foi atualizada', 409)
    }

    const proximo = avancarTurno(combate)
    combates.set(salaId, proximo)
    emitir(salaId, 'turno:estado', { combate: proximo })
    return { combate: proximo }
  }))

  // Durante o arrasto só distribui (volátil, sem gravar); ao soltar (final) grava no banco.
  // socket.to() exclui quem arrastou — a tela dele já mostra a posição.
  socket.on('token:mover', tratar(async ({ tokenId, x, y, final }) => {
    const salaId = salaAtual()
    if (typeof tokenId !== 'string' || !coordenadaValida(x) || !coordenadaValida(y)) {
      throw new AppError('Movimento inválido', 400)
    }
    let pode = permissaoToken.get(tokenId)
    if (pode === undefined) {
      pode = await podeMoverToken(usuarioId, salaId, tokenId)
      permissaoToken.set(tokenId, pode)
    }
    if (!pode) throw new AppError('Você só pode mover o token da sua ficha', 403)

    socket.to(nomeSalaSocket(salaId)).emit('token:movido', { tokenId, x, y })
    if (final === true) await salvarPosicaoToken(tokenId, x, y)
  }))

  // Tamanho da montaria (alça no canto, como no Owlbear): qualquer membro muda. Mesmo esquema do
  // token:mover — durante o arrasto só distribui; ao soltar (final) grava.
  socket.on('token:escalar', tratar(async ({ tokenId, escala, final }) => {
    const salaId = salaAtual()
    if (typeof tokenId !== 'string' || !escalaValida(escala)) throw new AppError('Tamanho inválido', 400)
    let pode = permissaoEscala.get(tokenId)
    if (pode === undefined) {
      pode = await podeEscalarToken(usuarioId, salaId, tokenId)
      permissaoEscala.set(tokenId, pode)
    }
    if (!pode) throw new AppError('Só montarias mudam de tamanho', 403)

    socket.to(nomeSalaSocket(salaId)).emit('token:escalado', { tokenId, escala })
    if (final === true) await salvarEscalaToken(tokenId, escala)
  }))

  // Presença de vídeo: cada aba anuncia seu id de peer (aleatório — o mesmo
  // usuário em duas abas não colide) e se tem câmera. A lista é da sala toda.
  socket.on('video:entrar', tratar(async ({ peerId, temCamera }) => {
    const salaId = salaAtual()
    if (typeof peerId !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(peerId)) {
      throw new AppError('peerId inválido', 400)
    }
    socket.data.video = { peerId, temCamera: temCamera === true }
    await transmitirParticipantesVideo(salaId)
  }))

  socket.on('video:sair', tratar(async () => {
    const salaId = salaAtual()
    socket.data.video = undefined
    await transmitirParticipantesVideo(salaId)
  }))

  // Botão "Reconectar" de quem recebe: pede a quem liga pra tentar de novo.
  socket.on('video:pedirReconexao', tratar(async ({ peerId }) => {
    const salaId = salaAtual()
    const sockets = await socket.nsp.in(nomeSalaSocket(salaId)).fetchSockets()
    const alvo = sockets.find((s) => s.data.video?.peerId === peerId)
    if (!alvo) throw new AppError('Esse participante não está mais no vídeo', 404)
    alvo.emit('video:reconexaoPedida', { peerId: socket.data.video?.peerId })
  }))

  socket.on('disconnect', () => {
    const salaId = socket.data.salaId as string | undefined
    if (salaId && socket.data.video) transmitirParticipantesVideo(salaId).catch(console.error)
  })

  socket.on('turno:finalizar', tratar(async () => {
    const salaId = salaAtual()
    await garantirMestre(salaId, usuarioId)
    combates.delete(salaId)
    emitir(salaId, 'turno:estado', { combate: null })
    return { combate: null }
  }))
}
