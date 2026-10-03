import { create } from 'zustand'
import { useLibraryStore } from '../features/library'
import { AudioGraph } from './audio-graph'
import { PlayerController } from './controller'
import type { PlayerSnapshot, RestoreState } from './controller'
import { applyOutputDevice, listOutputDevices, supportsOutputSelection } from './output-devices'
import type { OutputDevice } from './output-devices'
import { SleepTimer } from './sleep-timer'
import type { TimerSnapshot } from './sleep-timer'
import type { ChannelMode, QueueTrack } from './types'

const audio = new Audio()
audio.preload = 'metadata'

const controller = new PlayerController(audio)
const graph = new AudioGraph(audio)
const sleepTimer = new SleepTimer(() => {
  void controller.fadeOutAndPause()
})

controller.onTrackEnded(() => sleepTimer.onTrackEnded())

export function getAnalyser(): AudioGraph {
  return graph
}

type PlayerState = PlayerSnapshot & {
  timer: TimerSnapshot
  outputDevices: OutputDevice[]
  outputDeviceId: string
  refreshOutputDevices: () => Promise<void>
  setOutputDevice: (deviceId: string) => Promise<void>
  playTracks: (tracks: QueueTrack[], startId?: string, sourcePlaylistId?: string | null) => void
  toggle: () => void
  pause: () => void
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
  setRate: (value: number) => void
  setLoopPointA: () => void
  setLoopPointB: () => void
  clearAbLoop: () => void
  setKaraoke: (enabled: boolean) => void
  setCrossfade: (seconds: number) => void
  startTimerMinutes: (minutes: number) => void
  startTimerEndOfTrack: () => void
  startTimerAfterTracks: (count: number) => void
  cancelTimer: () => void
}

export const usePlayerStore = create<PlayerState>(() => ({
  ...controller.getSnapshot(),
  timer: sleepTimer.getSnapshot(),
  outputDevices: [],
  outputDeviceId: 'default',

  refreshOutputDevices: async () => {
    if (!supportsOutputSelection()) {
      return
    }

    const devices = await listOutputDevices()
    usePlayerStore.setState({ outputDevices: devices })
  },

  setOutputDevice: async (deviceId) => {
    const applied = await applyOutputDevice(audio, deviceId)
    if (applied) {
      usePlayerStore.setState({ outputDeviceId: deviceId })
    }
  },

  playTracks: (tracks, startId, sourcePlaylistId = null) => {
    controller.playTracks(tracks, startId, sourcePlaylistId)
    void graph.resume()
  },
  toggle: () => {
    void graph.resume()
    void controller.toggle()
  },
  pause: () => controller.pause(),
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
  setRate: (value) => controller.setRate(value),
  setLoopPointA: () => controller.setLoopPointA(),
  setLoopPointB: () => controller.setLoopPointB(),
  clearAbLoop: () => controller.clearAbLoop(),
  setKaraoke: (enabled) => {
    controller.setKaraoke(enabled)
    graph.setKaraoke(enabled)
  },
  setCrossfade: (seconds) => controller.setCrossfade(seconds),
  startTimerMinutes: (minutes) => sleepTimer.startMinutes(minutes),
  startTimerEndOfTrack: () => sleepTimer.startEndOfTrack(),
  startTimerAfterTracks: (count) => sleepTimer.startAfterTracks(count),
  cancelTimer: () => sleepTimer.cancel(),
}))

controller.subscribe((snapshot) => {
  usePlayerStore.setState(snapshot)
})

sleepTimer.subscribe((snapshot) => {
  usePlayerStore.setState({ timer: snapshot })
})
