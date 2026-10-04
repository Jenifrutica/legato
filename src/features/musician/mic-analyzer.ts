import { clampBpm } from '../../player'

/** Latencia aproximada entre el sonido real y su captura por el micrófono. */
export const MIC_LATENCY_SECONDS = 0.08

export type MicStartResult =
  { ok: true } | { ok: false; error: 'denied' | 'unavailable' | 'unknown' }

/** BPM a partir de los golpes oídos (mediana de intervalos razonables). */
export function estimateBpmFromBeats(beatTimes: number[]): number | null {
  if (beatTimes.length < 3) {
    return null
  }

  const intervals: number[] = []
  for (let index = 1; index < beatTimes.length; index++) {
    const interval = (beatTimes[index] ?? 0) - (beatTimes[index - 1] ?? 0)
    if (interval > 0.25 && interval < 1.5) {
      intervals.push(interval)
    }
  }
  if (intervals.length === 0) {
    return null
  }

  intervals.sort((a, b) => a - b)
  const median = intervals[Math.floor(intervals.length / 2)] ?? 0.5
  return clampBpm(Math.round(60 / median))
}

/** Fase media (segundos dentro del compás) de los golpes oídos a un BPM. */
export function phaseFromBeats(beatTimes: number[], bpm: number): number {
  if (beatTimes.length === 0 || bpm <= 0) {
    return 0
  }

  const period = 60 / bpm
  let angle = 0
  for (const time of beatTimes) {
    const inside = ((time % period) + period) % period
    angle += (2 * Math.PI * inside) / period
  }
  angle /= beatTimes.length
  return ((angle / (2 * Math.PI)) * period + period) % period
}

/**
 * Micrófono como fuente de análisis: cadena source → niveles → beat → gain 0
 * al destino (silencio total, sin realimentación). El audio no sale del equipo.
 */
export class MicAnalyzer {
  #context: AudioContext | null = null
  #stream: MediaStream | null = null
  #levels: AnalyserNode | null = null
  #beat: AnalyserNode | null = null
  #levelsData: Uint8Array<ArrayBuffer> | null = null
  #beatData: Uint8Array<ArrayBuffer> | null = null
  #beatStartBin = 0
  #beatEndBin = 0
  #frameSize = 4096

  get listening(): boolean {
    return this.#levels !== null
  }

  get sampleRate(): number {
    return this.#context?.sampleRate ?? 48000
  }

  get frameSize(): number {
    return this.#frameSize
  }

  async start(): Promise<MicStartResult> {
    if (this.listening) {
      return { ok: true }
    }
    if (
      typeof navigator === 'undefined' ||
      navigator.mediaDevices === undefined ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      return { ok: false, error: 'unavailable' }
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      const denied = name === 'NotAllowedError' || name === 'SecurityError'
      return { ok: false, error: denied ? 'denied' : 'unavailable' }
    }

    try {
      const context = new AudioContext()
      await context.resume()

      const source = context.createMediaStreamSource(stream)
      const levels = context.createAnalyser()
      levels.fftSize = this.#frameSize
      levels.smoothingTimeConstant = 0.4

      const beat = context.createAnalyser()
      beat.fftSize = 1024
      beat.smoothingTimeConstant = 0
      // Mismo margen dinámico que en el grafo local: evita que la banda del
      // bombo se sature con un bajo continuo.
      beat.minDecibels = -90
      beat.maxDecibels = -10

      const silent = context.createGain()
      silent.gain.value = 0

      const binHz = context.sampleRate / beat.fftSize
      const beatStartBin = Math.max(0, Math.floor(40 / binHz))
      const beatEndBin = Math.min(
        beat.frequencyBinCount - 1,
        Math.max(beatStartBin, Math.floor(150 / binHz)),
      )

      source.connect(levels)
      levels.connect(beat)
      beat.connect(silent)
      silent.connect(context.destination)

      this.#context = context
      this.#stream = stream
      this.#levels = levels
      this.#beat = beat
      this.#levelsData = new Uint8Array(levels.frequencyBinCount)
      this.#beatData = new Uint8Array(beat.frequencyBinCount)
      this.#beatStartBin = beatStartBin
      this.#beatEndBin = beatEndBin
      return { ok: true }
    } catch {
      for (const track of stream.getTracks()) {
        track.stop()
      }
      return { ok: false, error: 'unknown' }
    }
  }

  /** Espectro completo para el croma (acordes en vivo). */
  getLevels(): Uint8Array {
    if (this.#levels === null || this.#levelsData === null) {
      return new Uint8Array(0)
    }
    this.#levels.getByteFrequencyData(this.#levelsData)
    return this.#levelsData
  }

  /** Nivel medio normalizado (0–1) de la banda del bombo, sin suavizado. */
  getBeatBass(): number {
    if (this.#beat === null || this.#beatData === null) {
      return 0
    }

    this.#beat.getByteFrequencyData(this.#beatData)
    let sum = 0
    let count = 0
    for (let index = this.#beatStartBin; index <= this.#beatEndBin; index++) {
      sum += this.#beatData[index] ?? 0
      count++
    }
    return count === 0 ? 0 : sum / (count * 255)
  }

  stop(): void {
    try {
      for (const track of this.#stream?.getTracks() ?? []) {
        track.stop()
      }
    } catch {
      // el stream ya no existe
    }
    void this.#context?.close()

    this.#context = null
    this.#stream = null
    this.#levels = null
    this.#beat = null
    this.#levelsData = null
    this.#beatData = null
  }
}
