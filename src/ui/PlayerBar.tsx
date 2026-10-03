import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../features/library'
import { getAnalyser, usePlayerStore } from '../player'
import { WaveBars } from './WaveBars'
import {
  DiscMark,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  TimerIcon,
  VolumeIcon,
} from './icons'

function TransportButton({
  label,
  icon,
  onClick,
  disabled = false,
  pressed,
  primary = false,
}: {
  label: string
  icon: ReactNode
  onClick?: () => void
  disabled?: boolean
  pressed?: boolean
  primary?: boolean
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className={`grid place-items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? 'size-11 bg-primary-strong text-white hover:opacity-90'
          : `size-9 ${pressed === true ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:text-ink'}`
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
    </button>
  )
}

export function PlayerBar() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const duration = usePlayerStore((state) => state.duration)
  const volume = usePlayerStore((state) => state.volume)
  const rate = usePlayerStore((state) => state.rate)
  const loopMode = usePlayerStore((state) => state.loopMode)
  const shuffle = usePlayerStore((state) => state.shuffle)
  const toggle = usePlayerStore((state) => state.toggle)
  const next = usePlayerStore((state) => state.next)
  const previous = usePlayerStore((state) => state.previous)
  const seek = usePlayerStore((state) => state.seek)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const cycleRate = usePlayerStore((state) => state.cycleRate)
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle)
  const cycleLoopMode = usePlayerStore((state) => state.cycleLoopMode)

  const isPlaying = status === 'playing'
  const hasTrack = currentTrack !== null
  const maxProgress = duration > 0 ? duration : 1
  const loopLabel =
    loopMode === 'none'
      ? t('player.repeatOff')
      : loopMode === 'all'
        ? t('player.repeatAll')
        : t('player.repeatOne')

  return (
    <section
      aria-label={t('player.region')}
      className="border-t border-border bg-surface shadow-bar"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-ink text-bg">
            {currentTrack?.artworkUrl !== null && currentTrack?.artworkUrl !== undefined ? (
              <img
                alt={t('vinyl.coverAlt', { title: currentTrack.title })}
                className="size-full object-cover"
                src={currentTrack.artworkUrl}
              />
            ) : (
              <DiscMark className="size-6" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {currentTrack?.title ?? t('player.noPlayback')}
            </p>
            <p className="truncate text-xs text-ink-muted">
              {currentTrack?.artist ?? t('player.importSong')}
            </p>
          </div>
        </div>

        <div className="hidden flex-1 flex-col items-center gap-1 sm:flex">
          <WaveBars active={isPlaying} analyser={getAnalyser()} />

          <div className="flex items-center gap-2">
            <TransportButton
              disabled={!hasTrack}
              icon={<ShuffleIcon className="size-4" />}
              label={t('player.shuffle')}
              onClick={toggleShuffle}
              pressed={shuffle}
            />
            <TransportButton
              disabled={!hasTrack}
              icon={<SkipBackIcon className="size-5" />}
              label={t('player.previous')}
              onClick={previous}
            />
            <TransportButton
              disabled={!hasTrack}
              icon={isPlaying ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
              label={isPlaying ? t('player.pause') : t('player.play')}
              onClick={() => void toggle()}
              primary
            />
            <TransportButton
              disabled={!hasTrack}
              icon={<SkipForwardIcon className="size-5" />}
              label={t('player.next')}
              onClick={next}
            />
            <TransportButton
              disabled={!hasTrack}
              icon={
                <span className="relative grid place-items-center">
                  <RepeatIcon className="size-4" />
                  {loopMode === 'one' && (
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-primary-strong px-1 text-[0.5rem] font-bold leading-3 text-white">
                      1
                    </span>
                  )}
                </span>
              }
              label={loopLabel}
              onClick={cycleLoopMode}
              pressed={loopMode !== 'none'}
            />
          </div>

          <div className="flex w-full max-w-xl items-center gap-3">
            <span className="w-10 text-right text-xs tabular-nums text-ink-muted">
              {formatDuration(currentTime)}
            </span>
            <input
              aria-label={t('player.progress')}
              className="h-1.5 flex-1 cursor-pointer accent-primary disabled:cursor-not-allowed"
              disabled={!hasTrack}
              max={maxProgress}
              min={0}
              onChange={(event) => seek(Number(event.target.value))}
              step={0.5}
              type="range"
              value={Math.min(currentTime, maxProgress)}
            />
            <span className="w-10 text-xs tabular-nums text-ink-muted">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-3 lg:flex">
            <button
              aria-label={t('player.speed')}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-primary hover:text-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!hasTrack}
              onClick={cycleRate}
              type="button"
            >
              {rate}x
            </button>
            <TransportButton
              icon={<TimerIcon className="size-4" />}
              label={t('player.timer')}
              disabled
            />
            <span className="flex items-center gap-2">
              <VolumeIcon className="size-4 text-ink-muted" />
              <input
                aria-label={t('player.volume')}
                className="h-1.5 w-24 cursor-pointer accent-primary"
                max={100}
                min={0}
                onChange={(event) => setVolume(Number(event.target.value) / 100)}
                type="range"
                value={Math.round(volume * 100)}
              />
            </span>
          </div>

          <div className="sm:hidden">
            <TransportButton
              disabled={!hasTrack}
              icon={isPlaying ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
              label={isPlaying ? t('player.pause') : t('player.play')}
              onClick={() => void toggle()}
              primary
            />
          </div>
        </div>
      </div>
    </section>
  )
}
