import type { Request, Response } from 'express'
import * as mensagemService from './mensagem.service.js'

export async function listarController(req: Request, res: Response) {
  const mensagens = await mensagemService.listarMensagens(req.usuarioId!, req.params.id!)
  res.json(mensagens)
}
