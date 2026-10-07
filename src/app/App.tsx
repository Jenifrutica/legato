import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthContextProvider, useAuth } from '../features/auth'
import { usePlayLogStore, usePlayTracker } from '../features/capsule'
import { useHistoryStore } from '../features/history'
import { CookieConsent, LegalPage } from '../features/legal'
import {
  adoptOrphanData,
  hydrateStores,
  setActiveUserId,
  startPersistence,
  stopPersistence,
} from '../features/persistence'
import { setSpotifyScope, SpotifyBanner, useExternalPlayback } from '../features/sources'
import { configureCloudSync } from '../features/sync'
import { useAlbumTheme } from '../features/theme'
import { useAudioFxStore } from '../player'
import { teardownSession } from './teardown-session'
import { Hero } from '../ui/Hero'
import { Landing } from '../ui/Landing'
import { LegatoLogo, LeguiMark } from '../ui/Legui'
import { LeguiWelcome } from '../ui/LeguiWelcome'

import { MiniPlayer } from '../ui/MiniPlayer'
import { MobileNav } from '../ui/MobileNav'
import { MusiciansPanel } from '../ui/MusiciansPanel'
import { PlayerBar } from '../ui/PlayerBar'
import { usePanelVisibilityStore } from '../ui/panel-tabs'
import { RightPanel } from '../ui/RightPanel'
import { TopBar } from '../ui/TopBar'

export default function App() {
  return (
    <AuthContextProvider>
      <AuthGate />
    </AuthContextProvider>
  )
}

export function AuthGate() {
  const { t } = useTranslation()
  const { user, ready, kind, isGuest } = useAuth()

  if (!ready) {
    return (
      <div
        aria-label={t('app.loading')}
        className="grid min-h-dvh place-items-center bg-bg text-ink"
      >
        <div className="flex flex-col items-center gap-4">
          <LeguiMark className="animate-legui-bob w-24" />
          <LegatoLogo className="h-8 w-auto" />
          <span className="sr-only">Legato</span>
        </div>
      </div>
    )
  }

  if (user === null) {
    return <Landing />
  }

  return <AppShell authKind={kind} guest={isGuest} userId={user.id} />
}

function AppShell({
  authKind,
  userId,
  guest,
}: {
  authKind: string
  userId: string
  guest: boolean
}) {
  const { t } = useTranslation()
  useAlbumTheme()
  const panelCollapsed = usePanelVisibilityStore((state) => state.collapsed)
  const togglePanel = usePanelVisibilityStore((state) => state.toggle)
  usePlayTracker()
  useExternalPlayback()

  useEffect(() => {
    let cancelled = false
    // Solo se puede guardar/limpiar la sesión si de verdad se llegó a hidratar;
    // si no, al montar se guardaría un estado vacío y pisaría la Lista guardada.
    let hydrated = false

    void (async () => {
      setActiveUserId(userId)
      setSpotifyScope(userId)
      usePlayLogStore.getState().setScope(userId)
      // El invitado no adopta huérfanos ni sincroniza en la nube.
      if (!guest) {
        await adoptOrphanData(userId, { inheritLocalAccounts: authKind !== 'local' })
      }
      if (cancelled) {
        return
      }
      await hydrateStores()
      hydrated = true
      startPersistence()
      useAudioFxStore.getState().resumeAmbientPlayback()
      configureCloudSync(guest ? null : userId)
    })()

    return () => {
      cancelled = true
      if (hydrated) {
        teardownSession()
      } else {
        stopPersistence()
      }
    }
  }, [userId, authKind, guest])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey
      if (!modifier || event.key.toLowerCase() !== 'z') {
        return
      }

      const target = event.target as HTMLElement | null
      if (
        target !== null &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }

      event.preventDefault()
      if (event.shiftKey) {
        useHistoryStore.getState().redo()
      } else {
        useHistoryStore.getState().undo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-dvh bg-bg text-ink" style={{ paddingBottom: 'var(--bottom-bar)' }}>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:border-2 focus:border-rule focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
        href="#contenido"
      >
        {t('app.skipToContent')}
      </a>

      <TopBar />
      <SpotifyBanner />

      <div
        className={`min-w-0 lg:grid ${
          panelCollapsed
            ? 'lg:grid-cols-1'
            : 'lg:grid-cols-[minmax(0,1fr)_25rem] xl:grid-cols-[minmax(0,1fr)_27rem]'
        }`}
      >
        <main className="min-w-0" id="contenido">
          <LeguiWelcome />
          <Hero />
        </main>

        <RightPanel collapsed={panelCollapsed} />
      </div>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-5 py-4 text-xs text-ink-muted lg:px-8">
        <a
          className="underline underline-offset-2 transition-colors hover:text-accent-ink"
          href="#/legal/privacy"
        >
          {t('legal.links.privacy')}
        </a>
        <a
          className="underline underline-offset-2 transition-colors hover:text-accent-ink"
          href="#/legal/terms"
        >
          {t('legal.links.terms')}
        </a>
        <a
          className="underline underline-offset-2 transition-colors hover:text-accent-ink"
          href="#/legal/cookies"
        >
          {t('legal.links.cookies')}
        </a>
        <a
          className="underline underline-offset-2 transition-colors hover:text-accent-ink"
          href="#/legal/accessibility"
        >
          {t('legal.links.accessibility')}
        </a>
        <span aria-hidden="true">·</span>
        <span>{t('academic')}</span>
      </footer>

      <button
        aria-label={panelCollapsed ? t('panel.show') : t('panel.hide')}
        aria-pressed={panelCollapsed}
        className="fixed right-3 z-40 grid size-9 place-items-center border-2 border-rule bg-surface text-ink shadow-[3px_3px_0_var(--color-rule)] lg:hidden"
        onClick={togglePanel}
        style={{ bottom: 'calc(var(--bottom-bar) + 0.75rem)' }}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          {panelCollapsed ? <path d="m6 15 6-6 6 6" /> : <path d="m6 9 6 6 6-6" />}
        </svg>
      </button>

      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <PlayerBar />
        <MobileNav />
      </div>

      <MusiciansPanel />
      <MiniPlayer />

      <CookieConsent />
      <LegalPage />
    </div>
  )
}
