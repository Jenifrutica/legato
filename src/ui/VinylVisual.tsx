import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useTrackAnalysisStore } from '../features/musician'
import { useSpotifyStore } from '../features/sources'
import { getAnalyser, usePlayerStore } from '../player'
import { DiscMark } from './icons'
import { WaveRing } from './WaveRing'

export function VinylVisual() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const queue = usePlayerStore((state) => state.queue)
  const toggle = usePlayerStore((state) => state.toggle)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)
  const spotifyToggle = useSpotifyStore((state) => state.toggle)
  const trackId = currentTrack?.id ?? null
  const analysis = useTrackAnalysisStore((state) =>
    trackId === null ? null : (state.records[trackId] ?? null),
  )

  const spotifyActive = spotifyPlayback !== null
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const artworkUrl = spotifyActive ? spotifyPlayback.artworkUrl : (currentTrack?.artworkUrl ?? null)
  const title = spotifyActive ? spotifyPlayback.title : (currentTrack?.title ?? '')
  const hasTrack = spotifyActive || currentTrack !== null

  const nodeIndex =
    currentTrack === null ? -1 : queue.findIndex((item) => item.id === currentTrack.id)
  const nodeCode = nodeIndex >= 0 ? `N-${String(nodeIndex + 1).padStart(2, '0')}` : 'N-00'

  function handleToggle() {
    if (spotifyActive) {
      void spotifyToggle()
    } else {
      void toggle()
    }
  }

  return (
    <section aria-label={t('vinyl.region')} className="relative">
      <div className="disc-zone" style={{ '--disc': 'min(46rem, 80vw, 72dvh)' } as CSSProperties}>
        <span aria-hidden="true" className="disc-field" />

        <div className="disc-wrap">
          <WaveRing
            active={isPlaying}
            analyser={getAnalyser()}
            beats={analysis?.detectedBeats ?? null}
            bpmOverride={analysis?.bpm ?? null}
            position={spotifyActive ? spotifyPlayback.positionMs / 1000 : currentTime}
          />

          <div
            className="disc-plate motion-reduce:animate-none"
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
          >
            {artworkUrl !== null ? (
              <img
                alt={t('vinyl.coverAlt', { title })}
                className="absolute inset-0 size-full object-cover"
                src={artworkUrl}
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center bg-surface-2">
                <DiscMark className="size-20 text-ink/60" />
              </span>
            )}
            <span aria-hidden="true" className="disc-grooves" />
            {artworkUrl === null && (
              <span className="disc-label">
                <b className="font-mono text-[0.6875rem] tracking-[0.14em]">{nodeCode}</b>
              </span>
            )}
          </div>

          <button
            aria-label={isPlaying ? t('player.pause') : t('player.play')}
            className="absolute inset-0 rounded-full disabled:cursor-not-allowed"
            disabled={!hasTrack}
            onClick={handleToggle}
            type="button"
          />
        </div>
      </div>
    </section>
  )
}
