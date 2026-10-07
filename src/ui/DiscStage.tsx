import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../features/library'
import { isExternalTrack, useSpotifyStore } from '../features/sources'
import { usePlayerStore } from '../player'
import { DiscVideo } from './DiscVideo'
import {
  DiscMark,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  XIcon,
} from './icons'
import { useVideoPrefs } from './video-prefs'

/**
 * Vista a pantalla completa del disco.
 * - `full`: el reproductor completo (disco + info + progreso + transporte).
 * - `disc`: solo el disco; los controles aparecen al mover el mouse.
 * Usa la API real de pantalla completa con capa a ventana completa de respaldo.
 */
export function DiscStage({ mode, onClose }: { mode: 'full' | 'disc'; onClose: () => void }) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)

  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const duration = usePlayerStore((state) => state.duration)
  const shuffle = usePlayerStore((state) => state.shuffle)
  const loopMode = usePlayerStore((state) => state.loopMode)
  const toggle = usePlayerStore((state) => state.toggle)
  const next = usePlayerStore((state) => state.next)
  const previous = usePlayerStore((state) => state.previous)
  const seek = usePlayerStore((state) => state.seek)
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle)
  const cycleLoopMode = usePlayerStore((state) => state.cycleLoopMode)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)
  const spotifyToggle = useSpotifyStore((state) => state.toggle)
  const videoInDisc = useVideoPrefs((state) => state.inDisc)

  const spotifyActive =
    spotifyPlayback !== null && (currentTrack === null || isExternalTrack(currentTrack))
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const title = spotifyActive ? spotifyPlayback.title : (currentTrack?.title ?? '')
  const artist = spotifyActive ? spotifyPlayback.artist : (currentTrack?.artist ?? '')
  const artworkUrl = spotifyActive ? spotifyPlayback.artworkUrl : (currentTrack?.artworkUrl ?? null)
  const isVideo = !spotifyActive && currentTrack?.mediaType === 'video'
  const showVideo = isVideo && videoInDisc && currentTrack !== null
  const progressTime = spotifyActive ? spotifyPlayback.positionMs / 1000 : currentTime
  const progressDuration = spotifyActive ? spotifyPlayback.durationMs / 1000 : duration
  const maxProgress = progressDuration > 0 ? progressDuration : 1

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  function handleToggle() {
    if (spotifyActive) {
      void spotifyToggle()
    } else {
      void toggle()
    }
  }

  function handleSeek(seconds: number) {
    if (spotifyActive) {
      void useSpotifyStore.getState().seek(seconds * 1000)
    } else {
      seek(seconds)
    }
  }

  useEffect(() => {
    const element = ref.current
    void element?.requestFullscreen?.().catch(() => undefined)
    const onFullscreenChange = () => {
      if (document.fullscreenElement === null) {
        onCloseRef.current()
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      if (document.fullscreenElement !== null) {
        void document.exitFullscreen?.().catch(() => undefined)
      }
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const label = t(mode === 'full' ? 'player.fullscreen' : 'player.discOnly')

  function discFace(size: string) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full border-2 border-rule bg-surface-2"
        style={{
          animation: isVideo ? 'none' : 'legato-disc 6s linear infinite',
          animationPlayState: isPlaying && !isVideo ? 'running' : 'paused',
          height: size,
          width: size,
        }}
      >
        {showVideo ? (
          <DiscVideo src={currentTrack.sourceUrl} />
        ) : artworkUrl !== null ? (
          <img
            alt={t('vinyl.coverAlt', { title })}
            className="absolute inset-0 size-full object-cover"
            src={artworkUrl}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center bg-surface-2">
            <DiscMark className="size-32 text-ink/60" />
          </span>
        )}
        <span aria-hidden="true" className="disc-grooves" />
      </div>
    )
  }

  return createPortal(
    <div
      aria-label={label}
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-ink text-bg"
      ref={ref}
      role="dialog"
    >
      {mode === 'full' ? (
        <div className="flex w-full max-w-2xl flex-col items-center gap-5 px-6">
          {discFace('min(46vmin, 46vh)')}
          <div className="w-full text-center">
            <h2 className="truncate font-display text-2xl font-black tracking-[0.02em] uppercase">
              {title}
            </h2>
            <p className="truncate text-sm text-bg/70">{artist}</p>
          </div>
          <div className="flex w-full items-center gap-3">
            <span className="w-10 text-right font-mono text-[0.6875rem] text-bg/70">
              {formatDuration(progressTime)}
            </span>
            <input
              aria-label={t('player.progress')}
              className="h-3 min-w-0 flex-1 cursor-pointer"
              max={maxProgress}
              min={0}
              onChange={(event) => handleSeek(Number(event.target.value))}
              step={0.5}
              type="range"
              value={Math.min(progressTime, maxProgress)}
            />
            <span className="w-10 font-mono text-[0.6875rem] text-bg/70">
              {formatDuration(progressDuration)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label={t('player.shuffle')}
              aria-pressed={shuffle}
              className={`border-2 border-bg/50 p-3 transition-transform hover:-translate-y-0.5 ${
                shuffle ? 'bg-accent text-on-accent' : 'text-bg'
              }`}
              onClick={toggleShuffle}
              type="button"
            >
              <ShuffleIcon className="size-5" />
            </button>
            <button
              aria-label={t('player.previous')}
              className="border-2 border-bg/50 p-3 text-bg transition-transform hover:-translate-y-0.5"
              onClick={previous}
              type="button"
            >
              <SkipBackIcon className="size-5" />
            </button>
            <button
              aria-label={isPlaying ? t('player.pause') : t('player.play')}
              className="border-2 border-rule bg-accent p-4 text-on-accent transition-transform hover:-translate-y-0.5"
              onClick={handleToggle}
              type="button"
            >
              {isPlaying ? <PauseIcon className="size-6" /> : <PlayIcon className="size-6" />}
            </button>
            <button
              aria-label={t('player.next')}
              className="border-2 border-bg/50 p-3 text-bg transition-transform hover:-translate-y-0.5"
              onClick={next}
              type="button"
            >
              <SkipForwardIcon className="size-5" />
            </button>
            <button
              aria-label={t('player.repeatAll')}
              aria-pressed={loopMode !== 'none'}
              className={`relative border-2 border-bg/50 p-3 transition-transform hover:-translate-y-0.5 ${
                loopMode !== 'none' ? 'bg-accent text-on-accent' : 'text-bg'
              }`}
              onClick={cycleLoopMode}
              type="button"
            >
              <RepeatIcon className="size-5" />
              {loopMode === 'one' && (
                <span className="absolute -right-1.5 -bottom-1.5 border border-rule bg-bg px-1 font-mono text-[0.625rem] leading-3 font-bold text-ink">
                  1
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
        discFace('min(84vmin, 84vh)')
      )}

      {mode === 'full' && (
        <button
          aria-label={t('player.exitFullscreen')}
          className="absolute top-4 right-4 border-2 border-bg/60 bg-ink/80 p-2 text-bg transition-transform hover:-translate-y-0.5"
          onClick={onClose}
          type="button"
        >
          <XIcon className="size-5" />
        </button>
      )}
    </div>,
    document.body,
  )
}
