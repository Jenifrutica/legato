import { useTranslation } from 'react-i18next'
import { isChordsAutoEnabled, useMicStore } from '../features/musician'
import type { MicError } from '../features/musician'
import { useSpotifyStore } from '../features/sources'
import { usePlayerStore } from '../player'

const ERROR_KEYS = {
  denied: 'mic.denied',
  unavailable: 'mic.unavailable',
  unknown: 'mic.unknown',
} as const satisfies Record<Exclude<MicError, null>, string>

export function MicControl() {
  const { t } = useTranslation()
  const status = useMicStore((state) => state.status)
  const error = useMicStore((state) => state.error)
  const liveChord = useMicStore((state) => state.liveChord)
  const bpm = useMicStore((state) => state.bpm)

  function handleStart() {
    void useMicStore.getState().start({
      getTrackId: () => usePlayerStore.getState().currentTrack?.id ?? null,
      getPosition: () => {
        const playback = useSpotifyStore.getState().playback
        if (playback !== null) {
          return playback.positionMs / 1000
        }
        return usePlayerStore.getState().currentTrack === null
          ? null
          : usePlayerStore.getState().currentTime
      },
    })
  }

  const listening = status === 'listening'
  const autoChords = isChordsAutoEnabled()

  return (
    <div className="flex flex-col gap-2 border-2 border-rule/40 bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`border-2 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors disabled:cursor-wait ${
            listening
              ? 'border-rule bg-accent text-on-accent'
              : 'border-rule/40 text-ink-muted hover:border-accent hover:text-ink'
          }`}
          disabled={status === 'requesting'}
          onClick={listening ? () => useMicStore.getState().stop() : handleStart}
          type="button"
        >
          {status === 'requesting'
            ? t('mic.requesting')
            : listening
              ? t('mic.stop')
              : t('mic.start')}
        </button>

        {listening && (
          <span className="font-mono text-[0.6875rem] tracking-[0.12em] text-accent-ink uppercase">
            {t('mic.live')}
          </span>
        )}
      </div>

      {listening && (bpm !== null || (autoChords && liveChord !== null)) && (
        <p className="font-display text-lg font-black text-ink">
          {autoChords && liveChord !== null ? liveChord : null}
          {bpm !== null && (
            <span className="ml-2 font-mono text-xs font-normal text-ink-muted">
              {t('mic.bpm', { bpm })}
            </span>
          )}
        </p>
      )}

      {status === 'error' && error !== null && (
        <p className="text-xs text-danger" role="status">
          {t(ERROR_KEYS[error])}
        </p>
      )}

      <p className="text-xs leading-relaxed text-ink-muted">{t('mic.hint')}</p>
    </div>
  )
}
