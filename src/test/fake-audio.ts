import type { AudioLike } from '../player/engine'

export class FakeAudio implements AudioLike {
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
