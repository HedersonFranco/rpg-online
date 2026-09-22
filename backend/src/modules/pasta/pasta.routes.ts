import { Router } from 'express'
import { autenticar } from '../../middlewares/auth.js'
import { atualizarController, deletarController } from './pasta.controller.js'

// Criação e listagem (biblioteca) ficam em sala.routes.ts (/salas/:id/...).
export const pastaRoutes = Router()

pastaRoutes.use(autenticar)

pastaRoutes.patch('/:id', atualizarController)
pastaRoutes.delete('/:id', deletarController)
