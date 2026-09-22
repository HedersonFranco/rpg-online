import { Router } from 'express'
import { autenticar } from '../../middlewares/auth.js'
import {
  buscarController,
  criarController,
  deletarController,
  entrarController,
  listarController,
  promoverMembroController,
  regenerarConviteController,
} from './sala.controller.js'

export const salaRoutes = Router()

salaRoutes.use(autenticar)

salaRoutes.post('/', criarController)
salaRoutes.get('/', listarController)
// Rota estática precisa vir antes de '/:id' pra não ser capturada como :id.
salaRoutes.post('/entrar', entrarController)
salaRoutes.get('/:id', buscarController)
salaRoutes.delete('/:id', deletarController)
salaRoutes.post('/:id/convite', regenerarConviteController)
salaRoutes.patch('/:id/membros/:membroId', promoverMembroController)
