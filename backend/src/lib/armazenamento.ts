import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Único lugar que sabe onde os arquivos moram. Trocar disco local por S3 é
// reescrever este módulo — quem chama só vê uma URL.
export const PASTA_UPLOADS = path.resolve(process.env.UPLOADS_DIR ?? 'uploads')
const PREFIXO_URL = '/uploads/'

export type TipoImagem = 'png' | 'jpg' | 'webp'

// Pelos primeiros bytes, não pela extensão nem pelo Content-Type que o
// cliente mandou: impede subir HTML/SVG disfarçado de imagem.
export function detectarTipoImagem(conteudo: Buffer): TipoImagem | null {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (conteudo.length >= 8 && conteudo.subarray(0, 8).equals(png)) return 'png'
  if (conteudo.length >= 3 && conteudo[0] === 0xff && conteudo[1] === 0xd8 && conteudo[2] === 0xff) return 'jpg'
  if (conteudo.length >= 12 && conteudo.toString('ascii', 0, 4) === 'RIFF' && conteudo.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp'
  }
  return null
}

export async function salvarArquivo(conteudo: Buffer, extensao: TipoImagem): Promise<string> {
  await mkdir(PASTA_UPLOADS, { recursive: true })
  const nome = `${randomUUID()}.${extensao}`
  await writeFile(path.join(PASTA_UPLOADS, nome), conteudo)
  return PREFIXO_URL + nome
}

export async function removerArquivo(url: string) {
  if (!url.startsWith(PREFIXO_URL)) return
  // basename: uma URL adulterada no banco não consegue apontar pra fora da pasta.
  await unlink(path.join(PASTA_UPLOADS, path.basename(url))).catch(() => {})
}
