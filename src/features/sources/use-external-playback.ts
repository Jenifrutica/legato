import { useEffect } from 'react'
import { setExternalPlayer, usePlayerStore } from '../../player'
import { useSpotifyStore } from './spotify-store'

export function isExternalTrack(track: { external?: boolean; sourceUrl: string } | null): boolean {
  return track !== null && (track.external === true || track.sourceUrl.startsWith('spotify:'))
}

/**
 * Puente entre la lista doble y el SDK de Spotify: las referencias externas
 * se reproducen con el SDK y, al terminar, la Lista avanza sola.
 */
export function useExternalPlayback(): void {
  useEffect(() => {
    setExternalPlayer({
      play: async (rawUri, startVolume) => {
        const uri = rawUri
          .replace('https://open.spotify.com/track/', 'spotify:track:')
          .split('?')[0]
        const store = useSpotifyStore.getState()
        if (store.status !== 'ready') {
          const connected = await store.connect()
          if (!connected) {
            throw new Error('spotify-not-connected')
          }
        }
        await useSpotifyStore.getState().playUris([uri], startVolume)
      },
      stop: () => {
        const store = useSpotifyStore.getState()
        if (store.playback !== null && !store.playback.paused) {
          void store.toggle()
        }
      },
      // Fundido del crossfade sobre el volumen del SDK (Spotify no solapa).
      // Usa el volumen transitorio para no pisar el volumen del usuario.
      setVolume: (value: number) => {
        void useSpotifyStore.getState().applyVolume(value)
      },
      getVolume: () => useSpotifyStore.getState().volume,
    })

    return () => setExternalPlayer(null)
  }, [])

  useEffect(() => {
    const unsubscribe = useSpotifyStore.subscribe((state, previous) => {
      const current = usePlayerStore.getState().currentTrack
      if (!isExternalTrack(current)) {
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
