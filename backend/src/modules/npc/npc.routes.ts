import { Router } from 'express'
import { autenticar } from '../../middlewares/auth.js'
import { uploadAvatar } from '../../middlewares/upload.js'
import {
  antesDoUploadDeAvatar,
  atualizarController,
  buscarController,
  deletarController,
  removerAvatarController,
  trocarAvatarController,
} from './npc.controller.js'

// Criação fica em sala.routes.ts (/salas/:id/npcs); listagem é a biblioteca.
export const npcRoutes = Router()

npcRoutes.use(autenticar)

npcRoutes.get('/:id', buscarController)
npcRoutes.patch('/:id', atualizarController)
npcRoutes.delete('/:id', deletarController)
// Antes do upload, quem pode: só o mestre chega a mandar o arquivo.
npcRoutes.put('/:id/avatar', antesDoUploadDeAvatar, uploadAvatar, trocarAvatarController)
npcRoutes.delete('/:id/avatar', removerAvatarController)
