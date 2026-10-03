import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AccountChip } from '../features/auth'
import { useA11yStore } from '../features/a11y'
import { LanguageSelector } from '../features/i18n'
import { usePlaylistsStore } from '../features/playlists'
import {
  AccessibilityIcon,
  DiscMark,
  LibraryIcon,
  ListMusicIcon,
  PlusIcon,
  SettingsIcon,
} from './icons'

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  const className = `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? 'bg-primary-soft text-primary-strong'
      : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
  }`

  if (onClick === undefined) {
    return (
      <li className={`${className} opacity-70`}>
        {icon}
        <span className="truncate">{label}</span>
      </li>
    )
  }

  return (
    <li>
      <button
        aria-current={active ? 'page' : undefined}
        className={className}
        onClick={onClick}
        type="button"
      >
        {icon}
        <span className="truncate">{label}</span>
      </button>
    </li>
  )
}

export function Sidebar() {
  const { t } = useTranslation()
  const playlists = usePlaylistsStore((state) => state.playlists)
  const selectedPlaylistId = usePlaylistsStore((state) => state.selectedPlaylistId)
  const selectPlaylist = usePlaylistsStore((state) => state.selectPlaylist)
  const createPlaylist = usePlaylistsStore((state) => state.createPlaylist)
  const openA11yPanel = useA11yStore((state) => state.openPanel)

  const [isCreating, setIsCreating] = useState(false)
  const [draft, setDraft] = useState('')

  function submitNewPlaylist(event: FormEvent) {
    event.preventDefault()
    if (draft.trim() !== '') {
      createPlaylist(draft)
    }
    setDraft('')
    setIsCreating(false)
  }

  return (
    <aside className="hidden border-r border-border bg-surface/70 px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[17rem] lg:flex-col lg:gap-6 lg:overflow-y-auto lg:pb-36">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-ink text-bg">
          <DiscMark className="size-6" />
        </span>
        <span className="font-display text-2xl font-semibold tracking-tight">Legato</span>
      </div>

      <nav aria-label={t('nav.libraryRegion')}>
        <ul className="flex flex-col gap-1">
          <NavItem
            active={selectedPlaylistId === null}
            icon={<LibraryIcon className="size-5 shrink-0" />}
            label={t('nav.library')}
            onClick={() => selectPlaylist(null)}
          />
        </ul>
      </nav>

      <section aria-label={t('nav.playlists')} className="flex min-h-0 flex-col gap-2">
        <div className="flex items-center justify-between px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('nav.playlists')}
          </h2>
          <button
            aria-label={t('playlists.newPlaylist')}
            className="rounded-full p-1 text-ink-muted transition-colors hover:text-primary-strong"
            onClick={() => setIsCreating(true)}
            type="button"
          >
            <PlusIcon className="size-4" />
          </button>
        </div>

        {isCreating && (
          <form className="px-1" onSubmit={submitNewPlaylist}>
            <input
              autoFocus
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm focus:border-primary focus:outline-none"
              onBlur={() => {
                if (draft.trim() !== '') {
                  createPlaylist(draft)
                }
                setDraft('')
                setIsCreating(false)
              }}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t('playlists.namePlaceholder')}
              value={draft}
            />
          </form>
        )}

        <ul className="flex flex-col gap-1">
          {playlists.map((playlist) => {
            const active = playlist.id === selectedPlaylistId
            return (
              <li key={playlist.id}>
                <button
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-soft text-primary-strong'
                      : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                  onClick={() => selectPlaylist(playlist.id)}
                  type="button"
                >
                  <ListMusicIcon className="size-5 shrink-0" />
                  <span className="truncate">{playlist.name}</span>
                  <span className="ml-auto text-xs tabular-nums text-ink-muted">
                    {playlist.trackIds.length}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="mt-auto flex flex-col gap-4 border-t border-border pt-5">
        <LanguageSelector />
        <AccountChip />
        <ul className="flex flex-col gap-1">
          <NavItem
            icon={<AccessibilityIcon className="size-5 shrink-0" />}
            label={t('nav.accessibility')}
            onClick={openA11yPanel}
          />
          <NavItem icon={<SettingsIcon className="size-5 shrink-0" />} label={t('nav.settings')} />
        </ul>
        <p className="px-3 text-xs leading-relaxed text-ink-muted">{t('academic')}</p>
      </div>
    </aside>
  )
}
