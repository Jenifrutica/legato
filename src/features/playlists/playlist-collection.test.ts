import { describe, expect, it } from 'vitest'
import type { LibraryTrack } from '../library'
import { PlaylistCollection } from './playlist-collection'

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

describe('PlaylistCollection', () => {
  it('crea playlists con nombre y las lista en orden', () => {
    const collection = new PlaylistCollection()
    const first = collection.create('Ensayo')
    const second = collection.create('Directo')

    expect(collection.size).toBe(2)
    expect(collection.toArray().map((playlist) => playlist.name)).toEqual(['Ensayo', 'Directo'])
    expect(collection.find(first.id)?.name).toBe('Ensayo')
    expect(collection.find(second.id)?.name).toBe('Directo')
    expect(collection.find('nope')).toBeNull()
  })

  it('usa un nombre por defecto si viene vacio', () => {
    const collection = new PlaylistCollection()
    const playlist = collection.create('   ')
    expect(playlist.name).toBe('Nueva playlist')
  })

  it('renombra playlists', () => {
    const collection = new PlaylistCollection()
    const playlist = collection.create('Vieja')

    expect(collection.rename(playlist.id, 'Nueva')).toBe(true)
    expect(collection.find(playlist.id)?.name).toBe('Nueva')
    expect(collection.rename(playlist.id, '  ')).toBe(false)
    expect(collection.rename('nope', 'x')).toBe(false)
  })

  it('duplica una playlist con sus canciones en orden', () => {
    const collection = new PlaylistCollection()
    const playlist = collection.create('Original')
    collection.addTrack(playlist.id, track('a'))
    collection.addTrack(playlist.id, track('b'))

    const copy = collection.duplicate(playlist.id)

    expect(copy).not.toBeNull()
    expect(copy?.name).toBe('Original (copia)')
    expect(collection.tracksOf(copy?.id ?? '').map((item) => item.id)).toEqual(['a', 'b'])
    expect(collection.duplicate('nope')).toBeNull()
  })

  it('elimina playlists', () => {
    const collection = new PlaylistCollection()
    const playlist = collection.create('Temporal')

    expect(collection.remove(playlist.id)).toBe(true)
    expect(collection.remove(playlist.id)).toBe(false)
    expect(collection.size).toBe(0)
    expect(collection.tracksOf(playlist.id)).toEqual([])
  })

  it('agrega canciones sin duplicados y mantiene el orden', () => {
    const collection = new PlaylistCollection()
    const playlist = collection.create('Mixta')

    expect(collection.addTrack(playlist.id, track('a'))).toBe(true)
    expect(collection.addTrack(playlist.id, track('b'))).toBe(true)
    expect(collection.addTrack(playlist.id, track('a'))).toBe(false)
    expect(collection.addTrack('nope', track('c'))).toBe(false)

    expect(collection.tracksOf(playlist.id).map((item) => item.id)).toEqual(['a', 'b'])
    expect(collection.trackCount(playlist.id)).toBe(2)
    expect(collection.containsTrack(playlist.id, 'a')).toBe(true)
    expect(collection.containsTrack(playlist.id, 'z')).toBe(false)
  })

  it('quita canciones por id', () => {
    const collection = new PlaylistCollection()
    const playlist = collection.create('Mixta')
    collection.addTrack(playlist.id, track('a'))
    collection.addTrack(playlist.id, track('b'))

    expect(collection.removeTrack(playlist.id, 'a')).toBe(true)
    expect(collection.removeTrack(playlist.id, 'a')).toBe(false)
    expect(collection.removeTrack('nope', 'a')).toBe(false)
    expect(collection.tracksOf(playlist.id).map((item) => item.id)).toEqual(['b'])
  })

  it('mueve canciones a una posicion final', () => {
    const collection = new PlaylistCollection()
    const playlist = collection.create('Mixta')
    for (const id of ['a', 'b', 'c', 'd']) {
      collection.addTrack(playlist.id, track(id))
    }

    expect(collection.moveTrack(playlist.id, 'c', 0)).toBe(true)
    expect(collection.tracksOf(playlist.id).map((item) => item.id)).toEqual(['c', 'a', 'b', 'd'])
    expect(collection.moveTrack(playlist.id, 'c', 2)).toBe(true)
    expect(collection.tracksOf(playlist.id).map((item) => item.id)).toEqual(['a', 'b', 'c', 'd'])
    expect(collection.moveTrack(playlist.id, 'z', 0)).toBe(false)
    expect(collection.moveTrack('nope', 'a', 0)).toBe(false)
  })

  it('expone la estructura real de la lista doble', () => {
    const collection = new PlaylistCollection()
    const playlist = collection.create('Set')
    for (const id of ['a', 'b', 'c']) {
      collection.addTrack(playlist.id, track(id))
    }

    const structure = collection.structureOf(playlist.id)

    expect(structure.map((node) => node.id)).toEqual(['a', 'b', 'c'])
    expect(structure[0]).toMatchObject({ prevId: null, nextId: 'b' })
    expect(structure[1]).toMatchObject({ prevId: 'a', nextId: 'c' })
    expect(structure[2]).toMatchObject({ prevId: 'b', nextId: null })
    expect(collection.structureOf('nope')).toEqual([])
  })

  it('genera snapshots con los ids de las canciones', () => {
    const collection = new PlaylistCollection()
    const playlist = collection.create('Set')
    collection.addTrack(playlist.id, track('a'))

    const snapshots = collection.toSnapshots()

    expect(snapshots).toHaveLength(1)
    expect(snapshots[0].name).toBe('Set')
    expect(snapshots[0].trackIds).toEqual(['a'])
  })
})
