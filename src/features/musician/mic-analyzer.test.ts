import { describe, expect, it } from 'vitest'
import { estimateBpmFromBeats, phaseFromBeats } from './mic-analyzer'

function beats(bpm: number, count: number, offset = 0): number[] {
  const period = 60 / bpm
  return Array.from({ length: count }, (_, index) => offset + index * period)
}

describe('estimateBpmFromBeats', () => {
  it('estima 120 BPM de golpes regulares', () => {
    expect(estimateBpmFromBeats(beats(120, 8))).toBe(120)
    expect(estimateBpmFromBeats(beats(100, 8))).toBe(100)
  })

  it('tolera huecos fuera del rango razonable', () => {
    const list = [...beats(100, 4), ...beats(100, 5, 10)]
    expect(estimateBpmFromBeats(list)).toBe(100)
  })

  it('con menos de tres golpes devuelve null', () => {
    expect(estimateBpmFromBeats([0, 0.5])).toBeNull()
    expect(estimateBpmFromBeats([])).toBeNull()
  })
})

describe('phaseFromBeats', () => {
  it('calcula la fase media de los golpes', () => {
    expect(phaseFromBeats([0, 0.5, 1], 120)).toBeCloseTo(0)
    expect(phaseFromBeats([0.1, 0.6, 1.1], 120)).toBeCloseTo(0.1)
  })

  it('sin datos o sin BPM devuelve 0', () => {
    expect(phaseFromBeats([], 120)).toBe(0)
    expect(phaseFromBeats([0.2], 0)).toBe(0)
  })
})
