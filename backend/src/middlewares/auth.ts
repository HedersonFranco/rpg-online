import type { NextFunction, Request, Response } from 'express'
import { verificarToken } from '../lib/jwt.js'
import { AppError } from '../errors/AppError.js'

declare global {
  namespace Express {
    interface Request {
      usuarioId?: string
    }
  }
}

export function autenticar(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Token de autenticação ausente', 401)
  }

  const token = header.slice('Bearer '.length)

  try {
    const payload = verificarToken(token)
    req.usuarioId = payload.usuarioId
    next()
  } catch {
    throw new AppError('Token de autenticação inválido ou expirado', 401)
  }
}
