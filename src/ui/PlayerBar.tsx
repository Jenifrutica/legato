import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../features/library'
import { getAnalyser, usePlayerStore } from '../player'
import { PracticePanel } from './PracticePanel'
import { TimerPanel } from './TimerPanel'
import { TransportButton } from './TransportButton'
import { WaveBars } from './WaveBars'
import {
  DiscMark,
  FlagIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  TimerIcon,
} from './icons'

export function PlayerBar() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const duration = usePlayerStore((state) => state.duration)
  const loopMode = usePlayerStore((state) => state.loopMode)
  const shuffle = usePlayerStore((state) => state.shuffle)
  const abLoop = usePlayerStore((state) => state.abLoop)
  const timer = usePlayerStore((state) => state.timer)
  const toggle = usePlayerStore((state) => state.toggle)
  const next = usePlayerStore((state) => state.next)
  const previous = usePlayerStore((state) => state.previous)
  const seek = usePlayerStore((state) => state.seek)
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle)
  const cycleLoopMode = usePlayerStore((state) => state.cycleLoopMode)
  const [practiceOpen, setPracticeOpen] = useState(false)
  const [timerOpen, setTimerOpen] = useState(false)

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
      className="border-t border-border bg-surface/95 shadow-bar backdrop-blur-md lg:hidden"
    >
      <div className="flex items-center gap-2 px-3 pb-1 pt-2">
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-ink text-bg">
          {currentTrack?.artworkUrl !== null && currentTrack?.artworkUrl !== undefined ? (
            <img
              alt={t('vinyl.coverAlt', { title: currentTrack.title })}
              className="size-full object-cover"
              src={currentTrack.artworkUrl}
            />
          ) : (
            <DiscMark className="size-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {currentTrack?.title ?? t('player.noPlayback')}
          </p>
          <p className="truncate text-xs text-ink-muted">
            {currentTrack?.artist ?? t('player.importSong')}
          </p>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <div className="relative">
            <TransportButton
              icon={<FlagIcon className="size-4" />}
              label={t('practice.title')}
              onClick={() => {
                setTimerOpen(false)
                setPracticeOpen((value) => !value)
              }}
              pressed={abLoop !== null}
            />
            {practiceOpen && <PracticePanel onClose={() => setPracticeOpen(false)} />}
          </div>
          <div className="relative">
            <TransportButton
              icon={<TimerIcon className="size-4" />}
              label={t('player.timer')}
              onClick={() => {
                setPracticeOpen(false)
                setTimerOpen((value) => !value)
              }}
              pressed={timer.mode !== 'off'}
            />
            {timerOpen && <TimerPanel onClose={() => setTimerOpen(false)} />}
          </div>
        </div>

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

      <div className="flex items-center gap-2 px-3 pb-2">
        <span className="w-9 text-right text-[0.625rem] tabular-nums text-ink-muted">
          {formatDuration(currentTime)}
        </span>
        <input
          aria-label={t('player.progress')}
          className="h-1 flex-1 cursor-pointer accent-primary disabled:cursor-not-allowed"
          disabled={!hasTrack}
          max={maxProgress}
          min={0}
          onChange={(event) => seek(Number(event.target.value))}
          step={0.5}
          type="range"
          value={Math.min(currentTime, maxProgress)}
        />
        <span className="w-9 text-[0.625rem] tabular-nums text-ink-muted">
          {formatDuration(duration)}
        </span>
      </div>

      <div className="hidden px-3 pb-1 sm:block">
        <WaveBars active={isPlaying} analyser={getAnalyser()} />
      </div>
    </section>
  )
}
