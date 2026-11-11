import type { NextFunction, Request, Response } from 'express'
import * as npcService from './npc.service.js'

export async function antesDoUploadDeAvatar(req: Request<{ id: string }>, _res: Response, next: NextFunction) {
  await npcService.garantirMestreDoNpc(req.usuarioId!, req.params.id)
  next()
}

export async function trocarAvatarController(req: Request<{ id: string }>, res: Response) {
  res.json(await npcService.trocarAvatarNpc(req.usuarioId!, req.params.id, req.file))
}

export async function removerAvatarController(req: Request<{ id: string }>, res: Response) {
  res.json(await npcService.removerAvatarNpc(req.usuarioId!, req.params.id))
}

export async function criarController(req: Request<{ id: string }>, res: Response) {
  const npc = await npcService.criarNpc(req.usuarioId!, req.params.id, req.body ?? {})
  res.status(201).json(npc)
}

export async function listarController(req: Request<{ id: string }>, res: Response) {
  const npcs = await npcService.listarNpcs(req.usuarioId!, req.params.id)
  res.json(npcs)
}

export async function buscarController(req: Request<{ id: string }>, res: Response) {
  const npc = await npcService.buscarNpc(req.usuarioId!, req.params.id)
  res.json(npc)
}

export async function atualizarController(req: Request<{ id: string }>, res: Response) {
  const npc = await npcService.atualizarNpc(req.usuarioId!, req.params.id, req.body ?? {})
  res.json(npc)
}

export async function deletarController(req: Request<{ id: string }>, res: Response) {
  await npcService.deletarNpc(req.usuarioId!, req.params.id)
  res.status(204).send()
}
