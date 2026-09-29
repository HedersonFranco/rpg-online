import type { Request, Response } from 'express'
import * as salaService from './sala.service.js'
import { ocultarConvite } from '../../engine/convite.js'

export async function criarController(req: Request, res: Response) {
  const { nome, sistema } = req.body ?? {}
  const sala = await salaService.criarSala(req.usuarioId!, nome, sistema)
  res.status(201).json(sala)
}

export async function listarController(req: Request, res: Response) {
  const salas = await salaService.listarSalasDoUsuario(req.usuarioId!)
  res.json(salas.map((sala) => ocultarConvite(sala, req.usuarioId!)))
}

export async function buscarController(req: Request, res: Response) {
  const sala = await salaService.buscarSalaOuFalhar(req.params.id!, req.usuarioId!)
  res.json(ocultarConvite(sala, req.usuarioId!))
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
  res.status(201).json({ ...resultado, sala: ocultarConvite(resultado.sala, req.usuarioId!) })
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

// DELETE /salas/:id/membros/:membroId?banir=1 — expulsar (ou banir, com ?banir=1).
export async function removerMembroController(req: Request, res: Response) {
  const banir = req.query.banir === '1' || req.query.banir === 'true'
  await salaService.removerMembro(req.params.id!, req.params.membroId!, req.usuarioId!, banir)
  res.status(204).send()
}

export async function listarBanidosController(req: Request, res: Response) {
  res.json(await salaService.listarBanidos(req.params.id!, req.usuarioId!))
}

export async function desbanirController(req: Request, res: Response) {
  await salaService.desbanir(req.params.id!, req.params.usuarioId!, req.usuarioId!)
  res.status(204).send()
}
