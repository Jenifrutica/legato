export type TimerMode = 'off' | 'duration' | 'endOfTrack' | 'tracks'

export type TimerSnapshot = {
  mode: TimerMode
  remainingMs: number | null
  remainingTracks: number | null
}

export class SleepTimer {
  #mode: TimerMode = 'off'
  #endsAt: number | null = null
  #remainingTracks: number | null = null
  #interval: ReturnType<typeof setInterval> | null = null
  #listeners = new Set<(snapshot: TimerSnapshot) => void>()
  #onExpire: () => void

  constructor(onExpire: () => void) {
    this.#onExpire = onExpire
  }

  get mode(): TimerMode {
    return this.#mode
  }

  startMinutes(minutes: number): void {
    this.#clearInterval()
    this.#mode = 'duration'
    this.#endsAt = Date.now() + minutes * 60_000
    this.#remainingTracks = null
    this.#interval = setInterval(() => this.#tick(), 1000)
    this.#notify()
  }

  startEndOfTrack(): void {
    this.#clearInterval()
    this.#mode = 'endOfTrack'
    this.#endsAt = null
    this.#remainingTracks = null
    this.#notify()
  }

  startAfterTracks(count: number): void {
    this.#clearInterval()
    this.#mode = 'tracks'
    this.#endsAt = null
    this.#remainingTracks = count
    this.#notify()
  }

  cancel(): void {
    this.#clearInterval()
    this.#mode = 'off'
    this.#endsAt = null
    this.#remainingTracks = null
    this.#notify()
  }

  onTrackEnded(): boolean {
    if (this.#mode === 'endOfTrack') {
      this.cancel()
      this.#onExpire()
      return true
    }

    if (this.#mode === 'tracks' && this.#remainingTracks !== null) {
      this.#remainingTracks -= 1
      if (this.#remainingTracks <= 0) {
        this.cancel()
        this.#onExpire()
        return true
      }
      this.#notify()
    }

    return false
  }

  getSnapshot(): TimerSnapshot {
    if (this.#mode === 'duration' && this.#endsAt !== null) {
      return {
        mode: this.#mode,
        remainingMs: Math.max(0, this.#endsAt - Date.now()),
        remainingTracks: null,
      }
    }

    return {
      mode: this.#mode,
      remainingMs: null,
      remainingTracks: this.#remainingTracks,
    }
  }

  subscribe(listener: (snapshot: TimerSnapshot) => void): () => void {
    this.#listeners.add(listener)
    return () => {
      this.#listeners.delete(listener)
    }
  }

  destroy(): void {
    this.#clearInterval()
    this.#listeners.clear()
  }

  #tick(): void {
    if (this.#mode !== 'duration' || this.#endsAt === null) {
      return
    }

    if (Date.now() >= this.#endsAt) {
      this.cancel()
      this.#onExpire()
      return
    }

    this.#notify()
  }

  #notify(): void {
    const snapshot = this.getSnapshot()
    for (const listener of this.#listeners) {
      listener(snapshot)
    }
  }

  #clearInterval(): void {
    if (this.#interval !== null) {
      clearInterval(this.#interval)
      this.#interval = null
    }
  }
}
