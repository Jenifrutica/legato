import { describe, expect, it } from 'vitest'
import { AudioGraph } from './audio-graph'

describe('AudioGraph', () => {
  it('sin AudioContext queda inactivo pero no rompe', () => {
    const graph = new AudioGraph(new Audio())

    expect(graph.available).toBe(false)
    expect(graph.getLevels().length).toBe(0)

    graph.setBalance(-0.5)
    graph.setChannelMode('left')

    expect(graph.balance).toBe(-0.5)
    expect(graph.channelMode).toBe('left')
  })

  it('limita el balance entre -1 y 1', () => {
    const graph = new AudioGraph(new Audio())

    graph.setBalance(5)
    expect(graph.balance).toBe(1)

    graph.setBalance(-5)
    expect(graph.balance).toBe(-1)
  })

  it('resume sin contexto no lanza error', async () => {
    const graph = new AudioGraph(new Audio())
    await expect(graph.resume()).resolves.toBeUndefined()
  })
})
