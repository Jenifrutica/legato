import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { formatFileSize, useLibraryStore } from '../features/library'
import { supportsOutputSelection, usePlayerStore } from '../player'
import type { ChannelMode } from '../player'

const MODE_KEYS = {
  stereo: 'audio.modes.stereo',
  left: 'audio.modes.left',
  right: 'audio.modes.right',
  mono: 'audio.modes.mono',
} as const satisfies Record<ChannelMode, string>

const CHANNEL_MODES: ChannelMode[] = ['stereo', 'left', 'right', 'mono']

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
            <dt className="text-[0.625rem] uppercase tracking-wide text-ink-muted">{item.label}</dt>
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

      <p className="mt-3 text-xs leading-relaxed text-ink-muted">{t('audio.hint')}</p>
    </div>
  )
}
