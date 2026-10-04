import { afterEach, describe, expect, it, vi } from 'vitest'
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
  afterEach(() => {
    vi.useRealTimers()
  })

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

  it('clearSession deja la reproducción neutra y sin cola', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a'), track('b')], 'a')
    controller.setVolume(0.3)
    controller.setRate(0.5)
    controller.setBalance(0.4)
    controller.setChannelMode('left')
    controller.setKaraoke(true)
    controller.toggleShuffle()
    controller.setLoopPointA()

    controller.clearSession()

    const snapshot = controller.getSnapshot()
    expect(snapshot.currentTrack).toBeNull()
    expect(snapshot.queue).toHaveLength(0)
    expect(snapshot.status).not.toBe('playing')
    expect(snapshot.volume).toBe(1)
    expect(snapshot.rate).toBe(1)
    expect(snapshot.balance).toBe(0)
    expect(snapshot.channelMode).toBe('stereo')
    expect(snapshot.shuffle).toBe(false)
    expect(snapshot.loopMode).toBe('none')
    expect(snapshot.karaoke).toBe(false)
    expect(snapshot.abLoop).toBeNull()
    expect(snapshot.loopPointA).toBeNull()
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
    expect(snapshot.rate).toBe(1.25)
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
    expect(controller.getSnapshot().rate).toBe(2)

    controller.cycleRate()
    expect(controller.getSnapshot().rate).toBe(0.9)

    controller.cycleRate()
    controller.cycleRate()
    controller.cycleRate()
    expect(controller.getSnapshot().rate).toBe(1)
  })

  it('balance y aislamiento de canales en el snapshot', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a')])

    controller.setBalance(-0.5)
    controller.setChannelMode('left')

    const snapshot = controller.getSnapshot()
    expect(snapshot.balance).toBe(-0.5)
    expect(snapshot.channelMode).toBe('left')
  })

  it('restoreSession recupera posicion, balance y canal', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)

    controller.restoreSession([track('a'), track('b')], {
      trackIds: ['a', 'b'],
      currentId: 'b',
      currentTime: 30,
      loopMode: 'all',
      shuffle: false,
      volume: 0.4,
      rate: 0.75,
      balance: 0.5,
      channelMode: 'right',
    })

    const snapshot = controller.getSnapshot()
    expect(snapshot.currentTrack?.id).toBe('b')
    expect(snapshot.currentTime).toBe(30)
    expect(snapshot.volume).toBe(0.4)
    expect(snapshot.rate).toBe(0.75)
    expect(snapshot.balance).toBe(0.5)
    expect(snapshot.channelMode).toBe('right')
  })

  it('restoreSession sin balance usa valores por defecto', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)

    controller.restoreSession([track('a')], {
      trackIds: ['a'],
      currentId: 'a',
      currentTime: 0,
      loopMode: 'none',
      shuffle: false,
      volume: 1,
      rate: 1,
    })

    const snapshot = controller.getSnapshot()
    expect(snapshot.balance).toBe(0)
    expect(snapshot.channelMode).toBe('stereo')
  })

  it('onTrackEnded puede detener el avance (temporizador)', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a'), track('b')])
    controller.onTrackEnded(() => true)

    audio.dispatch('ended')

    expect(controller.getSnapshot().currentTrack?.id).toBe('a')
    expect(controller.getSnapshot().status).toBe('ended')
  })

  it('fadeOutAndPause baja el volumen, pausa y lo restaura', async () => {
    vi.useFakeTimers()
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a')])
    controller.setVolume(1)

    const promise = controller.fadeOutAndPause(1000)
    await vi.runAllTimersAsync()
    await promise

    expect(audio.paused).toBe(true)
    expect(audio.volume).toBe(1)
  })

  it('bucle A-B: marca A y B y salta al llegar a B', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a')])

    audio.currentTime = 10
    controller.setLoopPointA()
    audio.currentTime = 20
    controller.setLoopPointB()

    expect(controller.getSnapshot().abLoop).toEqual({ a: 10, b: 20 })

    audio.currentTime = 21
    audio.dispatch('timeupdate')
    expect(audio.currentTime).toBe(10)
  })

  it('bucle A-B: B invalido se ignora, clear lo apaga y cambiar de cancion lo limpia', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a'), track('b')])

    audio.currentTime = 10
    controller.setLoopPointA()
    audio.currentTime = 5
    controller.setLoopPointB()
    expect(controller.getSnapshot().abLoop).toBeNull()
    expect(controller.getSnapshot().loopPointA).toBe(10)

    audio.currentTime = 20
    controller.setLoopPointB()
    expect(controller.getSnapshot().abLoop).toEqual({ a: 10, b: 20 })

    controller.next()
    expect(controller.getSnapshot().abLoop).toBeNull()
    expect(controller.getSnapshot().loopPointA).toBeNull()

    audio.currentTime = 1
    controller.setLoopPointA()
    controller.clearAbLoop()
    expect(controller.getSnapshot().loopPointA).toBeNull()
  })

  it('setRate fija la velocidad directamente', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a')])

    controller.setRate(0.5)

    expect(controller.getSnapshot().rate).toBe(0.5)
    expect(audio.playbackRate).toBe(0.5)
  })

  it('karaoke se refleja en el snapshot', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.playTracks([track('a')])

    controller.setKaraoke(true)
    expect(controller.getSnapshot().karaoke).toBe(true)

    controller.setKaraoke(false)
    expect(controller.getSnapshot().karaoke).toBe(false)
  })

  it('crossfade: por defecto 2s, se limita y se aplica al cambiar', async () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    expect(controller.getSnapshot().crossfadeSeconds).toBe(2)

    controller.setCrossfade(20)
    expect(controller.getSnapshot().crossfadeSeconds).toBe(12)
    controller.setCrossfade(-3)
    expect(controller.getSnapshot().crossfadeSeconds).toBe(0)

    controller.playTracks([track('a'), track('b')])
    controller.next()
    expect(audio.src).toBe('blob:b')
  })

  it('crossfade con duracion hace la transicion y restaura el volumen', async () => {
    vi.useFakeTimers()
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.setCrossfade(0.1)
    controller.playTracks([track('a'), track('b')])
    controller.next()
    await vi.runAllTimersAsync()

    expect(audio.src).toBe('blob:b')
    expect(audio.volume).toBe(1)
    expect(controller.getSnapshot().currentTrack?.id).toBe('b')
  })

  it('restoreSession recupera el crossfade', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    controller.restoreSession([track('a')], {
      trackIds: ['a'],
      currentId: 'a',
      currentTime: 0,
      loopMode: 'none',
      shuffle: false,
      volume: 1,
      rate: 1,
      crossfadeSeconds: 4,
    })

    expect(controller.getSnapshot().crossfadeSeconds).toBe(4)
  })

  it('playTracks sin canciones deja el reproductor quieto', () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)

    controller.playTracks([])

    expect(controller.getSnapshot().currentTrack).toBeNull()
    expect(audio.src).toBe('')
  })
})
