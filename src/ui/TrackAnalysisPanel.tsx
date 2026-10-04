import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLibraryStore } from '../features/library'
import {
  ALL_KEY_OPTIONS,
  detectBpmFromBlob,
  useMetronomeStore,
  useTrackAnalysisStore,
} from '../features/musician'
import { MAX_BPM, MIN_BPM, usePlayerStore } from '../player'

export function TrackAnalysisPanel() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const trackId = currentTrack?.id ?? null
  const libraryTrack = useLibraryStore((state) =>
    trackId === null ? null : (state.tracks.find((item) => item.id === trackId) ?? null),
  )
  const record = useTrackAnalysisStore((state) =>
    trackId === null ? null : (state.records[trackId] ?? null),
  )
  const setBpm = useTrackAnalysisStore((state) => state.setBpm)
  const setKey = useTrackAnalysisStore((state) => state.setKey)
  const setMetronomeBpm = useMetronomeStore((state) => state.setBpm)
  const [detecting, setDetecting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const canDetect =
    trackId !== null &&
    libraryTrack !== null &&
    libraryTrack.external !== true &&
    libraryTrack.blob.size > 0

  async function handleDetect() {
    if (trackId === null || libraryTrack === null) {
      return
    }

    setDetecting(true)
    setMessage(null)
    const bpm = await detectBpmFromBlob(libraryTrack.blob)
    setDetecting(false)

    if (bpm === null) {
      setMessage(t('analysis.detectFailed'))
      return
    }

    setBpm(trackId, bpm)
    setMessage(t('analysis.detected', { bpm }))
  }

  return (
    <section aria-label={t('analysis.title')} className="flex flex-col gap-4 p-5">
      <h3 className="font-display text-base font-semibold">{t('analysis.title')}</h3>

      {trackId === null ? (
        <p className="text-xs leading-relaxed text-ink-muted">{t('analysis.empty')}</p>
      ) : (
        <>
          <div>
            <p className="truncate text-sm font-medium text-ink" title={currentTrack?.title}>
              {currentTrack?.title}
            </p>
            <p className="truncate text-xs text-ink-muted">{currentTrack?.artist}</p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-muted" htmlFor="analysis-bpm">
                {t('analysis.bpm')}
              </label>
              <input
                className="mt-1 w-24 border-2 border-rule bg-surface px-2 py-1.5 font-mono text-lg text-ink focus:border-accent focus:outline-none"
                id="analysis-bpm"
                max={MAX_BPM}
                min={MIN_BPM}
                onChange={(event) =>
                  setBpm(trackId, event.target.value === '' ? null : Number(event.target.value))
                }
                placeholder="—"
                step={1}
                type="number"
                value={record?.bpm ?? ''}
              />
            </div>
            <button
              className="border-2 border-rule/40 px-3 py-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canDetect || detecting}
              onClick={() => void handleDetect()}
              type="button"
            >
              {detecting ? t('analysis.detecting') : t('analysis.detect')}
            </button>
          </div>

          {!canDetect && (
            <p className="text-xs leading-relaxed text-ink-muted">
              {t('analysis.detectUnavailable')}
            </p>
          )}
          {message !== null && (
            <p className="text-xs text-ink-muted" role="status">
              {message}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-muted" htmlFor="analysis-key">
              {t('analysis.key')}
            </label>
            <select
              className="mt-1 border-2 border-rule bg-surface px-2 py-1.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
              id="analysis-key"
              onChange={(event) => setKey(trackId, event.target.value)}
              value={record?.key ?? ''}
            >
              <option value="">{t('analysis.keyNone')}</option>
              {ALL_KEY_OPTIONS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              className="border-2 border-rule bg-surface px-3 py-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink uppercase transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={record?.bpm == null}
              onClick={() => {
                if (record?.bpm != null) {
                  setMetronomeBpm(record.bpm)
                }
              }}
              type="button"
            >
              {t('analysis.useInMetronome')}
            </button>
          </div>
        </>
      )}

      <p className="text-xs leading-relaxed text-ink-muted">{t('analysis.hint')}</p>
    </section>
  )
}
