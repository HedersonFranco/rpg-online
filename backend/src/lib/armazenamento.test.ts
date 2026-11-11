import { describe, expect, it } from 'vitest'
import { detectarTipoImagem, salvarImagemEnviada } from './armazenamento.js'

describe('salvarImagemEnviada', () => {
  it('recusa pedido sem arquivo e arquivo que não é PNG/JPEG/WebP, sem gravar nada', async () => {
    await expect(salvarImagemEnviada(undefined)).rejects.toMatchObject({ statusCode: 400 })
    const html = { buffer: Buffer.from('<html><script>alert(1)</script>') } as Express.Multer.File
    await expect(salvarImagemEnviada(html)).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('detectarTipoImagem', () => {
  it('reconhece PNG, JPEG e WebP pelos bytes iniciais', () => {
    expect(detectarTipoImagem(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe('png')
    expect(detectarTipoImagem(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpg')
    expect(detectarTipoImagem(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')]))).toBe('webp')
  })

  it('rejeita HTML/SVG mesmo que o nome diga .png', () => {
    expect(detectarTipoImagem(Buffer.from('<html><script>alert(1)</script>'))).toBeNull()
    expect(detectarTipoImagem(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull()
    expect(detectarTipoImagem(Buffer.alloc(0))).toBeNull()
  })
})
