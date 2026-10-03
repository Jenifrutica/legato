import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../../player'
import { usePlayLogStore } from './play-log'

/** Registra una escucha cuando una pista nueva empieza a sonar. */
export function usePlayTracker(): void {
  const trackId = usePlayerStore((state) => state.currentTrack?.id ?? null)
  const status = usePlayerStore((state) => state.status)
  const lastRegistered = useRef<string | null>(null)

  useEffect(() => {
    if (trackId === null || status !== 'playing' || lastRegistered.current === trackId) {
      return
    }

    lastRegistered.current = trackId
    usePlayLogStore.getState().register(trackId)
  }, [trackId, status])
}
