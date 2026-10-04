import { create } from 'zustand'
import { usePlayerStore } from '../../player'
import {
  createSpotifyBridge,
  type SpotifyBridge,
  type SpotifyPlaybackState,
} from './spotify-player'
import { getSpotifyAccessToken, isSpotifyConfigured, isSpotifyConnected } from './spotify'

type SpotifyStatus = 'idle' | 'connecting' | 'ready' | 'error'

type SpotifyStore = {
  status: SpotifyStatus
  error: string | null
  deviceId: string | null
  playback: SpotifyPlaybackState | null
  volume: number
  connect: () => Promise<boolean>
  disconnect: () => void
  playUris: (uris: string[]) => Promise<void>
  toggle: () => Promise<void>
  next: () => Promise<void>
  previous: () => Promise<void>
  seek: (positionMs: number) => Promise<void>
  setVolume: (value: number) => Promise<void>
}

let bridge: SpotifyBridge | null = null
let disconnectPlayer: (() => void) | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

function stopPolling(): void {
  if (pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

export const useSpotifyStore = create<SpotifyStore>((set, get) => ({
  status: 'idle',
  error: null,
  deviceId: null,
  playback: null,
  volume: 1,

  connect: async () => {
    if (bridge !== null) {
      return true
    }

    if (!isSpotifyConfigured() || !isSpotifyConnected()) {
      set({ status: 'error', error: 'not-connected' })
      return false
    }

    set({ status: 'connecting', error: null })

    try {
      const created = await createSpotifyBridge({
        getToken: getSpotifyAccessToken,
        onState: (playback) => set({ playback }),
      })

      bridge = created.bridge
      disconnectPlayer = created.disconnect
      set({ status: 'ready', deviceId: created.deviceId })
      stopPolling()
      pollTimer = setInterval(() => {
        const current = get().playback
        if (bridge === null || current === null || current.paused) {
          return
        }

        void bridge.getState().then((state) => {
          if (state !== null) {
            set({ playback: state })
          }
        })
      }, 1000)

      return true
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : 'error' })
      return false
    }
  },

  disconnect: () => {
    stopPolling()
    disconnectPlayer?.()
    bridge = null
    disconnectPlayer = null
    set({ status: 'idle', deviceId: null, playback: null, error: null })
  },

  playUris: async (uris) => {
    const ready = await get().connect()
    if (!ready || bridge === null) {
      return
    }

    usePlayerStore.getState().pause()
    await bridge.playUris(uris)
  },

  toggle: async () => {
    if (bridge === null || get().playback === null) {
      return
    }

    if (get().playback?.paused === true) {
      await bridge.resume()
    } else {
      await bridge.pause()
    }
  },

  next: async () => {
    if (bridge !== null) {
      await bridge.next()
    }
  },

  previous: async () => {
    if (bridge !== null) {
      await bridge.previous()
    }
  },

  seek: async (positionMs) => {
    if (bridge !== null) {
      await bridge.seek(positionMs)
    }
  },

  setVolume: async (value) => {
    const volume = Math.min(1, Math.max(0, value))
    set({ volume })
    if (bridge !== null) {
      await bridge.setVolume(volume)
    }
  },
}))
