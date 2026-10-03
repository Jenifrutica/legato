import type { ReactNode } from 'react'
import {
  DiscMark,
  PlayIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  TimerIcon,
  VolumeIcon,
} from './icons'

function TransportButton({
  label,
  icon,
  primary = false,
}: {
  label: string
  icon: ReactNode
  primary?: boolean
}) {
  return (
    <button
      aria-label={label}
      className={`grid place-items-center rounded-full disabled:cursor-not-allowed disabled:opacity-45 ${
        primary ? 'size-11 bg-primary-strong text-white' : 'size-9 text-ink-muted'
      }`}
      disabled
      type="button"
    >
      {icon}
    </button>
  )
}

export function PlayerBar() {
  return (
    <section aria-label="Reproductor" className="border-t border-border bg-surface shadow-bar">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-ink text-bg">
            <DiscMark className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Sin reproducción</p>
            <p className="truncate text-xs text-ink-muted">Importa una canción</p>
          </div>
        </div>

        <div className="hidden flex-1 flex-col items-center gap-2 sm:flex">
          <div className="flex items-center gap-2">
            <TransportButton icon={<ShuffleIcon className="size-4" />} label="Aleatorio" />
            <TransportButton icon={<SkipBackIcon className="size-5" />} label="Anterior" />
            <div className="sm:hidden">
              <TransportButton icon={<PlayIcon className="size-5" />} label="Reproducir" primary />
            </div>
            <TransportButton icon={<SkipForwardIcon className="size-5" />} label="Siguiente" />
            <TransportButton icon={<RepeatIcon className="size-4" />} label="Repetir" />
          </div>

          <div className="flex w-full max-w-xl items-center gap-3">
            <span className="w-10 text-right text-xs tabular-nums text-ink-muted">0:00</span>
            <div
              aria-label="Progreso de la canción"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={0}
              className="h-1.5 flex-1 rounded-full bg-surface-2"
              role="progressbar"
            >
              <div className="h-full w-0 rounded-full bg-primary" />
            </div>
            <span className="w-10 text-xs tabular-nums text-ink-muted">0:00</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-3 lg:flex">
            <button
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted disabled:cursor-not-allowed disabled:opacity-50"
              disabled
              type="button"
            >
              1.0x
            </button>
            <TransportButton icon={<TimerIcon className="size-4" />} label="Temporizador" />
            <span className="flex items-center gap-2">
              <VolumeIcon className="size-4 text-ink-muted" />
              <input
                aria-label="Volumen"
                className="h-1.5 w-24 accent-primary"
                defaultValue={70}
                disabled
                max={100}
                min={0}
                type="range"
              />
            </span>
          </div>

          <TransportButton icon={<PlayIcon className="size-5" />} label="Reproducir" primary />
        </div>
      </div>
    </section>
  )
}
