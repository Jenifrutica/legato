import { describe, expect, it } from 'vitest'
import { TrackLibrary } from './track-library'
import type { LibraryTrack } from './types'

function track(id: string): LibraryTrack {
  return {
    id,
    title: `Cancion ${id}`,
    artist: 'Artista',
    album: null,
    durationSeconds: 180,
    sourceUrl: `blob:${id}`,
    artworkUrl: null,
    artworkBlob: null,
    blob: new Blob(['audio'], { type: 'audio/mpeg' }),
    fileName: `${id}.mp3`,
    fileSize: 1024,
    mimeType: 'audio/mpeg',
    dedupeKey: `${id}.mp3:1024:0`,
    addedAt: 0,
    sampleRate: 44100,
    bitrate: 320000,
    codec: 'MP3',
    channels: 2,
  }
}

describe('TrackLibrary', () => {
  it('agrega, busca y evita duplicados por id', () => {
    const library = new TrackLibrary()

    expect(library.add(track('a'))).toBe(true)
    expect(library.add(track('b'))).toBe(true)
    expect(library.add(track('a'))).toBe(false)

    expect(library.size).toBe(2)
    expect(library.has('a')).toBe(true)
    expect(library.find('b')?.title).toBe('Cancion b')
    expect(library.find('z')).toBeNull()
  })

  it('mantiene el orden de insercion', () => {
    const library = new TrackLibrary()
    library.add(track('a'))
    library.add(track('b'))
    library.add(track('c'))

    expect(library.toArray().map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })

  it('actualiza una cancion', () => {
    const library = new TrackLibrary()
    library.add(track('a'))

    expect(library.update('a', { title: 'Nuevo titulo', artist: 'Otra' })).toBe(true)
    expect(library.find('a')?.title).toBe('Nuevo titulo')
    expect(library.update('z', { title: 'x' })).toBe(false)
  })

  it('elimina por id', () => {
    const library = new TrackLibrary()
    library.add(track('a'))
    library.add(track('b'))

    expect(library.remove('a')).toBe(true)
    expect(library.remove('a')).toBe(false)
    expect(library.size).toBe(1)
    expect(library.toArray().map((item) => item.id)).toEqual(['b'])
  })

  it('clear y restore', () => {
    const library = new TrackLibrary()
    library.add(track('a'))
    library.clear()
    expect(library.size).toBe(0)

    library.restore([track('x'), track('y')])
    expect(library.toArray().map((item) => item.id)).toEqual(['x', 'y'])
  })
})
