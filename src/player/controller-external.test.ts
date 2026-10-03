import { describe, expect, it } from 'vitest'
import { FakeAudio } from '../test/fake-audio'
import { PlayerController } from './controller'
import type { QueueTrack } from './types'

function local(id: string): QueueTrack {
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

function external(id: string): QueueTrack {
  return {
    id: `spotify:${id}`,
    title: `Spotify ${id}`,
    artist: 'Artista',
    album: null,
    durationSeconds: 200,
    sourceUrl: `spotify:track:${id}`,
    artworkUrl: null,
    external: true,
  }
}

describe('Lista mixta con referencias externas', () => {
  it('reproduce la referencia con el SDK y deja que la lista siga', async () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    const played: string[] = []
    let stops = 0
    controller.setExternalPlayer({
      play: (uri) => {
        played.push(uri)
      },
      stop: () => {
        stops++
      },
    })

    controller.playTracks([external('x'), local('a')], 'spotify:x')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(played).toEqual(['spotify:track:x'])
    expect(audio.paused).toBe(true)

    controller.next()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(controller.getSnapshot().currentTrack?.id).toBe('a')
    expect(audio.src).toBe('blob:a')
    expect(stops).toBeGreaterThan(0)
  })

  it('toggle delega la reproducción externa al SDK', async () => {
    const audio = new FakeAudio()
    const controller = new PlayerController(audio)
    const played: string[] = []
    controller.setExternalPlayer({
      play: (uri) => {
        played.push(uri)
      },
      stop: () => undefined,
    })

    controller.playTracks([external('x')], 'spotify:x')
    await new Promise((resolve) => setTimeout(resolve, 0))
    await controller.toggle()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(played).toEqual(['spotify:track:x', 'spotify:track:x'])
  })
})
