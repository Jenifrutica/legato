import { describe, expect, it } from 'vitest'
import { useAudioFxStore } from './audio-fx'

describe('efectos de audio', () => {
  it('limita los bajos al rango -12..12 dB', () => {
    useAudioFxStore.getState().setBass(50)
    expect(useAudioFxStore.getState().bassDb).toBe(12)

    useAudioFxStore.getState().setBass(-50)
    expect(useAudioFxStore.getState().bassDb).toBe(-12)

    useAudioFxStore.getState().setBass(-5)
    expect(useAudioFxStore.getState().bassDb).toBe(-5)
  })

  it('limita el volumen del ambiente al rango 0..1', () => {
    useAudioFxStore.getState().setAmbientVolume(4)
    expect(useAudioFxStore.getState().ambientVolume).toBe(1)

    useAudioFxStore.getState().setAmbientVolume(-1)
    expect(useAudioFxStore.getState().ambientVolume).toBe(0)
  })
})
