import type { AudioLike, EngineStatus } from './engine'
import { PlayerEngine } from './engine'
import { PlaybackQueue } from './queue'
import type { ChannelMode, LoopMode, QueueTrack, StructureNode } from './types'

export type PlayerSnapshot = {
  currentTrack: QueueTrack | null
  status: EngineStatus
  currentTime: number
  duration: number
  volume: number
  rate: number
  balance: number
  channelMode: ChannelMode
  loopMode: LoopMode
  shuffle: boolean
  abLoop: { a: number; b: number } | null
  loopPointA: number | null
  karaoke: boolean
  crossfadeSeconds: number
  error: string | null
  queue: QueueTrack[]
  queueStructure: StructureNode[]
  sourcePlaylistId: string | null
}

export type RestoreState = {
  trackIds: string[]
  currentId: string | null
  currentTime: number
  loopMode: LoopMode
  shuffle: boolean
  volume: number
  rate: number
  balance?: number
  channelMode?: ChannelMode
  crossfadeSeconds?: number
}

export class PlayerController {
  #localEngine: PlayerEngine
  #streamEngine: PlayerEngine
  #engine: PlayerEngine
  #queue = new PlaybackQueue()
  #listeners = new Set<(snapshot: PlayerSnapshot) => void>()
  #trackEndedListeners = new Set<() => boolean | void>()
  #volume = 1
  #rate = 1
  #balance = 0
  #channelMode: ChannelMode = 'stereo'
  #abLoop: { a: number; b: number } | null = null
  #loopPointA: number | null = null
  #karaoke = false
  #crossfadeSeconds = 2
  #transitionToken = 0
  #lastError: string | null = null
  #sourcePlaylistId: string | null = null
  #externalPlayer: {
    play: (uri: string) => Promise<void> | void
    stop: () => void
  } | null = null

  constructor(audio?: AudioLike, streamAudio?: AudioLike) {
    this.#localEngine = new PlayerEngine(audio)
    this.#streamEngine =
      streamAudio === undefined ? this.#localEngine : new PlayerEngine(streamAudio)
    this.#engine = this.#localEngine

    const engines = new Set([this.#localEngine, this.#streamEngine])
    for (const engine of engines) {
      engine.on('status', () => {
        if (engine === this.#engine) {
          this.#notify()
        }
      })
      engine.on('time', () => {
        if (engine === this.#engine) {
          this.#enforceAbLoop()
          this.#notify()
        }
      })
      engine.on('ended', () => {
        if (engine === this.#engine) {
          this.#handleEnded()
        }
      })
      engine.on('error', (message) => {
        if (engine === this.#engine) {
          this.#lastError = message
          this.#notify()
        }
      })
    }
  }

  setExternalPlayer(
    player: { play: (uri: string) => Promise<void> | void; stop: () => void } | null,
  ): void {
    this.#externalPlayer = player
  }

  #isExternal(track: QueueTrack): boolean {
    return track.external === true || track.sourceUrl.startsWith('spotify:')
  }

  #engineFor(track: QueueTrack): PlayerEngine {
    if (this.#streamEngine === this.#localEngine) {
      return this.#localEngine
    }

    if (track.sourceUrl.startsWith('blob:')) {
      return this.#localEngine
    }

    try {
      return new URL(track.sourceUrl, window.location.href).origin === window.location.origin
        ? this.#localEngine
        : this.#streamEngine
    } catch {
      return this.#streamEngine
    }
  }

  #selectEngine(track: QueueTrack): void {
    const engine = this.#engineFor(track)
    if (engine === this.#engine) {
      return
    }

    for (const candidate of new Set([this.#localEngine, this.#streamEngine])) {
      if (candidate !== engine) {
        candidate.pause()
      }
    }

    this.#engine = engine
  }

  playTracks(tracks: QueueTrack[], startId?: string, sourcePlaylistId: string | null = null): void {
    this.#queue.clear()

    for (const track of tracks) {
      this.#queue.enqueue(track)
    }

    this.#sourcePlaylistId = sourcePlaylistId

    const start = startId ?? tracks[0]?.id
    if (start !== undefined) {
      this.#queue.setCurrent(start)
    }

    const current = this.#queue.currentTrack
    if (current !== null) {
      this.#resetAbLoop()
      this.#notify()
      void this.#transitionTo(current, true)
    } else {
      this.#notify()
    }
  }

  async toggle(): Promise<void> {
    const current = this.#queue.currentTrack
    if (current === null) {
      return
    }

    if (this.#isExternal(current)) {
      try {
        await this.#externalPlayer?.play(current.sourceUrl)
      } catch {
        this.#lastError = 'No se pudo reproducir en Spotify'
      }
      this.#notify()
      return
    }

    await this.#engine.toggle()
    this.#notify()
  }

  next(): void {
    const track = this.#queue.next()
    if (track === null) {
      this.#engine.pause()
      this.#notify()
      return
    }

    this.#resetAbLoop()
    this.#notify()
    void this.#transitionTo(track, true)
  }

  previous(): void {
    const track = this.#queue.previous()
    if (track === null) {
      return
    }

    this.#resetAbLoop()
    this.#notify()
    void this.#transitionTo(track, true)
  }

  pause(): void {
    this.#engine.pause()
    this.#notify()
  }

  async fadeOutAndPause(durationMs = 2500): Promise<void> {
    await this.#rampVolume(1, 0, durationMs)
    this.#engine.pause()
    this.#engine.setVolume(this.#volume)
    this.#notify()
  }

  setCrossfade(seconds: number): void {
    this.#crossfadeSeconds = Math.min(12, Math.max(0, seconds))
    this.#notify()
  }

  onTrackEnded(listener: () => boolean | void): () => void {
    this.#trackEndedListeners.add(listener)
    return () => {
      this.#trackEndedListeners.delete(listener)
    }
  }

  seek(seconds: number): void {
    this.#engine.seek(seconds)
    this.#notify()
  }

  setVolume(value: number): void {
    this.#volume = Math.min(1, Math.max(0, value))
    this.#engine.setVolume(this.#volume)
    this.#notify()
  }

  setRate(value: number): void {
    this.#rate = value
    this.#engine.setRate(value)
    this.#notify()
  }

  setBalance(value: number): void {
    this.#balance = Math.min(1, Math.max(-1, value))
    this.#notify()
  }

  setChannelMode(mode: ChannelMode): void {
    this.#channelMode = mode
    this.#notify()
  }

  setLoopPointA(): void {
    this.#loopPointA = this.#engine.currentTime
    this.#abLoop = null
    this.#notify()
  }

  setLoopPointB(): void {
    const a = this.#loopPointA
    if (a === null) {
      return
    }

    const b = this.#engine.currentTime
    if (b <= a) {
      return
    }

    this.#abLoop = { a, b }
    this.#notify()
  }

  clearAbLoop(): void {
    this.#loopPointA = null
    this.#abLoop = null
    this.#notify()
  }

  setKaraoke(enabled: boolean): void {
    this.#karaoke = enabled
    this.#notify()
  }

  cycleRate(): void {
    const presets = [1, 0.9, 0.75, 0.5]
    const index = presets.indexOf(this.#rate)
    this.setRate(presets[(index + 1) % presets.length])
  }

  toggleShuffle(): void {
    this.#queue.setShuffle(!this.#queue.shuffle)
    this.#notify()
  }

  cycleLoopMode(): void {
    const order: LoopMode[] = ['none', 'all', 'one']
    const index = order.indexOf(this.#queue.loopMode)
    this.#queue.setLoopMode(order[(index + 1) % order.length])
    this.#notify()
  }
  reorder(trackId: string, targetIndex: number, playlistId: string): void {
    if (this.#sourcePlaylistId !== playlistId) {
      return
    }

    if (this.#queue.move(trackId, targetIndex)) {
      this.#notify()
    }
  }

  moveInQueue(trackId: string, targetIndex: number): void {
    if (this.#queue.move(trackId, targetIndex)) {
      this.#notify()
    }
  }

  enqueue(track: QueueTrack): void {
    this.#queue.enqueue(track)
    this.#notify()
  }

  playNext(track: QueueTrack): void {
    this.#queue.insertAfterCurrent(track)
    this.#notify()
  }

  removeFromQueue(trackId: string): void {
    const wasCurrent = this.#queue.currentTrack?.id === trackId
    if (!this.#queue.remove(trackId)) {
      return
    }

    if (wasCurrent) {
      this.#engine.pause()
      const current = this.#queue.currentTrack
      if (current !== null) {
        void this.#transitionTo(current, true)
      } else {
        this.#notify()
      }
      return
    }

    this.#notify()
  }

  clearQueue(): void {
    this.#queue.clear()
    this.#engine.pause()
    this.#sourcePlaylistId = null
    this.#notify()
  }

  restoreSession(tracks: QueueTrack[], state: RestoreState): void {
    this.#queue.restore(tracks, {
      trackIds: state.trackIds,
      currentId: state.currentId,
      loopMode: state.loopMode,
      shuffle: state.shuffle,
    })

    this.#volume = Math.min(1, Math.max(0, state.volume))
    this.#rate = state.rate
    this.#balance = Math.min(1, Math.max(-1, state.balance ?? 0))
    this.#channelMode = state.channelMode ?? 'stereo'
    this.#crossfadeSeconds = Math.min(12, Math.max(0, state.crossfadeSeconds ?? 2))

    const current = this.#queue.currentTrack
    if (current !== null && !this.#isExternal(current)) {
      this.#resetAbLoop()
      this.#selectEngine(current)
      this.#engine.load(current)
      this.#engine.setVolume(this.#volume)
      this.#engine.setRate(this.#rate)
      this.#engine.seek(state.currentTime)
    }

    this.#notify()
  }

  getSnapshot(): PlayerSnapshot {
    const current = this.#queue.currentTrack
    const engineDuration = this.#engine.duration

    return {
      currentTrack: current,
      status: this.#engine.status,
      currentTime: this.#engine.currentTime,
      duration: engineDuration > 0 ? engineDuration : (current?.durationSeconds ?? 0),
      volume: this.#volume,
      rate: this.#rate,
      balance: this.#balance,
      channelMode: this.#channelMode,
      loopMode: this.#queue.loopMode,
      shuffle: this.#queue.shuffle,
      abLoop: this.#abLoop === null ? null : { ...this.#abLoop },
      loopPointA: this.#loopPointA,
      karaoke: this.#karaoke,
      crossfadeSeconds: this.#crossfadeSeconds,
      error: this.#lastError,
      queue: this.#queue.tracks,
      queueStructure: this.#queue.structure(),
      sourcePlaylistId: this.#sourcePlaylistId,
    }
  }

  subscribe(listener: (snapshot: PlayerSnapshot) => void): () => void {
    this.#listeners.add(listener)
    return () => {
      this.#listeners.delete(listener)
    }
  }

  #enforceAbLoop(): void {
    if (this.#abLoop === null) {
      return
    }

    if (this.#engine.currentTime >= this.#abLoop.b) {
      this.#engine.seek(this.#abLoop.a)
    }
  }

  #resetAbLoop(): void {
    this.#abLoop = null
    this.#loopPointA = null
  }

  #handleEnded = (): void => {
    for (const listener of this.#trackEndedListeners) {
      if (listener() === true) {
        this.#notify()
        return
      }
    }

    if (this.#queue.loopMode === 'one') {
      this.#engine.seek(0)
      void this.#engine.play()
      this.#notify()
      return
    }

    const track = this.#queue.next()
    if (track !== null) {
      this.#notify()
      void this.#transitionTo(track, false)
      return
    }

    this.#notify()
  }

  async #transitionTo(track: QueueTrack, fadeOutCurrent: boolean): Promise<void> {
    const token = ++this.#transitionToken

    if (this.#isExternal(track)) {
      this.#resetAbLoop()
      this.#lastError = null
      this.#engine.pause()
      this.#notify()

      try {
        await this.#externalPlayer?.play(track.sourceUrl)
      } catch {
        this.#lastError = 'No se pudo reproducir en Spotify'
      }

      if (token === this.#transitionToken) {
        this.#notify()
      }
      return
    }

    this.#externalPlayer?.stop()
    const crossfade = this.#crossfadeSeconds
    const shouldFade = fadeOutCurrent && crossfade > 0 && !this.#engine.paused

    if (shouldFade) {
      await this.#rampVolume(1, 0, crossfade * 1000)
      if (token !== this.#transitionToken) {
        return
      }
    }

    this.#resetAbLoop()
    this.#lastError = null
    this.#selectEngine(track)
    this.#engine.load(track)
    this.#engine.setRate(this.#rate)
    this.#engine.setVolume(shouldFade ? 0 : this.#volume)
    await this.#engine.play()

    if (token !== this.#transitionToken) {
      return
    }

    if (shouldFade) {
      await this.#rampVolume(0, 1, crossfade * 1000)
      if (token !== this.#transitionToken) {
        return
      }
    }

    this.#engine.setVolume(this.#volume)
    this.#notify()
  }

  #rampVolume(fromFactor: number, toFactor: number, durationMs: number): Promise<void> {
    const steps = Math.max(1, Math.round(durationMs / 50))
    const stepMs = durationMs / steps

    return new Promise((resolve) => {
      let step = 0
      const timer = setInterval(() => {
        step++
        const factor = fromFactor + ((toFactor - fromFactor) * step) / steps
        this.#engine.setVolume(Math.min(1, Math.max(0, this.#volume * factor)))

        if (step >= steps) {
          clearInterval(timer)
          resolve()
        }
      }, stepMs)
    })
  }

  #notify(): void {
    const snapshot = this.getSnapshot()
    for (const listener of this.#listeners) {
      listener(snapshot)
    }
  }
}
