import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { connectSpotify, isSpotifyConfigured, isSpotifyConnected } from '../features/sources'
import { XIcon } from './icons'
import { LeguiSticker } from './Legui'

const WELCOME_KEY = 'legato.legui.welcome.v1'
const CONTACT_EMAIL = 'jenifer.urbano@campusucc.edu.co'

/**
 * Nubecita de bienvenida de Legui: al entrar sugiere conectar Spotify y,
 * ya conectado, explica cómo pedir la importación de playlists escribiéndole
 * a la autora (el límite es de la app en modo desarrollo, no del usuario).
 */
export function LeguiWelcome() {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(WELCOME_KEY) === '1')
  const [connected] = useState(isSpotifyConnected)

  if (dismissed || !isSpotifyConfigured()) {
    return null
  }

  function dismiss() {
    localStorage.setItem(WELCOME_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-[110rem] items-center gap-3 px-5 pt-4 lg:px-10">
      <LeguiSticker className="size-12" />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 border-2 border-rule bg-surface px-3 py-2 shadow-[3px_3px_0_var(--color-rule)]">
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink">
          {connected
            ? t('legui.spotifyImportHint', { email: CONTACT_EMAIL })
            : t('legui.introBubble')}
        </p>
        {!connected && (
          <button
            className="border-2 border-rule bg-accent px-3 py-1.5 font-mono text-[0.6875rem] font-semibold tracking-[0.08em] text-on-accent uppercase transition-transform hover:-translate-y-0.5"
            onClick={() => {
              void connectSpotify()
            }}
            type="button"
          >
            {t('legui.introConnect')}
          </button>
        )}
        <button
          aria-label={t('cookies.close')}
          className="p-1.5 text-ink-muted transition-colors hover:text-ink"
          onClick={dismiss}
          type="button"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}
