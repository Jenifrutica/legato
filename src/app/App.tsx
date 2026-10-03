import { useTranslation } from 'react-i18next'
import { A11yPanel, useA11yStore } from '../features/a11y'
import { AccountChip, AuthContextProvider } from '../features/auth'
import { LanguageSelector } from '../features/i18n'
import { CookieConsent, LegalPage } from '../features/legal'
import { LibraryPanel } from '../ui/LibraryPanel'
import { MobileNav } from '../ui/MobileNav'
import { PlayerBar } from '../ui/PlayerBar'
import { Sidebar } from '../ui/Sidebar'
import { VinylStage } from '../ui/VinylStage'
import { AccessibilityIcon, DiscMark } from '../ui/icons'

export default function App() {
  return (
    <AuthContextProvider>
      <AppShell />
    </AuthContextProvider>
  )
}

function AppShell() {
  const { t } = useTranslation()
  const openA11yPanel = useA11yStore((state) => state.openPanel)

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-strong focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        href="#contenido"
      >
        {t('app.skipToContent')}
      </a>

      <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <Sidebar />

        <div className="min-w-0">
          <header className="flex items-center gap-3 px-4 pt-5 sm:px-6 lg:hidden">
            <span className="grid size-9 place-items-center rounded-full bg-ink text-bg">
              <DiscMark className="size-5" />
            </span>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Legato</h1>
            <div className="ml-auto flex min-w-0 items-center gap-2">
              <button
                aria-label={t('a11y.title')}
                className="rounded-full p-2 text-ink-muted transition-colors hover:text-ink"
                onClick={openA11yPanel}
                type="button"
              >
                <AccessibilityIcon className="size-5" />
              </button>
              <LanguageSelector compact />
              <div className="min-w-0 max-w-36">
                <AccountChip />
              </div>
            </div>
          </header>

          <main className="px-4 pb-48 pt-5 sm:px-6 lg:px-8 lg:pb-36 lg:pt-8" id="contenido">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
              <VinylStage />
              <LibraryPanel />
            </div>

            <footer className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs text-ink-muted">
              <a
                className="underline underline-offset-2 transition-colors hover:text-primary-strong"
                href="#/legal/privacy"
              >
                {t('legal.links.privacy')}
              </a>
              <a
                className="underline underline-offset-2 transition-colors hover:text-primary-strong"
                href="#/legal/terms"
              >
                {t('legal.links.terms')}
              </a>
              <a
                className="underline underline-offset-2 transition-colors hover:text-primary-strong"
                href="#/legal/cookies"
              >
                {t('legal.links.cookies')}
              </a>
              <a
                className="underline underline-offset-2 transition-colors hover:text-primary-strong"
                href="#/legal/accessibility"
              >
                {t('legal.links.accessibility')}
              </a>
              <span aria-hidden="true">·</span>
              <span>{t('academic')}</span>
            </footer>
          </main>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30">
        <PlayerBar />
        <MobileNav />
      </div>

      <A11yPanel />
      <CookieConsent />
      <LegalPage />
    </div>
  )
}
