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
}

export class PlayerController {
  #engine: PlayerEngine
  #queue = new PlaybackQueue()
  #listeners = new Set<(snapshot: PlayerSnapshot) => void>()
  #volume = 1
  #rate = 1
  #balance = 0
  #channelMode: ChannelMode = 'stereo'
  #sourcePlaylistId: string | null = null

  constructor(audio?: AudioLike) {
    this.#engine = new PlayerEngine(audio)
    this.#engine.on('status', () => {
      this.#notify()
    })
    this.#engine.on('time', () => {
      this.#notify()
    })
    this.#engine.on('ended', this.#handleEnded)
  }

  playTracks(tracks: QueueTrack[], startId?: string, sourcePlaylistId: string | null = null): void {
    this.#queue.clear()

    for (const track of tracks) {
      this.#queue.add(track)
    }

    this.#sourcePlaylistId = sourcePlaylistId

    const start = startId ?? tracks[0]?.id
    if (start !== undefined) {
      this.#queue.setCurrent(start)
    }

    const current = this.#queue.currentTrack
    if (current !== null) {
      this.#engine.load(current)
      this.#engine.setVolume(this.#volume)
      this.#engine.setRate(this.#rate)
      void this.#engine.play()
    }

    this.#notify()
  }

  async toggle(): Promise<void> {
    if (this.#queue.currentTrack === null) {
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

    this.#engine.load(track)
    void this.#engine.play()
    this.#notify()
  }

  previous(): void {
    const track = this.#queue.previous()
    if (track === null) {
      return
    }

    this.#engine.load(track)
    void this.#engine.play()
    this.#notify()
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

    const current = this.#queue.currentTrack
    if (current !== null) {
      this.#engine.load(current)
      this.#engine.setVolume(this.#volume)
      this.#engine.setRate(this.#rate)
      this.#engine.seek(state.currentTime)
    }

    this.#notify()
  }

  getSnapshot(): PlayerSnapshot {
    return {
      currentTrack: this.#queue.currentTrack,
      status: this.#engine.status,
      currentTime: this.#engine.currentTime,
      duration: this.#engine.duration,
      volume: this.#volume,
      rate: this.#rate,
      balance: this.#balance,
      channelMode: this.#channelMode,
      loopMode: this.#queue.loopMode,
      shuffle: this.#queue.shuffle,
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

  #handleEnded = (): void => {
    if (this.#queue.loopMode === 'one') {
      this.#engine.seek(0)
      void this.#engine.play()
      this.#notify()
      return
    }

    const track = this.#queue.next()
    if (track !== null) {
      this.#engine.load(track)
      void this.#engine.play()
    }

    this.#notify()
  }

  #notify(): void {
    const snapshot = this.getSnapshot()
    for (const listener of this.#listeners) {
      listener(snapshot)
    }
  }
}
