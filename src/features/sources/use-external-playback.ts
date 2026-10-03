import { useEffect } from 'react'
import { setExternalPlayer, usePlayerStore } from '../../player'
import { useSpotifyStore } from './spotify-store'

function isExternal(track: { external?: boolean; sourceUrl: string }): boolean {
  return track.external === true || track.sourceUrl.startsWith('spotify:')
}

/**
 * Puente entre la lista doble y el SDK de Spotify: las referencias externas
 * se reproducen con el SDK y, al terminar, la Lista avanza sola.
 */
export function useExternalPlayback(): void {
  useEffect(() => {
    setExternalPlayer({
      play: async (uri) => {
        const store = useSpotifyStore.getState()
        if (store.status !== 'ready') {
          const connected = await store.connect()
          if (!connected) {
            throw new Error('spotify-not-connected')
          }
        }
        await useSpotifyStore.getState().playUris([uri])
      },
      stop: () => {
        const store = useSpotifyStore.getState()
        if (store.playback !== null && !store.playback.paused) {
          void store.toggle()
        }
      },
    })

    return () => setExternalPlayer(null)
  }, [])

  useEffect(() => {
    const unsubscribe = useSpotifyStore.subscribe((state, previous) => {
      const current = usePlayerStore.getState().currentTrack
      if (current === null || !isExternal(current)) {
        return
      }

      const wasPlaying = previous.playback !== null && !previous.playback.paused
      const playback = state.playback
      if (!wasPlaying || playback === null || !playback.paused || playback.positionMs > 1500) {
        return
      }

      usePlayerStore.getState().next()
    })

    return unsubscribe
  }, [])
}
