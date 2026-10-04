import { describe, expect, it } from 'vitest'
import {
  base64ToBytes,
  bytesToBase64,
  CHUNK_BYTES,
  fileIdFromPath,
  joinBytes,
  splitBytes,
} from './file-chunks'

describe('file-chunks', () => {
  it('convierte a base64 y vuelve sin perder bytes', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 255, 128])
    expect([...base64ToBytes(bytesToBase64(bytes))]).toEqual([...bytes])
  })

  it('trocea y recompone respetando el orden', () => {
    const bytes = new Uint8Array(10)
    for (let index = 0; index < bytes.length; index++) {
      bytes[index] = index
    }
    const chunks = splitBytes(bytes, 4)
    expect(chunks).toHaveLength(3)
    expect([...joinBytes(chunks)]).toEqual([...bytes])
  })

  it('un blob vacío produce un trozo vacío', () => {
    expect(splitBytes(new Uint8Array(0))).toHaveLength(1)
  })

  it('el tamaño de trozo por defecto cabe en un documento', () => {
    expect(CHUNK_BYTES).toBeLessThan(1024 * 1024)
  })

  it('el id de archivo no lleva barras', () => {
    expect(fileIdFromPath('users/u1/songs/s1')).toBe('users__u1__songs__s1')
  })
})
