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
    <header className="sticky top-0 z-30 border-b border-border/70 bg-surface/95">
      <div className="mx-auto flex max-w-[110rem] items-center gap-3 px-4 py-3 sm:px-6">
        <span className="grid size-9 place-items-center rounded-full bg-ink text-bg">
          <DiscMark className="size-5" />
        </span>
        <h1 className="font-display text-xl font-semibold tracking-tight">Legato</h1>

        <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <select
          aria-label={t('topbar.collection')}
          className="hidden max-w-52 rounded-full border border-border bg-bg/70 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none sm:block"
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
          className="ml-auto size-4 rounded-full border border-border bg-[var(--album-primary,var(--color-primary))] transition-colors duration-500"
        />
        <button
          aria-label={t('a11y.title')}
          className="rounded-full p-2 text-ink-muted transition-colors hover:text-ink"
          onClick={openA11yPanel}
          type="button"
        >
          <AccessibilityIcon className="size-5" />
        </button>
        <button
          aria-label={t('theme.toggle')}
          className="rounded-full p-2 text-ink-muted transition-colors hover:text-ink"
          onClick={toggleTheme}
          type="button"
        >
          {themeMode === 'dark' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
        </button>
        <button
          aria-label={t('settings.title')}
          className="rounded-full p-2 text-ink-muted transition-colors hover:text-ink"
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
