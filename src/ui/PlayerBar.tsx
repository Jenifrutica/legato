import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../features/library'
import { isExternalTrack, useSpotifyStore } from '../features/sources'
import { usePlayerStore } from '../player'
import { PracticePanel } from './PracticePanel'
import { TimerPanel } from './TimerPanel'
import { TransportButton } from './TransportButton'
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
  VolumeIcon,
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
  const volume = usePlayerStore((state) => state.volume)
  const rate = usePlayerStore((state) => state.rate)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const cycleRate = usePlayerStore((state) => state.cycleRate)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)
  const spotifyToggle = useSpotifyStore((state) => state.toggle)
  const spotifyNext = useSpotifyStore((state) => state.next)
  const spotifyPrevious = useSpotifyStore((state) => state.previous)
  const spotifyVolume = useSpotifyStore((state) => state.volume)
  const setSpotifyVolume = useSpotifyStore((state) => state.setVolume)
  const [practiceOpen, setPracticeOpen] = useState(false)
  const [timerOpen, setTimerOpen] = useState(false)
  const [speedNotice, setSpeedNotice] = useState(false)

  useEffect(() => {
    if (!speedNotice) {
      return
    }
    const id = setTimeout(() => setSpeedNotice(false), 2600)
    return () => clearTimeout(id)
  }, [speedNotice])

  const externalCurrent = isExternalTrack(currentTrack)
  const spotifyActive = spotifyPlayback !== null && (currentTrack === null || externalCurrent)
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const hasTrack = spotifyActive || currentTrack !== null
  const displayTitle = spotifyActive ? spotifyPlayback.title : (currentTrack?.title ?? null)
  const displayArtist = spotifyActive ? spotifyPlayback.artist : (currentTrack?.artist ?? null)
  const displayArtwork = spotifyActive ? spotifyPlayback.artworkUrl : currentTrack?.artworkUrl
  const progressTime = spotifyActive ? spotifyPlayback.positionMs / 1000 : currentTime
  const progressDuration = spotifyActive ? spotifyPlayback.durationMs / 1000 : duration
  const maxProgress = progressDuration > 0 ? progressDuration : 1
  const loopLabel =
    loopMode === 'none'
      ? t('player.repeatOff')
      : loopMode === 'all'
        ? t('player.repeatAll')
        : t('player.repeatOne')

  return (
    <section
      aria-label={t('player.region')}
      className="border-t-2 border-rule bg-surface shadow-bar lg:hidden"
    >
      <div className="flex items-center gap-2 px-3 pb-1 pt-2">
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden  bg-ink text-bg">
          {displayArtwork !== null && displayArtwork !== undefined ? (
            <img
              alt={t('vinyl.coverAlt', { title: displayTitle ?? '' })}
              className="size-full object-cover"
              src={displayArtwork}
            />
          ) : (
            <DiscMark className="size-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{displayTitle ?? t('player.noPlayback')}</p>
          <p className="truncate text-xs text-ink-muted">
            {displayArtist ?? t('player.importSong')}
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
          onClick={() => {
            if (spotifyActive && !externalCurrent) {
              void spotifyPrevious()
            } else {
              previous()
            }
          }}
        />
        <TransportButton
          disabled={!hasTrack}
          icon={isPlaying ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
          label={isPlaying ? t('player.pause') : t('player.play')}
          onClick={() => {
            if (spotifyActive) {
              void spotifyToggle()
            } else {
              void toggle()
            }
          }}
          primary
        />
        <TransportButton
          disabled={!hasTrack}
          icon={<SkipForwardIcon className="size-5" />}
          label={t('player.next')}
          onClick={() => {
            if (spotifyActive && !externalCurrent) {
              void spotifyNext()
            } else {
              next()
            }
          }}
        />
        <TransportButton
          disabled={!hasTrack}
          icon={
            <span className="relative grid place-items-center">
              <RepeatIcon className="size-4" />
              {loopMode === 'one' && (
                <span className="absolute -bottom-1 -right-1  bg-primary-strong px-1 text-[0.6875rem] font-bold leading-3 text-on-primary">
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
        <span className="w-9 text-right text-[0.6875rem] tabular-nums text-ink-muted">
          {formatDuration(progressTime)}
        </span>
        <input
          aria-label={t('player.progress')}
          className="h-3 min-w-0 flex-1 cursor-pointer disabled:cursor-not-allowed"
          disabled={!hasTrack}
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
        <span className="w-9 text-[0.6875rem] tabular-nums text-ink-muted">
          {formatDuration(progressDuration)}
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 pb-2">
        <VolumeIcon className="size-4 shrink-0 text-ink-muted" />
        <input
          aria-label={t('player.volume')}
          className="h-3 min-w-0 flex-1 cursor-pointer"
          max={100}
          min={0}
          onChange={(event) => {
            const value = Number(event.target.value) / 100
            setVolume(value)
            if (spotifyActive) {
              void setSpotifyVolume(value)
            }
          }}
          type="range"
          value={Math.round((spotifyActive ? spotifyVolume : volume) * 100)}
        />
        <button
          aria-label={t('player.speed')}
          className="h-8 shrink-0 border-2 border-rule bg-surface px-3 font-mono text-xs font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!hasTrack}
          onClick={() => {
            if (spotifyActive) {
              setSpeedNotice(true)
            } else {
              cycleRate()
            }
          }}
          title={spotifyActive ? t('player.speedSpotify') : undefined}
          type="button"
        >
          {rate}x
        </button>
      </div>

      {speedNotice && (
        <p className="px-3 pb-2 font-mono text-[0.6875rem] text-ink-muted" role="status">
          {t('player.speedSpotify')}
        </p>
      )}
    </section>
  )
}
