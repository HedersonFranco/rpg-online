import { Router } from 'express'
import { autenticar } from '../../middlewares/auth.js'
import { criarTokenController, deletarController, deletarTokenController } from './mapa.controller.js'

// Upload, listagem e mapa ativo ficam em sala.routes.ts (/salas/:id/...).
export const mapaRoutes = Router()
mapaRoutes.use(autenticar)
mapaRoutes.delete('/:id', deletarController)
mapaRoutes.post('/:id/tokens', criarTokenController)

export const tokenRoutes = Router()
tokenRoutes.use(autenticar)
tokenRoutes.delete('/:id', deletarTokenController)
