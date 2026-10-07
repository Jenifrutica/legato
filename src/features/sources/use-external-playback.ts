import { useEffect, useRef } from 'react'
import { setExternalPlayer, usePlayerStore } from '../../player'
import type { LoopMode } from '../../player'
import { useSpotifyStore } from './spotify-store'

export function isExternalTrack(track: { external?: boolean; sourceUrl: string } | null): boolean {
  return track !== null && (track.external === true || track.sourceUrl.startsWith('spotify:'))
}

/**
 * Cuando una pista externa (Spotify) llega al final, con «repetir una» se
 * reinicia la misma; con «repetir todas» o sin bucle, avanza con la Lista.
 */
export function externalEndAction(loopMode: LoopMode): 'repeat' | 'next' {
  return loopMode === 'one' ? 'repeat' : 'next'
}

/**
 * Puente entre la lista doble y el SDK de Spotify: las referencias externas
 * se reproducen con el SDK y, al terminar, la Lista avanza sola.
 */
export function useExternalPlayback(): void {
  const maxPositionRef = useRef(0)
  const trackUriRef = useRef<string | null>(null)

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
      const player = usePlayerStore.getState()
      const current = player.currentTrack
      if (current === null || !isExternalTrack(current)) {
        return
      }

      const wasPlaying = previous.playback !== null && !previous.playback.paused
      const playback = state.playback

      // Posición máxima vista de la pista actual (para no saltar si no sonó).
      if (playback !== null) {
        if (trackUriRef.current !== playback.trackUri) {
          trackUriRef.current = playback.trackUri
          maxPositionRef.current = 0
        }
        maxPositionRef.current = Math.max(maxPositionRef.current, playback.positionMs)
      }

      if (!wasPlaying || playback === null || !playback.paused || playback.positionMs > 1500) {
        return
      }

      // Si la pista nunca llegó a sonar (p. ej. iOS bloqueó el audio), no
      // avanzamos: evita que se salte canciones sin reproducirlas.
      if (maxPositionRef.current < 3000) {
        return
      }

      if (externalEndAction(player.loopMode) === 'repeat') {
        // «Repetir una»: vuelve a sonar la misma referencia en vez de avanzar.
        void useSpotifyStore.getState().playUris([current.sourceUrl])
        return
      }

      player.next()
    })

    return unsubscribe
  }, [])
}
