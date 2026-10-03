import { Suspense, lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAnalyser, usePlayerStore } from '../player'
import { DiscMark } from './icons'
import { WaveRing } from './WaveRing'

const Vinyl3D = lazy(() => import('./Vinyl3D'))

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null
  } catch {
    return false
  }
}

export function VinylVisual() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const toggle = usePlayerStore((state) => state.toggle)
  const [render3D, setRender3D] = useState(false)
  const isPlaying = status === 'playing'

  useEffect(() => {
    const reducedMotion =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false
    setRender3D(supportsWebGL() && !reducedMotion)
  }, [])

  return (
    <section aria-label={t('vinyl.region')} className="relative">
      <div className="relative mx-auto aspect-square w-full">
        <WaveRing active={isPlaying} analyser={getAnalyser()} />

        {render3D ? (
          <div className="absolute inset-0">
            <Suspense fallback={null}>
              <Vinyl3D artworkUrl={currentTrack?.artworkUrl ?? null} spinning={isPlaying} />
            </Suspense>
          </div>
        ) : (
          <>
            <span
              className="motion-reduce:animate-none absolute inset-0 animate-disc rounded-full shadow-disc"
              style={{
                animationPlayState: isPlaying ? 'running' : 'paused',
                background:
                  'repeating-radial-gradient(circle at center, #221e1b 0 2px, #2f2a26 2px 5px)',
              }}
            >
              {currentTrack?.artworkUrl !== null && currentTrack?.artworkUrl !== undefined ? (
                <img
                  alt={t('vinyl.coverAlt', { title: currentTrack.title })}
                  className="absolute inset-[16%] rounded-full object-cover"
                  src={currentTrack.artworkUrl}
                />
              ) : (
                <span className="absolute inset-[31%] grid place-items-center rounded-full bg-primary-soft">
                  <DiscMark className="size-10 text-primary-strong sm:size-12" />
                </span>
              )}
              <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg" />
            </span>

            <svg
              aria-hidden="true"
              className="absolute -right-3 -top-2 w-24 text-wood transition-transform duration-700 sm:-right-5 sm:w-28"
              fill="none"
              style={{
                transform: isPlaying ? 'rotate(9deg)' : 'rotate(0deg)',
                transformOrigin: '85% 15%',
              }}
              viewBox="0 0 96 96"
            >
              <circle cx="78" cy="16" fill="currentColor" r="8" />
              <path d="M78 16 38 60" stroke="currentColor" strokeLinecap="round" strokeWidth="6" />
              <rect
                fill="#2b2622"
                height="22"
                rx="5"
                transform="rotate(-46 28 62)"
                width="14"
                x="21"
                y="51"
              />
            </svg>
          </>
        )}

        <button
          aria-label={isPlaying ? t('player.pause') : t('player.play')}
          className="absolute inset-0 rounded-full disabled:cursor-not-allowed"
          disabled={currentTrack === null}
          onClick={() => void toggle()}
          type="button"
        />
      </div>
    </section>
  )
}
