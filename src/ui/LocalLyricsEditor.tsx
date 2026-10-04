import { useTranslation } from 'react-i18next'
import { useLocalLyricsStore } from '../features/lyrics'
import { usePlayerStore } from '../player'

export function LocalLyricsEditor() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const trackId = currentTrack?.id ?? null
  const hasLocal = useLocalLyricsStore((state) =>
    trackId === null ? false : state.records[trackId] !== undefined,
  )
  const setText = useLocalLyricsStore((state) => state.setText)
  const clear = useLocalLyricsStore((state) => state.clear)

  if (trackId === null) {
    return <p className="text-xs leading-relaxed text-ink-muted">{t('localLyrics.emptyTrack')}</p>
  }

  async function handleFile(file: File | undefined) {
    if (file === undefined || trackId === null) {
      return
    }
    setText(trackId, await file.text())
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs leading-relaxed text-ink-muted">
        {hasLocal ? t('localLyrics.loaded') : t('localLyrics.empty')}
      </p>
      <div className="flex flex-wrap gap-2">
        <label className="cursor-pointer border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink">
          {t('localLyrics.import')}
          <input
            accept=".lrc,text/plain"
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
            type="file"
          />
        </label>
        {hasLocal && (
          <button
            className="border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-danger hover:text-danger"
            onClick={() => clear(trackId)}
            type="button"
          >
            {t('localLyrics.clear')}
          </button>
        )}
      </div>
    </div>
  )
}
