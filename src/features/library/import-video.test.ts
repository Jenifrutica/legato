import { describe, expect, it } from 'vitest'
import { importAudioFiles, isAudioFile, isVideoFile } from './import-audio-files'

describe('importación de video', () => {
  it('clasifica mp4/mov como video y mp3 como audio', () => {
    expect(isVideoFile(new File([], 'clip.mp4', { type: 'video/mp4' }))).toBe(true)
    expect(isVideoFile(new File([], 'toma.mov', { type: '' }))).toBe(true)
    expect(isVideoFile(new File([], 'tema.mp3', { type: 'audio/mpeg' }))).toBe(false)
  })

  it('acepta archivos de video como media importable', () => {
    expect(isAudioFile(new File([], 'clip.mp4', { type: 'video/mp4' }))).toBe(true)
  })

  it('marca mediaType video al importar un mp4', async () => {
    const file = new File([new Uint8Array([0, 0, 0, 24])], 'clip.mp4', { type: 'video/mp4' })
    const result = await importAudioFiles([file])

    expect(result.tracks).toHaveLength(1)
    expect(result.tracks[0]?.mediaType).toBe('video')
    expect(result.tracks[0]?.mimeType).toBe('video/mp4')
  })
})
