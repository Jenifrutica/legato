import type { ChannelMode } from './types'

export type AnalyserLike = {
  getLevels(): Uint8Array
}

export class AudioGraph implements AnalyserLike {
  #context: AudioContext | null = null
  #analyser: AnalyserNode | null = null
  #leftGain: GainNode | null = null
  #rightGain: GainNode | null = null
  #merger: ChannelMergerNode | null = null
  #data: Uint8Array<ArrayBuffer> | null = null
  #balance = 0
  #channelMode: ChannelMode = 'stereo'

  constructor(audio: HTMLAudioElement) {
    if (typeof AudioContext === 'undefined') {
      return
    }

    try {
      const context = new AudioContext()
      const source = context.createMediaElementSource(audio)
      const splitter = context.createChannelSplitter(2)
      const leftGain = context.createGain()
      const rightGain = context.createGain()
      const merger = context.createChannelMerger(2)
      const analyser = context.createAnalyser()

      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.82

      source.connect(splitter)
      splitter.connect(leftGain, 0)
      splitter.connect(rightGain, 1)
      merger.connect(analyser)
      analyser.connect(context.destination)

      this.#context = context
      this.#analyser = analyser
      this.#leftGain = leftGain
      this.#rightGain = rightGain
      this.#merger = merger
      this.#data = new Uint8Array(analyser.frequencyBinCount)

      this.#applyRouting()
      this.#applyGains()
    } catch {
      this.#context = null
      this.#analyser = null
      this.#leftGain = null
      this.#rightGain = null
      this.#merger = null
      this.#data = null
    }
  }

  get available(): boolean {
    return this.#analyser !== null
  }

  get balance(): number {
    return this.#balance
  }

  get channelMode(): ChannelMode {
    return this.#channelMode
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

  #applyRouting(): void {
    const leftGain = this.#leftGain
    const rightGain = this.#rightGain
    const merger = this.#merger

    if (leftGain === null || rightGain === null || merger === null) {
      return
    }

    leftGain.disconnect()
    rightGain.disconnect()

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

    if (this.#channelMode === 'left') {
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
