import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clampBeatsPerBar,
  clampClickVolume,
  isAccent,
  MetronomeEngine,
  MetronomeScheduler,
} from './metronome'

describe('isAccent', () => {
  it('acentúa el primer tiempo de cada compás', () => {
    expect(isAccent(0, 4)).toBe(true)
    expect(isAccent(1, 4)).toBe(false)
    expect(isAccent(4, 4)).toBe(true)
    expect(isAccent(2, 3)).toBe(false)
    expect(isAccent(3, 3)).toBe(true)
  })

  it('en 6/8 acentúa el 1 y el 4', () => {
    expect(isAccent(0, 6)).toBe(true)
    expect(isAccent(3, 6)).toBe(true)
    expect(isAccent(1, 6)).toBe(false)
    expect(isAccent(6, 6)).toBe(true)
  })

  it('corrige compases y volumen inválidos', () => {
    expect(clampBeatsPerBar(3)).toBe(3)
    expect(clampBeatsPerBar(5)).toBe(4)
    expect(clampClickVolume(-1)).toBe(0)
    expect(clampClickVolume(3)).toBe(1)
    expect(clampClickVolume(Number.NaN)).toBe(0.6)
  })
})

describe('MetronomeScheduler', () => {
  it('programa 120 BPM con acento cada cuatro tiempos', () => {
    const scheduler = new MetronomeScheduler({ bpm: 120, beatsPerBar: 4, lookaheadSeconds: 0.12 })
    scheduler.start(0)

    expect(scheduler.tick(0)).toEqual([{ time: 0, accent: true }])
    expect(scheduler.tick(0.4)).toEqual([{ time: 0.5, accent: false }])
    expect(scheduler.tick(1.4)).toEqual([{ time: 1.5, accent: false }])
    expect(scheduler.tick(1.9)).toEqual([{ time: 2, accent: true }])
  })

  it('cambia el espaciado al cambiar el BPM', () => {
    const scheduler = new MetronomeScheduler({ bpm: 60, beatsPerBar: 4, lookaheadSeconds: 0.12 })
    scheduler.start(0)
    expect(scheduler.tick(0)).toEqual([{ time: 0, accent: true }])

    scheduler.setBpm(120)
    expect(scheduler.tick(0.4)).toEqual([{ time: 0.5, accent: false }])
    expect(scheduler.tick(0.9)).toEqual([{ time: 1, accent: false }])
  })

  it('se resincroniza si el reloj se atrasa sin perder la fase', () => {
    const scheduler = new MetronomeScheduler({ bpm: 120, beatsPerBar: 4, lookaheadSeconds: 0.12 })
    scheduler.start(0)
    scheduler.tick(0)

    const clicks = scheduler.tick(10)
    expect(clicks.length).toBeGreaterThan(0)
    expect(clicks[0]?.time).toBeGreaterThanOrEqual(10)
    expect(clicks[0]?.accent).toBe(true)
  })

  it('no programa nada detenido', () => {
    const scheduler = new MetronomeScheduler({ bpm: 120 })
    scheduler.start(0)
    scheduler.tick(0)
    scheduler.stop()

    expect(scheduler.tick(10)).toEqual([])
    expect(scheduler.running).toBe(false)
  })
})

describe('MetronomeEngine', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('sin AudioContext no arranca', () => {
    const engine = new MetronomeEngine(() => null)

    expect(engine.start()).toBe(false)
    expect(engine.running).toBe(false)
  })

  it('agenda clics con el reloj del contexto', () => {
    vi.useFakeTimers()
    const clicks: Array<{ time: number; accent: boolean }> = []
    const context = {
      currentTime: 0,
      resume: () => Promise.resolve(),
    } as unknown as AudioContext

    const engine = new MetronomeEngine(
      () => context,
      (_context, time, accent) => {
        clicks.push({ time, accent })
      },
    )
    engine.setBpm(120)

    expect(engine.start()).toBe(true)
    vi.advanceTimersByTime(25)
    expect(clicks).toHaveLength(1)
    expect(clicks[0]?.time).toBeCloseTo(0.05)
    expect(clicks[0]?.accent).toBe(true)

    ;(context as { currentTime: number }).currentTime = 0.5
    vi.advanceTimersByTime(25)
    expect(clicks.some((click) => Math.abs(click.time - 0.55) < 0.001)).toBe(true)

    engine.stop()
    expect(engine.running).toBe(false)
  })
})
