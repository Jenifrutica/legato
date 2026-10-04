import { describe, expect, it } from 'vitest'
import { moveSetlistItem, removeSetlistItem, toggleSetlistItem } from './setlist'
import type { SetlistItem } from './setlist'

function items(...ids: string[]): SetlistItem[] {
  return ids.map((trackId) => ({ trackId, played: false }))
}

function order(list: SetlistItem[]): string[] {
  return list.map((item) => item.trackId)
}

describe('moveSetlistItem', () => {
  it('reordena con la lista doble del núcleo', () => {
    expect(order(moveSetlistItem(items('a', 'b', 'c'), 'c', 0))).toEqual(['c', 'a', 'b'])
    expect(order(moveSetlistItem(items('a', 'b', 'c'), 'a', 2))).toEqual(['b', 'c', 'a'])
    expect(order(moveSetlistItem(items('a', 'b', 'c'), 'b', 1))).toEqual(['a', 'b', 'c'])
  })

  it('ignora pistas que no están en la lista', () => {
    const original = items('a', 'b')
    expect(moveSetlistItem(original, 'z', 0)).toBe(original)
  })
})

describe('toggleSetlistItem y removeSetlistItem', () => {
  it('marca y desmarca tocada sin tocar el orden', () => {
    const marked = toggleSetlistItem(items('a', 'b'), 'a')
    expect(marked[0]?.played).toBe(true)
    expect(marked[1]?.played).toBe(false)

    const unmarked = toggleSetlistItem(marked, 'a')
    expect(unmarked[0]?.played).toBe(false)
    expect(order(unmarked)).toEqual(['a', 'b'])
  })

  it('quita una pista del setlist', () => {
    expect(order(removeSetlistItem(items('a', 'b'), 'a'))).toEqual(['b'])
  })
})
