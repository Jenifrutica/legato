import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDuration, useLibraryStore } from '../features/library'
import type { LibraryTrack } from '../features/library'
import { usePlaylistsStore } from '../features/playlists'
import {
  fetchSpotifyPlaylistTracks,
  fetchSpotifyPlaylists,
  importSourceTrackToPlaylist,
  isSpotifyConnected,
  saveSourceTrack,
  SearchTab,
} from '../features/sources'
import type { SourceTrack, SpotifyPlaylistSummary } from '../features/sources'
import { usePlayerStore } from '../player'
import type { QueueTrack } from '../player'
import { AudioQualityPanel } from './AudioQualityPanel'
import { LibraryPanel } from './LibraryPanel'
import { PlaylistPicker } from './PlaylistPicker'
import { CopyIcon, GripIcon, PencilIcon, PlusIcon, TrashIcon, XIcon } from './icons'

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
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [spotifyOpen, setSpotifyOpen] = useState(false)
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylistSummary[]>([])
  const [spotifyStatus, setSpotifyStatus] = useState<'idle' | 'loading' | 'importing' | 'error'>(
    'idle',
  )
  const [spotifyMessage, setSpotifyMessage] = useState<string | null>(null)
  const addTracks = useLibraryStore((state) => state.addTracks)
  const existingDedupeKeys = useLibraryStore((state) => state.existingDedupeKeys)
  const spotifyConnected = isSpotifyConnected()

  async function openSpotifyImport() {
    setSpotifyOpen(true)
    setSpotifyStatus('loading')
    setSpotifyMessage(null)

    try {
      setSpotifyPlaylists(await fetchSpotifyPlaylists())
      setSpotifyStatus('idle')
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setSpotifyStatus('error')
      setSpotifyMessage(
        message.includes('403')
          ? t('spotify.importScope')
          : message.includes('401') || message.includes('not-connected')
            ? t('spotify.reconnect')
            : `${t('spotify.importError')} ${message}`.trim(),
      )
      console.warn('[spotify-import]', error)
    }
  }

  async function importSpotifyPlaylist(playlist: SpotifyPlaylistSummary) {
    setSpotifyStatus('importing')
    setSpotifyMessage(null)

    try {
      const tracks = await fetchSpotifyPlaylistTracks(playlist.id)
      const localId = createPlaylist(playlist.name)
      let imported = 0

      for (const track of tracks) {
        const saved = await saveSourceTrack(track, existingDedupeKeys())
        if (saved !== null) {
          addTracks([saved])
          usePlaylistsStore.getState().addTrackToPlaylist(localId, saved)
          imported++
        }
      }

      setSpotifyMessage(t('spotify.imported', { count: imported }))
      setSpotifyStatus('idle')
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setSpotifyStatus('error')
      setSpotifyMessage(
        message.includes('403')
          ? t('spotify.importScope')
          : message.includes('401') || message.includes('not-connected')
            ? t('spotify.reconnect')
            : `${t('spotify.importError')} ${message}`.trim(),
      )
      console.warn('[spotify-import]', error)
    }
  }

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
        <div className="flex items-center gap-2">
          {spotifyConnected && (
            <button
              className="border-2 border-rule/40 px-2 py-1 font-mono text-[0.6875rem] tracking-[0.08em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink"
              onClick={() => void openSpotifyImport()}
              type="button"
            >
              {t('spotify.importPlaylists')}
            </button>
          )}
          {playlists.length > 0 && (
            <button
              aria-label={t('playlists.newPlaylist')}
              className=" p-1.5 text-ink-muted transition-colors hover:text-accent-ink"
              onClick={() => setIsCreating(true)}
              type="button"
            >
              <PlusIcon className="size-4" />
            </button>
          )}
        </div>
      </div>

      {spotifyOpen && (
        <div className="border-2 border-rule bg-surface p-3 shadow-[3px_3px_0_var(--color-rule)]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[0.6875rem] tracking-[0.12em] text-accent-ink uppercase">
              {t('spotify.importPlaylists')}
            </span>
            <button
              aria-label={t('cookies.close')}
              className="p-1 text-ink-muted hover:text-ink"
              onClick={() => setSpotifyOpen(false)}
              type="button"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>

          {spotifyStatus === 'loading' && (
            <p className="mt-2 text-xs text-ink-muted">{t('spotify.loadingPlaylists')}</p>
          )}
          {spotifyStatus === 'importing' && (
            <p className="mt-2 text-xs text-ink-muted">{t('spotify.importing')}</p>
          )}
          {spotifyMessage !== null && (
            <p className="mt-2 text-xs text-ink-muted" role="status">
              {spotifyMessage}
            </p>
          )}

          {spotifyStatus !== 'loading' &&
            spotifyPlaylists.length === 0 &&
            spotifyMessage === null && (
              <p className="mt-2 text-xs text-ink-muted">{t('spotify.emptyPlaylists')}</p>
            )}

          <ul className="mt-2 flex flex-col">
            {spotifyPlaylists.map((playlist) => (
              <li key={playlist.id}>
                <button
                  className="flex w-full items-center gap-2 border-b border-border py-2 text-left text-sm transition-colors hover:text-accent-ink disabled:opacity-50"
                  disabled={spotifyStatus === 'importing'}
                  onClick={() => void importSpotifyPlaylist(playlist)}
                  type="button"
                >
                  <span className="min-w-0 flex-1 truncate">{playlist.name}</span>
                  <span className="shrink-0 font-mono text-[0.6875rem] text-ink-muted">
                    {playlist.trackCount}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
                  selected || dragOverId === playlist.id
                    ? 'border-accent bg-accent-soft'
                    : 'border-rule/30 bg-surface'
                }`}
                key={playlist.id}
                onDragEnter={() => setDragOverId(playlist.id)}
                onDragLeave={() => setDragOverId(null)}
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
                  setDragOverId(null)
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
                      className=" p-1.5 text-ink-muted transition-colors hover:text-accent-ink"
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
                      className=" p-1.5 text-ink-muted transition-colors hover:text-accent-ink"
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

function SortableQueueRow({
  track,
  index,
  active,
  barWidth,
  libraryTrack,
  onPlay,
  onRemove,
  onAddToPlaylist,
}: {
  track: QueueTrack
  index: number
  active: boolean
  barWidth: number
  libraryTrack: LibraryTrack | null
  onPlay: () => void
  onRemove: () => void
  onAddToPlaylist: (playlistId: string) => void
}) {
  const { t } = useTranslation()
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: track.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <li
      className={`flex items-center gap-2 px-3 py-2 ${
        active ? 'bg-accent-soft' : ''
      } ${isDragging ? 'relative z-10 bg-surface-2' : ''}`}
      ref={setNodeRef}
      style={style}
    >
      <button
        aria-label={t('queue.reorder', { title: track.title })}
        className="cursor-grab touch-none p-1 text-ink-muted transition-colors hover:text-ink"
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripIcon className="size-4" />
      </button>
      <span
        className={`w-6 shrink-0 font-mono text-[0.6875rem] ${
          active ? 'text-accent-ink' : 'text-ink-muted'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <button className="min-w-0 flex-1 text-left" onClick={onPlay} type="button">
        <span className="block truncate text-sm font-semibold">{track.title}</span>
        <span className="block truncate text-xs text-ink-muted">{track.artist}</span>
      </button>
      {track.sourceUrl.startsWith('spotify:') && (
        <span className="shrink-0 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase">
          Spotify
        </span>
      )}
      <span
        aria-hidden="true"
        className={`hidden h-3 shrink-0 border-2 border-rule sm:block ${
          active ? 'bg-accent' : 'bg-surface-2'
        }`}
        style={{ width: barWidth }}
      />
      <span className="shrink-0 font-mono text-[0.6875rem] text-ink-muted">
        {formatDuration(track.durationSeconds ?? 0)}
      </span>
      {libraryTrack !== null && (
        <PlaylistPicker
          label={t('library.addToLabel', { title: track.title })}
          onPick={onAddToPlaylist}
        />
      )}
      <button
        aria-label={t('queue.removeLabel', { title: track.title })}
        className="shrink-0 p-1.5 text-ink-muted transition-colors hover:text-danger"
        onClick={onRemove}
        type="button"
      >
        <XIcon className="size-4" />
      </button>
    </li>
  )
}

function QueueTab() {
  const { t } = useTranslation()
  const queue = usePlayerStore((state) => state.queue)
  const currentId = usePlayerStore((state) => state.currentTrack?.id ?? null)
  const playTracks = usePlayerStore((state) => state.playTracks)
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue)
  const clearQueue = usePlayerStore((state) => state.clearQueue)
  const moveInQueue = usePlayerStore((state) => state.moveInQueue)
  const libraryTracks = useLibraryStore((state) => state.tracks)
  const addTrackToPlaylist = usePlaylistsStore((state) => state.addTrackToPlaylist)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over === null || active.id === over.id) {
      return
    }

    const newIndex = queue.findIndex((track) => track.id === over.id)
    if (newIndex === -1) {
      return
    }

    moveInQueue(String(active.id), newIndex)
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase">
          {t('queue.count', { count: queue.length })} · {t('queue.structure')}
        </span>
        <button
          className="font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase transition-colors hover:text-danger"
          onClick={clearQueue}
          type="button"
        >
          {t('queue.clear')}
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext
          items={queue.map((track) => track.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol aria-label={t('tabs.queue')} className="divide-y divide-border">
            {queue.map((track, index) => {
              const seconds = track.durationSeconds ?? 0
              const barWidth =
                seconds > 0 ? Math.max(18, Math.round((seconds / maxDuration) * 72)) : 24

              return (
                <SortableQueueRow
                  active={track.id === currentId}
                  barWidth={barWidth}
                  index={index}
                  key={track.id}
                  libraryTrack={libraryTracks.find((item) => item.id === track.id) ?? null}
                  onAddToPlaylist={(playlistId) => {
                    const libraryTrack = libraryTracks.find((item) => item.id === track.id)
                    if (libraryTrack !== undefined) {
                      addTrackToPlaylist(playlistId, libraryTrack)
                    }
                  }}
                  onPlay={() => playTracks(queue, track.id, null)}
                  onRemove={() => removeFromQueue(track.id)}
                  track={track}
                />
              )
            })}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export function RightPanel() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('library')
  const [queueDragOver, setQueueDragOver] = useState(false)
  const [playlistsDragOver, setPlaylistsDragOver] = useState(false)
  const selectPlaylist = usePlaylistsStore((state) => state.selectPlaylist)
  const playlists = usePlaylistsStore((state) => state.playlists)
  const selectedPlaylistId = usePlaylistsStore((state) => state.selectedPlaylistId)
  const addTrackToPlaylist = usePlaylistsStore((state) => state.addTrackToPlaylist)

  function acceptsLibraryDrop(event: DragEvent<HTMLButtonElement>): boolean {
    return event.dataTransfer.types.includes('application/x-legato-library-track')
  }

  return (
    <aside className="relative z-20 flex min-h-0 flex-col border-t-2 border-rule bg-surface pb-52 lg:sticky lg:top-[4.4rem] lg:h-[calc(100dvh-4.4rem)] lg:border-t-0 lg:border-l-2 lg:pb-0">
      <div
        aria-label={t('tabs.label')}
        className="flex flex-wrap items-center gap-1 gap-y-1 border-b-2 border-rule px-3 py-2"
        role="tablist"
      >
        {TABS.map((candidate) => {
          const isDropTarget = candidate === 'queue' || candidate === 'playlists'
          const highlighted =
            (candidate === 'queue' && queueDragOver) ||
            (candidate === 'playlists' && playlistsDragOver)

          return (
            <button
              aria-selected={tab === candidate}
              className={`px-3 py-1.5 text-[0.6875rem] font-semibold tracking-[0.1em] uppercase transition-colors ${
                highlighted || tab === candidate
                  ? 'bg-accent text-on-accent'
                  : 'text-ink-muted hover:text-ink'
              }`}
              key={candidate}
              onClick={() => {
                if (candidate === 'library') {
                  selectPlaylist(null)
                }
                setTab(candidate)
              }}
              onDragEnter={
                isDropTarget
                  ? (event) => {
                      if (acceptsLibraryDrop(event)) {
                        if (candidate === 'queue') {
                          setQueueDragOver(true)
                        } else {
                          setPlaylistsDragOver(true)
                        }
                      }
                    }
                  : undefined
              }
              onDragLeave={
                isDropTarget
                  ? () => {
                      if (candidate === 'queue') {
                        setQueueDragOver(false)
                      } else {
                        setPlaylistsDragOver(false)
                      }
                    }
                  : undefined
              }
              onDragOver={
                isDropTarget
                  ? (event) => {
                      if (acceptsLibraryDrop(event)) {
                        event.preventDefault()
                        event.dataTransfer.dropEffect = 'copy'
                      }
                    }
                  : undefined
              }
              onDrop={
                isDropTarget
                  ? (event) => {
                      if (candidate === 'queue') {
                        setQueueDragOver(false)
                      } else {
                        setPlaylistsDragOver(false)
                      }
                      const trackId = event.dataTransfer.getData(
                        'application/x-legato-library-track',
                      )
                      if (trackId === '') {
                        return
                      }
                      event.preventDefault()
                      const track = useLibraryStore
                        .getState()
                        .tracks.find((item) => item.id === trackId)
                      if (track === undefined) {
                        return
                      }
                      if (candidate === 'queue') {
                        usePlayerStore.getState().enqueue(track)
                      } else {
                        const targetId = selectedPlaylistId ?? playlists[0]?.id
                        if (targetId !== undefined) {
                          addTrackToPlaylist(targetId, track)
                        }
                      }
                      setTab(candidate)
                    }
                  : undefined
              }
              role="tab"
              type="button"
            >
              {t(TAB_KEYS[candidate])}
            </button>
          )
        })}
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
