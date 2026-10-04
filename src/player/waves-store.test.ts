import { describe, expect, it } from 'vitest'
import { clampBpm, MAX_BPM, MIN_BPM, nextTap } from './waves-store'

describe('clampBpm', () => {
  it('limita el rango y corrige valores inválidos', () => {
    expect(clampBpm(0)).toBe(MIN_BPM)
    expect(clampBpm(999)).toBe(MAX_BPM)
    expect(clampBpm(119.6)).toBe(120)
    expect(clampBpm(Number.NaN)).toBe(120)
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
