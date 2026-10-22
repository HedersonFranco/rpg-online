import type { RequestHandler } from 'express'
import multer, { MulterError } from 'multer'
import { AppError } from '../errors/AppError.js'

// Requisito não funcional: mapa até 10MB. Acima disso o multer aborta e o
// errorHandler responde 413 com mensagem clara.
export const TAMANHO_MAXIMO_MAPA = 10 * 1024 * 1024
// Imagem de montaria: o mesmo teto do avatar (RNF10), 2MB.
export const TAMANHO_MAXIMO_IMAGEM = 2 * 1024 * 1024

export const uploadMapa = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_MAPA, files: 1 },
}).single('imagem')

// Limita também campos e partes: sem isso, uma requisição com milhares de campos enche a memória.
const multerImagem = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_IMAGEM, files: 1, fields: 5, fieldSize: 1024, parts: 6 },
}).single('imagem')

export const uploadImagemMontaria: RequestHandler = (req, res, next) =>
  multerImagem(req, res, (erro: unknown) =>
    next(erro instanceof MulterError && erro.code === 'LIMIT_FILE_SIZE'
      ? new AppError('Imagem muito grande — o limite para montarias é 2MB.', 413)
      : erro))
