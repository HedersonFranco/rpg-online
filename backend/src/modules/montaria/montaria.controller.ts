import type { NextFunction, Request, Response } from 'express'
import * as montariaService from './montaria.service.js'

export async function antesDoUploadDeMontaria(req: Request<{ id: string }>, _res: Response, next: NextFunction) {
  await montariaService.garantirPodeEnviarMontaria(req.usuarioId!, req.params.id)
  next()
}

export async function listarController(req: Request<{ id: string }>, res: Response) {
  res.json(await montariaService.listarMontarias(req.params.id, req.usuarioId!))
}

export async function criarController(req: Request<{ id: string }>, res: Response) {
  res.status(201).json(await montariaService.criarMontaria(req.usuarioId!, req.params.id, req.body?.nome, req.file))
}

export async function apagarController(req: Request<{ id: string }>, res: Response) {
  await montariaService.apagarMontaria(req.usuarioId!, req.params.id)
  res.status(204).send()
}

export async function porNoMapaController(req: Request<{ id: string }>, res: Response) {
  res.status(201).json(await montariaService.porMontariaNoMapa(req.usuarioId!, req.params.id, req.body ?? {}))
}
