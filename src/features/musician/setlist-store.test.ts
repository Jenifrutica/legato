import { beforeEach, describe, expect, it } from 'vitest'
import { useSetlistStore } from './setlist-store'

beforeEach(() => {
  useSetlistStore.getState().hydrate([])
})

describe('store de setlists', () => {
  it('crea setlists con y sin pistas y selecciona la nueva', () => {
    const id = useSetlistStore.getState().create('Bolo', ['a', 'b'])
    const setlist = useSetlistStore.getState().setlists[0]

    expect(setlist?.name).toBe('Bolo')
    expect(setlist?.items.map((item) => item.trackId)).toEqual(['a', 'b'])
    expect(useSetlistStore.getState().selectedId).toBe(id)
  })

  it('reordena con moveItem, marca tocadas y quita elementos', () => {
    const id = useSetlistStore.getState().create('Bolo', ['a', 'b', 'c'])

    useSetlistStore.getState().moveItem(id, 'c', 0)
    expect(useSetlistStore.getState().setlists[0]?.items.map((item) => item.trackId)).toEqual([
      'c',
      'a',
      'b',
    ])

    useSetlistStore.getState().togglePlayed(id, 'a')
    expect(
      useSetlistStore.getState().setlists[0]?.items.find((item) => item.trackId === 'a')?.played,
    ).toBe(true)

    useSetlistStore.getState().removeItem(id, 'b')
    expect(useSetlistStore.getState().setlists[0]?.items.map((item) => item.trackId)).toEqual([
      'c',
      'a',
    ])
  })

  it('elimina setlists y re-selecciona', () => {
    const first = useSetlistStore.getState().create('A')
    const second = useSetlistStore.getState().create('B')

    useSetlistStore.getState().remove(second)
    expect(useSetlistStore.getState().selectedId).toBe(first)

    useSetlistStore.getState().remove(first)
    expect(useSetlistStore.getState().selectedId).toBeNull()
  })

  it('hidrata conservando la selección si sigue existiendo', () => {
    const id = useSetlistStore.getState().create('A')
    useSetlistStore.getState().hydrate([
      { id, name: 'A', items: [], createdAt: 1, updatedAt: 1 },
      { id: 'otra', name: 'Otra', items: [], createdAt: 1, updatedAt: 1 },
    ])

    expect(useSetlistStore.getState().setlists).toHaveLength(2)
    expect(useSetlistStore.getState().selectedId).toBe(id)
  })
})
