import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { A11yPanel, useA11yStore } from '../features/a11y'
import { AccountChip } from '../features/auth'
import { LanguageSelector } from '../features/i18n'
import { usePlaylistsStore } from '../features/playlists'
import { SettingsPanel } from '../features/sources'
import { useThemeStore } from '../features/theme'
import { AccessibilityIcon, DiscMark, MoonIcon, SettingsIcon, SunIcon, TimerIcon } from './icons'
import { useMusiciansPanelStore } from './panel-tabs'

export function TopBar() {
  const { t } = useTranslation()
  const playlists = usePlaylistsStore((state) => state.playlists)
  const selectedPlaylistId = usePlaylistsStore((state) => state.selectedPlaylistId)
  const selectPlaylist = usePlaylistsStore((state) => state.selectPlaylist)
  const openA11yPanel = useA11yStore((state) => state.openPanel)
  const openMusicians = useMusiciansPanelStore((state) => state.setOpen)
  const themeMode = useThemeStore((state) => state.mode)
  const toggleTheme = useThemeStore((state) => state.toggle)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [collectionOpen, setCollectionOpen] = useState(false)
  const collectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!collectionOpen) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (collectionRef.current !== null && !collectionRef.current.contains(event.target as Node)) {
        setCollectionOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCollectionOpen(false)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [collectionOpen])

  const currentCollectionName =
    playlists.find((playlist) => playlist.id === selectedPlaylistId)?.name ?? t('nav.library')

  return (
    <header className="sticky top-0 z-30 border-b-2 border-rule bg-ink text-bg">
      <div className="mx-auto flex max-w-[110rem] items-center gap-3 px-4 py-2.5 sm:px-6">
        <span className="grid size-9 place-items-center border-2 border-bg/25 bg-accent text-on-accent">
          <DiscMark className="size-5" />
        </span>
        <h1 className="font-display text-xl font-black tracking-[0.08em] uppercase">Legato</h1>

        <span aria-hidden="true" className="mx-1 hidden h-6 w-0.5 bg-bg/25 sm:block" />

        <div className="relative hidden sm:block" ref={collectionRef}>
          <button
            aria-expanded={collectionOpen}
            aria-haspopup="listbox"
            aria-label={t('topbar.collection')}
            className="flex max-w-52 cursor-pointer items-center gap-2 border-2 border-bg/40 bg-transparent py-1.5 pr-2.5 pl-3 text-sm font-semibold text-bg focus:border-accent focus:outline-none"
            onClick={() => setCollectionOpen((value) => !value)}
            title={currentCollectionName}
            type="button"
          >
            <span className="truncate">{currentCollectionName}</span>
            <span aria-hidden="true" className="font-mono text-xs text-bg/70">
              ▾
            </span>
          </button>

          {collectionOpen && (
            <div
              aria-label={t('topbar.collection')}
              className="absolute top-full left-0 z-40 mt-1 w-56 border-2 border-rule bg-surface text-ink shadow-[4px_4px_0_var(--color-rule)]"
              role="listbox"
            >
              <button
                aria-selected={selectedPlaylistId === null}
                className={`block w-full truncate px-3 py-2 text-left text-sm ${
                  selectedPlaylistId === null
                    ? 'bg-accent font-semibold text-on-accent'
                    : 'hover:bg-accent-soft'
                }`}
                onClick={() => {
                  selectPlaylist(null)
                  setCollectionOpen(false)
                }}
                role="option"
                type="button"
              >
                {t('nav.library')}
              </button>
              {playlists.map((playlist) => (
                <button
                  aria-selected={playlist.id === selectedPlaylistId}
                  className={`block w-full truncate border-t border-border px-3 py-2 text-left text-sm ${
                    playlist.id === selectedPlaylistId
                      ? 'bg-accent font-semibold text-on-accent'
                      : 'hover:bg-accent-soft'
                  }`}
                  key={playlist.id}
                  onClick={() => {
                    selectPlaylist(playlist.id)
                    setCollectionOpen(false)
                  }}
                  role="option"
                  type="button"
                >
                  {playlist.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <span
          aria-hidden="true"
          className="ml-auto size-3 border border-bg/50 bg-accent transition-colors duration-300"
        />
        <button
          aria-label={t('musician.title')}
          className="p-2 text-bg/70 transition-colors hover:text-bg"
          onClick={() => openMusicians(true)}
          type="button"
        >
          <TimerIcon className="size-5" />
        </button>
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
        <LanguageSelector compact onDark />
        <div className="hidden min-w-0 max-w-44 sm:block">
          <AccountChip />
        </div>
      </div>
      <A11yPanel />
      <SettingsPanel onClose={() => setSettingsOpen(false)} open={settingsOpen} />
    </header>
  )
}
