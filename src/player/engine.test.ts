import { describe, expect, it, vi } from 'vitest'
import { PlayerEngine } from './engine'
import type { AudioLike } from './engine'
import type { QueueTrack } from './types'

class FakeAudio implements AudioLike {
  src = ''
  currentTime = 0
  duration = 180
  paused = true
  volume = 1
  playbackRate = 1
  listeners = new Map<string, Set<(event: Event) => void>>()

  play(): void {
    this.paused = false
    this.dispatch('play')
  }

  pause(): void {
    this.paused = true
    this.dispatch('pause')
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    const set = this.listeners.get(type) ?? new Set<(event: Event) => void>()
    const callback =
      typeof listener === 'function'
        ? listener
        : (event: Event) => {
            listener.handleEvent(event)
          }
    set.add(callback)
    this.listeners.set(type, set)
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    const callback =
      typeof listener === 'function'
        ? listener
        : (event: Event) => {
            listener.handleEvent(event)
          }
    this.listeners.get(type)?.delete(callback)
  }

  dispatch(type: string): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(new Event(type))
    }
  }
}

function track(): QueueTrack {
  return {
    id: 'a',
    title: 'Cancion A',
    artist: 'Artista',
    album: 'Album',
    durationSeconds: 180,
    sourceUrl: 'blob:a',
    artworkUrl: null,
  }
}

describe('PlayerEngine', () => {
  it('carga una pista y queda en loading', () => {
    const audio = new FakeAudio()
    const engine = new PlayerEngine(audio)
    const statuses: string[] = []
    engine.on('status', (status) => statuses.push(status))

    engine.load(track())

    expect(audio.src).toBe('blob:a')
    expect(audio.currentTime).toBe(0)
    expect(engine.status).toBe('loading')
    expect(statuses).toEqual(['loading'])
  })

  it('reproduce, pausa y alterna', async () => {
    const audio = new FakeAudio()
    const engine = new PlayerEngine(audio)

    await engine.play()
    expect(engine.status).toBe('playing')
    expect(engine.paused).toBe(false)

    engine.pause()
    expect(engine.status).toBe('paused')
    expect(engine.paused).toBe(true)

    await engine.toggle()
    expect(engine.status).toBe('playing')
  })

  it('emite error si play falla', async () => {
    const audio = new FakeAudio()
    audio.play = () => {
      throw new Error('bloqueado')
    }
    const engine = new PlayerEngine(audio)
    const errors: string[] = []
    engine.on('error', (message) => errors.push(message))

    await engine.play()

    expect(errors).toHaveLength(1)
  })

  it('seek, volumen y velocidad con limites', () => {
    const audio = new FakeAudio()
    const engine = new PlayerEngine(audio)

    engine.seek(42)
    expect(audio.currentTime).toBe(42)
    engine.seek(-5)
    expect(audio.currentTime).toBe(0)

    engine.setVolume(0.5)
    expect(audio.volume).toBe(0.5)
    engine.setVolume(2)
    expect(audio.volume).toBe(1)
    engine.setVolume(-1)
    expect(audio.volume).toBe(0)

    engine.setRate(0.75)
    expect(audio.playbackRate).toBe(0.75)
  })

  it('emite tiempo y fin de pista', () => {
    const audio = new FakeAudio()
    const engine = new PlayerEngine(audio)
    const times: Array<[number, number]> = []
    const ended = vi.fn()
    engine.on('time', (currentTime, duration) => times.push([currentTime, duration]))
    engine.on('ended', ended)

    audio.currentTime = 12
    audio.dispatch('timeupdate')
    expect(times).toEqual([[12, 180]])

    audio.dispatch('ended')
    expect(ended).toHaveBeenCalledTimes(1)
    expect(engine.status).toBe('ended')
  })

  it('emite error de carga', () => {
    const audio = new FakeAudio()
    const engine = new PlayerEngine(audio)
    const errors: string[] = []
    engine.on('error', (message) => errors.push(message))

    audio.dispatch('error')

    expect(errors).toHaveLength(1)
  })

  it('permite desuscribirse de eventos', async () => {
    const audio = new FakeAudio()
    const engine = new PlayerEngine(audio)
    const listener = vi.fn()
    const unsubscribe = engine.on('status', listener)

    unsubscribe()
    await engine.play()

    expect(listener).not.toHaveBeenCalled()
  })

  it('destroy quita los listeners del audio', () => {
    const audio = new FakeAudio()
    const engine = new PlayerEngine(audio)

    engine.destroy()

    expect(audio.listeners.get('timeupdate')?.size).toBe(0)
    expect(audio.listeners.get('ended')?.size).toBe(0)
    expect(audio.paused).toBe(true)
  })
})
