import type { Request, Response } from 'express'
import * as fichaService from './ficha.service.js'

export async function criarController(req: Request<{ id: string }>, res: Response) {
  const resultado = await fichaService.criarFicha(req.usuarioId!, req.params.id, req.body ?? {})
  res.status(201).json(resultado)
}

export async function listarController(req: Request<{ id: string }>, res: Response) {
  const fichas = await fichaService.listarFichasDaSala(req.params.id, req.usuarioId!)
  res.json(fichas)
}

export async function buscarController(req: Request<{ id: string }>, res: Response) {
  const ficha = await fichaService.buscarFichaOuFalhar(req.params.id, req.usuarioId!)
  res.json(ficha)
}

export async function atualizarController(req: Request<{ id: string }>, res: Response) {
  const resultado = await fichaService.atualizarFicha(req.params.id, req.usuarioId!, req.body ?? {})
  res.json(resultado)
}

export async function removerController(req: Request<{ id: string }>, res: Response) {
  await fichaService.removerFicha(req.params.id, req.usuarioId!)
  res.status(204).send()
}

export async function treinarPericiaController(req: Request<{ id: string }>, res: Response) {
  const { nome, nivel } = req.body ?? {}
  res.json(await fichaService.treinarPericia(req.params.id, req.usuarioId!, nome, nivel))
}

export async function criarEntradaController(req: Request<{ id: string }>, res: Response) {
  res.status(201).json(await fichaService.criarEntrada(req.params.id, req.usuarioId!, req.body ?? {}))
}

export async function atualizarEntradaController(req: Request<{ id: string; entradaId: string }>, res: Response) {
  res.json(await fichaService.atualizarEntrada(req.params.id, req.params.entradaId, req.usuarioId!, req.body ?? {}))
}

export async function removerEntradaController(req: Request<{ id: string; entradaId: string }>, res: Response) {
  res.json(await fichaService.removerEntrada(req.params.id, req.params.entradaId, req.usuarioId!))
}
