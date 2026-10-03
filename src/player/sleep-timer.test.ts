import { afterEach, describe, expect, it, vi } from 'vitest'
import { SleepTimer } from './sleep-timer'

describe('SleepTimer', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('cuenta minutos y expira', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-03T10:00:00Z'))

    const onExpire = vi.fn()
    const timer = new SleepTimer(onExpire)
    timer.startMinutes(1)

    expect(timer.mode).toBe('duration')

    vi.advanceTimersByTime(30_000)
    const snapshot = timer.getSnapshot()
    expect(snapshot.mode).toBe('duration')
    expect(snapshot.remainingMs).toBeLessThanOrEqual(30_000)

    vi.advanceTimersByTime(31_000)
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(timer.mode).toBe('off')
  })

  it('fin de cancion dispara y detiene el avance', () => {
    const onExpire = vi.fn()
    const timer = new SleepTimer(onExpire)
    timer.startEndOfTrack()

    expect(timer.onTrackEnded()).toBe(true)
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(timer.mode).toBe('off')
  })

  it('cuenta canciones y expira al llegar a cero', () => {
    const onExpire = vi.fn()
    const timer = new SleepTimer(onExpire)
    timer.startAfterTracks(2)

    expect(timer.onTrackEnded()).toBe(false)
    expect(timer.getSnapshot().remainingTracks).toBe(1)

    expect(timer.onTrackEnded()).toBe(true)
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(timer.mode).toBe('off')
  })

  it('cancelar apaga el temporizador', () => {
    const timer = new SleepTimer(() => undefined)
    timer.startMinutes(5)
    timer.cancel()

    expect(timer.mode).toBe('off')
    expect(timer.getSnapshot().remainingMs).toBeNull()
    expect(timer.getSnapshot().remainingTracks).toBeNull()
  })

  it('notifica a los suscriptores', () => {
    const timer = new SleepTimer(() => undefined)
    const listener = vi.fn()
    const unsubscribe = timer.subscribe(listener)

    timer.startAfterTracks(1)
    expect(listener).toHaveBeenCalled()

    unsubscribe()
    timer.cancel()
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
