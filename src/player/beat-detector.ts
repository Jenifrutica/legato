export type WaveSensitivity = 'soft' | 'normal' | 'aggressive'

export type BeatConfig = {
  fluxThreshold: number
  adaptiveFactor: number
  refractoryMs: number
  halfLifeMs: number
}

export const WAVE_SENSITIVITIES: WaveSensitivity[] = ['soft', 'normal', 'aggressive']

/**
 * Presets de sensibilidad para el detector por flujo espectral de la banda
 * del bombo. `soft` exige un ataque más fuerte y espera más entre golpes;
 * `aggressive` reacciona a golpes suaves y deja pasar tempos rápidos.
 */
export const BEAT_PRESETS: Record<WaveSensitivity, BeatConfig> = {
  soft: { fluxThreshold: 0.08, adaptiveFactor: 2.2, refractoryMs: 220, halfLifeMs: 170 },
  normal: { fluxThreshold: 0.05, adaptiveFactor: 1.6, refractoryMs: 180, halfLifeMs: 130 },
  aggressive: { fluxThreshold: 0.03, adaptiveFactor: 1.2, refractoryMs: 140, halfLifeMs: 100 },
}

/**
 * Detector de golpes por flujo espectral: recibe el nivel normalizado de la
 * banda del bombo (0–1) y devuelve la energía del golpe con su envolvente.
 * Es puro y sin dependencias para poder medirlo con datos sintéticos.
 */
export class BeatDetector {
  #config: BeatConfig
  #prevBass = 0
  #fluxAverage = 0.02
  #energy = 0
  #lastBeatAt = -Infinity
  #lastAt: number | null = null

  constructor(sensitivity: WaveSensitivity = 'normal') {
    this.#config = BEAT_PRESETS[sensitivity]
  }

  setSensitivity(sensitivity: WaveSensitivity): void {
    this.#config = BEAT_PRESETS[sensitivity]
  }

  get energy(): number {
    return this.#energy
  }

  reset(): void {
    this.#prevBass = 0
    this.#fluxAverage = 0.02
    this.#energy = 0
    this.#lastBeatAt = -Infinity
    this.#lastAt = null
  }

  process(bass: number, timeMs: number): number {
    // El primer cuadro solo fija la línea base: arrancar el audio no es un golpe.
    if (this.#lastAt === null) {
      this.#lastAt = timeMs
      this.#prevBass = bass
      return this.#energy
    }

    const dtMs = Math.min(200, Math.max(8, timeMs - this.#lastAt))
    this.#lastAt = timeMs

    const flux = Math.max(0, bass - this.#prevBass)
    this.#prevBass = bass
    this.#fluxAverage = this.#fluxAverage * 0.9 + flux * 0.1

    if (
      flux > this.#config.fluxThreshold &&
      flux > this.#fluxAverage * this.#config.adaptiveFactor &&
      timeMs - this.#lastBeatAt > this.#config.refractoryMs
    ) {
      this.#energy = 1
      this.#lastBeatAt = timeMs
    }

    // Vida media medida en milisegundos para que no dependa de los fps.
    this.#energy *= Math.pow(0.5, dtMs / this.#config.halfLifeMs)
    return this.#energy
  }
}
