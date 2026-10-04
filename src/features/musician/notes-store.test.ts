import { beforeEach, describe, expect, it } from 'vitest'
import { noteKey, useNotesStore } from './notes-store'

beforeEach(() => {
  useNotesStore.getState().hydrate([])
})

describe('store de notas', () => {
  it('guarda notas por pista y por playlist', () => {
    useNotesStore.getState().setText('track', 't1', 'subir medio tono')
    useNotesStore.getState().setText('playlist', 'p1', 'orden de concierto')

    expect(useNotesStore.getState().records[noteKey('track', 't1')]?.text).toBe('subir medio tono')
    expect(useNotesStore.getState().records[noteKey('playlist', 'p1')]?.text).toBe(
      'orden de concierto',
    )
  })

  it('hidrata y borra notas', () => {
    useNotesStore
      .getState()
      .hydrate([{ targetType: 'track', targetId: 't1', text: 'x', updatedAt: 1 }])
    expect(useNotesStore.getState().records[noteKey('track', 't1')]?.text).toBe('x')

    useNotesStore.getState().clear('track', 't1')
    expect(useNotesStore.getState().records[noteKey('track', 't1')]).toBeUndefined()
  })
})
