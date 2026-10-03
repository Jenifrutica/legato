import { useTranslation } from 'react-i18next'
import { AccountChip, AuthContextProvider } from '../features/auth'
import { LanguageSelector } from '../features/i18n'
import { LibraryPanel } from '../ui/LibraryPanel'
import { MobileNav } from '../ui/MobileNav'
import { PlayerBar } from '../ui/PlayerBar'
import { Sidebar } from '../ui/Sidebar'
import { VinylStage } from '../ui/VinylStage'
import { DiscMark } from '../ui/icons'

export default function App() {
  return (
    <AuthContextProvider>
      <AppShell />
    </AuthContextProvider>
  )
}

function AppShell() {
  const { t } = useTranslation()

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
          </main>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30">
        <PlayerBar />
        <MobileNav />
      </div>
    </div>
  )
}
