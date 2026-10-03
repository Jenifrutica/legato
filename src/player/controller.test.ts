import { describe, expect, it, vi } from 'vitest'
import { FakeAudio } from '../test/fake-audio'
import { PlayerController } from './controller'
import type { QueueTrack } from './types'

function track(id: string): QueueTrack {
  return {
    id,
    title: `Cancion ${id}`,
    artist: 'Artista',
    album: null,
    durationSeconds: 180,
    sourceUrl: `blob:${id}`,
    artworkUrl: null,
  }
}

describe('PlayerController', () => {
  it('playTracks carga y reproduce desde el id indicado', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)

    controller.playTracks([track('a'), track('b'), track('c')], 'b')

    const snapshot = controller.getSnapshot()
    expect(snapshot.currentTrack?.id).toBe('b')
    expect(snapshot.status).toBe('playing')
    expect(audio.src).toBe('blob:b')
    expect(snapshot.queue.map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })

  it('toggle pausa y reanuda', async () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a')])

    await controller.toggle()
    expect(controller.getSnapshot().status).toBe('paused')

    await controller.toggle()
    expect(controller.getSnapshot().status).toBe('playing')
  })

  it('next y previous cambian de cancion', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a'), track('b'), track('c')])

    controller.next()
    expect(controller.getSnapshot().currentTrack?.id).toBe('b')

    controller.previous()
    expect(controller.getSnapshot().currentTrack?.id).toBe('a')
  })

  it('al terminar con bucle one repite la misma cancion', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a'), track('b')])
    controller.cycleLoopMode()
    controller.cycleLoopMode()

    expect(controller.getSnapshot().loopMode).toBe('one')
    audio.dispatch('ended')

    expect(controller.getSnapshot().currentTrack?.id).toBe('a')
    expect(audio.currentTime).toBe(0)
    expect(controller.getSnapshot().status).toBe('playing')
  })

  it('al terminar sin bucle avanza a la siguiente', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a'), track('b')])

    audio.dispatch('ended')

    expect(controller.getSnapshot().currentTrack?.id).toBe('b')
    expect(audio.src).toBe('blob:b')
  })

  it('al terminar la ultima sin bucle queda en ended', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a')])

    audio.dispatch('ended')

    expect(controller.getSnapshot().status).toBe('ended')
    expect(controller.getSnapshot().currentTrack?.id).toBe('a')
  })

  it('reorder solo afecta si la playlist de origen coincide', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a'), track('b'), track('c')], undefined, 'p1')

    controller.reorder('c', 0, 'p2')
    expect(controller.getSnapshot().queue.map((item) => item.id)).toEqual(['a', 'b', 'c'])

    controller.reorder('c', 0, 'p1')
    expect(controller.getSnapshot().queue.map((item) => item.id)).toEqual(['c', 'a', 'b'])
    expect(controller.getSnapshot().currentTrack?.id).toBe('a')
  })

  it('seek, volumen, velocidad, aleatorio y bucle notifican cambios', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    const listener = vi.fn()
    controller.subscribe(listener)
    controller.playTracks([track('a')])

    controller.seek(30)
    controller.setVolume(0.5)
    controller.cycleRate()
    controller.toggleShuffle()
    controller.cycleLoopMode()

    const snapshot = controller.getSnapshot()
    expect(audio.currentTime).toBe(30)
    expect(snapshot.volume).toBe(0.5)
    expect(snapshot.rate).toBe(0.9)
    expect(snapshot.shuffle).toBe(true)
    expect(snapshot.loopMode).toBe('all')
    expect(listener).toHaveBeenCalled()
  })

  it('cycleRate recorre los presets y vuelve al inicio', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a')])

    controller.cycleRate()
    controller.cycleRate()
    controller.cycleRate()
    expect(controller.getSnapshot().rate).toBe(0.5)

    controller.cycleRate()
    expect(controller.getSnapshot().rate).toBe(1)
  })

  it('playTracks sin canciones deja el reproductor quieto', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)

    controller.playTracks([])

    expect(controller.getSnapshot().currentTrack).toBeNull()
    expect(audio.src).toBe('')
  })
})
