import type { ChannelMode } from './types'

export type AnalyserLike = {
  getLevels(): Uint8Array
  getBeatBass?(): number
}

export class AudioGraph implements AnalyserLike {
  #context: AudioContext | null = null
  #analyser: AnalyserNode | null = null
  #beatAnalyser: AnalyserNode | null = null
  #beatData: Uint8Array<ArrayBuffer> | null = null
  #beatStartBin = 0
  #beatEndBin = 0
  #bass: BiquadFilterNode | null = null
  #leftGain: GainNode | null = null
  #rightGain: GainNode | null = null
  #merger: ChannelMergerNode | null = null
  #data: Uint8Array<ArrayBuffer> | null = null
  #balance = 0
  #channelMode: ChannelMode = 'stereo'
  #karaoke = false
  #bassDb = 0

  constructor(audio: HTMLAudioElement, secondAudio?: HTMLAudioElement) {
    if (typeof AudioContext === 'undefined') {
      return
    }

    try {
      const context = new AudioContext()
      const source = context.createMediaElementSource(audio)
      const splitter = context.createChannelSplitter(2)

      // Segundo deck local (para el crossfade con solape): también pasa por el
      // grafo para conservar balance, karaoke, bajos y analizador. Si falla,
      // el deck A sigue sonando (el crossfade cae a modo secuencial).
      if (secondAudio !== undefined) {
        try {
          context.createMediaElementSource(secondAudio).connect(splitter)
        } catch (error) {
          console.warn('[audio-graph] no se pudo enrutar el segundo deck', error)
        }
      }
      const leftGain = context.createGain()
      const rightGain = context.createGain()
      const merger = context.createChannelMerger(2)
      const bass = context.createBiquadFilter()
      const analyser = context.createAnalyser()
      // Analizador aparte para los golpes: sin suavizado y con más resolución
      // en la banda del bombo (40–150 Hz).
      const beatAnalyser = context.createAnalyser()

      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.68
      beatAnalyser.fftSize = 1024
      beatAnalyser.smoothingTimeConstant = 0
      // Margen dinámico amplio: con los valores por defecto (-100..-30 dB) un
      // bajo continuo satura los bins del bombo y aplasta el flujo del golpe.
      beatAnalyser.minDecibels = -90
      beatAnalyser.maxDecibels = -10
      bass.type = 'lowshelf'
      bass.frequency.value = 180

      const binHz = context.sampleRate / beatAnalyser.fftSize
      const beatStartBin = Math.max(0, Math.floor(40 / binHz))
      const beatEndBin = Math.min(
        beatAnalyser.frequencyBinCount - 1,
        Math.max(beatStartBin, Math.floor(150 / binHz)),
      )

      source.connect(splitter)
      splitter.connect(leftGain, 0)
      splitter.connect(rightGain, 1)
      merger.connect(bass)
      bass.connect(analyser)
      analyser.connect(beatAnalyser)
      beatAnalyser.connect(context.destination)

      this.#context = context
      this.#analyser = analyser
      this.#beatAnalyser = beatAnalyser
      this.#beatStartBin = beatStartBin
      this.#beatEndBin = beatEndBin
      this.#bass = bass
      this.#leftGain = leftGain
      this.#rightGain = rightGain
      this.#merger = merger
      this.#data = new Uint8Array(analyser.frequencyBinCount)
      this.#beatData = new Uint8Array(beatAnalyser.frequencyBinCount)

      this.#applyRouting()
      this.#applyGains()
    } catch (error) {
      console.warn('[audio-graph] no se pudo crear el grafo de audio', error)
      this.#context = null
      this.#analyser = null
      this.#beatAnalyser = null
      this.#beatData = null
      this.#bass = null
      this.#leftGain = null
      this.#rightGain = null
      this.#merger = null
      this.#data = null
    }
  }

  get available(): boolean {
    return this.#analyser !== null
  }

  get audioContext(): AudioContext | null {
    return this.#context
  }

  get balance(): number {
    return this.#balance
  }

  get channelMode(): ChannelMode {
    return this.#channelMode
  }

  get karaoke(): boolean {
    return this.#karaoke
  }

  getLevels(): Uint8Array {
    if (this.#analyser === null || this.#data === null) {
      return new Uint8Array(0)
    }

    this.#analyser.getByteFrequencyData(this.#data)
    return this.#data
  }

  /** Nivel medio normalizado (0–1) de la banda del bombo, sin suavizado. */
  getBeatBass(): number {
    if (this.#beatAnalyser === null || this.#beatData === null) {
      return 0
    }

    this.#beatAnalyser.getByteFrequencyData(this.#beatData)
    let sum = 0
    let count = 0
    for (let index = this.#beatStartBin; index <= this.#beatEndBin; index++) {
      sum += this.#beatData[index] ?? 0
      count++
    }

    return count === 0 ? 0 : sum / (count * 255)
  }

  async resume(): Promise<void> {
    if (this.#context !== null && this.#context.state === 'suspended') {
      await this.#context.resume()
    }
  }

  setBalance(value: number): void {
    this.#balance = Math.min(1, Math.max(-1, value))
    this.#applyGains()
  }

  setChannelMode(mode: ChannelMode): void {
    if (mode === this.#channelMode) {
      return
    }

    this.#channelMode = mode
    this.#applyRouting()
    this.#applyGains()
  }

  setKaraoke(enabled: boolean): void {
    if (enabled === this.#karaoke) {
      return
    }

    this.#karaoke = enabled
    this.#applyRouting()
    this.#applyGains()
  }

  setBass(gainDb: number): void {
    this.#bassDb = Math.min(12, Math.max(-12, gainDb))
    if (this.#bass === null || this.#context === null) {
      return
    }

    this.#bass.gain.setTargetAtTime(this.#bassDb, this.#context.currentTime, 0.03)
  }

  #applyRouting(): void {
    const leftGain = this.#leftGain
    const rightGain = this.#rightGain
    const merger = this.#merger

    if (leftGain === null || rightGain === null || merger === null) {
      return
    }

    leftGain.disconnect()
    rightGain.disconnect()

    if (this.#karaoke) {
      leftGain.connect(merger, 0, 0)
      leftGain.connect(merger, 0, 1)
      rightGain.connect(merger, 0, 0)
      rightGain.connect(merger, 0, 1)
      return
    }

    if (this.#channelMode === 'mono') {
      leftGain.connect(merger, 0, 0)
      leftGain.connect(merger, 0, 1)
      rightGain.connect(merger, 0, 0)
      rightGain.connect(merger, 0, 1)
    } else {
      leftGain.connect(merger, 0, 0)
      rightGain.connect(merger, 0, 1)
    }
  }

  #applyGains(): void {
    const context = this.#context
    const leftGain = this.#leftGain
    const rightGain = this.#rightGain

    if (context === null || leftGain === null || rightGain === null) {
      return
    }

    const angle = ((this.#balance + 1) * Math.PI) / 4
    let left = Math.cos(angle)
    let right = Math.sin(angle)

    if (this.#karaoke) {
      left = 1
      right = -1
    } else if (this.#channelMode === 'left') {
      left = 1
      right = 0
    } else if (this.#channelMode === 'right') {
      left = 0
      right = 1
    } else if (this.#channelMode === 'mono') {
      left *= 0.5
      right *= 0.5
    }

    const now = context.currentTime
    leftGain.gain.setTargetAtTime(left, now, 0.02)
    rightGain.gain.setTargetAtTime(right, now, 0.02)
  }
}
