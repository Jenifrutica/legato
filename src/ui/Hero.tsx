import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../features/library'
import { useSpotifyStore } from '../features/sources'
import { usePlayerStore } from '../player'
import { PracticePanel } from './PracticePanel'
import { TimerPanel } from './TimerPanel'
import { TransportButton } from './TransportButton'
import { VinylVisual } from './VinylVisual'
import {
  FlagIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  TimerIcon,
  VolumeIcon,
} from './icons'

export function Hero() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const duration = usePlayerStore((state) => state.duration)
  const volume = usePlayerStore((state) => state.volume)
  const rate = usePlayerStore((state) => state.rate)
  const loopMode = usePlayerStore((state) => state.loopMode)
  const shuffle = usePlayerStore((state) => state.shuffle)
  const abLoop = usePlayerStore((state) => state.abLoop)
  const timer = usePlayerStore((state) => state.timer)
  const toggle = usePlayerStore((state) => state.toggle)
  const next = usePlayerStore((state) => state.next)
  const previous = usePlayerStore((state) => state.previous)
  const seek = usePlayerStore((state) => state.seek)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const cycleRate = usePlayerStore((state) => state.cycleRate)
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle)
  const cycleLoopMode = usePlayerStore((state) => state.cycleLoopMode)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)
  const spotifyToggle = useSpotifyStore((state) => state.toggle)
  const spotifyNext = useSpotifyStore((state) => state.next)
  const spotifyPrevious = useSpotifyStore((state) => state.previous)
  const [practiceOpen, setPracticeOpen] = useState(false)
  const [timerOpen, setTimerOpen] = useState(false)

  const spotifyActive = spotifyPlayback !== null
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const hasPlayable = spotifyActive || currentTrack !== null
  const displayTitle = spotifyActive
    ? spotifyPlayback.title
    : (currentTrack?.title ?? t('vinyl.idleTitle'))
  const displaySubtitle = spotifyActive
    ? `${spotifyPlayback.artist} · ${t('spotify.premium')}`
    : currentTrack === null
      ? t('vinyl.idleHint')
      : currentTrack.album === null
        ? currentTrack.artist
        : `${currentTrack.artist} · ${currentTrack.album}`

  const progressTime = spotifyActive ? spotifyPlayback.positionMs / 1000 : currentTime
  const progressDuration = spotifyActive ? spotifyPlayback.durationMs / 1000 : duration
  const maxProgress = progressDuration > 0 ? progressDuration : 1
  const loopLabel =
    loopMode === 'none'
      ? t('player.repeatOff')
      : loopMode === 'all'
        ? t('player.repeatAll')
        : t('player.repeatOne')

  function handleToggle() {
    if (spotifyActive) {
      void spotifyToggle()
    } else {
      void toggle()
    }
  }

  function handleNext() {
    if (spotifyActive) {
      void spotifyNext()
    } else {
      next()
    }
  }

  function handlePrevious() {
    if (spotifyActive) {
      void spotifyPrevious()
    } else {
      previous()
    }
  }

  return (
    <section className="relative min-h-[70vh] overflow-x-hidden px-5 py-8 xl:min-h-[calc(100dvh-9rem)]">
      <div className="mx-auto flex w-full max-w-[110rem] flex-col items-center gap-6 xl:block">
        <div className="relative z-0 w-64 shrink-0 sm:w-80 xl:pointer-events-none xl:absolute xl:-left-[min(11rem,18dvh)] xl:top-1/2 xl:w-[min(44rem,70dvh)] xl:-translate-y-1/2">
          <VinylVisual />
        </div>

        <div className="relative z-10 flex w-full min-w-0 max-w-2xl flex-col items-center gap-5 text-center xl:ml-[36rem] xl:mr-0 xl:items-start xl:gap-6 xl:text-left">
          <h2 className="max-w-full font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            {displayTitle}
          </h2>

          <p className="max-w-full text-base text-ink-muted sm:text-lg">{displaySubtitle}</p>

          <div className="flex w-full max-w-xl items-center gap-3">
            <span className="w-10 text-right text-xs tabular-nums text-ink-muted">
              {formatDuration(progressTime)}
            </span>
            <input
              aria-label={t('player.progress')}
              className="h-1.5 min-w-0 flex-1 cursor-pointer disabled:cursor-not-allowed"
              disabled={!hasPlayable}
              max={maxProgress}
              min={0}
              onChange={(event) => {
                const seconds = Number(event.target.value)
                if (spotifyActive) {
                  void useSpotifyStore.getState().seek(seconds * 1000)
                } else {
                  seek(seconds)
                }
              }}
              step={0.5}
              type="range"
              value={Math.min(progressTime, maxProgress)}
            />
            <span className="w-10 text-xs tabular-nums text-ink-muted">
              {formatDuration(progressDuration)}
            </span>
          </div>

          <div className="flex max-w-full flex-wrap items-center justify-center gap-2 xl:justify-start">
            <TransportButton
              disabled={!hasPlayable}
              icon={<ShuffleIcon className="size-4" />}
              label={t('player.shuffle')}
              onClick={toggleShuffle}
              pressed={shuffle}
            />
            <TransportButton
              disabled={!hasPlayable}
              icon={<SkipBackIcon className="size-5" />}
              label={t('player.previous')}
              onClick={handlePrevious}
            />
            <TransportButton
              disabled={!hasPlayable}
              icon={isPlaying ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
              label={isPlaying ? t('player.pause') : t('player.play')}
              onClick={handleToggle}
              primary
            />
            <TransportButton
              disabled={!hasPlayable}
              icon={<SkipForwardIcon className="size-5" />}
              label={t('player.next')}
              onClick={handleNext}
            />
            <TransportButton
              disabled={!hasPlayable}
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

            <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />

            <button
              aria-label={t('player.speed')}
              className="rounded-full border border-border px-3 py-1.5 font-mono text-xs font-semibold text-ink-muted transition-colors hover:border-primary hover:text-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!hasPlayable}
              onClick={cycleRate}
              type="button"
            >
              {rate}x
            </button>

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

            <span className="flex items-center gap-2 pl-1">
              <VolumeIcon className="size-4 text-ink-muted" />
              <input
                aria-label={t('player.volume')}
                className="h-1.5 w-20 cursor-pointer"
                max={100}
                min={0}
                onChange={(event) => setVolume(Number(event.target.value) / 100)}
                type="range"
                value={Math.round(volume * 100)}
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
