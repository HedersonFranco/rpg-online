import { Router } from 'express'
import { cadastrarController, loginController, meController } from './usuario.controller.js'
import { autenticar } from '../../middlewares/auth.js'
import { authRateLimiter } from '../../middlewares/rateLimit.js'

export const usuarioRoutes = Router()

usuarioRoutes.post('/cadastro', authRateLimiter, cadastrarController)
usuarioRoutes.post('/login', authRateLimiter, loginController)
usuarioRoutes.get('/me', autenticar, meController)
