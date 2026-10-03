import type { QueueTrack } from './types'

export type EngineStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended'

export type AudioLike = {
  src: string
  currentTime: number
  readonly duration: number
  readonly paused: boolean
  volume: number
  playbackRate: number
  play(): Promise<void> | void
  pause(): void
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void
}

export type EngineEvents = {
  status: (status: EngineStatus) => void
  time: (currentTime: number, duration: number) => void
  ended: () => void
  error: (message: string) => void
}

export class PlayerEngine {
  #audio: AudioLike
  #status: EngineStatus = 'idle'
  #listeners: { [K in keyof EngineEvents]: Set<EngineEvents[K]> } = {
    status: new Set(),
    time: new Set(),
    ended: new Set(),
    error: new Set(),
  }

  constructor(audio: AudioLike = new Audio()) {
    this.#audio = audio
    this.#audio.addEventListener('timeupdate', this.#handleTimeUpdate)
    this.#audio.addEventListener('ended', this.#handleEnded)
    this.#audio.addEventListener('error', this.#handleError)
    this.#audio.addEventListener('play', this.#handlePlay)
    this.#audio.addEventListener('pause', this.#handlePause)
  }

  get status(): EngineStatus {
    return this.#status
  }

  get currentTime(): number {
    return this.#audio.currentTime
  }

  get duration(): number {
    return Number.isFinite(this.#audio.duration) ? this.#audio.duration : 0
  }

  get paused(): boolean {
    return this.#audio.paused
  }

  load(track: QueueTrack): void {
    this.#audio.src = track.sourceUrl
    this.#audio.currentTime = 0
    this.#setStatus('loading')
    this.#updateMediaSession(track)
  }

  async play(): Promise<void> {
    try {
      await this.#audio.play()
    } catch {
      this.#emit('error', 'No se pudo reproducir el audio')
    }
  }

  pause(): void {
    this.#audio.pause()
  }

  async toggle(): Promise<void> {
    if (this.#audio.paused) {
      await this.play()
    } else {
      this.pause()
    }
  }

  seek(seconds: number): void {
    this.#audio.currentTime = Math.max(0, seconds)
  }

  setVolume(value: number): void {
    this.#audio.volume = Math.min(1, Math.max(0, value))
  }

  setRate(value: number): void {
    this.#audio.playbackRate = value
  }

  destroy(): void {
    this.#audio.removeEventListener('timeupdate', this.#handleTimeUpdate)
    this.#audio.removeEventListener('ended', this.#handleEnded)
    this.#audio.removeEventListener('error', this.#handleError)
    this.#audio.removeEventListener('play', this.#handlePlay)
    this.#audio.removeEventListener('pause', this.#handlePause)
    this.#audio.pause()
  }

  on<K extends keyof EngineEvents>(event: K, listener: EngineEvents[K]): () => void {
    this.#listeners[event].add(listener)
    return () => {
      this.#listeners[event].delete(listener)
    }
  }

  #emit(event: 'status', status: EngineStatus): void
  #emit(event: 'time', currentTime: number, duration: number): void
  #emit(event: 'ended'): void
  #emit(event: 'error', message: string): void
  #emit(event: keyof EngineEvents, ...args: unknown[]): void {
    for (const listener of this.#listeners[event]) {
      ;(listener as (...values: unknown[]) => void)(...args)
    }
  }

  #setStatus(status: EngineStatus): void {
    if (this.#status === status) {
      return
    }
    this.#status = status
    this.#emit('status', status)
  }

  #handleTimeUpdate = (): void => {
    this.#emit('time', this.#audio.currentTime, this.duration)
  }

  #handleEnded = (): void => {
    this.#setStatus('ended')
    this.#emit('ended')
  }

  #handleError = (): void => {
    this.#setStatus('idle')
    this.#emit('error', 'Ocurrió un error al cargar el audio')
  }

  #handlePlay = (): void => {
    this.#setStatus('playing')
  }

  #handlePause = (): void => {
    if (this.#status !== 'ended') {
      this.#setStatus('paused')
    }
  }

  #updateMediaSession(track: QueueTrack): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return
    }

    if (typeof MediaMetadata === 'undefined') {
      return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album ?? undefined,
      artwork: track.artworkUrl === null ? [] : [{ src: track.artworkUrl }],
    })
  }
}
