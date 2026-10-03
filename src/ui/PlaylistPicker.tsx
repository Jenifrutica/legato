import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlaylistsStore } from '../features/playlists'
import { PlusIcon } from './icons'

export function PlaylistPicker({
  onPick,
  label,
}: {
  onPick: (playlistId: string) => void
  label: string
}) {
  const { t } = useTranslation()
  const playlists = usePlaylistsStore((state) => state.playlists)
  const createPlaylist = usePlaylistsStore((state) => state.createPlaylist)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setCreating(false)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function pick(playlistId: string) {
    onPick(playlistId)
    setOpen(false)
  }

  function createAndPick(event: FormEvent) {
    event.preventDefault()
    const name = draft.trim()
    if (name === '') {
      return
    }
    const id = createPlaylist(name)
    setDraft('')
    setCreating(false)
    pick(id)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className="grid size-8 shrink-0 place-items-center border-2 border-rule/40 bg-surface text-ink-muted transition-colors hover:text-ink"
        onClick={() => setOpen((value) => !value)}
        title={label}
        type="button"
      >
        <PlusIcon className="size-4" />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 z-30 mt-1 w-48 border-2 border-rule bg-surface shadow-[4px_4px_0_var(--color-rule)]"
          role="menu"
        >
          {playlists.length === 0 && (
            <p className="px-3 py-2 text-xs text-ink-muted">{t('playlists.emptyList')}</p>
          )}
          {playlists.map((playlist) => (
            <button
              className="block w-full truncate px-3 py-2 text-left text-sm transition-colors hover:bg-accent-soft"
              key={playlist.id}
              onClick={() => pick(playlist.id)}
              role="menuitem"
              type="button"
            >
              {playlist.name}
            </button>
          ))}
          {creating ? (
            <form
              className="flex items-center gap-1 border-t border-border p-2"
              onSubmit={createAndPick}
            >
              <input
                autoFocus
                className="min-w-0 flex-1 border-2 border-rule/40 bg-surface px-2 py-1 text-xs focus:border-accent focus:outline-none"
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t('playlists.namePlaceholder')}
                value={draft}
              />
              <button
                className="border-2 border-rule bg-accent px-2 py-1 font-mono text-[0.6875rem] tracking-[0.08em] text-on-accent uppercase"
                type="submit"
              >
                {t('playlists.create')}
              </button>
            </form>
          ) : (
            <button
              className="block w-full border-t border-border px-3 py-2 text-left font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors hover:bg-accent-soft"
              onClick={() => setCreating(true)}
              role="menuitem"
              type="button"
            >
              ＋ {t('playlists.newPlaylist')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
