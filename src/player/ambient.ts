export type AmbientId = 'rain' | 'vinyl' | 'cafe' | 'wind'

export const AMBIENT_IDS: AmbientId[] = ['rain', 'vinyl', 'cafe', 'wind']

type AmbientPreset = {
  type: BiquadFilterType
  frequency: number
  q: number
  gain: number
  lfoRate?: number
  lfoDepth?: number
}

const PRESETS: Record<AmbientId, AmbientPreset> = {
  rain: { type: 'highpass', frequency: 700, q: 0.6, gain: 0.5 },
  vinyl: { type: 'lowpass', frequency: 2600, q: 0.7, gain: 0.4 },
  cafe: { type: 'lowpass', frequency: 700, q: 0.4, gain: 0.5, lfoRate: 0.12, lfoDepth: 0.25 },
  wind: { type: 'lowpass', frequency: 420, q: 0.5, gain: 0.6, lfoRate: 0.07, lfoDepth: 0.4 },
}

function createNoiseBuffer(context: AudioContext): AudioBuffer {
  const seconds = 2
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index++) {
    data[index] = Math.random() * 2 - 1
  }
  return buffer
}

/**
 * Camas de ambiente generadas por ruido filtrado (sin archivos con licencia).
 * Se conectan directo a la salida del contexto, con ganancia propia.
 */
export class AmbientEngine {
  #context: AudioContext | null = null
  #source: AudioBufferSourceNode | null = null
  #gain: GainNode | null = null
  #lfo: OscillatorNode | null = null
  #presetGain = 0.5
  #volume = 0.5

  get running(): boolean {
    return this.#source !== null
  }

  start(context: AudioContext, id: AmbientId, volume: number): void {
    this.stop()

    const preset = PRESETS[id]
    const source = context.createBufferSource()
    source.buffer = createNoiseBuffer(context)
    source.loop = true

    const filter = context.createBiquadFilter()
    filter.type = preset.type
    filter.frequency.value = preset.frequency
    filter.Q.value = preset.q

    const gain = context.createGain()
    this.#presetGain = preset.gain
    this.#volume = Math.min(1, Math.max(0, volume))
    gain.gain.value = this.#volume * preset.gain

    source.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)

    if (preset.lfoRate !== undefined && preset.lfoDepth !== undefined) {
      const lfo = context.createOscillator()
      lfo.frequency.value = preset.lfoRate
      const depth = context.createGain()
      depth.gain.value = preset.lfoDepth * preset.gain * this.#volume
      lfo.connect(depth)
      depth.connect(gain.gain)
      lfo.start()
      this.#lfo = lfo
    }

    source.start()

    this.#context = context
    this.#source = source
    this.#gain = gain
  }

  stop(): void {
    if (this.#source !== null) {
      try {
        this.#source.stop()
      } catch {
        // ya detenido
      }
      this.#source.disconnect()
      this.#source = null
    }

    if (this.#lfo !== null) {
      try {
        this.#lfo.stop()
      } catch {
        // ya detenido
      }
      this.#lfo.disconnect()
      this.#lfo = null
    }

    this.#gain?.disconnect()
    this.#gain = null
    this.#context = null
  }

  setVolume(volume: number): void {
    this.#volume = Math.min(1, Math.max(0, volume))
    if (this.#gain !== null && this.#context !== null) {
      this.#gain.gain.setTargetAtTime(
        this.#volume * this.#presetGain,
        this.#context.currentTime,
        0.05,
      )
    }
  }
}
