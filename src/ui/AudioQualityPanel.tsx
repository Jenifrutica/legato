import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatFileSize, useLibraryStore } from '../features/library'
import { useTrackAnalysisStore } from '../features/musician'
import { useSpotifyStore } from '../features/sources'
import {
  AMBIENT_IDS,
  MAX_BPM,
  MIN_BPM,
  nextTap,
  offsetFromPositions,
  supportsOutputSelection,
  useAudioFxStore,
  usePlayerStore,
  useWavesStore,
  WAVE_SENSITIVITIES,
} from '../player'
import type { AmbientId, ChannelMode, WaveSensitivity } from '../player'
import { MicControl } from './MicControl'

const MODE_KEYS = {
  stereo: 'audio.modes.stereo',
  left: 'audio.modes.left',
  right: 'audio.modes.right',
  mono: 'audio.modes.mono',
} as const satisfies Record<ChannelMode, string>

const AMBIENT_KEYS = {
  rain: 'audio.ambientRain',
  vinyl: 'audio.ambientVinyl',
  cafe: 'audio.ambientCafe',
  wind: 'audio.ambientWind',
} as const satisfies Record<AmbientId, string>

const CHANNEL_MODES: ChannelMode[] = ['stereo', 'left', 'right', 'mono']

const SENSITIVITY_KEYS = {
  soft: 'audio.waveSoft',
  normal: 'audio.waveNormal',
  aggressive: 'audio.waveAggressive',
} as const satisfies Record<WaveSensitivity, string>

