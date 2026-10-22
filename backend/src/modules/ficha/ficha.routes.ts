import { Router } from 'express'
import { autenticar } from '../../middlewares/auth.js'
import {
  atualizarController,
  atualizarEntradaController,
  buscarController,
  criarEntradaController,
  removerController,
  removerEntradaController,
  treinarPericiaController,
} from './ficha.controller.js'

// Rotas "achatadas" (/fichas/:id) — a criação e listagem por sala ficam
// aninhadas em sala.routes.ts (/salas/:id/fichas), pois dependem do salaId.
export const fichaRoutes = Router()

fichaRoutes.use(autenticar)

fichaRoutes.get('/:id', buscarController)
fichaRoutes.patch('/:id', atualizarController)
fichaRoutes.delete('/:id', removerController)
fichaRoutes.post('/:id/pericias', treinarPericiaController)
fichaRoutes.post('/:id/entradas', criarEntradaController)
fichaRoutes.patch('/:id/entradas/:entradaId', atualizarEntradaController)
fichaRoutes.delete('/:id/entradas/:entradaId', removerEntradaController)
