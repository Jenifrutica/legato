import { describe, expect, it } from 'vitest'
import { fftMagnitudes } from './fft'

describe('fftMagnitudes', () => {
  it('encuentra el pico de un seno en su bin', () => {
    const size = 1024
    const sampleRate = 8192
    const frequency = 1000
    const samples = new Float32Array(size)
    for (let index = 0; index < size; index++) {
      samples[index] = Math.sin((2 * Math.PI * frequency * index) / sampleRate)
    }

    const magnitudes = fftMagnitudes(samples)
    let peak = 0
    for (let index = 1; index < magnitudes.length; index++) {
      if ((magnitudes[index] ?? 0) > (magnitudes[peak] ?? 0)) {
        peak = index
      }
    }

    expect(Math.abs(peak - 125)).toBeLessThanOrEqual(1)
  })

  it('una señal constante concentra la energía en la componente DC', () => {
    const magnitudes = fftMagnitudes(new Float32Array(256).fill(1))
    let peak = 0
    for (let index = 1; index < magnitudes.length; index++) {
      if ((magnitudes[index] ?? 0) > (magnitudes[peak] ?? 0)) {
        peak = index
      }
    }

    expect(peak).toBe(0)
  })
})
