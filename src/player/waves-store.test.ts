import { describe, expect, it } from 'vitest'
import {
  clampBpm,
  clampOffset,
  MAX_BPM,
  MIN_BPM,
  nextTap,
  offsetFromPositions,
} from './waves-store'

describe('clampBpm', () => {
  it('limita el rango y corrige valores inválidos', () => {
    expect(clampBpm(0)).toBe(MIN_BPM)
    expect(clampBpm(999)).toBe(MAX_BPM)
    expect(clampBpm(119.6)).toBe(120)
    expect(clampBpm(Number.NaN)).toBe(120)
  })
})

describe('clampOffset', () => {
  it('normaliza el desfase a un ciclo de 10 s', () => {
    expect(clampOffset(-0.25)).toBeCloseTo(9.75)
    expect(clampOffset(12)).toBeCloseTo(2)
    expect(clampOffset(Number.NaN)).toBe(0)
  })
})

describe('offsetFromPositions', () => {
  it('calcula la fase media de los toques a un BPM', () => {
    // 120 BPM: periodo 0.5 s. Toques a 0.1 y 0.6 → fase 0.1.
    expect(offsetFromPositions([0.1, 0.6], 120)).toBeCloseTo(0.1)
    // Toques justo en el pulso → fase 0.
    expect(offsetFromPositions([0.5, 1.0], 120)).toBeCloseTo(0)
    // Da igual el compás: 0.4 y 0.9 → fase 0.4.
    expect(offsetFromPositions([0.4, 0.9], 120)).toBeCloseTo(0.4)
  })

  it('sin toques o sin BPM devuelve 0', () => {
    expect(offsetFromPositions([], 120)).toBe(0)
    expect(offsetFromPositions([0.1], 0)).toBe(0)
  })
})

describe('nextTap', () => {
  it('necesita al menos dos toques para calcular el BPM', () => {
    const first = nextTap([], 1000)
    expect(first.bpm).toBeNull()
    expect(first.taps).toEqual([1000])
  })

  it('calcula 120 BPM con toques cada 500 ms', () => {
    const result = nextTap([1000], 1500)
    expect(result.bpm).toBe(120)
  })

  it('promedia varios toques', () => {
    let taps: number[] = []
    let bpm: number | null = null
    for (const time of [1000, 1500, 2010, 2500]) {
      const result = nextTap(taps, time)
      taps = result.taps
      bpm = result.bpm
    }

    expect(bpm).not.toBeNull()
    expect(bpm as number).toBeGreaterThan(115)
    expect(bpm as number).toBeLessThan(125)
  })

  it('se reinicia si pasa mucho tiempo entre toques', () => {
    const result = nextTap([1000, 1500], 5000)
    expect(result.taps).toEqual([5000])
    expect(result.bpm).toBeNull()
  })
})
