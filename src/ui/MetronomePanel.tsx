import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BEATS_PER_BAR_OPTIONS, useMetronomeStore } from '../features/musician'
import { clampBpm, MAX_BPM, MIN_BPM, nextTap } from '../player'

export function MetronomePanel() {
  const { t } = useTranslation()
  const running = useMetronomeStore((state) => state.running)
  const bpm = useMetronomeStore((state) => state.bpm)
  const beatsPerBar = useMetronomeStore((state) => state.beatsPerBar)
  const volume = useMetronomeStore((state) => state.volume)
  const toggle = useMetronomeStore((state) => state.toggle)
  const setBpm = useMetronomeStore((state) => state.setBpm)
  const setBeatsPerBar = useMetronomeStore((state) => state.setBeatsPerBar)
  const setVolume = useMetronomeStore((state) => state.setVolume)
  const [taps, setTaps] = useState<number[]>([])
  const [bpmDraft, setBpmDraft] = useState(String(bpm))
  const [editing, setEditing] = useState(false)

  // Sincroniza el texto cuando el BPM cambia por fuera (tap, sesión) y no se edita.
  useEffect(() => {
    if (!editing) {
      setBpmDraft(String(bpm))
    }
  }, [bpm, editing])

  function commitBpm() {
    setEditing(false)
    const parsed = Number(bpmDraft)
    if (bpmDraft.trim() === '' || Number.isNaN(parsed)) {
      setBpmDraft(String(bpm))
      return
    }
    const value = clampBpm(parsed)
    setBpm(value)
    setBpmDraft(String(value))
  }

  function handleTap() {
    const result = nextTap(taps, performance.now())
    setTaps(result.taps)
    if (result.bpm !== null) {
      setBpm(result.bpm)
    }
  }

  return (
    <section aria-label={t('metronome.title')} className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold">{t('metronome.title')}</h3>
        <button
          aria-pressed={running}
          className={`border-2 px-4 py-2 font-mono text-[0.6875rem] font-semibold tracking-[0.12em] uppercase transition-transform hover:-translate-y-0.5 ${
            running ? 'border-rule bg-accent text-on-accent' : 'border-rule bg-surface text-ink'
          }`}
          onClick={toggle}
          type="button"
        >
          {running ? t('metronome.stop') : t('metronome.start')}
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-muted" htmlFor="metronome-bpm">
            {t('metronome.bpm')}
          </label>
          <input
            className="mt-1 w-24 border-2 border-rule bg-surface px-2 py-1.5 font-mono text-lg text-ink focus:border-accent focus:outline-none"
            id="metronome-bpm"
            inputMode="numeric"
            max={MAX_BPM}
            min={MIN_BPM}
            onBlur={commitBpm}
            onChange={(event) => {
              setEditing(true)
              setBpmDraft(event.target.value)
            }}
            onFocus={() => setEditing(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur()
              }
            }}
            step={1}
            type="number"
            value={bpmDraft}
          />
        </div>
        <button
          className="border-2 border-rule/40 px-3 py-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink"
          onClick={handleTap}
          type="button"
        >
          {t('metronome.tap')}
        </button>
      </div>

      <div>
        <p className="text-xs font-medium text-ink-muted">{t('metronome.beats')}</p>
        <div aria-label={t('metronome.beats')} className="mt-2 flex flex-wrap gap-2" role="group">
          {BEATS_PER_BAR_OPTIONS.map((value) => (
            <button
              aria-pressed={beatsPerBar === value}
              className={`border-2 px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                beatsPerBar === value
                  ? 'border-rule bg-accent text-on-accent'
                  : 'border-rule/40 text-ink-muted hover:text-ink'
              }`}
              key={value}
              onClick={() => setBeatsPerBar(value)}
              type="button"
            >
              {value === 6 ? '6/8' : `${value}/4`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-ink-muted" htmlFor="metronome-volume">
          {t('metronome.volume')}
        </label>
        <div className="mt-1 flex items-center gap-3">
          <input
            className="h-3 max-w-52 flex-1 cursor-pointer"
            id="metronome-volume"
            max={100}
            min={0}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            type="range"
            value={Math.round(volume * 100)}
          />
          <span className="w-10 font-mono text-xs tabular-nums text-ink-muted">
            {Math.round(volume * 100)}
          </span>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">{t('metronome.hint')}</p>
    </section>
  )
}
