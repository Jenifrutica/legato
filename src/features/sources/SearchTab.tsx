import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLibraryStore } from '../library'
import { usePlaylistsStore } from '../playlists'
import { usePlayerStore } from '../../player'
import type { QueueTrack } from '../../player'
import { DownloadIcon, DiscMark, ListMusicIcon, PlayIcon, SearchIcon } from '../../ui/icons'
import { PlaylistPicker } from '../../ui/PlaylistPicker'
import { useProvidersStore } from './providers-store'
import { importSourceTrackToPlaylist, saveSourceTrack } from './save-track'
import { searchAll } from './search'
import type { SourceSearchError } from './search'
import { isSpotifyConnected, queueSpotifyTrack } from './spotify'
import { useSpotifyStore } from './spotify-store'
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
  const playSpotifyUris = useSpotifyStore((state) => state.playUris)
  const enqueue = usePlayerStore((state) => state.enqueue)
  const addTracks = useLibraryStore((state) => state.addTracks)
  const existingDedupeKeys = useLibraryStore((state) => state.existingDedupeKeys)
  const createPlaylist = usePlaylistsStore((state) => state.createPlaylist)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SourceTrack[]>([])
  const [errors, setErrors] = useState<SourceSearchError[]>([])
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
    setErrors([])
    const result = await searchAll(query, enabled)
    setResults(result.tracks)
    setErrors(result.errors)
    setSearched(true)
    setStatus('idle')
  }

  function play(track: SourceTrack) {
    if (track.sourceId === 'spotify') {
      if (!isSpotifyConnected()) {
        setMessage(t('search.spotifyHint'))
        return
      }

      void playSpotifyUris(
        results
          .filter((item) => item.sourceId === 'spotify')
          .map((item) => `spotify:track:${item.id}`),
      )
      return
    }

    if (track.streamUrl === null) {
      return
    }

    const queue = results.filter((item) => item.streamUrl !== null).map(toQueueTrack)
    playTracks(queue, `${track.sourceId}:${track.id}`, null)
  }

  async function addToQueue(track: SourceTrack) {
    if (track.sourceId === 'spotify') {
      if (!isSpotifyConnected()) {
        setMessage(t('search.spotifyHint'))
        return
      }

      const uri = `spotify:track:${track.id}`
      let deviceId = useSpotifyStore.getState().deviceId
      let result = await queueSpotifyTrack(uri, deviceId)

      // Sin dispositivo activo: inicializa el reproductor del SDK y reintenta.
      if (!result.ok && deviceId === null && result.status !== 401) {
        const connected = await useSpotifyStore.getState().connect()
        if (connected) {
          deviceId = useSpotifyStore.getState().deviceId
          result = await queueSpotifyTrack(uri, deviceId)
        }
      }

      if (result.ok) {
        setMessage(t('search.queuedSpotify'))
      } else if (result.status === 403) {
        setMessage(t('search.queuePremium'))
      } else if (result.status === 401) {
        setMessage(t('search.spotifyHint'))
      } else if (result.status === 404) {
        setMessage(t('search.queueNoDevice'))
      } else {
        setMessage(t('search.queueError', { error: `HTTP ${result.status}` }))
      }
      return
    }

    if (!track.downloadable) {
      return
    }

    setStatus('saving')
    setMessage(null)

    try {
      const saved = await saveSourceTrack(track, existingDedupeKeys())
      if (saved === null) {
        setMessage(t('search.cannotSave'))
      } else {
        addTracks([saved])
        enqueue(saved)
        setMessage(t('queue.addedToEnd'))
      }
    } catch {
      setMessage(t('search.saveError'))
    }

    setStatus('idle')
  }

  async function download(track: SourceTrack) {
    setStatus('saving')
    setMessage(null)

    try {
      const saved = await saveSourceTrack(track, existingDedupeKeys())
      if (saved === null) {
        setMessage(t('search.cannotSave'))
      } else {
        addTracks([saved])
        setMessage(t('search.saved'))
      }
    } catch {
      setMessage(t('search.saveError'))
    }

    setStatus('idle')
  }

  async function addToPlaylist(track: SourceTrack, value: string) {
    if (value === '') {
      return
    }

    setStatus('saving')
    setMessage(null)

    try {
      let playlistId = value
      if (value === '__new__') {
        const name = window.prompt(t('playlists.namePlaceholder'), track.title)
        if (name === null || name.trim() === '') {
          setStatus('idle')
          return
        }
        playlistId = createPlaylist(name)
      }

      const added = await importSourceTrackToPlaylist(track, playlistId)
      setMessage(added ? t('search.addedToPlaylist') : t('search.cannotSave'))
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
            className="w-full  border border-border bg-bg py-2 pl-9 pr-3 text-sm placeholder:text-ink-muted focus:border-accent focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search.placeholder')}
            type="search"
            value={query}
          />
        </label>
        <button
          className=" bg-primary-strong px-4 py-2 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={status !== 'idle' || !hasProviders}
          type="submit"
        >
          {status === 'loading' ? t('search.searching') : t('search.button')}
        </button>
      </form>

      {message !== null && (
        <p className=" bg-accent-soft px-3 py-2 text-xs text-ink" role="status">
          {message}
        </p>
      )}

      {errors.length > 0 && (
        <ul className=" bg-accent-soft px-3 py-2 text-xs text-ink">
          {errors.map((error) => (
            <li key={error.sourceId}>
              <strong>{SOURCE_LABELS[error.sourceId]}:</strong> {error.message}
              {error.sourceId === 'spotify' && (
                <span className="block">{t('spotify.reconnect')}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {status === 'idle' && searched && results.length === 0 && errors.length === 0 && (
        <div className="py-4 text-center text-sm text-ink-muted">
          <p>{t('search.empty')}</p>
          {enabled.spotify && <p className="mt-1 text-xs">{t('search.spotifyHint')}</p>}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {results.map((track) => (
          <li
            className="flex items-center gap-2  border border-border bg-surface/60 p-2"
            draggable={track.downloadable}
            key={`${track.sourceId}:${track.id}`}
            onDragStart={(event) => {
              if (track.downloadable) {
                event.dataTransfer.setData('application/x-legato-track', JSON.stringify(track))
                event.dataTransfer.effectAllowed = 'copy'
              }
            }}
          >
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden  bg-surface-2 text-[0.6875rem] font-semibold uppercase text-ink-muted">
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

            {track.downloadable && (
              <PlaylistPicker
                label={`${t('search.addToPlaylist')} ${track.title}`}
                onPick={(playlistId) => void addToPlaylist(track, playlistId)}
              />
            )}

            <button
              aria-label={t('queue.addToEndLabel', { title: track.title })}
              className="grid size-8 shrink-0 place-items-center text-ink-muted transition-colors hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
              disabled={status !== 'idle'}
              onClick={() => void addToQueue(track)}
              type="button"
            >
              <ListMusicIcon className="size-4" />
            </button>

            <button
              aria-label={`${t('search.play')} ${track.title}`}
              className="grid size-8 shrink-0 place-items-center  text-ink-muted transition-colors hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
              disabled={track.streamUrl === null}
              onClick={() => play(track)}
              type="button"
            >
              <PlayIcon className="size-4" />
            </button>

            {track.sourceId === 'spotify' && (
              <button
                aria-label={`${t('search.playFull')} ${track.title}`}
                className="grid size-8 shrink-0 place-items-center  bg-[#1db954] text-on-primary transition-opacity hover:opacity-90 disabled:opacity-40"
                disabled={status !== 'idle'}
                onClick={() =>
                  void playSpotifyUris(
                    results
                      .filter((item) => item.sourceId === 'spotify')
                      .map((item) => `spotify:track:${item.id}`),
                  )
                }
                type="button"
              >
                <DiscMark className="size-4" />
              </button>
            )}

            {track.downloadable && (
              <button
                aria-label={`${t('search.save')} ${track.title}`}
                className="grid size-8 shrink-0 place-items-center  text-ink-muted transition-colors hover:text-accent-ink disabled:opacity-40"
                disabled={status !== 'idle'}
                onClick={() => void download(track)}
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
