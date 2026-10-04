import { beforeEach, describe, expect, it } from 'vitest'
import { useChordStore } from './chord-store'

beforeEach(() => {
  useChordStore.getState().hydrate([])
})

describe('store de hojas ChordPro', () => {
  it('hidrata, guarda y borra hojas por pista', () => {
    useChordStore.getState().hydrate([{ trackId: 'a', text: '[C]Hola', updatedAt: 1 }])
    expect(useChordStore.getState().records.a?.text).toBe('[C]Hola')

    useChordStore.getState().setText('b', '[G]Nuevo')
    expect(useChordStore.getState().records.b?.text).toBe('[G]Nuevo')

    useChordStore.getState().clear('a')
    expect(useChordStore.getState().records.a).toBeUndefined()
  })
})
