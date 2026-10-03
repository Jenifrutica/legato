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
import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formatDuration,
  formatFileSize,
  importAudioFiles,
  normalizeText,
  useLibraryStore,
} from '../features/library'
import type { ImportErrorCode, LibraryTrack } from '../features/library'
import { getPlaylistStructure, usePlaylistsStore } from '../features/playlists'
import { usePlayerStore } from '../player'
import { HistoryButtons } from './HistoryButtons'
import {
  GripIcon,
  ListMusicIcon,
  PlayIcon,
  SearchIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from './icons'
import { StructureView } from './StructureView'

const ERROR_KEYS = {
  unsupported: 'library.errors.unsupported',
  tooLarge: 'library.errors.tooLarge',
  duplicate: 'library.errors.duplicate',
} as const satisfies Record<ImportErrorCode, string>

function TrackMeta({ index, track }: { index: number; track: LibraryTrack }) {
  return (
    <>
      <span className="w-6 text-right text-xs tabular-nums text-ink-muted">{index + 1}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{track.title}</span>
        <span className="block truncate text-xs text-ink-muted">
          {track.artist}
          {track.album === null ? '' : ` · ${track.album}`}
        </span>
      </span>
      <span className="hidden text-xs tabular-nums text-ink-muted sm:block">
        {formatFileSize(track.fileSize)}
      </span>
      <span className="text-xs tabular-nums text-ink-muted">
        {formatDuration(track.durationSeconds)}
      </span>
    </>
  )
}

function SortableTrackRow({
  index,
  track,
  disabled,
  children,
}: {
  index: number
  track: LibraryTrack
  disabled: boolean
  children: ReactNode
}) {
  const { t } = useTranslation()
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    disabled,
    id: track.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <li
      className={`flex items-center gap-3 px-5 py-3 ${isDragging ? 'relative z-10 bg-surface-2' : ''}`}
      ref={setNodeRef}
      style={style}
    >
      <button
        aria-label={t('playlists.reorder', { title: track.title })}
        className="cursor-grab touch-none rounded p-1 text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled}
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripIcon className="size-4" />
      </button>
      <TrackMeta index={index} track={track} />
      {children}
    </li>
  )
}

