import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDuration, useLibraryStore } from '../features/library'
import { usePlaylistsStore } from '../features/playlists'
import { importSourceTrackToPlaylist, SearchTab } from '../features/sources'
import type { SourceTrack } from '../features/sources'
import { usePlayerStore } from '../player'
import { AudioQualityPanel } from './AudioQualityPanel'
import { LibraryPanel } from './LibraryPanel'
import { CopyIcon, PencilIcon, PlusIcon, TrashIcon } from './icons'

const TAB_KEYS = {
  library: 'tabs.library',
  search: 'tabs.search',
  playlists: 'tabs.playlists',
  queue: 'tabs.queue',
  audio: 'tabs.audio',
} as const

type Tab = keyof typeof TAB_KEYS
const TABS: Tab[] = ['library', 'search', 'playlists', 'queue', 'audio']

function PlaylistsTab({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation()
  const playlists = usePlaylistsStore((state) => state.playlists)
  const selectedPlaylistId = usePlaylistsStore((state) => state.selectedPlaylistId)
  const selectPlaylist = usePlaylistsStore((state) => state.selectPlaylist)
  const createPlaylist = usePlaylistsStore((state) => state.createPlaylist)
  const renamePlaylist = usePlaylistsStore((state) => state.renamePlaylist)
  const duplicatePlaylist = usePlaylistsStore((state) => state.duplicatePlaylist)
  const removePlaylist = usePlaylistsStore((state) => state.removePlaylist)

  const [isCreating, setIsCreating] = useState(false)
  const [draft, setDraft] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [dropMessage, setDropMessage] = useState<string | null>(null)

  function submitCreate(event: FormEvent) {
    event.preventDefault()
    if (draft.trim() !== '') {
      createPlaylist(draft)
    }
    setDraft('')
    setIsCreating(false)
  }

  function submitRename(event: FormEvent) {
    event.preventDefault()
    if (renamingId !== null && renameDraft.trim() !== '') {
      renamePlaylist(renamingId, renameDraft)
    }
    setRenamingId(null)
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">{t('nav.playlists')}</h2>
        {playlists.length > 0 && (
          <button
            aria-label={t('playlists.newPlaylist')}
            className=" p-1.5 text-ink-muted transition-colors hover:text-accent-ink-ink"
            onClick={() => setIsCreating(true)}
            type="button"
          >
            <PlusIcon className="size-4" />
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={submitCreate}>
          <input
            autoFocus
            className="w-full border-2 border-rule bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
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

      {dropMessage !== null && (
        <p className=" bg-accent-soft px-3 py-2 text-xs text-ink" role="status">
          {dropMessage}
        </p>
      )}

      {playlists.length === 0 ? (
        <div className="flex flex-col items-start gap-3 border-2 border-rule bg-surface p-4 shadow-[3px_3px_0_var(--color-rule)]">
          <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-accent-ink uppercase">
            {t('nav.playlists')}
          </p>
          <p className="text-sm text-ink-muted">{t('playlists.emptyList')}</p>
          <button
            className=" bg-primary-strong px-4 py-2 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            onClick={() => setIsCreating(true)}
            type="button"
          >
            {t('playlists.newPlaylist')}
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {playlists.map((playlist, index) => {
            const selected = playlist.id === selectedPlaylistId
            return (
              <li
                className={`flex items-center gap-3 border-2 px-3 py-2 transition-colors ${
                  selected ? 'border-accent bg-accent-soft' : 'border-rule/30 bg-surface'
                }`}
                key={playlist.id}
                onDragOver={(event) => {
                  const types = event.dataTransfer.types
                  if (
                    types.includes('application/x-legato-track') ||
                    types.includes('application/x-legato-library-track')
                  ) {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'copy'
                  }
                }}
                onDrop={(event) => {
                  const sourceRaw = event.dataTransfer.getData('application/x-legato-track')
                  if (sourceRaw !== '') {
                    event.preventDefault()
                    try {
                      const track = JSON.parse(sourceRaw) as SourceTrack
                      void importSourceTrackToPlaylist(track, playlist.id).then((added) => {
                        setDropMessage(added ? t('search.addedToPlaylist') : t('search.cannotSave'))
                      })
                    } catch {
                      setDropMessage(t('search.saveError'))
                    }
                    return
                  }

                  const libraryId = event.dataTransfer.getData('application/x-legato-library-track')
                  if (libraryId !== '') {
                    event.preventDefault()
                    const track = useLibraryStore
                      .getState()
                      .tracks.find((item) => item.id === libraryId)
                    if (track !== undefined) {
                      const added = usePlaylistsStore
                        .getState()
                        .addTrackToPlaylist(playlist.id, track)
                      setDropMessage(added ? t('search.addedToPlaylist') : t('search.duplicate'))
                    }
                  }
                }}
              >
                {renamingId === playlist.id ? (
                  <form onSubmit={submitRename}>
                    <input
                      autoFocus
                      className="w-full border-2 border-rule bg-surface px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
                      onBlur={() => setRenamingId(null)}
                      onChange={(event) => setRenameDraft(event.target.value)}
                      value={renameDraft}
                    />
                  </form>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center gap-1">
                    <span className="w-6 shrink-0 font-mono text-[0.6875rem] text-accent-ink">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        selectPlaylist(playlist.id)
                        onOpen()
                      }}
                      type="button"
                    >
                      <span className="block truncate text-sm font-medium">{playlist.name}</span>
                      <span className="text-xs text-ink-muted">
                        {playlist.trackIds.length} {t('playlists.tracksShort')}
                      </span>
                    </button>
                    <button
                      aria-label={`${t('playlists.rename')} ${playlist.name}`}
                      className=" p-1.5 text-ink-muted transition-colors hover:text-accent-ink-ink"
                      onClick={() => {
                        setRenameDraft(playlist.name)
                        setRenamingId(playlist.id)
                      }}
                      type="button"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    <button
                      aria-label={`${t('playlists.duplicate')} ${playlist.name}`}
                      className=" p-1.5 text-ink-muted transition-colors hover:text-accent-ink-ink"
                      onClick={() => duplicatePlaylist(playlist.id)}
                      type="button"
                    >
                      <CopyIcon className="size-3.5" />
                    </button>
                    <button
                      aria-label={`${t('playlists.delete')} ${playlist.name}`}
                      className=" p-1.5 text-ink-muted transition-colors hover:text-danger"
                      onClick={() => {
                        if (window.confirm(t('playlists.confirmDelete', { name: playlist.name }))) {
                          removePlaylist(playlist.id)
                        }
                      }}
                      type="button"
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function QueueTab() {
  const { t } = useTranslation()
  const queue = usePlayerStore((state) => state.queue)
  const currentId = usePlayerStore((state) => state.currentTrack?.id ?? null)
  const playTracks = usePlayerStore((state) => state.playTracks)

  if (queue.length === 0) {
    return (
      <div className="m-4 border-2 border-rule bg-surface p-4 shadow-[3px_3px_0_var(--color-rule)]">
        <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-accent-ink uppercase">
          {t('tabs.queue')}
        </p>
        <p className="mt-2 text-sm text-ink-muted">{t('queue.empty')}</p>
      </div>
    )
  }

  const maxDuration = Math.max(1, ...queue.map((track) => track.durationSeconds ?? 0))

  return (
    <ol className="divide-y divide-border">
      {queue.map((track, index) => {
        const active = track.id === currentId
        const seconds = track.durationSeconds ?? 0
        const barWidth = seconds > 0 ? Math.max(18, Math.round((seconds / maxDuration) * 88)) : 24

        return (
          <li
            className={`flex items-center gap-3 px-4 py-3 ${active ? 'bg-accent-soft' : ''}`}
            key={`${track.id}-${index}`}
          >
            <span
              className={`w-7 shrink-0 font-mono text-[0.6875rem] ${
                active ? 'text-accent-ink' : 'text-ink-muted'
              }`}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <button
              className="min-w-0 flex-1 text-left"
              onClick={() => playTracks(queue, track.id, null)}
              type="button"
            >
              <span className="block truncate text-sm font-semibold">{track.title}</span>
              <span className="block truncate text-xs text-ink-muted">{track.artist}</span>
            </button>
            <span
              aria-hidden="true"
              className={`h-3 shrink-0 border-2 border-rule ${active ? 'bg-accent' : 'bg-surface-2'}`}
              style={{ width: barWidth }}
            />
            <span className="shrink-0 font-mono text-[0.6875rem] text-ink-muted">
              {formatDuration(seconds)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function RightPanel() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('library')
  const selectPlaylist = usePlaylistsStore((state) => state.selectPlaylist)

  return (
    <aside className="relative z-20 flex min-h-0 flex-col border-t-2 border-rule bg-surface pb-52 lg:sticky lg:top-[4.4rem] lg:h-[calc(100dvh-4.4rem)] lg:border-t-0 lg:border-l-2 lg:pb-0">
      <div
        aria-label={t('tabs.label')}
        className="flex flex-wrap items-center gap-1 gap-y-1 border-b-2 border-rule px-3 py-2"
        role="tablist"
      >
        {TABS.map((candidate) => (
          <button
            aria-selected={tab === candidate}
            className={`px-3 py-1.5 text-[0.6875rem] font-semibold tracking-[0.1em] uppercase transition-colors ${
              tab === candidate ? 'bg-accent text-on-accent' : 'text-ink-muted hover:text-ink'
            }`}
            key={candidate}
            onClick={() => {
              if (candidate === 'library') {
                selectPlaylist(null)
              }
              setTab(candidate)
            }}
            role="tab"
            type="button"
          >
            {t(TAB_KEYS[candidate])}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'library' && <LibraryPanel />}
        {tab === 'search' && <SearchTab />}
        {tab === 'playlists' && <PlaylistsTab onOpen={() => setTab('library')} />}
        {tab === 'queue' && <QueueTab />}
        {tab === 'audio' && (
          <div className="p-4">
            <AudioQualityPanel />
          </div>
        )}
      </div>
    </aside>
  )
}
