import type { Request, Response } from 'express'
import * as npcService from './npc.service.js'

export async function criarController(req: Request, res: Response) {
  const npc = await npcService.criarNpc(req.usuarioId!, req.params.id!, req.body ?? {})
  res.status(201).json(npc)
}

export async function buscarController(req: Request, res: Response) {
  const npc = await npcService.buscarNpc(req.usuarioId!, req.params.id!)
  res.json(npc)
}

export async function atualizarController(req: Request, res: Response) {
  const npc = await npcService.atualizarNpc(req.usuarioId!, req.params.id!, req.body ?? {})
  res.json(npc)
}

export async function deletarController(req: Request, res: Response) {
  await npcService.deletarNpc(req.usuarioId!, req.params.id!)
  res.status(204).send()
}
