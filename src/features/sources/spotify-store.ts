import { create } from 'zustand'
import { usePlayerStore } from '../../player'
import {
  getActivePlayback,
  isAppleMobile,
  nextActive,
  pauseActive,
  pickConnectDevice,
  playUriOnDevice,
  previousActive,
  resumeActive,
  seekActive,
  setActiveVolume,
} from './spotify-connect'
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
  playUris: (uris: string[], startVolume?: number) => Promise<void>
  toggle: () => Promise<void>
  next: () => Promise<void>
  previous: () => Promise<void>
  seek: (positionMs: number) => Promise<void>
  setVolume: (value: number) => Promise<void>
  /** Volumen transitorio (fundido del crossfade) sin tocar el del usuario. */
  applyVolume: (value: number) => Promise<void>
}

// iPhone/iPad usan Spotify Connect (controlan la app de Spotify del teléfono)
// porque el SDK (DRM) no es fiable en iOS.
const connectMode = isAppleMobile()

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
    if (!isSpotifyConfigured() || !isSpotifyConnected()) {
      set({ status: 'error', error: 'not-connected' })
      return false
    }

    // Modo Connect (iPhone/iPad): no se crea el SDK; se controla la app.
    if (connectMode) {
      const token = await getSpotifyAccessToken()
      if (token === null) {
        set({ status: 'error', error: 'not-connected' })
        return false
      }
      set({ status: 'ready', error: null })
      stopPolling()
      pollTimer = setInterval(() => {
        void getActivePlayback()
          .then((state) => {
            if (state !== null) {
              set({ playback: state })
            }
          })
          .catch(() => undefined)
      }, 1000)
      return true
    }

    if (bridge !== null) {
      return true
    }

    set({ status: 'connecting', error: null })

    try {
      const created = await createSpotifyBridge({
        getToken: getSpotifyAccessToken,
        onState: (playback) => set({ playback }),
        onAutoplayFailed: () => {
          // iOS: el navegador bloqueó el arranque; se reintenta al pulsar play.
          console.warn('[spotify] autoplay_failed; se reintentará al pulsar play')
        },
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

  playUris: async (uris, startVolume) => {
    const ready = await get().connect()
    if (!ready) {
      throw new Error(get().error ?? 'No se pudo iniciar Spotify')
    }

    usePlayerStore.getState().pause()

    if (connectMode) {
      const device = await pickConnectDevice()
      if (device === null) {
        throw new Error('Abre la app de Spotify en el teléfono y vuelve a pulsar play')
      }
      if (startVolume !== undefined) {
        try {
          await setActiveVolume(startVolume * 100)
        } catch {
          // volumen no aplicable
        }
      }
      const first = uris[0]
      if (first !== undefined) {
        await playUriOnDevice(device.id, first)
      }
      return
    }

    if (bridge === null) {
      throw new Error(get().error ?? 'No se pudo iniciar Spotify')
    }

    // Volumen con el que arranca la pista: el del usuario (o 0 si el crossfade
    // va a subirla). Así no hay golpe y tampoco se queda mudo.
    await bridge.setVolume(startVolume ?? get().volume)
    try {
      await bridge.activateElement()
    } catch {
      // sin activateElement (SDK viejo) o bloqueado
    }
    await bridge.playUris(uris)
  },

  toggle: async () => {
    if (connectMode) {
      const current = get().playback
      if (current === null) {
        return
      }
      if (current.paused) {
        await resumeActive()
      } else {
        await pauseActive()
      }
      set({ playback: { ...current, paused: !current.paused } })
      return
    }

    if (bridge === null || get().playback === null) {
      return
    }

    if (get().playback?.paused === true) {
      await bridge.setVolume(get().volume)
      try {
        await bridge.activateElement()
      } catch {
        // sin activateElement o bloqueado
      }
      await bridge.resume()
    } else {
      await bridge.pause()
    }
  },

  next: async () => {
    if (connectMode) {
      await nextActive().catch(() => undefined)
      return
    }
    if (bridge !== null) {
      await bridge.setVolume(get().volume)
      await bridge.next()
    }
  },

  previous: async () => {
    if (connectMode) {
      await previousActive().catch(() => undefined)
      return
    }
    if (bridge !== null) {
      await bridge.setVolume(get().volume)
      await bridge.previous()
    }
  },

  seek: async (positionMs) => {
    if (connectMode) {
      await seekActive(positionMs).catch(() => undefined)
      return
    }
    if (bridge !== null) {
      await bridge.seek(positionMs)
    }
  },

  setVolume: async (value) => {
    const volume = Math.min(1, Math.max(0, value))
    set({ volume })
    if (connectMode) {
      await setActiveVolume(volume * 100).catch(() => undefined)
      return
    }
    if (bridge !== null) {
      await bridge.setVolume(volume)
    }
  },

  applyVolume: async (value) => {
    // El fundido del crossfade no cambia el volumen del dispositivo en Connect.
    if (connectMode) {
      return
    }
    // Solo aplica al SDK; conserva `volume` como la intención del usuario.
    if (bridge !== null) {
      await bridge.setVolume(Math.min(1, Math.max(0, value)))
    }
  },
}))
