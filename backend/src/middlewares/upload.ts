import multer from 'multer'

// Requisito não funcional: mapa até 10MB. Acima disso o multer aborta e o
// errorHandler responde 413 com mensagem clara.
export const TAMANHO_MAXIMO_MAPA = 10 * 1024 * 1024

export const uploadMapa = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_MAPA, files: 1 },
}).single('imagem')
