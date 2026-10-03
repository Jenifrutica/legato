import { create } from 'zustand'
import { WebAudioAnalyser } from './analyser'
import { PlayerController } from './controller'
import type { PlayerSnapshot } from './controller'
import type { QueueTrack } from './types'

const audio = new Audio()
audio.preload = 'metadata'

const controller = new PlayerController(audio)
const analyser = new WebAudioAnalyser(audio)

export function getAnalyser(): WebAudioAnalyser {
  return analyser
}

type PlayerState = PlayerSnapshot & {
  playTracks: (tracks: QueueTrack[], startId?: string, sourcePlaylistId?: string | null) => void
  toggle: () => void
  next: () => void
  previous: () => void
  seek: (seconds: number) => void
  setVolume: (value: number) => void
  cycleRate: () => void
  toggleShuffle: () => void
  cycleLoopMode: () => void
  reorder: (trackId: string, targetIndex: number, playlistId: string) => void
}

export const usePlayerStore = create<PlayerState>(() => ({
  ...controller.getSnapshot(),

  playTracks: (tracks, startId, sourcePlaylistId = null) => {
    controller.playTracks(tracks, startId, sourcePlaylistId)
    void analyser.resume()
  },
  toggle: () => {
    void analyser.resume()
    void controller.toggle()
  },
  next: () => controller.next(),
  previous: () => controller.previous(),
  seek: (seconds) => controller.seek(seconds),
  setVolume: (value) => controller.setVolume(value),
  cycleRate: () => controller.cycleRate(),
  toggleShuffle: () => controller.toggleShuffle(),
  cycleLoopMode: () => controller.cycleLoopMode(),
  reorder: (trackId, targetIndex, playlistId) =>
    controller.reorder(trackId, targetIndex, playlistId),
}))

controller.subscribe((snapshot) => {
  usePlayerStore.setState(snapshot)
})
