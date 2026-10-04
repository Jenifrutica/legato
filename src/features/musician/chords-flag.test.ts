import { beforeEach, describe, expect, it } from 'vitest'
import { isChordsAutoEnabled } from './chords-flag'

beforeEach(() => {
  localStorage.removeItem('legato.chords.auto')
})

describe('bandera de acordes automáticos', () => {
  it('está apagada por defecto (bloque archivado)', () => {
    expect(isChordsAutoEnabled()).toBe(false)
  })

  it('se activa solo con la bandera a 1', () => {
    localStorage.setItem('legato.chords.auto', '1')
    expect(isChordsAutoEnabled()).toBe(true)

    localStorage.setItem('legato.chords.auto', '0')
    expect(isChordsAutoEnabled()).toBe(false)
  })
})
