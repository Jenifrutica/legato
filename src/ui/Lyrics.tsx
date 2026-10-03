import { useTranslation } from 'react-i18next'
import { useSpotifyStore } from '../features/sources'
import { usePlayerStore } from '../player'

export type LyricLine = {
  time: number
  text: string
}

/**
 * Letra demostrativa para validar el diseño (F7). La conexión real
 * (LRCLIB para streaming y etiquetas/.lrc para archivos) llega en F12.
 * Solo se activa con la bandera local `legato.lyrics.demo`, nunca por defecto.
 */
export const DEMO_LYRICS: LyricLine[] = [
  { time: 0, text: 'La aguja cae sobre el mar quieto' },
  { time: 8, text: 'y el cuarto entero aprende a respirar' },
  { time: 16, text: 'cada surco guarda un verano entero' },
  { time: 24, text: 'la noche gira y no quiere parar' },
  { time: 32, text: 'vidrio en la ventana, luz de sal' },
]

function demoEnabled(): boolean {
  if (typeof localStorage === 'undefined') {
    return false
  }

  try {
    return localStorage.getItem('legato.lyrics.demo') === '1'
  } catch {
    return false
  }
}

export function activeLineIndex(lines: LyricLine[], time: number): number {
  let active = -1
  for (let index = 0; index < lines.length; index++) {
    if (lines[index].time <= time) {
      active = index
    } else {
      break
    }
  }
  return active
}

export function Lyrics({ lines = [] }: { lines?: LyricLine[] }) {
  const { t } = useTranslation()
  const currentTime = usePlayerStore((state) => state.currentTime)
  const status = usePlayerStore((state) => state.status)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)

  const spotifyActive = spotifyPlayback !== null
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const time = spotifyActive ? spotifyPlayback.positionMs / 1000 : currentTime

  if (lines.length === 0 || !isPlaying) {
    return null
  }

  const active = activeLineIndex(lines, time)
  const current = active >= 0 ? lines[active] : lines[0]
  const next = lines[active + 1] ?? null

  return (
    <div aria-label={t('lyrics.region')} className="relative mt-8 max-w-3xl">
      <span
        aria-hidden="true"
        className="staff-lines absolute inset-x-0 top-1/2 h-[62px] -translate-y-1/2"
      />
      <p className="relative inline-block bg-accent px-4 py-2 font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.05] font-black text-on-accent uppercase">
        {current.text}
      </p>
      {next !== null && (
        <p className="relative mt-3 font-serif text-base text-ink-muted sm:text-lg" lang="es">
          {next.text}
        </p>
      )}
    </div>
  )
}

export function useDemoLyrics(): LyricLine[] {
  return demoEnabled() ? DEMO_LYRICS : []
}