export function LibraryPanel() {
  const { t } = useTranslation()
  const tracks = useLibraryStore((state) => state.tracks)
  const isImporting = useLibraryStore((state) => state.isImporting)
  const lastErrors = useLibraryStore((state) => state.lastErrors)
  const addTracks = useLibraryStore((state) => state.addTracks)
  const removeTrack = useLibraryStore((state) => state.removeTrack)
  const setImporting = useLibraryStore((state) => state.setImporting)
  const setErrors = useLibraryStore((state) => state.setErrors)
  const existingDedupeKeys = useLibraryStore((state) => state.existingDedupeKeys)

  const playlists = usePlaylistsStore((state) => state.playlists)
  const selectedPlaylistId = usePlaylistsStore((state) => state.selectedPlaylistId)
  const selectPlaylist = usePlaylistsStore((state) => state.selectPlaylist)
  const renamePlaylist = usePlaylistsStore((state) => state.renamePlaylist)
  const duplicatePlaylist = usePlaylistsStore((state) => state.duplicatePlaylist)
  const removePlaylist = usePlaylistsStore((state) => state.removePlaylist)
  const addTrackToPlaylist = usePlaylistsStore((state) => state.addTrackToPlaylist)
  const removeTrackFromPlaylist = usePlaylistsStore((state) => state.removeTrackFromPlaylist)
  const moveTrackInPlaylist = usePlaylistsStore((state) => state.moveTrackInPlaylist)

  const playTracks = usePlayerStore((state) => state.playTracks)
  const reorderInQueue = usePlayerStore((state) => state.reorder)
  const queueStructure = usePlayerStore((state) => state.queueStructure)
  const currentTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null)

  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameDraft, setRenameDraft] = useState('')
  const [showStructure, setShowStructure] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const selectedPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId) ?? null
  const isPlaylistView = selectedPlaylist !== null

  const viewTracks: LibraryTrack[] = isPlaylistView
    ? selectedPlaylist.trackIds
        .map((id) => tracks.find((track) => track.id === id))
        .filter((track): track is LibraryTrack => track !== undefined)
    : tracks

  const normalizedQuery = normalizeText(query)
  const filtered =
    normalizedQuery === ''
      ? viewTracks
      : viewTracks.filter((track) =>
          normalizeText(`${track.title} ${track.artist} ${track.album ?? ''}`).includes(
            normalizedQuery,
          ),
        )

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files)
    if (list.length === 0) {
      return
    }

    setImporting(true)
    setNotice(null)
    const result = await importAudioFiles(list, existingDedupeKeys())
    addTracks(result.tracks)
    setErrors(result.errors)
    setNotice(
      result.tracks.length > 0 ? t('library.importedCount', { count: result.tracks.length }) : null,
    )
    setImporting(false)
  }

  function handleRemoveFromLibrary(trackId: string) {
    for (const playlist of playlists) {
      if (playlist.trackIds.includes(trackId)) {
        removeTrackFromPlaylist(playlist.id, trackId)
      }
    }
    removeTrack(trackId)
  }

  function handleDragEnd(event: DragEndEvent) {
    if (selectedPlaylist === null) {
      return
    }

    const { active, over } = event
    if (over === null || active.id === over.id) {
      return
    }

    const newIndex = filtered.findIndex((track) => track.id === over.id)
    if (newIndex === -1) {
      return
    }

    moveTrackInPlaylist(selectedPlaylist.id, String(active.id), newIndex)
    reorderInQueue(String(active.id), newIndex, selectedPlaylist.id)
  }

  function submitRename(event: FormEvent) {
    event.preventDefault()
    if (selectedPlaylist !== null && renameDraft.trim() !== '') {
      renamePlaylist(selectedPlaylist.id, renameDraft)
    }
    setIsRenaming(false)
  }

  return (
    <section
      aria-labelledby="biblioteca-titulo"
      className="flex min-w-0 flex-col  border border-border bg-surface shadow-soft"
      onDragOver={(event) => {
        event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        if (!isPlaylistView) {
          void handleFiles(event.dataTransfer.files)
        }
      }}
    >
      <header className="flex flex-col gap-4 border-b border-border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {isPlaylistView ? (
            <div className="min-w-0 flex-1">
              <button
                className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition-colors hover:text-accent"
                onClick={() => selectPlaylist(null)}
                type="button"
              >
                <XIcon className="size-3" />
                {t('playlists.back')}
              </button>
              {isRenaming ? (
                <form onSubmit={submitRename}>
                  <input
                    autoFocus
                    className="w-full max-w-sm  border border-border bg-bg px-3 py-1.5 font-display text-xl font-semibold focus:border-accent focus:outline-none"
                    onBlur={() => setIsRenaming(false)}
                    onChange={(event) => setRenameDraft(event.target.value)}
                    value={renameDraft}
                  />
                </form>
              ) : (
                <h2 className="truncate font-display text-xl font-semibold" id="biblioteca-titulo">
                  {selectedPlaylist.name}
                </h2>
              )}
              <p className="mt-1 text-sm text-ink-muted">
                {t('playlists.trackCount', { count: selectedPlaylist.trackIds.length })}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-xl font-semibold" id="biblioteca-titulo">
                {t('library.title')}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">{t('library.subtitle')}</p>
            </div>
          )}

          {isPlaylistView ? (
            <div className="flex flex-wrap items-center gap-2">
              <HistoryButtons />
              <button
                aria-pressed={showStructure}
                className={` border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  showStructure
                    ? 'border-accent bg-accent-soft text-ink'
                    : 'border-border text-ink-muted hover:border-accent hover:text-accent'
                }`}
                onClick={() => setShowStructure((value) => !value)}
                type="button"
              >
                {t('playlists.structure')}
              </button>
              <button
                className=" border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-accent hover:text-accent"
                onClick={() => {
                  setRenameDraft(selectedPlaylist.name)
                  setIsRenaming(true)
                }}
                type="button"
              >
                {t('playlists.rename')}
              </button>
              <button
                className=" border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-accent hover:text-accent"
                onClick={() => duplicatePlaylist(selectedPlaylist.id)}
                type="button"
              >
                {t('playlists.duplicate')}
              </button>
              <button
                className=" border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-danger hover:text-danger"
                onClick={() => {
                  if (
                    window.confirm(t('playlists.confirmDelete', { name: selectedPlaylist.name }))
                  ) {
                    removePlaylist(selectedPlaylist.id)
                  }
                }}
                type="button"
              >
                {t('playlists.delete')}
              </button>
            </div>
          ) : (
            <>
              <HistoryButtons />
              <button
                aria-pressed={showStructure}
                className={` border px-3 py-2 text-xs font-semibold transition-colors ${
                  showStructure
                    ? 'border-accent bg-accent-soft text-ink'
                    : 'border-border text-ink-muted hover:border-accent hover:text-accent'
                }`}
                onClick={() => setShowStructure((value) => !value)}
                type="button"
              >
                {t('playlists.structure')}
              </button>
              <button
                className="inline-flex items-center gap-2  bg-primary-strong px-4 py-2 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={isImporting}
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                <UploadIcon className="size-4" />
                {isImporting ? t('library.importing') : t('library.import')}
              </button>
              <input
                accept="audio/*,.mp3,.m4a,.aac,.wav,.flac,.ogg,.oga,.opus"
                aria-label={t('library.import')}
                className="sr-only"
                multiple
                onChange={(event) => {
                  void handleFiles(event.target.files ?? [])
                  event.target.value = ''
                }}
                ref={inputRef}
                type="file"
              />
            </>
          )}
        </div>

        <label className="relative block w-full sm:max-w-72">
          <span className="sr-only">{t('library.search')}</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            className="w-full  border border-border bg-bg py-2 pl-9 pr-3 text-sm placeholder:text-ink-muted focus:border-accent focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('library.searchPlaceholder')}
            type="search"
            value={query}
          />
        </label>
      </header>

      {notice !== null && (
        <p
          className="border-b border-border bg-accent-soft px-5 py-2 text-sm text-ink"
          role="status"
        >
          {notice}
        </p>
      )}

      {lastErrors.length > 0 && !isPlaylistView && (
        <ul className="border-b border-border bg-accent-soft px-5 py-2 text-xs text-ink">
          {lastErrors.slice(0, 3).map((error) => (
            <li key={`${error.fileName}-${error.code}`}>
              {error.fileName}: {t(ERROR_KEYS[error.code])}
            </li>
          ))}
          {lastErrors.length > 3 && (
            <li>{t('library.errors.more', { count: lastErrors.length - 3 })}</li>
          )}
        </ul>
      )}

      {showStructure ? (
        <StructureView
          currentId={currentTrackId}
          nodes={
            isPlaylistView && selectedPlaylist !== null
              ? getPlaylistStructure(selectedPlaylist.id)
              : queueStructure
          }
        />
      ) : viewTracks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="max-w-sm text-center">
            <span className="mx-auto grid size-14 place-items-center  bg-accent-soft text-accent">
              <ListMusicIcon className="size-7" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">
              {isPlaylistView ? t('playlists.emptyTitle') : t('library.emptyTitle')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {isPlaylistView ? t('playlists.emptyText') : t('library.emptyText')}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-h-[30rem] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">
              {t('library.noResults', { query })}
            </p>
          ) : isPlaylistView ? (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext
                items={filtered.map((track) => track.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="divide-y divide-border">
                  {filtered.map((track, index) => (
                    <SortableTrackRow
                      disabled={normalizedQuery !== ''}
                      index={index}
                      key={track.id}
                      track={track}
                    >
                      <button
                        aria-label={t('library.playTrack', { title: track.title })}
                        className=" p-2 text-ink-muted transition-colors hover:text-accent"
                        onClick={() => playTracks(viewTracks, track.id, selectedPlaylist.id)}
                        type="button"
                      >
                        <PlayIcon className="size-4" />
                      </button>
                      <button
                        aria-label={t('playlists.removeTrack', { title: track.title })}
                        className=" p-2 text-ink-muted transition-colors hover:text-danger"
                        onClick={() => removeTrackFromPlaylist(selectedPlaylist.id, track.id)}
                        type="button"
                      >
                        <XIcon className="size-4" />
                      </button>
                    </SortableTrackRow>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((track, index) => (
                <li
                  className="flex items-center gap-3 px-5 py-3"
                  draggable
                  key={track.id}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/x-legato-library-track', track.id)
                    event.dataTransfer.effectAllowed = 'copy'
                  }}
                >
                  <button
                    aria-label={t('library.playTrack', { title: track.title })}
                    className=" p-2 text-ink-muted transition-colors hover:text-accent"
                    onClick={() => playTracks(viewTracks, track.id, null)}
                    type="button"
                  >
                    <PlayIcon className="size-4" />
                  </button>
                  <TrackMeta index={index} track={track} />
                  {playlists.length > 0 && (
                    <select
                      aria-label={t('library.addToLabel', { title: track.title })}
                      className="max-w-32  border border-border bg-bg px-2.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-accent focus:border-accent focus:outline-none"
                      defaultValue=""
                      onChange={(event) => {
                        const playlistId = event.target.value
                        if (playlistId !== '') {
                          addTrackToPlaylist(playlistId, track)
                          event.target.value = ''
                        }
                      }}
                    >
                      <option value="">＋ {t('library.addTo')}</option>
                      {playlists.map((playlist) => (
                        <option key={playlist.id} value={playlist.id}>
                          {playlist.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    aria-label={t('library.removeFromLibrary', { title: track.title })}
                    className=" p-2 text-ink-muted transition-colors hover:text-danger"
                    onClick={() => handleRemoveFromLibrary(track.id)}
                    type="button"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
