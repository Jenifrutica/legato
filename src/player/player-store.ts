import { create } from 'zustand'
import { useLibraryStore } from '../features/library'
import { AudioGraph } from './audio-graph'
import { PlayerController } from './controller'
import type { PlayerSnapshot, RestoreState } from './controller'
import type { ChannelMode, QueueTrack } from './types'

const audio = new Audio()
audio.preload = 'metadata'

const controller = new PlayerController(audio)
const graph = new AudioGraph(audio)

export function getAnalyser(): AudioGraph {
  return graph
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
  restoreSession: (record: RestoreState) => void
  setBalance: (value: number) => void
  setChannelMode: (mode: ChannelMode) => void
}

export const usePlayerStore = create<PlayerState>(() => ({
  ...controller.getSnapshot(),

  playTracks: (tracks, startId, sourcePlaylistId = null) => {
    controller.playTracks(tracks, startId, sourcePlaylistId)
    void graph.resume()
  },
  toggle: () => {
    void graph.resume()
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
  restoreSession: (record) => {
    const tracks = useLibraryStore.getState().tracks
    controller.restoreSession(tracks, record)
    const snapshot = controller.getSnapshot()
    graph.setBalance(snapshot.balance)
    graph.setChannelMode(snapshot.channelMode)
  },
  setBalance: (value) => {
    controller.setBalance(value)
    graph.setBalance(value)
  },
  setChannelMode: (mode) => {
    controller.setChannelMode(mode)
    graph.setChannelMode(mode)
  },
}))

controller.subscribe((snapshot) => {
  usePlayerStore.setState(snapshot)
})
