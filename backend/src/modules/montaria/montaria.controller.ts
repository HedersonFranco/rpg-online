import type { NextFunction, Request, Response } from 'express'
import { buscarSalaOuFalhar } from '../sala/sala.service.js'
import * as montariaService from './montaria.service.js'

// Antes do upload: só membro da mesa chega a mandar o arquivo para a memória do servidor.
export async function exigirMembro(req: Request, _res: Response, next: NextFunction) {
  await buscarSalaOuFalhar(req.params.id as string, req.usuarioId!)
  next()
}

export async function listarController(req: Request, res: Response) {
  res.json(await montariaService.listarMontarias(req.params.id as string, req.usuarioId!))
}

export async function criarController(req: Request, res: Response) {
  res.status(201).json(await montariaService.criarMontaria(req.usuarioId!, req.params.id as string, req.body?.nome, req.file))
}

export async function apagarController(req: Request, res: Response) {
  await montariaService.apagarMontaria(req.usuarioId!, req.params.id as string)
  res.status(204).send()
}

export async function porNoMapaController(req: Request, res: Response) {
  res.status(201).json(await montariaService.porMontariaNoMapa(req.usuarioId!, req.params.id as string, req.body ?? {}))
}
