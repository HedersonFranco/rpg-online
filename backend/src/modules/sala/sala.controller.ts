import type { Request, Response } from 'express'
import * as salaService from './sala.service.js'

export async function criarController(req: Request, res: Response) {
  const { nome, sistema } = req.body ?? {}
  const sala = await salaService.criarSala(req.usuarioId!, nome, sistema)
  res.status(201).json(sala)
}

export async function listarController(req: Request, res: Response) {
  const salas = await salaService.listarSalasDoUsuario(req.usuarioId!)
  res.json(salas)
}

export async function buscarController(req: Request, res: Response) {
  const sala = await salaService.buscarSalaOuFalhar(req.params.id!, req.usuarioId!)
  res.json(sala)
}

export async function deletarController(req: Request, res: Response) {
  await salaService.deletarSala(req.params.id!, req.usuarioId!)
  res.status(204).send()
}

export async function regenerarConviteController(req: Request, res: Response) {
  const convite = await salaService.regenerarConvite(req.params.id!, req.usuarioId!)
  res.json(convite)
}

export async function entrarController(req: Request, res: Response) {
  const { token } = req.body ?? {}
  const resultado = await salaService.entrarComConvite(req.usuarioId!, token)
  res.status(201).json(resultado)
}

export async function promoverMembroController(req: Request, res: Response) {
  const { papel } = req.body ?? {}
  const membro = await salaService.promoverMembro(
    req.params.id!,
    req.params.membroId!,
    req.usuarioId!,
    papel,
  )
  res.json(membro)
}
