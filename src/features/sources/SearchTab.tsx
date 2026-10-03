import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { importAudioFiles, useLibraryStore } from '../library'
import { usePlayerStore } from '../../player'
import type { QueueTrack } from '../../player'
import { DownloadIcon, PlayIcon, SearchIcon } from '../../ui/icons'
import { useProvidersStore } from './providers-store'
import { searchAll } from './search'
import type { SourceId, SourceTrack } from './types'

const SOURCE_LABELS: Record<SourceId, string> = {
  spotify: 'Spotify',
  audius: 'Audius',
  jamendo: 'Jamendo',
}

function toQueueTrack(track: SourceTrack): QueueTrack {
  return {
    id: `${track.sourceId}:${track.id}`,
    title: track.title,
    artist: track.artist,
    album: track.album,
    durationSeconds: track.durationSeconds,
    sourceUrl: track.streamUrl ?? '',
    artworkUrl: track.artworkUrl,
  }
}

export function SearchTab() {
  const { t } = useTranslation()
  const enabled = useProvidersStore((state) => state.enabled)
  const playTracks = usePlayerStore((state) => state.playTracks)
  const addTracks = useLibraryStore((state) => state.addTracks)
  const existingDedupeKeys = useLibraryStore((state) => state.existingDedupeKeys)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SourceTrack[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const activeSources = (Object.keys(enabled) as SourceId[]).filter((id) => enabled[id])
  const hasProviders = activeSources.length > 0

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (query.trim() === '' || !hasProviders) {
      return
    }

    setStatus('loading')
    setMessage(null)
    const found = await searchAll(query, enabled)
    setResults(found)
    setSearched(true)
    setStatus('idle')
  }

  function play(track: SourceTrack) {
    if (track.streamUrl === null) {
      return
    }

    const queue = results.filter((item) => item.streamUrl !== null).map(toQueueTrack)
    playTracks(queue, `${track.sourceId}:${track.id}`, null)
  }

  async function save(track: SourceTrack) {
    if (track.streamUrl === null || !track.downloadable) {
      return
    }

    setStatus('saving')
    setMessage(null)

    try {
      const response = await fetch(track.streamUrl)
      const blob = await response.blob()
      const extension = blob.type.includes('wav') ? 'wav' : 'mp3'
      const file = new File([blob], `${track.artist} - ${track.title}.${extension}`, {
        type: blob.type === '' ? 'audio/mpeg' : blob.type,
      })
      const result = await importAudioFiles([file], existingDedupeKeys())
      addTracks(result.tracks)
      setMessage(result.tracks.length > 0 ? t('search.saved') : t('search.duplicate'))
    } catch {
      setMessage(t('search.saveError'))
    }

    setStatus('idle')
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-xs text-ink-muted">
        {hasProviders
          ? t('search.activeSources', {
              sources: activeSources.map((id) => SOURCE_LABELS[id]).join(' · '),
            })
          : t('search.noProviders')}
      </p>

      <form className="flex items-center gap-2" onSubmit={submit}>
        <label className="relative block flex-1">
          <span className="sr-only">{t('search.label')}</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            className="w-full rounded-full border border-border bg-bg py-2 pl-9 pr-3 text-sm placeholder:text-ink-muted focus:border-primary focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search.placeholder')}
            type="search"
            value={query}
          />
        </label>
        <button
          className="rounded-full bg-primary-strong px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={status !== 'idle' || !hasProviders}
          type="submit"
        >
          {status === 'loading' ? t('search.searching') : t('search.button')}
        </button>
      </form>

      {message !== null && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-xs text-ink" role="status">
          {message}
        </p>
      )}

      {status === 'idle' && searched && results.length === 0 && (
        <div className="py-4 text-center text-sm text-ink-muted">
          <p>{t('search.empty')}</p>
          {enabled.spotify && <p className="mt-1 text-xs">{t('search.spotifyHint')}</p>}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {results.map((track) => (
          <li
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/60 p-2"
            key={`${track.sourceId}:${track.id}`}
          >
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-surface-2 text-[0.625rem] font-semibold uppercase text-ink-muted">
              {track.artworkUrl === null ? (
                track.sourceId.slice(0, 2)
              ) : (
                <img alt="" className="size-full object-cover" src={track.artworkUrl} />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{track.title}</span>
              <span className="block truncate text-xs text-ink-muted">
                {track.artist} · {SOURCE_LABELS[track.sourceId]}
              </span>
            </span>

            <button
              aria-label={`${t('search.play')} ${track.title}`}
              className="grid size-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:text-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
              disabled={track.streamUrl === null}
              onClick={() => play(track)}
              type="button"
            >
              <PlayIcon className="size-4" />
            </button>

            {track.downloadable && (
              <button
                aria-label={`${t('search.save')} ${track.title}`}
                className="grid size-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:text-primary-strong disabled:opacity-40"
                disabled={status !== 'idle'}
                onClick={() => void save(track)}
                type="button"
              >
                <DownloadIcon className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
