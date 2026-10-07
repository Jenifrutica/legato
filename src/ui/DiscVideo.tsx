import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../player'

/**
 * Video del mp4 dentro del disco. Va silenciado y solo sincroniza imagen y
 * tiempo: el audio sale del motor principal.
 */
export function DiscVideo({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const status = usePlayerStore((state) => state.status)

  useEffect(() => {
    const video = videoRef.current
    if (video === null) {
      return
    }
    if (Math.abs(video.currentTime - currentTime) > 0.4) {
      video.currentTime = currentTime
    }
  }, [currentTime])

  useEffect(() => {
    const video = videoRef.current
    if (video === null) {
      return
    }
    if (status === 'playing' && video.paused) {
      void video.play().catch(() => undefined)
    }
    if (status !== 'playing' && !video.paused) {
      video.pause()
    }
  }, [status])

  return (
    <video
      aria-hidden="true"
      className={`absolute inset-0 size-full object-cover ${className ?? ''}`}
      muted
      playsInline
      ref={videoRef}
      src={src}
    />
  )
}
