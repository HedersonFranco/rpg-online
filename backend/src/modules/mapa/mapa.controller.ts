import type { Request, Response } from 'express'
import * as mapaService from './mapa.service.js'

export async function criarController(req: Request, res: Response) {
  const mapa = await mapaService.criarMapa(req.usuarioId!, req.params.id!, req.body?.nome, req.file)
  res.status(201).json(mapa)
}

export async function listarController(req: Request, res: Response) {
  res.json(await mapaService.listarMapas(req.usuarioId!, req.params.id!))
}

export async function buscarAtivoController(req: Request, res: Response) {
  res.json(await mapaService.buscarMapaAtivo(req.usuarioId!, req.params.id!))
}

export async function definirAtivoController(req: Request, res: Response) {
  res.json(await mapaService.definirMapaAtivo(req.usuarioId!, req.params.id!, req.body?.mapaId ?? null))
}

export async function deletarController(req: Request, res: Response) {
  await mapaService.deletarMapa(req.usuarioId!, req.params.id!)
  res.status(204).send()
}

export async function criarTokenController(req: Request, res: Response) {
  const token = await mapaService.criarToken(req.usuarioId!, req.params.id!, req.body ?? {})
  res.status(201).json(token)
}

export async function deletarTokenController(req: Request, res: Response) {
  await mapaService.deletarToken(req.usuarioId!, req.params.id!)
  res.status(204).send()
}
