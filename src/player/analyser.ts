export type AnalyserLike = {
  getLevels(): Uint8Array
}

export class WebAudioAnalyser implements AnalyserLike {
  #context: AudioContext | null = null
  #analyser: AnalyserNode | null = null
  #data: Uint8Array<ArrayBuffer> | null = null

  constructor(audio: HTMLAudioElement) {
    if (typeof AudioContext === 'undefined') {
      return
    }

    try {
      const context = new AudioContext()
      const source = context.createMediaElementSource(audio)
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.82
      source.connect(analyser)
      analyser.connect(context.destination)

      this.#context = context
      this.#analyser = analyser
      this.#data = new Uint8Array(analyser.frequencyBinCount)
    } catch {
      this.#context = null
      this.#analyser = null
      this.#data = null
    }
  }

  get available(): boolean {
    return this.#analyser !== null
  }

  getLevels(): Uint8Array {
    if (this.#analyser === null || this.#data === null) {
      return new Uint8Array(0)
    }

    this.#analyser.getByteFrequencyData(this.#data)
    return this.#data
  }

  async resume(): Promise<void> {
    if (this.#context !== null && this.#context.state === 'suspended') {
      await this.#context.resume()
    }
  }
}
