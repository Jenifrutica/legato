import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { A11yPanel, useA11yStore } from '../features/a11y'
import { AccountChip } from '../features/auth'
import { LanguageSelector } from '../features/i18n'
import { usePlaylistsStore } from '../features/playlists'
import { SettingsPanel } from '../features/sources'
import { useThemeStore } from '../features/theme'
import { AccessibilityIcon, DiscMark, MoonIcon, SettingsIcon, SunIcon } from './icons'

export function TopBar() {
  const { t } = useTranslation()
  const playlists = usePlaylistsStore((state) => state.playlists)
  const selectedPlaylistId = usePlaylistsStore((state) => state.selectedPlaylistId)
  const selectPlaylist = usePlaylistsStore((state) => state.selectPlaylist)
  const openA11yPanel = useA11yStore((state) => state.openPanel)
  const themeMode = useThemeStore((state) => state.mode)
  const toggleTheme = useThemeStore((state) => state.toggle)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b-2 border-rule bg-ink text-bg">
      <div className="mx-auto flex max-w-[110rem] items-center gap-3 px-4 py-2.5 sm:px-6">
        <span className="grid size-9 place-items-center border-2 border-bg/25 bg-accent text-on-accent">
          <DiscMark className="size-5" />
        </span>
        <h1 className="font-display text-xl font-black tracking-[0.08em] uppercase">Legato</h1>

        <span aria-hidden="true" className="mx-1 hidden h-6 w-0.5 bg-bg/25 sm:block" />

        <span className="relative hidden sm:block">
          <select
            aria-label={t('topbar.collection')}
            className="max-w-52 cursor-pointer appearance-none border-2 border-bg/40 bg-transparent py-1.5 pr-8 pl-3 text-sm font-semibold text-bg focus:border-accent focus:outline-none"
            onChange={(event) =>
              selectPlaylist(event.target.value === 'library' ? null : event.target.value)
            }
            value={selectedPlaylistId ?? 'library'}
          >
            <option value="library">{t('nav.library')}</option>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 font-mono text-xs text-bg/70"
          >
            ▾
          </span>
        </span>

        <span
          aria-hidden="true"
          className="ml-auto size-3 border border-bg/50 bg-accent transition-colors duration-300"
        />
        <button
          aria-label={t('a11y.title')}
          className="p-2 text-bg/70 transition-colors hover:text-bg"
          onClick={openA11yPanel}
          type="button"
        >
          <AccessibilityIcon className="size-5" />
        </button>
        <button
          aria-label={t('theme.toggle')}
          className="p-2 text-bg/70 transition-colors hover:text-bg"
          onClick={toggleTheme}
          type="button"
        >
          {themeMode === 'dark' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
        </button>
        <button
          aria-label={t('settings.title')}
          className="p-2 text-bg/70 transition-colors hover:text-bg"
          onClick={() => setSettingsOpen(true)}
          type="button"
        >
          <SettingsIcon className="size-5" />
        </button>
        <LanguageSelector compact />
        <div className="hidden min-w-0 max-w-44 sm:block">
          <AccountChip />
        </div>
      </div>
      <A11yPanel />
      <SettingsPanel onClose={() => setSettingsOpen(false)} open={settingsOpen} />
    </header>
  )
}
