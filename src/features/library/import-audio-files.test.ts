import { describe, expect, it } from 'vitest'
import {
  createDedupeKey,
  importAudioFiles,
  isAudioFile,
  MAX_AUDIO_FILE_BYTES,
} from './import-audio-files'

function createWavFile(name: string, seconds = 1, lastModified = 1000): File {
  const sampleRate = 8000
  const samples = sampleRate * seconds
  const dataSize = samples * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const write = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index++) {
      view.setUint8(offset + index, text.charCodeAt(index))
    }
  }

  write(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  write(8, 'WAVE')
  write(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  write(36, 'data')
  view.setUint32(40, dataSize, true)

  return new File([buffer], name, { type: 'audio/wav', lastModified })
}

describe('isAudioFile', () => {
  it('acepta por mime o por extension', () => {
    expect(isAudioFile(new File(['x'], 'a.bin', { type: 'audio/mpeg' }))).toBe(true)
    expect(isAudioFile(new File(['x'], 'cancion.FLAC', { type: '' }))).toBe(true)
    expect(isAudioFile(new File(['x'], 'nota.txt', { type: 'text/plain' }))).toBe(false)
  })
})

describe('createDedupeKey', () => {
  it('combina nombre, tamano y fecha', () => {
    const file = new File(['abc'], 'a.mp3', { type: 'audio/mpeg', lastModified: 42 })
    expect(createDedupeKey(file)).toBe('a.mp3:3:42')
  })
})

describe('importAudioFiles', () => {
  it('importa un WAV y usa el nombre como titulo si no hay metadatos', async () => {
    const file = createWavFile('mi-cancion.wav')
    const result = await importAudioFiles([file])

    expect(result.errors).toEqual([])
    expect(result.tracks).toHaveLength(1)

    const track = result.tracks[0]
    expect(track.title).toBe('mi-cancion')
    expect(track.artist).toBe('Artista desconocido')
    expect(track.sourceUrl.startsWith('blob:')).toBe(true)
    expect(track.dedupeKey).toBe('mi-cancion.wav:16044:1000')
    expect(track.durationSeconds).toBeGreaterThan(0.5)
  })

  it('rechaza archivos que no son audio', async () => {
    const result = await importAudioFiles([new File(['hola'], 'notas.txt', { type: 'text/plain' })])

    expect(result.tracks).toHaveLength(0)
    expect(result.errors[0]?.reason).toBe('Formato no soportado')
  })

  it('rechaza archivos que superan el limite', async () => {
    const file = new File(['x'], 'grande.mp3', { type: 'audio/mpeg' })
    Object.defineProperty(file, 'size', { value: MAX_AUDIO_FILE_BYTES + 1 })

    const result = await importAudioFiles([file])

    expect(result.tracks).toHaveLength(0)
    expect(result.errors[0]?.reason).toContain('200 MB')
  })

  it('detecta duplicados dentro de la misma importacion y contra existentes', async () => {
    const file = createWavFile('repetida.wav', 1, 500)
    const existing = new Set([createDedupeKey(file)])

    const sameBatch = await importAudioFiles([file, file])
    expect(sameBatch.tracks).toHaveLength(1)
    expect(sameBatch.errors).toHaveLength(1)

    const againstExisting = await importAudioFiles([file], existing)
    expect(againstExisting.tracks).toHaveLength(0)
    expect(againstExisting.errors[0]?.reason).toBe('Ya está en la biblioteca')
  })

  it('si fallan los metadatos igual agrega la cancion con datos basicos', async () => {
    const file = new File(['no es audio real'], 'rota.mp3', {
      type: 'audio/mpeg',
      lastModified: 7,
    })

    const result = await importAudioFiles([file])

    expect(result.tracks).toHaveLength(1)
    expect(result.tracks[0].title).toBe('rota')
    expect(result.tracks[0].durationSeconds).toBeNull()
  })
})
