import { useRef, useState } from 'react'
import {
  formatDuration,
  formatFileSize,
  importAudioFiles,
  normalizeText,
  useLibraryStore,
} from '../features/library'
import { ListMusicIcon, SearchIcon, TrashIcon, UploadIcon } from './icons'

export function LibraryPanel() {
  const tracks = useLibraryStore((state) => state.tracks)
  const isImporting = useLibraryStore((state) => state.isImporting)
  const lastErrors = useLibraryStore((state) => state.lastErrors)
  const addTracks = useLibraryStore((state) => state.addTracks)
  const removeTrack = useLibraryStore((state) => state.removeTrack)
  const setImporting = useLibraryStore((state) => state.setImporting)
  const setErrors = useLibraryStore((state) => state.setErrors)
  const existingDedupeKeys = useLibraryStore((state) => state.existingDedupeKeys)

  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  const normalizedQuery = normalizeText(query)
  const filtered =
    normalizedQuery === ''
      ? tracks
      : tracks.filter((track) =>
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
    setNotice(result.tracks.length > 0 ? `${result.tracks.length} canción(es) importada(s)` : null)
    setImporting(false)
  }

  return (
    <section
      aria-labelledby="biblioteca-titulo"
      className="flex min-w-0 flex-col rounded-lg border border-border bg-surface shadow-soft"
      onDragOver={(event) => {
        event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        void handleFiles(event.dataTransfer.files)
      }}
    >
      <header className="flex flex-col gap-4 border-b border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold" id="biblioteca-titulo">
              Biblioteca
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Importa archivos del equipo o arrástralos aquí.
            </p>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-full bg-primary-strong px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={isImporting}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <UploadIcon className="size-4" />
            {isImporting ? 'Importando…' : 'Importar música'}
          </button>
          <input
            accept="audio/*,.mp3,.m4a,.aac,.wav,.flac,.ogg,.oga,.opus"
            className="sr-only"
            multiple
            onChange={(event) => {
              void handleFiles(event.target.files ?? [])
              event.target.value = ''
            }}
            ref={inputRef}
            type="file"
          />
        </div>

        <label className="relative block w-full sm:max-w-72">
          <span className="sr-only">Buscar canciones</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            className="w-full rounded-full border border-border bg-bg py-2 pl-9 pr-3 text-sm placeholder:text-ink-muted focus:border-primary focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título, artista o álbum"
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

      {lastErrors.length > 0 && (
        <ul className="border-b border-border bg-primary-soft px-5 py-2 text-xs text-ink">
          {lastErrors.slice(0, 3).map((error) => (
            <li key={`${error.fileName}-${error.reason}`}>
              {error.fileName}: {error.reason}
            </li>
          ))}
          {lastErrors.length > 3 && <li>y {lastErrors.length - 3} más</li>}
        </ul>
      )}

      {tracks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="max-w-sm text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
              <ListMusicIcon className="size-7" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">Tu biblioteca está vacía</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Agrega archivos de audio desde tu equipo para empezar a escuchar y organizar tu
              música.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-h-[30rem] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">
              Sin resultados para «{query}».
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((track, index) => (
                <li className="flex items-center gap-3 px-5 py-3" key={track.id}>
                  <span className="w-6 text-right text-xs tabular-nums text-ink-muted">
                    {index + 1}
                  </span>
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
                  <button
                    aria-label={`Eliminar ${track.title}`}
                    className="rounded-full p-2 text-ink-muted transition-colors hover:text-danger"
                    onClick={() => removeTrack(track.id)}
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
