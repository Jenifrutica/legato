import { clampBpm } from '../../player'

export const BEATS_PER_BAR_OPTIONS = [2, 3, 4, 6] as const
export type BeatsPerBar = (typeof BEATS_PER_BAR_OPTIONS)[number]

export function clampBeatsPerBar(value: number): BeatsPerBar {
  return (BEATS_PER_BAR_OPTIONS as readonly number[]).includes(value) ? (value as BeatsPerBar) : 4
}

export function clampClickVolume(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.6
}

/** El primer tiempo lleva acento; en 6/8 también el cuarto. */
export function isAccent(beatIndex: number, beatsPerBar: number): boolean {
  const index = beatsPerBar <= 0 ? 0 : beatIndex % beatsPerBar
  if (beatsPerBar === 6) {
    return index === 0 || index === 3
  }
  return index === 0
}

export type ScheduledClick = {
  time: number
  accent: boolean
}

/**
 * Programador puro del metrónomo con lookahead: la UI lo despierta cada
 * pocos milisegundos y él devuelve los clics que hay que agendar en el
 * AudioContext. Sin dependencias para poder testearlo con un reloj falso.
 */
export class MetronomeScheduler {
  #bpm = 120
  #beatsPerBar: BeatsPerBar = 4
  #lookaheadSeconds: number
  #running = false
  #nextTime = 0
  #lastTime = 0
  #beatIndex = 0

  constructor(options?: { bpm?: number; beatsPerBar?: number; lookaheadSeconds?: number }) {
    this.#bpm = clampBpm(options?.bpm ?? 120)
    this.#beatsPerBar = clampBeatsPerBar(options?.beatsPerBar ?? 4)
    this.#lookaheadSeconds = options?.lookaheadSeconds ?? 0.12
  }

  get running(): boolean {
    return this.#running
  }

  get bpm(): number {
    return this.#bpm
  }

  get beatsPerBar(): BeatsPerBar {
    return this.#beatsPerBar
  }

  start(fromTime: number): void {
    this.#running = true
    this.#nextTime = fromTime
    this.#lastTime = fromTime
    this.#beatIndex = 0
  }

  stop(): void {
    this.#running = false
  }

  setBpm(bpm: number): void {
    const value = clampBpm(bpm)
    if (value === this.#bpm) {
      return
    }

    this.#bpm = value
    // El siguiente pulso se reagenda desde el último clic para que el cambio
    // de tempo se sienta inmediato.
    if (this.#running) {
      this.#nextTime = this.#lastTime + 60 / value
    }
  }

  setBeatsPerBar(beats: number): void {
    this.#beatsPerBar = clampBeatsPerBar(beats)
  }

  tick(now: number): ScheduledClick[] {
    if (!this.#running) {
      return []
    }

    const secondsPerBeat = 60 / this.#bpm

    // Si el reloj se atrasó (pestaña oculta, GC), saltamos al siguiente pulso
    // sin perder la fase ni el acento.
    if (this.#nextTime < now) {
      const missed = Math.ceil((now - this.#nextTime) / secondsPerBeat)
      this.#nextTime += missed * secondsPerBeat
      this.#beatIndex += missed
    }

    const clicks: ScheduledClick[] = []
    while (this.#nextTime < now + this.#lookaheadSeconds) {
      clicks.push({
        time: this.#nextTime,
        accent: isAccent(this.#beatIndex, this.#beatsPerBar),
      })
      this.#lastTime = this.#nextTime
      this.#nextTime += secondsPerBeat
      this.#beatIndex++
    }

    return clicks
  }
}

export type ClickPlayer = (
  context: AudioContext,
  time: number,
  accent: boolean,
  volume: number,
) => void

export function playWebAudioClick(
  context: AudioContext,
  time: number,
  accent: boolean,
  volume: number,
): void {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(accent ? 1568 : 1047, time)
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.linearRampToValueAtTime(Math.max(0.001, clampClickVolume(volume)), time + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(time)
  oscillator.stop(time + 0.09)
}

/** Motor del metrónomo: agenda los clics sobre el AudioContext y los sintetiza. */
export class MetronomeEngine {
  #getContext: () => AudioContext | null
  #playClick: ClickPlayer
  #scheduler: MetronomeScheduler
  #timer: ReturnType<typeof setInterval> | null = null
  #volume = 0.6

  constructor(
    getContext: () => AudioContext | null,
    playClick: ClickPlayer = playWebAudioClick,
    options?: { bpm?: number; beatsPerBar?: number },
  ) {
    this.#getContext = getContext
    this.#playClick = playClick
    this.#scheduler = new MetronomeScheduler(options)
    this.#volume = 0.6
  }

  get running(): boolean {
    return this.#scheduler.running
  }

  get volume(): number {
    return this.#volume
  }

  start(): boolean {
    const context = this.#getContext()
    if (context === null) {
      return false
    }

    void context.resume()
    this.#scheduler.start(context.currentTime + 0.05)
    this.#timer ??= setInterval(() => this.#flush(), 25)
    return true
  }

  stop(): void {
    if (this.#timer !== null) {
      clearInterval(this.#timer)
      this.#timer = null
    }
    this.#scheduler.stop()
  }

  setBpm(bpm: number): void {
    this.#scheduler.setBpm(bpm)
  }

  setBeatsPerBar(beats: number): void {
    this.#scheduler.setBeatsPerBar(beats)
  }

  setVolume(volume: number): void {
    this.#volume = clampClickVolume(volume)
  }

  #flush(): void {
    const context = this.#getContext()
    if (context === null) {
      return
    }

    for (const click of this.#scheduler.tick(context.currentTime)) {
      this.#playClick(context, click.time, click.accent, this.#volume)
    }
  }
}
