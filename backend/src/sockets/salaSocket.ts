import { randomUUID } from 'node:crypto'
import type { Socket } from 'socket.io'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../errors/AppError.js'
import { buscarSalaOuFalhar, garantirMestre } from '../modules/sala/sala.service.js'
import { criarMensagem } from '../modules/mensagem/mensagem.service.js'
import { avancarTurno, criarCombate, podeEncerrarTurno } from '../engine/combate.js'
import { PedidoRolagemInvalido, rolar } from '../engine/rolagem.js'
import { combates, estadoDaSala, nomeSalaSocket, ultimasRolagens, type Rolagem } from './estado.js'

type Ack = (resposta: Record<string, unknown>) => void

// Todo evento responde por ack: { ok: true, ...dados } ou { ok: false, erro }.
// AppError vira mensagem pro usuário; qualquer outra coisa é logada e vira "erro interno".
function tratar(fn: (dados: Record<string, unknown>) => Promise<Record<string, unknown> | void>) {
  return async (dadosOuAck: unknown, talvezAck?: unknown) => {
    const ack = (typeof dadosOuAck === 'function' ? dadosOuAck : talvezAck) as Ack | undefined
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

type NovoParticipante = { tipo?: unknown; refId?: unknown; iniciativa?: unknown }

export function registrarEventosDaSala(socket: Socket) {
  const usuarioId = socket.data.usuarioId as string

  function salaAtual(): string {
    const salaId = socket.data.salaId as string | undefined
    if (!salaId) throw new AppError('Entre na sala antes', 400)
    return salaId
  }

  const emitir = (salaId: string, evento: string, dados: unknown) =>
    socket.nsp.to(nomeSalaSocket(salaId)).emit(evento, dados)

  socket.on('sala:entrar', tratar(async ({ salaId }) => {
    if (typeof salaId !== 'string') throw new AppError('salaId é obrigatório', 400)
    const sala = await buscarSalaOuFalhar(salaId, usuarioId)

    const anterior = socket.data.salaId as string | undefined
    if (anterior && anterior !== salaId) await socket.leave(nomeSalaSocket(anterior))
    await socket.join(nomeSalaSocket(salaId))
    socket.data.salaId = salaId
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

  // O servidor rola (ninguém escolhe o próprio resultado). Não persiste — só a última fica em memória.
  socket.on('rolagem:rolar', tratar(async (pedido) => {
    const salaId = salaAtual()
    let resultado
    try {
      resultado = rolar(pedido as Parameters<typeof rolar>[0])
    } catch (erro) {
      if (erro instanceof PedidoRolagemInvalido) throw new AppError(erro.message, 400)
      throw erro
    }
    const rolagem: Rolagem = {
      ...resultado,
      id: randomUUID(),
      autor: { id: usuarioId, nome: socket.data.nome as string },
      criadoEm: new Date().toISOString(),
    }
    ultimasRolagens.set(salaId, rolagem)
    emitir(salaId, 'rolagem:resultado', rolagem)
    return { rolagem }
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
      const origem = p.tipo === 'FICHA' ? fichas.find((f) => f.id === refId) : npcs.find((n) => n.id === refId)
      if (!origem) throw new AppError('Participante não encontrado nesta sala', 400)
      const n = (repeticoes.get(refId) ?? 0) + 1
      repeticoes.set(refId, n)
      const nome = (totalPorRef.get(refId) ?? 1) > 1 ? `${origem.nome} ${n}` : origem.nome
      return {
        nome,
        iniciativa: p.iniciativa as number,
        tipo: p.tipo as 'FICHA' | 'NPC',
        refId,
        usuarioId: 'usuario_id' in origem ? origem.usuario_id : null,
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

  socket.on('turno:finalizar', tratar(async () => {
    const salaId = salaAtual()
    await garantirMestre(salaId, usuarioId)
    combates.delete(salaId)
    emitir(salaId, 'turno:estado', { combate: null })
    return { combate: null }
  }))
}
