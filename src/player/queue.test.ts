import { describe, expect, it } from 'vitest'
import { PlaybackQueue } from './queue'
import type { QueueTrack } from './types'

function track(id: string): QueueTrack {
  return {
    id,
    title: `Cancion ${id}`,
    artist: 'Artista',
    album: null,
    durationSeconds: 180,
    sourceUrl: `blob:${id}`,
    artworkUrl: null,
  }
}

describe('PlaybackQueue', () => {
  it('agrega canciones y marca la primera como actual', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))
    queue.add(track('c'))

    expect(queue.size).toBe(3)
    expect(queue.currentTrack?.id).toBe('a')
    expect(queue.tracks.map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })

  it('avanza y retrocede en orden', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))
    queue.add(track('c'))

    expect(queue.next()?.id).toBe('b')
    expect(queue.next()?.id).toBe('c')
    expect(queue.previous()?.id).toBe('b')
    expect(queue.previous()?.id).toBe('a')
  })

  it('sin bucle devuelve null en los extremos', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))

    expect(queue.next()).toBeNull()
    expect(queue.previous()).toBeNull()
  })

  it('con bucle total envuelve en ambos extremos', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))
    queue.setLoopMode('all')

    expect(queue.next()?.id).toBe('b')
    expect(queue.next()?.id).toBe('a')
    expect(queue.previous()?.id).toBe('b')
  })

  it('setCurrent cambia la cancion actual por id', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))

    expect(queue.setCurrent('b')).toBe(true)
    expect(queue.currentTrack?.id).toBe('b')
    expect(queue.currentIndex).toBe(1)
    expect(queue.setCurrent('z')).toBe(false)
  })

  it('eliminar la cancion actual pasa a la siguiente', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))
    queue.add(track('c'))
    queue.setCurrent('b')

    expect(queue.remove('b')).toBe(true)
    expect(queue.currentTrack?.id).toBe('c')
    expect(queue.tracks.map((t) => t.id)).toEqual(['a', 'c'])
    expect(queue.remove('z')).toBe(false)
  })

  it('eliminar una cancion que no suena no cambia la actual', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))
    queue.add(track('c'))

    expect(queue.remove('b')).toBe(true)
    expect(queue.currentTrack?.id).toBe('a')
    expect(queue.tracks.map((t) => t.id)).toEqual(['a', 'c'])
  })

  it('eliminar la ultima cancion actual deja la cola vacia', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))

    expect(queue.remove('a')).toBe(true)
    expect(queue.size).toBe(0)
    expect(queue.currentTrack).toBeNull()
    expect(queue.next()).toBeNull()
  })

  it('el aleatorio conserva la cancion actual y recorre todas una vez', () => {
    const queue = new PlaybackQueue()
    for (const id of ['a', 'b', 'c', 'd', 'e']) {
      queue.add(track(id))
    }
    queue.setCurrent('c')

    queue.setShuffle(true)
    expect(queue.shuffle).toBe(true)
    expect(queue.currentTrack?.id).toBe('c')

    const seen = new Set<string>(['c'])
    let next = queue.next()
    while (next !== null) {
      seen.add(next.id)
      next = queue.next()
    }
    let previous = queue.previous()
    while (previous !== null) {
      seen.add(previous.id)
      previous = queue.previous()
    }

    expect(seen.size).toBe(5)
  })

  it('apagar el aleatorio vuelve al orden original desde la actual', () => {
    const queue = new PlaybackQueue()
    for (const id of ['a', 'b', 'c', 'd']) {
      queue.add(track(id))
    }
    queue.setShuffle(true)
    queue.setShuffle(false)

    expect(queue.shuffle).toBe(false)
    expect(queue.currentTrack?.id).toBe('a')
    expect(queue.next()?.id).toBe('b')
  })

  it('agregar con aleatorio activo incluye la cancion en el recorrido', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))
    queue.setShuffle(true)
    queue.add(track('c'))

    const visited: string[] = []
    let next = queue.next()
    while (next !== null) {
      visited.push(next.id)
      next = queue.next()
    }

    expect(visited).toContain('c')
  })

  it('eliminar con aleatorio activo mantiene el recorrido coherente', () => {
    const queue = new PlaybackQueue()
    for (const id of ['a', 'b', 'c', 'd']) {
      queue.add(track(id))
    }
    queue.setShuffle(true)
    queue.remove('b')

    expect(queue.size).toBe(3)

    const seen = new Set<string>([queue.currentTrack?.id ?? ''])
    let next = queue.next()
    while (next !== null) {
      seen.add(next.id)
      next = queue.next()
    }
    let previous = queue.previous()
    while (previous !== null) {
      seen.add(previous.id)
      previous = queue.previous()
    }

    expect(seen.size).toBe(3)
    expect(seen.has('b')).toBe(false)
  })

  it('bug #12: reordenar no cambia la cancion que suena', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))
    queue.add(track('c'))
    queue.setCurrent('a')

    expect(queue.move('c', 0)).toBe(true)
    expect(queue.tracks.map((t) => t.id)).toEqual(['c', 'a', 'b'])
    expect(queue.currentTrack?.id).toBe('a')
    expect(queue.next()?.id).toBe('b')
    expect(queue.move('z', 0)).toBe(false)
  })

  it('mover con aleatorio activo mantiene la cancion actual', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))
    queue.add(track('c'))
    queue.setCurrent('b')
    queue.setShuffle(true)

    expect(queue.move('c', 0)).toBe(true)
    expect(queue.currentTrack?.id).toBe('b')
    expect(queue.tracks.map((t) => t.id)).toEqual(['c', 'a', 'b'])
  })

  it('expone la estructura de la cola y la actualiza al mover', () => {
    const queue = new PlaybackQueue()
    for (const id of ['a', 'b', 'c']) {
      queue.add(track(id))
    }

    expect(queue.structure().map((node) => node.id)).toEqual(['a', 'b', 'c'])
    expect(queue.structure()[0]).toMatchObject({ prevId: null, nextId: 'b' })

    queue.move('c', 0)

    const structure = queue.structure()
    expect(structure.map((node) => node.id)).toEqual(['c', 'a', 'b'])
    expect(structure[0]).toMatchObject({ prevId: null, nextId: 'a' })
    expect(structure[2]).toMatchObject({ prevId: 'a', nextId: null })
  })

  it('serializa y restaura el estado', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))
    queue.add(track('c'))
    queue.setCurrent('b')
    queue.setLoopMode('all')

    const state = queue.toState()
    expect(state).toEqual({
      trackIds: ['a', 'b', 'c'],
      currentId: 'b',
      loopMode: 'all',
      shuffle: false,
    })

    const restored = new PlaybackQueue()
    restored.restore([track('a'), track('b'), track('c'), track('z')], state)

    expect(restored.tracks.map((t) => t.id)).toEqual(['a', 'b', 'c'])
    expect(restored.currentTrack?.id).toBe('b')
    expect(restored.loopMode).toBe('all')
    expect(restored.next()?.id).toBe('c')
  })

  it('restaurar con aleatorio mantiene la cancion actual', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.add(track('b'))
    queue.add(track('c'))
    queue.setCurrent('b')
    queue.setShuffle(true)

    const restored = new PlaybackQueue()
    restored.restore([track('a'), track('b'), track('c')], queue.toState())

    expect(restored.shuffle).toBe(true)
    expect(restored.currentTrack?.id).toBe('b')
  })

  it('clear deja la cola vacia', () => {
    const queue = new PlaybackQueue()
    queue.add(track('a'))
    queue.clear()

    expect(queue.size).toBe(0)
    expect(queue.currentTrack).toBeNull()
    expect(queue.shuffle).toBe(false)
  })
})
