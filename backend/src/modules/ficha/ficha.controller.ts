import type { Request, Response } from 'express'
import * as fichaService from './ficha.service.js'

export async function criarController(req: Request, res: Response) {
  const resultado = await fichaService.criarFicha(req.usuarioId!, req.params.id!, req.body ?? {})
  res.status(201).json(resultado)
}

export async function listarController(req: Request, res: Response) {
  const fichas = await fichaService.listarFichasDaSala(req.params.id!, req.usuarioId!)
  res.json(fichas)
}

export async function buscarController(req: Request, res: Response) {
  const ficha = await fichaService.buscarFichaOuFalhar(req.params.id!, req.usuarioId!)
  res.json(ficha)
}

export async function atualizarController(req: Request, res: Response) {
  const resultado = await fichaService.atualizarFicha(req.params.id!, req.usuarioId!, req.body ?? {})
  res.json(resultado)
}

export async function treinarPericiaController(req: Request, res: Response) {
  const { nome, nivel } = req.body ?? {}
  const fichaPericia = await fichaService.treinarPericia(req.params.id!, req.usuarioId!, nome, nivel)
  res.json(fichaPericia)
}