export function AudioQualityPanel() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const balance = usePlayerStore((state) => state.balance)
  const channelMode = usePlayerStore((state) => state.channelMode)
  const setBalance = usePlayerStore((state) => state.setBalance)
  const setChannelMode = usePlayerStore((state) => state.setChannelMode)
  const outputDevices = usePlayerStore((state) => state.outputDevices)
  const outputDeviceId = usePlayerStore((state) => state.outputDeviceId)
  const refreshOutputDevices = usePlayerStore((state) => state.refreshOutputDevices)
  const setOutputDevice = usePlayerStore((state) => state.setOutputDevice)
  const canSelectOutput = supportsOutputSelection()
  const bassDb = useAudioFxStore((state) => state.bassDb)
  const ambient = useAudioFxStore((state) => state.ambient)
  const ambientVolume = useAudioFxStore((state) => state.ambientVolume)
  const setBass = useAudioFxStore((state) => state.setBass)
  const setAmbient = useAudioFxStore((state) => state.setAmbient)
  const setAmbientVolume = useAudioFxStore((state) => state.setAmbientVolume)
  const crossfadeSeconds = usePlayerStore((state) => state.crossfadeSeconds)
  const setCrossfade = usePlayerStore((state) => state.setCrossfade)
  const sensitivity = useWavesStore((state) => state.sensitivity)
  const bpm = useWavesStore((state) => state.bpm)
  const setSensitivity = useWavesStore((state) => state.setSensitivity)
  const setBpm = useWavesStore((state) => state.setBpm)
  const setOffset = useWavesStore((state) => state.setOffset)
  const setAnalysisBpm = useTrackAnalysisStore((state) => state.setBpm)
  const setAnalysisBeatOffset = useTrackAnalysisStore((state) => state.setBeatOffset)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const [taps, setTaps] = useState<number[]>([])
  const [tapPositions, setTapPositions] = useState<number[]>([])
  const anchorRef = useRef<{ position: number; at: number } | null>(null)
  const track = useLibraryStore((state) =>
    currentTrack === null
      ? null
      : (state.tracks.find((item) => item.id === currentTrack.id) ?? null),
  )

  useEffect(() => {
    if (canSelectOutput) {
      void refreshOutputDevices()
    }
  }, [canSelectOutput, refreshOutputDevices])

  useEffect(() => {
    if (spotifyPlayback !== null) {
      anchorRef.current = { position: spotifyPlayback.positionMs / 1000, at: performance.now() }
    }
  }, [spotifyPlayback])

  /** Posición de la pista en segundos (interpolada entre sondeos de Spotify). */
  function currentPlaybackPosition(): number | null {
    if (spotifyPlayback !== null) {
      const anchor = anchorRef.current
      return anchor === null
        ? spotifyPlayback.positionMs / 1000
        : anchor.position + (performance.now() - anchor.at) / 1000
    }
    return currentTrack !== null ? currentTime : null
  }

  function handleTap() {
    const result = nextTap(taps, performance.now())
    setTaps(result.taps)
    if (result.bpm === null) {
      return
    }

    setBpm(result.bpm)
    if (currentTrack?.external === true && currentTrack.id !== '') {
      setAnalysisBpm(currentTrack.id, result.bpm)
    }

    // Fase: los toques también fijan en qué punto del compás caen las ondas.
    const position = currentPlaybackPosition()
    if (position === null) {
      return
    }
    const samples = result.taps.length <= 1 ? [position] : [...tapPositions, position].slice(-4)
    setTapPositions(samples)
    const offsetValue = offsetFromPositions(samples, result.bpm)
    setOffset(offsetValue)
    if (currentTrack?.external === true) {
      setAnalysisBeatOffset(currentTrack.id, offsetValue)
    }
  }
  const quality = [
    { label: t('audio.codec'), value: track?.codec ?? '—' },
    {
      label: t('audio.sampleRate'),
      value: track?.sampleRate == null ? '—' : `${(track.sampleRate / 1000).toFixed(1)} kHz`,
    },
    {
      label: t('audio.bitrate'),
      value: track?.bitrate == null ? '—' : `${Math.round(track.bitrate / 1000)} kbps`,
    },
    {
      label: t('audio.channels'),
      value:
        track?.channels == null ? '—' : track.channels === 1 ? t('audio.mono') : t('audio.stereo'),
    },
    { label: t('audio.size'), value: track == null ? '—' : formatFileSize(track.fileSize) },
  ]

  return (
    <div className="mt-6 border-t border-border pt-5 text-left">
      <h3 className="font-display text-sm font-semibold">{t('audio.title')}</h3>

      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {quality.map((item) => (
          <div className=" border border-border bg-bg px-3 py-2" key={item.label}>
            <dt className="text-[0.6875rem] uppercase tracking-wide text-ink-muted">
              {item.label}
            </dt>
            <dd className="font-mono text-sm text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <label className="text-xs font-medium text-ink-muted" htmlFor="audio-balance">
          {t('audio.balance')}
        </label>
        <div className="mt-1 flex items-center gap-3">
          <span className="font-mono text-xs text-ink-muted">L</span>
          <input
            className="h-1.5 flex-1 cursor-pointer accent-primary"
            id="audio-balance"
            max={100}
            min={-100}
            onChange={(event) => setBalance(Number(event.target.value) / 100)}
            type="range"
            value={Math.round(balance * 100)}
          />
          <span className="font-mono text-xs text-ink-muted">R</span>
          <span className="w-10 text-right font-mono text-xs tabular-nums text-ink-muted">
            {Math.round(balance * 100)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-ink-muted">{t('audio.channelMode')}</p>
        <div aria-label={t('audio.channelMode')} className="mt-2 flex flex-wrap gap-2" role="group">
          {CHANNEL_MODES.map((mode) => (
            <button
              aria-pressed={channelMode === mode}
              className={` border px-3 py-1.5 text-xs font-semibold transition-colors ${
                channelMode === mode
                  ? 'border-accent bg-accent-soft text-ink'
                  : 'border-border text-ink-muted hover:border-accent hover:text-accent-ink'
              }`}
              key={mode}
              onClick={() => setChannelMode(mode)}
              type="button"
            >
              {t(MODE_KEYS[mode])}
            </button>
          ))}
        </div>
      </div>

      {canSelectOutput && (
        <div className="mt-4">
          <label className="text-xs font-medium text-ink-muted" htmlFor="audio-output">
            {t('audio.output')}
          </label>
          <select
            className="mt-1 w-full  border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
            id="audio-output"
            onChange={(event) => void setOutputDevice(event.target.value)}
            value={outputDeviceId}
          >
            {outputDevices.map((device) => (
              <option key={device.id === '' ? 'default' : device.id} value={device.id}>
                {device.label === '' ? t('audio.outputDefault') : device.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4">
        <label className="text-xs font-medium text-ink-muted" htmlFor="audio-crossfade">
          {t('practice.crossfade')}{' '}
          <span className="font-mono text-ink">{crossfadeSeconds.toFixed(1)}s</span>
        </label>
        <input
          className="mt-1 h-3 max-w-52 w-full cursor-pointer"
          id="audio-crossfade"
          max={12}
          min={0}
          onChange={(event) => setCrossfade(Number(event.target.value))}
          step={0.5}
          type="range"
          value={crossfadeSeconds}
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-ink-muted" htmlFor="audio-bass">
          {t('audio.bass')}
        </label>
        <div className="mt-1 flex items-center gap-3">
          <input
            className="h-3 max-w-52 flex-1 cursor-pointer"
            id="audio-bass"
            max={12}
            min={-12}
            onChange={(event) => setBass(Number(event.target.value))}
            step={1}
            type="range"
            value={bassDb}
          />
          <span className="w-12 font-mono text-xs tabular-nums text-ink-muted">
            {bassDb > 0 ? '+' : ''}
            {bassDb} dB
          </span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-ink-muted">{t('audio.ambient')}</p>
        <div aria-label={t('audio.ambient')} className="mt-2 flex flex-wrap gap-2" role="group">
          <button
            aria-pressed={ambient === null}
            className={`border-2 px-3 py-1.5 text-[0.6875rem] font-semibold tracking-[0.1em] uppercase transition-colors ${
              ambient === null
                ? 'border-rule bg-accent text-on-accent'
                : 'border-rule/40 text-ink-muted hover:text-ink'
            }`}
            onClick={() => setAmbient(null)}
            type="button"
          >
            {t('audio.ambientNone')}
          </button>
          {AMBIENT_IDS.map((id) => (
            <button
              aria-pressed={ambient === id}
              className={`border-2 px-3 py-1.5 text-[0.6875rem] font-semibold tracking-[0.1em] uppercase transition-colors ${
                ambient === id
                  ? 'border-rule bg-accent text-on-accent'
                  : 'border-rule/40 text-ink-muted hover:text-ink'
              }`}
              key={id}
              onClick={() => setAmbient(ambient === id ? null : id)}
              type="button"
            >
              {t(AMBIENT_KEYS[id])}
            </button>
          ))}
        </div>

        {ambient !== null && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-ink-muted">{t('audio.ambientVolume')}</span>
            <input
              aria-label={t('audio.ambientVolume')}
              className="h-3 max-w-52 flex-1 cursor-pointer"
              max={100}
              min={0}
              onChange={(event) => setAmbientVolume(Number(event.target.value) / 100)}
              type="range"
              value={Math.round(ambientVolume * 100)}
            />
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-ink-muted">{t('audio.waves')}</p>
        <div aria-label={t('audio.waves')} className="mt-2 flex flex-wrap gap-2" role="group">
          {WAVE_SENSITIVITIES.map((value) => (
            <button
              aria-pressed={sensitivity === value}
              className={`border-2 px-3 py-1.5 text-[0.6875rem] font-semibold tracking-[0.1em] uppercase transition-colors ${
                sensitivity === value
                  ? 'border-rule bg-accent text-on-accent'
                  : 'border-rule/40 text-ink-muted hover:text-ink'
              }`}
              key={value}
              onClick={() => setSensitivity(value)}
              type="button"
            >
              {t(SENSITIVITY_KEYS[value])}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-ink-muted" htmlFor="audio-bpm">
            {t('audio.bpmManual')}
          </label>
          <input
            className="w-20 border-2 border-rule bg-surface px-2 py-1 font-mono text-sm text-ink focus:border-accent focus:outline-none"
            id="audio-bpm"
            max={MAX_BPM}
            min={MIN_BPM}
            onChange={(event) =>
              setBpm(event.target.value === '' ? null : Number(event.target.value))
            }
            placeholder="120"
            step={1}
            type="number"
            value={bpm ?? ''}
          />
          <button
            className="border-2 border-rule/40 px-3 py-1 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink"
            onClick={handleTap}
            type="button"
          >
            {t('audio.tap')}
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-ink-muted">{t('audio.bpmHint')}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t('audio.waveHint')}</p>
      </div>

      <div className="mt-4">
        <MicControl />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-muted">{t('audio.hint')}</p>
    </div>
  )
}
