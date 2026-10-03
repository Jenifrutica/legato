import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAnalyser, usePlayerStore } from '../player'
import { AudioQualityPanel } from './AudioQualityPanel'
import { DiscMark } from './icons'
import { WaveRing } from './WaveRing'

export function VinylStage() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const toggle = usePlayerStore((state) => state.toggle)
  const [showAudio, setShowAudio] = useState(false)
  const isPlaying = status === 'playing'

  return (
    <section
      aria-label={t('vinyl.region')}
      className="rounded-lg border border-border bg-surface p-6 shadow-soft sm:p-8"
    >
      <div className="relative mx-auto aspect-square w-full max-w-80">
        <WaveRing active={isPlaying} analyser={getAnalyser()} />

        <button
          aria-label={isPlaying ? t('player.pause') : t('player.play')}
          className="absolute inset-0 rounded-full shadow-disc disabled:cursor-not-allowed"
          disabled={currentTrack === null}
          onClick={() => void toggle()}
          type="button"
        >
          <span
            className="motion-reduce:animate-none absolute inset-0 animate-disc rounded-full"
            style={{
              animationPlayState: isPlaying ? 'running' : 'paused',
              background:
                'repeating-radial-gradient(circle at center, #221e1b 0 2px, #2f2a26 2px 5px)',
            }}
          >
            {currentTrack?.artworkUrl !== null && currentTrack?.artworkUrl !== undefined ? (
              <img
                alt={t('vinyl.coverAlt', { title: currentTrack.title })}
                className="absolute inset-[17%] rounded-full object-cover"
                src={currentTrack.artworkUrl}
              />
            ) : (
              <span className="absolute inset-[31%] grid place-items-center rounded-full bg-primary-soft">
                <DiscMark className="size-10 text-primary-strong sm:size-12" />
              </span>
            )}
            <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg" />
          </span>
        </button>

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
      </div>

      <div className="mt-8 text-center sm:mt-10">
        <p className="truncate font-display text-lg font-semibold">
          {currentTrack?.title ?? t('vinyl.idleTitle')}
        </p>
        <p className="mt-1 truncate text-sm text-ink-muted">
          {currentTrack?.artist ?? t('vinyl.idleHint')}
        </p>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          aria-expanded={showAudio}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            showAudio
              ? 'border-primary bg-primary-soft text-primary-strong'
              : 'border-border text-ink-muted hover:border-primary hover:text-primary-strong'
          }`}
          onClick={() => setShowAudio((value) => !value)}
          type="button"
        >
          {t('audio.toggle')}
        </button>
      </div>

      {showAudio && <AudioQualityPanel />}
    </section>
  )
}
