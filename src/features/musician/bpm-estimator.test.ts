import { describe, expect, it } from 'vitest'
import { estimateBpmFromSamples } from './bpm-estimator'

function clickTrack(bpm: number, seconds: number, sampleRate = 4000): Float32Array {
  const samples = new Float32Array(Math.floor(sampleRate * seconds))
  const interval = Math.floor((sampleRate * 60) / bpm)
  const kickSamples = Math.floor(sampleRate * 0.06)

  for (let start = 0; start + kickSamples < samples.length; start += interval) {
    for (let index = 0; index < kickSamples; index++) {
      const time = index / sampleRate
      samples[start + index] += 0.9 * Math.sin(2 * Math.PI * 60 * time) * Math.exp(-40 * time)
    }
  }

  return samples
}

describe('estimateBpmFromSamples', () => {
  it('estima 120 BPM en un tren de bombos', () => {
    const bpm = estimateBpmFromSamples(clickTrack(120, 20), 4000)

    expect(bpm).not.toBeNull()
    expect(Math.abs((bpm ?? 0) - 120)).toBeLessThanOrEqual(3)
  })

  it('estima 100 BPM', () => {
    const bpm = estimateBpmFromSamples(clickTrack(100, 24), 4000)

    expect(bpm).not.toBeNull()
    expect(Math.abs((bpm ?? 0) - 100)).toBeLessThanOrEqual(3)
  })

  it('sin ataques devuelve null', () => {
    expect(estimateBpmFromSamples(new Float32Array(4000 * 10), 4000)).toBeNull()
  })

  it('con audio demasiado corto devuelve null', () => {
    expect(estimateBpmFromSamples(new Float32Array(4000), 4000)).toBeNull()
  })
})
