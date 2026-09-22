import { Router } from 'express'
import { autenticar } from '../../middlewares/auth.js'
import { atualizarController, buscarController, deletarController } from './npc.controller.js'

// Criação fica em sala.routes.ts (/salas/:id/npcs); listagem é a biblioteca.
export const npcRoutes = Router()

npcRoutes.use(autenticar)

npcRoutes.get('/:id', buscarController)
npcRoutes.patch('/:id', atualizarController)
npcRoutes.delete('/:id', deletarController)
