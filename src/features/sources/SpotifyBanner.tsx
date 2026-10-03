import { useTranslation } from 'react-i18next'
import { formatDuration } from '../library'
import { DiscMark, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon, XIcon } from '../../ui/icons'
import { useSpotifyStore } from './spotify-store'

export function SpotifyBanner() {
  const { t } = useTranslation()
  const status = useSpotifyStore((state) => state.status)
  const error = useSpotifyStore((state) => state.error)
  const playback = useSpotifyStore((state) => state.playback)
  const toggle = useSpotifyStore((state) => state.toggle)
  const next = useSpotifyStore((state) => state.next)
  const previous = useSpotifyStore((state) => state.previous)
  const seek = useSpotifyStore((state) => state.seek)
  const disconnect = useSpotifyStore((state) => state.disconnect)

  if (status === 'connecting') {
    return (
      <div className="border-b border-border/70 bg-[#1db954]/10 px-4 py-2 text-xs text-ink-muted">
        {t('spotify.connecting')}
      </div>
    )
  }

  if (status === 'error' && error !== null) {
    return (
      <div className="flex items-center gap-3 border-b border-border/70 bg-primary-soft px-4 py-2 text-xs text-ink">
        <span className="min-w-0 flex-1">
          {error === 'not-connected'
            ? t('spotify.notConnected')
            : `${t('spotify.error')}: ${error}`}
        </span>
        <button
          aria-label={t('spotify.exit')}
          className="rounded-full p-1.5 text-ink-muted transition-colors hover:text-ink"
          onClick={disconnect}
          type="button"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    )
  }

  if (playback === null) {
    return null
  }

  const maxProgress = Math.max(1, playback.durationMs)

  return (
    <section
      aria-label={t('spotify.banner')}
      className="border-b border-border/70 bg-[#1db954]/10 px-4 py-2"
    >
      <div className="mx-auto flex max-w-[110rem] items-center gap-2 sm:gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#1db954] text-white">
          <DiscMark className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{playback.title}</span>
          <span className="block truncate text-xs text-ink-muted">
            {playback.artist} · {t('spotify.premium')}
          </span>
        </span>

        <span className="hidden font-mono text-xs tabular-nums text-ink-muted md:block">
          {formatDuration(playback.positionMs / 1000)} /{' '}
          {formatDuration(playback.durationMs / 1000)}
        </span>

        <input
          aria-label={t('player.progress')}
          className="hidden w-32 md:block lg:w-44"
          max={maxProgress}
          min={0}
          onChange={(event) => void seek(Number(event.target.value))}
          type="range"
          value={Math.min(playback.positionMs, maxProgress)}
        />

        <button
          aria-label={t('player.previous')}
          className="grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:text-ink"
          onClick={() => void previous()}
          type="button"
        >
          <SkipBackIcon className="size-4" />
        </button>
        <button
          aria-label={playback.paused ? t('player.play') : t('player.pause')}
          className="grid size-9 place-items-center rounded-full bg-primary-strong text-white"
          onClick={() => void toggle()}
          type="button"
        >
          {playback.paused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
        </button>
        <button
          aria-label={t('player.next')}
          className="grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:text-ink"
          onClick={() => void next()}
          type="button"
        >
          <SkipForwardIcon className="size-4" />
        </button>
        <button
          aria-label={t('spotify.exit')}
          className="grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:text-danger"
          onClick={disconnect}
          type="button"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </section>
  )
}
