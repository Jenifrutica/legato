import { describe, expect, it } from 'vitest'
import { PlaybackQueue } from './queue'
import type { QueueTrack } from './types'

function track(id: string): QueueTrack {
  return {
    id,
    title: `T ${id}`,
    artist: 'A',
    album: null,
    durationSeconds: 200,
    sourceUrl: `blob:${id}`,
    artworkUrl: null,
  }
}

describe('cola sobre lista doble hecha a mano', () => {
  it('enqueue agrega al final y conserva el nodo actual', () => {
    const queue = new PlaybackQueue()
    queue.enqueue(track('a'))
    queue.enqueue(track('b'))
    queue.setCurrent('a')
    queue.enqueue(track('c'))

    expect(queue.tracks.map((item) => item.id)).toEqual(['a', 'b', 'c'])
    expect(queue.currentTrack?.id).toBe('a')
    expect(queue.structure().map((node) => [node.id, node.prevId, node.nextId])).toEqual([
      ['a', null, 'b'],
      ['b', 'a', 'c'],
      ['c', 'b', null],
    ])
  })

  it('insertAfterCurrent inserta justo después del nodo en curso', () => {
    const queue = new PlaybackQueue()
    for (const id of ['a', 'b', 'c']) {
      queue.enqueue(track(id))
    }
    queue.setCurrent('a')
    queue.insertAfterCurrent(track('x'))
    expect(queue.tracks.map((item) => item.id)).toEqual(['a', 'x', 'b', 'c'])

    queue.setCurrent('c')
    queue.insertAfterCurrent(track('y'))
    expect(queue.tracks.map((item) => item.id)).toEqual(['a', 'x', 'b', 'c', 'y'])
    expect(queue.structure()[4]).toMatchObject({ id: 'y', prevId: 'c', nextId: null })
  })

  it('insertAfterCurrent sin nodo actual se comporta como enqueue', () => {
    const queue = new PlaybackQueue()
    queue.insertAfterCurrent(track('a'))

    expect(queue.currentTrack?.id).toBe('a')
    expect(queue.tracks).toHaveLength(1)
  })

  it('quitar el nodo en curso mueve el puntero al siguiente', () => {
    const queue = new PlaybackQueue()
    for (const id of ['a', 'b', 'c']) {
      queue.enqueue(track(id))
    }
    queue.setCurrent('b')

    expect(queue.remove('b')).toBe(true)
    expect(queue.currentTrack?.id).toBe('c')
    expect(queue.structure().map((node) => [node.id, node.prevId, node.nextId])).toEqual([
      ['a', null, 'c'],
      ['c', 'a', null],
    ])
  })

  it('move reordena con punteros coherentes', () => {
    const queue = new PlaybackQueue()
    for (const id of ['a', 'b', 'c']) {
      queue.enqueue(track(id))
    }
    queue.setCurrent('a')

    expect(queue.move('c', 0)).toBe(true)
    expect(queue.tracks.map((item) => item.id)).toEqual(['c', 'a', 'b'])
    expect(queue.currentTrack?.id).toBe('a')
    expect(queue.structure().map((node) => [node.id, node.prevId, node.nextId])).toEqual([
      ['c', null, 'a'],
      ['a', 'c', 'b'],
      ['b', 'a', null],
    ])
  })

  it('enqueue con aleatorio activo mantiene la pista en el orden de reproducción', () => {
    const queue = new PlaybackQueue()
    queue.enqueue(track('a'))
    queue.setShuffle(true)
    queue.enqueue(track('b'))

    const seen = new Set<string>()
    for (let step = 0; step < 4; step++) {
      const next = queue.next()
      if (next !== null) {
        seen.add(next.id)
      }
    }

    expect(seen.has('b')).toBe(true)
  })
})
