import { useTranslation } from 'react-i18next'
import { formatDuration } from '../features/library'
import { usePlayerStore } from '../player'

const MINUTE_PRESETS = [15, 30, 45, 60, 90]

export function TimerPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const timer = usePlayerStore((state) => state.timer)
  const startTimerMinutes = usePlayerStore((state) => state.startTimerMinutes)
  const startTimerEndOfTrack = usePlayerStore((state) => state.startTimerEndOfTrack)
  const startTimerAfterTracks = usePlayerStore((state) => state.startTimerAfterTracks)
  const cancelTimer = usePlayerStore((state) => state.cancelTimer)

  const active = timer.mode !== 'off'
  const description =
    timer.mode === 'duration'
      ? formatDuration((timer.remainingMs ?? 0) / 1000)
      : timer.mode === 'tracks'
        ? t('timer.tracksLeft', { count: timer.remainingTracks ?? 0 })
        : t('timer.untilEndOfTrack')

  return (
    <div
      aria-label={t('timer.title')}
      className="absolute bottom-full right-0 z-40 mb-2 w-64 rounded-lg border border-border bg-surface p-4 shadow-soft"
      role="dialog"
    >
      <h3 className="font-display text-sm font-semibold">{t('timer.title')}</h3>

      {active ? (
        <>
          <p className="mt-3 font-mono text-sm text-ink">{description}</p>
          <button
            className="mt-3 w-full rounded-full border border-border px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-danger hover:text-danger"
            onClick={() => {
              cancelTimer()
              onClose()
            }}
            type="button"
          >
            {t('timer.cancel')}
          </button>
        </>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {MINUTE_PRESETS.map((minutes) => (
              <button
                className="rounded-md border border-border px-2 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-primary hover:text-primary-strong"
                key={minutes}
                onClick={() => {
                  startTimerMinutes(minutes)
                  onClose()
                }}
                type="button"
              >
                {minutes} min
              </button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              className="rounded-md border border-border px-2 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-primary hover:text-primary-strong"
              onClick={() => {
                startTimerEndOfTrack()
                onClose()
              }}
              type="button"
            >
              {t('timer.endOfTrack')}
            </button>
            <button
              className="rounded-md border border-border px-2 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-primary hover:text-primary-strong"
              onClick={() => {
                startTimerAfterTracks(3)
                onClose()
              }}
              type="button"
            >
              {t('timer.afterTracks', { count: 3 })}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
