import { useTranslation } from 'react-i18next'
import { XIcon } from '../../ui/icons'
import { isAppleMobile } from './spotify-connect'
import { useSpotifyStore } from './spotify-store'

export function SpotifyBanner() {
  const { t } = useTranslation()
  const status = useSpotifyStore((state) => state.status)
  const error = useSpotifyStore((state) => state.error)
  const playback = useSpotifyStore((state) => state.playback)
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
      <div className="flex items-center gap-3 border-b border-border/70 bg-accent-soft px-4 py-2 text-xs text-ink">
        <span className="min-w-0 flex-1">
          {error === 'not-connected'
            ? t('spotify.notConnected')
            : `${t('spotify.error')}: ${error}`}
        </span>
        <button
          aria-label={t('spotify.exit')}
          className=" p-1.5 text-ink-muted transition-colors hover:text-ink"
          onClick={disconnect}
          type="button"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    )
  }

  // iPhone/iPad: el audio lo pone la app de Spotify, así que debe seguir abierta.
  if (isAppleMobile() && playback !== null) {
    return (
      <div className="border-b border-border/70 bg-[#1db954]/10 px-4 py-2 text-xs text-ink-muted">
        {t('spotify.backgroundHint')}
      </div>
    )
  }

  return null
}
