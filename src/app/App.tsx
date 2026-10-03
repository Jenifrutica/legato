import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthContextProvider } from '../features/auth'
import { usePlayTracker } from '../features/capsule'
import { useHistoryStore } from '../features/history'
import { CookieConsent, LegalPage } from '../features/legal'
import { SpotifyBanner } from '../features/sources'
import { useAlbumTheme } from '../features/theme'
import { Hero } from '../ui/Hero'
import { MobileNav } from '../ui/MobileNav'
import { MusiciansPanel } from '../ui/MusiciansPanel'
import { PlayerBar } from '../ui/PlayerBar'
import { RightPanel } from '../ui/RightPanel'
import { TopBar } from '../ui/TopBar'

export default function App() {
  return (
    <AuthContextProvider>
      <AppShell />
    </AuthContextProvider>
  )
}

function AppShell() {
  const { t } = useTranslation()
  useAlbumTheme()
  usePlayTracker()

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
    <div className="min-h-dvh bg-bg text-ink">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:border-2 focus:border-rule focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
        href="#contenido"
      >
        {t('app.skipToContent')}
      </a>

      <TopBar />
      <SpotifyBanner />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] xl:grid-cols-[minmax(0,1fr)_27rem]">
        <main className="min-w-0" id="contenido">
          <Hero />
        </main>

        <RightPanel />
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

      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <PlayerBar />
        <MobileNav />
      </div>

      <MusiciansPanel />

      <CookieConsent />
      <LegalPage />
    </div>
  )
}
