import type { Request, Response } from 'express'
import * as pastaService from './pasta.service.js'

export async function criarController(req: Request, res: Response) {
  const { nome, paiId } = req.body ?? {}
  const pasta = await pastaService.criarPasta(req.usuarioId!, req.params.id!, nome, paiId)
  res.status(201).json(pasta)
}

export async function listarBibliotecaController(req: Request, res: Response) {
  const pastaId = typeof req.query.pastaId === 'string' ? req.query.pastaId : undefined
  const conteudo = await pastaService.listarBiblioteca(req.usuarioId!, req.params.id!, pastaId)
  res.json(conteudo)
}

export async function atualizarController(req: Request, res: Response) {
  const pasta = await pastaService.atualizarPasta(req.usuarioId!, req.params.id!, req.body ?? {})
  res.json(pasta)
}

export async function deletarController(req: Request, res: Response) {
  const resultado = await pastaService.deletarPasta(req.usuarioId!, req.params.id!)
  res.json(resultado)
}
