import { describe, expect, it } from 'vitest'
import { BEAT_PRESETS, BeatDetector, WAVE_SENSITIVITIES } from './beat-detector'
import type { WaveSensitivity } from './beat-detector'

const ONSET = 0.7

function simulate(
  kickAmplitude: number,
  intervalMs: number,
  durationMs: number,
  sensitivity: WaveSensitivity,
): number[] {
  const detector = new BeatDetector(sensitivity)
  const onsets: number[] = []
  let previous = 0

  for (let time = 0; time <= durationMs; time += 33) {
    const phase = (time % intervalMs) / intervalMs
    const bass = kickAmplitude * Math.exp(-phase * 12)
    const energy = detector.process(bass, time)
    if (energy > ONSET && previous <= ONSET) {
      onsets.push(time)
    }
    previous = energy
  }

  return onsets
}

describe('BeatDetector', () => {
  it('detecta golpes cada 500 ms (120 BPM) sin desfase', () => {
    const onsets = simulate(0.8, 500, 20_000, 'normal')

    expect(onsets.length).toBeGreaterThanOrEqual(36)
    for (let index = 1; index < onsets.length; index++) {
      const interval = (onsets[index] ?? 0) - (onsets[index - 1] ?? 0)
      expect(interval).toBeGreaterThanOrEqual(450)
      expect(interval).toBeLessThanOrEqual(550)
    }
  })

  it('respeta el periodo refractario en golpes muy seguidos', () => {
    const onsets = simulate(0.8, 100, 4000, 'aggressive')

    expect(onsets.length).toBeGreaterThan(3)
    for (let index = 1; index < onsets.length; index++) {
      const interval = (onsets[index] ?? 0) - (onsets[index - 1] ?? 0)
      expect(interval).toBeGreaterThanOrEqual(BEAT_PRESETS.aggressive.refractoryMs)
    }
  })

  it('la sensibilidad agresiva detecta golpes suaves que la suave ignora', () => {
    const aggressive = simulate(0.06, 1000, 5000, 'aggressive')
    const soft = simulate(0.06, 1000, 5000, 'soft')

    expect(aggressive.length).toBeGreaterThanOrEqual(3)
    expect(soft).toHaveLength(0)
  })

  it('sin cambios de energía no hay golpes', () => {
    const detector = new BeatDetector('aggressive')
    const onsets: number[] = []

    for (let time = 0; time <= 5000; time += 33) {
      const energy = detector.process(0.3, time)
      if (energy > ONSET) {
        onsets.push(time)
      }
    }

    expect(onsets).toHaveLength(0)
  })

  it('reset deja el detector en reposo', () => {
    const detector = new BeatDetector('normal')
    detector.process(0, 0)
    expect(detector.process(0.9, 33)).toBeGreaterThan(0.5)

    detector.reset()
    expect(detector.energy).toBe(0)

    detector.process(0, 100)
    expect(detector.process(0.9, 133)).toBeGreaterThan(0.5)
  })

  it('los presets van de menos a más sensibles', () => {
    expect(WAVE_SENSITIVITIES).toEqual(['soft', 'normal', 'aggressive'])
    expect(BEAT_PRESETS.soft.fluxThreshold).toBeGreaterThan(BEAT_PRESETS.normal.fluxThreshold)
    expect(BEAT_PRESETS.normal.fluxThreshold).toBeGreaterThan(BEAT_PRESETS.aggressive.fluxThreshold)
    expect(BEAT_PRESETS.soft.refractoryMs).toBeGreaterThan(BEAT_PRESETS.aggressive.refractoryMs)
  })
})
