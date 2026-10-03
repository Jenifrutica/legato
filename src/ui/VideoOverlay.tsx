import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlayerStore } from '../player'
import { XIcon } from './icons'

/**
 * Video del mp4 en un visor. El audio sale del motor principal, así que este
 * elemento va silenciado y solo sincroniza imagen y tiempo.
 */
export function VideoOverlay({ src, onClose }: { src: string; onClose: () => void }) {
  const { t } = useTranslation()
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      aria-label={t('player.showVideo')}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/95 p-6"
      role="dialog"
    >
      <button
        aria-label={t('player.hideVideo')}
        className="absolute top-4 right-4 border-2 border-bg/60 p-2 text-bg transition-transform hover:-translate-y-0.5"
        onClick={onClose}
        type="button"
      >
        <XIcon className="size-4" />
      </button>
      <video
        className="max-h-[85vh] w-auto max-w-full border-2 border-rule bg-ink"
        muted
        playsInline
        ref={videoRef}
        src={src}
      />
    </div>
  )
}
