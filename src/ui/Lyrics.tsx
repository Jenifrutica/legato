import { useTranslation } from 'react-i18next'
import { isExternalTrack, useSpotifyStore } from '../features/sources'
import { displayLineIndex, type LyricLine } from '../features/lyrics'
import { usePlayerStore } from '../player'

export type { LyricLine }

/**
 * Letra de demostración para validar el diseño sin red. Se activa solo con la
 * bandera local `legato.lyrics.demo`, nunca por defecto.
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

export function Lyrics({
  lines = [],
  next = null,
  source = null,
}: {
  lines?: LyricLine[]
  /** Línea a mostrar como secundaria fuera del componente (si el héroe la calcula). */
  next?: LyricLine | null
  source?: 'lrclib' | 'local' | null
}) {
  const { t } = useTranslation()
  const currentTime = usePlayerStore((state) => state.currentTime)
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)

  const spotifyActive =
    spotifyPlayback !== null && (currentTrack === null || isExternalTrack(currentTrack))
  const time = spotifyActive ? spotifyPlayback.positionMs / 1000 : currentTime

  // La letra no desaparece al pausar: solo se oculta si no hay líneas.
  if (lines.length === 0) {
    return null
  }

  const active = displayLineIndex(lines, time)
  const current = active >= 0 ? lines[active] : lines[0]
  const follow = next ?? lines[active + 1] ?? null

  return (
    <div aria-label={t('lyrics.region')} className="relative mt-8 max-w-3xl">
      <span
        aria-hidden="true"
        className="staff-lines absolute inset-x-0 top-1/2 h-[62px] -translate-y-1/2"
      />
      <p className="relative inline-block bg-accent px-4 py-2 font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.05] font-black text-on-accent uppercase">
        {current.text}
      </p>
      <div className="relative mt-3 flex flex-wrap items-baseline gap-x-4">
        {follow !== null && (
          <p className="font-serif text-base text-ink-muted sm:text-lg" lang="es">
            {follow.text}
          </p>
        )}
        {source === 'lrclib' && (
          <a
            className="font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase underline underline-offset-2 hover:text-ink"
            href="https://lrclib.net"
            rel="noreferrer noopener"
            target="_blank"
          >
            {t('lyrics.source')}
          </a>
        )}
        {source === 'local' && (
          <span className="font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase">
            {t('lyrics.sourceLocal')}
          </span>
        )}
      </div>
    </div>
  )
}

export function useDemoLyrics(): LyricLine[] {
  return demoEnabled() ? DEMO_LYRICS : []
}
