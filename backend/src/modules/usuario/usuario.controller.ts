import type { Request, Response } from 'express'
import * as usuarioService from './usuario.service.js'

export async function cadastrarController(req: Request, res: Response) {
  const { nome, email, senha } = req.body ?? {}
  const resultado = await usuarioService.cadastrar(nome, email, senha)
  res.status(201).json(resultado)
}

export async function loginController(req: Request, res: Response) {
  const { email, senha } = req.body ?? {}
  const resultado = await usuarioService.login(email, senha)
  res.json(resultado)
}

export async function meController(req: Request, res: Response) {
  const usuario = await usuarioService.buscarPorId(req.usuarioId!)
  res.json(usuario)
}
