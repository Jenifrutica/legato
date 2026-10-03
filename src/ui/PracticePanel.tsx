import { useTranslation } from 'react-i18next'
import { formatDuration } from '../features/library'
import { usePlayerStore } from '../player'

const RATES = [0.5, 0.75, 0.9, 1]

export function PracticePanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const rate = usePlayerStore((state) => state.rate)
  const abLoop = usePlayerStore((state) => state.abLoop)
  const loopPointA = usePlayerStore((state) => state.loopPointA)
  const hasTrack = usePlayerStore((state) => state.currentTrack !== null)
  const setRate = usePlayerStore((state) => state.setRate)
  const setLoopPointA = usePlayerStore((state) => state.setLoopPointA)
  const setLoopPointB = usePlayerStore((state) => state.setLoopPointB)
  const clearAbLoop = usePlayerStore((state) => state.clearAbLoop)
  const karaoke = usePlayerStore((state) => state.karaoke)
  const setKaraoke = usePlayerStore((state) => state.setKaraoke)
  const crossfadeSeconds = usePlayerStore((state) => state.crossfadeSeconds)
  const setCrossfade = usePlayerStore((state) => state.setCrossfade)

  const loopActive = abLoop !== null

  return (
    <div
      aria-label={t('practice.title')}
      className="absolute bottom-full right-0 z-40 mb-2 w-72  border border-border bg-surface p-4 shadow-soft"
      role="dialog"
    >
      <h3 className="font-display text-sm font-semibold">{t('practice.title')}</h3>

      <div className="mt-3">
        <p className="text-xs font-medium text-ink-muted">{t('practice.speed')}</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {RATES.map((value) => (
            <button
              aria-pressed={rate === value}
              className={` border px-2 py-1.5 font-mono text-xs font-semibold transition-colors ${
                rate === value
                  ? 'border-accent bg-accent-soft text-ink'
                  : 'border-border text-ink-muted hover:border-accent hover:text-accent'
              }`}
              disabled={!hasTrack}
              key={value}
              onClick={() => setRate(value)}
              type="button"
            >
              {value}x
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-ink-muted">{t('practice.abLoop')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            className=" border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hasTrack}
            onClick={setLoopPointA}
            type="button"
          >
            {t('practice.markA')}
          </button>
          <button
            className=" border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hasTrack || loopPointA === null}
            onClick={setLoopPointB}
            type="button"
          >
            {t('practice.markB')}
          </button>
          <button
            className=" border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
            disabled={abLoop === null && loopPointA === null}
            onClick={() => {
              clearAbLoop()
              onClose()
            }}
            type="button"
          >
            {t('practice.clear')}
          </button>
        </div>

        <p className="mt-2 font-mono text-xs text-ink-muted">
          {t('practice.pointA', {
            time: loopPointA === null ? '--:--' : formatDuration(loopPointA),
          })}
          {' · '}
          {t('practice.pointB', { time: abLoop === null ? '--:--' : formatDuration(abLoop.b) })}
        </p>
        <p className={`mt-1 text-xs font-medium ${loopActive ? 'text-ink' : 'text-ink-muted'}`}>
          {loopActive ? t('practice.loopActive') : t('practice.loopIdle')}
        </p>
      </div>

      <div className="mt-4">
        <button
          aria-pressed={karaoke}
          className={`w-full  border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            karaoke
              ? 'border-accent bg-accent-soft text-ink'
              : 'border-border text-ink-muted hover:border-accent hover:text-accent'
          }`}
          disabled={!hasTrack}
          onClick={() => setKaraoke(!karaoke)}
          type="button"
        >
          {t('practice.karaoke')}
        </button>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">{t('practice.karaokeHint')}</p>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-ink-muted" htmlFor="practice-crossfade">
          {t('practice.crossfade')}{' '}
          <span className="font-mono text-ink">{crossfadeSeconds.toFixed(1)}s</span>
        </label>
        <input
          className="mt-1 h-1.5 w-full cursor-pointer accent-primary"
          id="practice-crossfade"
          max={8}
          min={0}
          onChange={(event) => setCrossfade(Number(event.target.value))}
          step={0.5}
          type="range"
          value={crossfadeSeconds}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-muted">{t('practice.hint')}</p>
    </div>
  )
}
