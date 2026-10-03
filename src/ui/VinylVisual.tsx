import { useTranslation } from 'react-i18next'
import { useSpotifyStore } from '../features/sources'
import { getAnalyser, usePlayerStore } from '../player'
import { DiscMark } from './icons'
import { WaveRing } from './WaveRing'

export function VinylVisual() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const toggle = usePlayerStore((state) => state.toggle)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)
  const spotifyToggle = useSpotifyStore((state) => state.toggle)

  const spotifyActive = spotifyPlayback !== null
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const artworkUrl = spotifyActive ? spotifyPlayback.artworkUrl : (currentTrack?.artworkUrl ?? null)
  const title = spotifyActive ? spotifyPlayback.title : (currentTrack?.title ?? '')
  const hasTrack = spotifyActive || currentTrack !== null

  function handleToggle() {
    if (spotifyActive) {
      void spotifyToggle()
    } else {
      void toggle()
    }
  }

  return (
    <section aria-label={t('vinyl.region')} className="relative">
      <div className="relative mx-auto aspect-square w-full">
        <WaveRing active={isPlaying} analyser={getAnalyser()} />

        <span
          className="motion-reduce:animate-none absolute inset-0 animate-disc overflow-hidden rounded-full shadow-disc will-change-transform"
          style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
        >
          {artworkUrl !== null ? (
            <img
              alt={t('vinyl.coverAlt', { title })}
              className="absolute inset-0 size-full rounded-full object-cover"
              src={artworkUrl}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center rounded-full bg-ink">
              <span className="grid size-1/3 place-items-center rounded-full bg-primary-soft">
                <DiscMark className="size-10 text-primary-strong sm:size-12" />
              </span>
            </span>
          )}

          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'repeating-radial-gradient(circle at center, rgb(0 0 0 / 0.28) 0 1px, transparent 1px 5px), radial-gradient(circle at center, transparent 42%, rgb(0 0 0 / 0.35) 100%)',
            }}
          />

          <span className="absolute left-1/2 top-1/2 size-[14%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg)] shadow-[inset_0_2px_6px_rgb(0_0_0/0.35)]">
            <span className="absolute left-1/2 top-1/2 size-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
          </span>
        </span>

        <button
          aria-label={isPlaying ? t('player.pause') : t('player.play')}
          className="absolute inset-0 rounded-full disabled:cursor-not-allowed"
          disabled={!hasTrack}
          onClick={handleToggle}
          type="button"
        />
      </div>
    </section>
  )
}
