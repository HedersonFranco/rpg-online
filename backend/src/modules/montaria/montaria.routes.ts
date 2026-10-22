import { Router } from 'express'
import { autenticar } from '../../middlewares/auth.js'
import { apagarController, porNoMapaController } from './montaria.controller.js'

// Listagem e criação ficam em sala.routes.ts (/salas/:id/montarias), pois dependem do salaId.
export const montariaRoutes = Router()

montariaRoutes.use(autenticar)

montariaRoutes.delete('/:id', apagarController)
montariaRoutes.post('/:id/token', porNoMapaController)
