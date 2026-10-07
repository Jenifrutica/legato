import { useState } from 'react'
import { useVideoPrefs } from './video-prefs'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../features/library'
import { isExternalTrack, useSpotifyStore } from '../features/sources'
import { usePlayerStore } from '../player'
import { PracticePanel } from './PracticePanel'
import { TimerPanel } from './TimerPanel'
import { TransportButton } from './TransportButton'
import { DiscStage } from './DiscStage'
import { VinylVisual } from './VinylVisual'
import { LeguiBubble } from './Legui'
import { activeLineIndex, useLyrics, useLyricsStore } from '../features/lyrics'
import { Lyrics, useDemoLyrics } from './Lyrics'
import { QueueStrip } from './QueueStrip'
import { NostalgiaCapsule } from './NostalgiaCapsule'
import { usePanelVisibilityStore } from './panel-tabs'
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
  const playerError = usePlayerStore((state) => state.error)
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
  const spotifyVolume = useSpotifyStore((state) => state.volume)
  const setSpotifyVolume = useSpotifyStore((state) => state.setVolume)
  const spotifyNext = useSpotifyStore((state) => state.next)
  const spotifyPrevious = useSpotifyStore((state) => state.previous)
  const [practiceOpen, setPracticeOpen] = useState(false)
  const [timerOpen, setTimerOpen] = useState(false)
  const [discExpanded, setDiscExpanded] = useState(false)
  const panelCollapsed = usePanelVisibilityStore((state) => state.collapsed)
  // Al ocultar el panel de listas, el héroe se centra solo (sin pulsar «Ver completo»).
  const centered = discExpanded || panelCollapsed
  const [stageMode, setStageMode] = useState<'full' | 'disc' | null>(null)
  const videoInDisc = useVideoPrefs((state) => state.inDisc)
  const toggleVideo = useVideoPrefs((state) => state.toggle)
  const demoLyrics = useDemoLyrics()

  const externalCurrent = isExternalTrack(currentTrack)
  const spotifyActive = spotifyPlayback !== null && (currentTrack === null || externalCurrent)
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const hasPlayable = spotifyActive || currentTrack !== null

  const lyricsQuery = spotifyActive
    ? {
        title: spotifyPlayback.title,
        artist: spotifyPlayback.artist,
        album: null,
        durationSeconds: spotifyPlayback.durationMs / 1000,
        trackId: currentTrack?.id ?? null,
      }
    : currentTrack === null
      ? null
      : {
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          durationSeconds: currentTrack.durationSeconds,
          trackId: currentTrack.id,
        }
  const lyricsState = useLyrics(lyricsQuery)
  const lyricsVisible = useLyricsStore((state) => state.enabled)
  const toggleLyrics = useLyricsStore((state) => state.toggle)
  const lyricsLines = lyricsVisible ? (demoLyrics.length > 0 ? demoLyrics : lyricsState.lines) : []
  const lyricsSource = lyricsVisible && demoLyrics.length === 0 ? lyricsState.source : null

  // Línea secundaria del héroe: si la vigente no ha entrado y la siguiente
  // está pronta, se enseña la siguiente. Se decide en los cambios de posición
  // (no cada cuadro) para que el componente no se recree en cada render.
  const heroTime =
    spotifyActive && spotifyPlayback !== null ? spotifyPlayback.positionMs / 1000 : currentTime
  const heroActive = activeLineIndex(lyricsLines, heroTime)
  const lyricsNext =
    heroActive >= 0
      ? heroActive + 1 < lyricsLines.length && lyricsLines[heroActive + 1].time - heroTime <= 1.2
        ? lyricsLines[heroActive + 1]
        : null
      : null
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

  const titleWords = displayTitle.trim().split(/\s+/)
  const titleTail = titleWords.length > 1 ? titleWords[titleWords.length - 1] : null
  const titleHead = titleTail === null ? displayTitle : titleWords.slice(0, -1).join(' ')

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
    if (spotifyActive && !externalCurrent) {
      void spotifyNext()
    } else {
      next()
    }
  }

  function handlePrevious() {
    if (spotifyActive && !externalCurrent) {
      void spotifyPrevious()
    } else {
      previous()
    }
  }

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-0 lg:flex lg:min-h-[calc(100dvh-4.6rem)] lg:flex-col lg:px-10 lg:pb-20">
      <div className="absolute top-3 right-4 z-10 hidden sm:block">
        <NostalgiaCapsule />
      </div>

      <div className="relative mx-auto flex w-full max-w-[110rem] flex-col lg:flex-1">
        <VinylVisual expanded={discExpanded} />

        <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
          <button
            aria-pressed={discExpanded}
            className={`h-9 border-2 border-rule px-3 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-transform hover:-translate-y-0.5 ${
              discExpanded
                ? 'bg-accent text-on-accent shadow-[3px_3px_0_var(--color-rule)]'
                : 'bg-surface text-ink-muted'
            }`}
            onClick={() => setDiscExpanded((value) => !value)}
            type="button"
          >
            {t('player.viewFull')}
          </button>
          <button
            className="h-9 border-2 border-rule bg-surface px-3 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-transform hover:-translate-y-0.5 hover:text-ink"
            onClick={() => setStageMode('full')}
            type="button"
          >
            {t('player.fullscreen')}
          </button>
          <button
            className="h-9 border-2 border-rule bg-surface px-3 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-transform hover:-translate-y-0.5 hover:text-ink"
            onClick={() => setStageMode('disc')}
            type="button"
          >
            {t('player.discOnly')}
          </button>
        </div>

        <div
          className={`mt-8 flex max-w-3xl flex-col lg:mt-10 lg:flex-1 ${
            centered ? 'lg:mx-auto lg:items-center lg:text-center' : ''
          }`}
        >
          <h1 className="font-display text-[clamp(2.6rem,7.5vw,5.5rem)] leading-[0.9] font-black tracking-[-0.01em] uppercase">
            {titleTail !== null && <span className="u-display block">{titleHead}</span>}
            <span
              className={`block ${titleTail !== null ? 'u-condensed text-accent' : 'u-display'}`}
            >
              {titleTail ?? titleHead}
            </span>
          </h1>

          <p className="mt-4 font-mono text-xs tracking-[0.2em] text-ink-muted uppercase">
            {displaySubtitle}
          </p>

          {playerError !== null && (
            <LeguiBubble bubbleClassName="mt-4 border-danger text-xs" size="size-10">
              <b>{t('legui.errorPrefix')}</b> {playerError}
            </LeguiBubble>
          )}

          <Lyrics lines={lyricsLines} next={lyricsNext} source={lyricsSource} />

          {lyricsLines.length === 0 && <QueueStrip />}

          <div className="lg:mt-auto lg:pt-4">
            <div
              className={`mt-8 hidden items-center gap-3 lg:flex ${
                centered ? 'lg:justify-center' : ''
              }`}
            >
              <span className="w-10 text-right font-mono text-[0.6875rem] text-ink-muted">
                {formatDuration(progressTime)}
              </span>
              <input
                aria-label={t('player.progress')}
                className="h-3 min-w-0 flex-1 cursor-pointer disabled:cursor-not-allowed"
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
              <span className="w-10 font-mono text-[0.6875rem] text-ink-muted">
                {formatDuration(progressDuration)}
              </span>
            </div>

            <div
              className={`mt-5 hidden flex-wrap items-center gap-3 lg:flex ${
                centered ? 'lg:justify-center' : ''
              }`}
            >
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
                icon={
                  isPlaying ? <PauseIcon className="size-6" /> : <PlayIcon className="size-6" />
                }
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
                      <span className="absolute -right-1.5 -bottom-1.5 border border-rule bg-accent px-1 font-mono text-[0.6875rem] leading-3 font-bold text-on-accent">
                        1
                      </span>
                    )}
                  </span>
                }
                label={loopLabel}
                onClick={cycleLoopMode}
                pressed={loopMode !== 'none'}
              />

              <span aria-hidden="true" className="mx-1 h-8 w-0.5 bg-rule/20" />

              {!spotifyActive && (
                <button
                  aria-label={t('player.speed')}
                  className="h-11 border-2 border-rule bg-surface px-4 font-mono text-sm font-semibold text-ink shadow-[3px_3px_0_var(--color-rule)] transition-transform enabled:hover:-translate-y-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!hasPlayable}
                  onClick={cycleRate}
                  type="button"
                >
                  {rate}x
                </button>
              )}

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

              <span className="ml-2 flex shrink-0 items-center gap-2">
                <VolumeIcon className="size-4 text-ink-muted" />
                <input
                  aria-label={t('player.volume')}
                  className="h-3 w-28 cursor-pointer"
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
              </span>

              <button
                aria-pressed={lyricsVisible}
                className={`ml-1 h-11 border-2 border-rule px-3 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-transform hover:-translate-y-0.5 ${
                  lyricsVisible
                    ? 'bg-accent text-on-accent shadow-[3px_3px_0_var(--color-rule)]'
                    : 'bg-surface text-ink-muted'
                }`}
                onClick={toggleLyrics}
                type="button"
              >
                {t('lyrics.toggle')}
              </button>

              {currentTrack?.mediaType === 'video' && (
                <button
                  aria-pressed={videoInDisc}
                  className={`h-11 border-2 border-rule px-3 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-transform hover:-translate-y-0.5 ${
                    videoInDisc
                      ? 'bg-accent text-on-accent shadow-[3px_3px_0_var(--color-rule)]'
                      : 'bg-surface text-ink-muted'
                  }`}
                  onClick={toggleVideo}
                  type="button"
                >
                  {videoInDisc ? t('player.hideVideo') : t('player.showVideo')}
                </button>
              )}

              {currentTrack !== null && isExternalTrack(currentTrack) && (
                <button
                  className="h-11 border-2 border-rule bg-surface px-3 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-transform hover:-translate-y-0.5 hover:text-ink"
                  onClick={() => {
                    const url = currentTrack.sourceUrl.replace(
                      'spotify:track:',
                      'https://open.spotify.com/track/',
                    )
                    window.open(url, '_blank', 'noopener')
                  }}
                  type="button"
                >
                  {t('spotify.openInApp')}
                </button>
              )}

              <span aria-hidden="true" className="mx-1 h-8 w-0.5 bg-rule/20" />

              <button
                aria-pressed={discExpanded}
                className={`h-11 border-2 border-rule px-3 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-transform hover:-translate-y-0.5 ${
                  discExpanded
                    ? 'bg-accent text-on-accent shadow-[3px_3px_0_var(--color-rule)]'
                    : 'bg-surface text-ink-muted'
                }`}
                onClick={() => setDiscExpanded((value) => !value)}
                type="button"
              >
                {t('player.viewFull')}
              </button>
              <button
                className="h-11 border-2 border-rule bg-surface px-3 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-transform hover:-translate-y-0.5 hover:text-ink"
                onClick={() => setStageMode('full')}
                type="button"
              >
                {t('player.fullscreen')}
              </button>
              <button
                className="h-11 border-2 border-rule bg-surface px-3 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-transform hover:-translate-y-0.5 hover:text-ink"
                onClick={() => setStageMode('disc')}
                type="button"
              >
                {t('player.discOnly')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {stageMode !== null && <DiscStage mode={stageMode} onClose={() => setStageMode(null)} />}
    </section>
  )
}
