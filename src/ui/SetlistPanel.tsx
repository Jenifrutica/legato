import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDuration, useLibraryStore } from '../features/library'
import type { LibraryTrack } from '../features/library'
import { useSetlistStore } from '../features/musician'
import { usePlaylistsStore } from '../features/playlists'
import { usePlayerStore } from '../player'

export function SetlistPanel() {
  const { t } = useTranslation()
  const setlists = useSetlistStore((state) => state.setlists)
  const selectedId = useSetlistStore((state) => state.selectedId)
  const select = useSetlistStore((state) => state.select)
  const create = useSetlistStore((state) => state.create)
  const remove = useSetlistStore((state) => state.remove)
  const moveItem = useSetlistStore((state) => state.moveItem)
  const togglePlayed = useSetlistStore((state) => state.togglePlayed)
  const removeItem = useSetlistStore((state) => state.removeItem)
  const tracks = useLibraryStore((state) => state.tracks)
  const playlists = usePlaylistsStore((state) => state.playlists)
  const playTracks = usePlayerStore((state) => state.playTracks)
  const [creating, setCreating] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [sourcePlaylistId, setSourcePlaylistId] = useState('')

  const selected = setlists.find((setlist) => setlist.id === selectedId) ?? null
  const items = selected?.items ?? []

  function trackOf(trackId: string): LibraryTrack | undefined {
    return tracks.find((track) => track.id === trackId)
  }

  function submitCreate() {
    const source = playlists.find((playlist) => playlist.id === sourcePlaylistId)
    const trackIds = source === undefined ? [] : [...new Set(source.trackIds)]
    create(nameDraft, trackIds)
    setNameDraft('')
    setSourcePlaylistId('')
    setCreating(false)
  }

  function playSelected() {
    if (selected === null) {
      return
    }

    const queue = selected.items
      .map((item) => trackOf(item.trackId))
      .filter((track): track is LibraryTrack => track !== undefined)
    const first = queue[0]
    if (first !== undefined) {
      playTracks(queue, first.id, null)
    }
  }

  const totalSeconds = items.reduce(
    (sum, item) => sum + (trackOf(item.trackId)?.durationSeconds ?? 0),
    0,
  )

  return (
    <section aria-label={t('setlist.title')} className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold">{t('setlist.title')}</h3>
        <button
          className="border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink"
          onClick={() => setCreating((value) => !value)}
          type="button"
        >
          {t('setlist.newSetlist')}
        </button>
      </div>

      {creating && (
        <div className="flex flex-col gap-2 border-2 border-rule bg-surface p-3">
          <input
            autoFocus
            className="border-2 border-rule bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
            onChange={(event) => setNameDraft(event.target.value)}
            placeholder={t('setlist.namePlaceholder')}
            value={nameDraft}
          />
          <select
            aria-label={t('setlist.source')}
            className="border-2 border-rule bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
            onChange={(event) => setSourcePlaylistId(event.target.value)}
            value={sourcePlaylistId}
          >
            <option value="">{t('setlist.noSource')}</option>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              className="border-2 border-rule bg-accent px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-on-accent uppercase"
              onClick={submitCreate}
              type="button"
            >
              {t('setlist.create')}
            </button>
            <button
              className="border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase"
              onClick={() => setCreating(false)}
              type="button"
            >
              {t('setlist.cancel')}
            </button>
          </div>
        </div>
      )}

      {setlists.length === 0 && !creating && (
        <p className="text-xs leading-relaxed text-ink-muted">{t('setlist.empty')}</p>
      )}

      {setlists.length > 0 && (
        <div aria-label={t('setlist.title')} className="flex flex-wrap gap-2" role="group">
          {setlists.map((setlist) => (
            <button
              aria-pressed={setlist.id === selectedId}
              className={`border-2 px-3 py-1.5 text-xs font-semibold transition-colors ${
                setlist.id === selectedId
                  ? 'border-rule bg-accent text-on-accent'
                  : 'border-rule/40 text-ink-muted hover:text-ink'
              }`}
              key={setlist.id}
              onClick={() => select(setlist.id)}
              type="button"
            >
              {setlist.name}
            </button>
          ))}
        </div>
      )}

      {selected !== null && (
        <>
          <p className="font-mono text-xs text-ink-muted">
            {t('setlist.count', { count: items.length })} ·{' '}
            {t('setlist.total', { duration: formatDuration(totalSeconds) })}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              className="border-2 border-rule bg-surface px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink uppercase transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={items.length === 0}
              onClick={playSelected}
              type="button"
            >
              {t('setlist.play')}
            </button>
            <button
              className="border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-danger hover:text-danger"
              onClick={() => remove(selected.id)}
              type="button"
            >
              {t('setlist.remove')}
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-xs leading-relaxed text-ink-muted">{t('setlist.emptyItems')}</p>
          ) : (
            <ol className="flex flex-col">
              {items.map((item, index) => {
                const track = trackOf(item.trackId)
                const title = track?.title ?? t('setlist.notFound')
                return (
                  <li
                    className="flex items-center gap-2 border-b border-border py-2"
                    key={`${item.trackId}-${index}`}
                  >
                    <span className="w-6 font-mono text-xs text-ink-muted">{index + 1}</span>
                    <input
                      aria-label={t('setlist.played', { title })}
                      checked={item.played}
                      className="size-4 shrink-0 accent-primary"
                      onChange={() => togglePlayed(selected.id, item.trackId)}
                      type="checkbox"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm ${
                          item.played ? 'text-ink-muted line-through' : 'text-ink'
                        }`}
                      >
                        {title}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {track?.artist ?? ''}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-ink-muted">
                      {track?.durationSeconds == null
                        ? '--:--'
                        : formatDuration(track.durationSeconds)}
                    </span>
                    <button
                      aria-label={t('setlist.moveUp', { title })}
                      className="px-1 text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
                      disabled={index === 0}
                      onClick={() => moveItem(selected.id, item.trackId, index - 1)}
                      type="button"
                    >
                      ↑
                    </button>
                    <button
                      aria-label={t('setlist.moveDown', { title })}
                      className="px-1 text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(selected.id, item.trackId, index + 1)}
                      type="button"
                    >
                      ↓
                    </button>
                    <button
                      aria-label={t('setlist.removeItem', { title })}
                      className="px-1 text-ink-muted transition-colors hover:text-danger"
                      onClick={() => removeItem(selected.id, item.trackId)}
                      type="button"
                    >
                      ×
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
        </>
      )}

      <p className="text-xs leading-relaxed text-ink-muted">{t('setlist.hint')}</p>
    </section>
  )
}
