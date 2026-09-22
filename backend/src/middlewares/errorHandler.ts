import type { NextFunction, Request, Response } from 'express'
import { MulterError } from 'multer'
import { AppError } from '../errors/AppError.js'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'Arquivo muito grande — o limite para mapas é 10MB.' })
    } else {
      res.status(400).json({ error: 'Envie um único arquivo de imagem no campo "imagem".' })
    }
    return
  }

  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
}
