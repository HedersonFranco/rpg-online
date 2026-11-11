import type { RequestHandler } from 'express'
import multer, { MulterError } from 'multer'
import { AppError } from '../errors/AppError.js'

// Requisito não funcional: mapa até 10MB. Acima disso o multer aborta e o
// errorHandler responde 413 com mensagem clara.
export const TAMANHO_MAXIMO_MAPA = 10 * 1024 * 1024
// Avatar (RNF10) e imagem de montaria: 2MB.
export const TAMANHO_MAXIMO_IMAGEM = 2 * 1024 * 1024

// Limita também campos e partes: sem isso, uma requisição com milhares de campos enche a memória.
export const uploadMapa = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_MAPA, files: 1, fields: 5, fieldSize: 1024, parts: 6 },
}).single('imagem')

const multerImagem = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_IMAGEM, files: 1, fields: 5, fieldSize: 1024, parts: 6 },
}).single('imagem')

const imagemAte2MB = (para: string): RequestHandler => (req, res, next) =>
  multerImagem(req, res, (erro: unknown) =>
    next(erro instanceof MulterError && erro.code === 'LIMIT_FILE_SIZE'
      ? new AppError(`Imagem muito grande — o limite para ${para} é 2MB.`, 413)
      : erro))

export const uploadImagemMontaria = imagemAte2MB('montarias')
export const uploadAvatar = imagemAte2MB('avatar')
