import { useTranslation } from 'react-i18next'
import { usePlaylistsStore } from '../features/playlists'
import { usePlayerStore } from '../player'
import { NotesEditor } from './NotesEditor'

export function NotesPanel() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const playlistId = usePlaylistsStore((state) => state.selectedPlaylistId)
  const playlists = usePlaylistsStore((state) => state.playlists)
  const selectedPlaylist = playlists.find((playlist) => playlist.id === playlistId) ?? null

  return (
    <section aria-label={t('notes.title')} className="flex flex-col gap-5 p-5">
      <h3 className="font-display text-base font-semibold">{t('notes.title')}</h3>

      {currentTrack === null ? (
        <p className="text-xs leading-relaxed text-ink-muted">{t('notes.trackEmpty')}</p>
      ) : (
        <div>
          <p className="mb-2 truncate text-sm font-medium text-ink" title={currentTrack.title}>
            {currentTrack.title}
          </p>
          <NotesEditor
            label={t('notes.track')}
            placeholder={t('notes.placeholder')}
            targetId={currentTrack.id}
            targetType="track"
          />
        </div>
      )}

      {selectedPlaylist === null ? (
        <p className="text-xs leading-relaxed text-ink-muted">{t('notes.playlistEmpty')}</p>
      ) : (
        <div>
          <p className="mb-2 truncate text-sm font-medium text-ink" title={selectedPlaylist.name}>
            {selectedPlaylist.name}
          </p>
          <NotesEditor
            label={t('notes.playlist')}
            placeholder={t('notes.placeholder')}
            targetId={selectedPlaylist.id}
            targetType="playlist"
          />
        </div>
      )}
    </section>
  )
}
