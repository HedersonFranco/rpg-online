import { describe, expect, it } from 'vitest'
import { detectarTipoImagem } from './armazenamento.js'

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
