import { useTranslation } from 'react-i18next'
import { formatDuration } from '../features/library'
import { usePlayerStore } from '../player'
import type { QueueTrack } from '../player'

function QueueNode({
  label,
  track,
  active,
  maxDuration,
}: {
  label: string
  track: QueueTrack | null
  active: boolean
  maxDuration: number
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span
        className={`font-mono text-[0.6875rem] tracking-[0.14em] uppercase ${
          active ? 'text-accent-ink' : 'text-ink-muted'
        }`}
      >
        {label}
      </span>
      {track === null ? (
        <span className="text-sm text-ink-muted">—</span>
      ) : (
        <>
          <span className={`truncate text-sm ${active ? 'font-semibold' : ''}`}>{track.title}</span>
          <span
            aria-hidden="true"
            className={`h-3 border-2 border-rule ${active ? 'bg-accent' : 'bg-surface-2'}`}
            style={{
              width: `${Math.max(20, Math.round(((track.durationSeconds ?? 0) / maxDuration) * 100))}%`,
            }}
          />
          <span className="font-mono text-[0.6875rem] text-ink-muted">
            {formatDuration(track.durationSeconds ?? 0)}
          </span>
        </>
      )}
    </div>
  )
}

/** Vista previa de la cola (anterior · sonando · siguiente) en el hueco de la letra. */
export function QueueStrip() {
  const { t } = useTranslation()
  const queue = usePlayerStore((state) => state.queue)
  const currentId = usePlayerStore((state) => state.currentTrack?.id ?? null)

  const index = queue.findIndex((track) => track.id === currentId)
  if (index === -1 || queue.length < 2) {
    return null
  }

  const maxDuration = Math.max(1, ...queue.map((track) => track.durationSeconds ?? 0))

  return (
    <section
      aria-label={t('tabs.queue')}
      className="mt-10 hidden border-t-2 border-rule pt-5 lg:flex lg:gap-8"
    >
      <QueueNode
        active={false}
        label={t('player.previous')}
        maxDuration={maxDuration}
        track={queue[index - 1] ?? null}
      />
      <QueueNode
        active
        label={t('queue.nowPlaying')}
        maxDuration={maxDuration}
        track={queue[index] ?? null}
      />
      <QueueNode
        active={false}
        label={t('player.next')}
        maxDuration={maxDuration}
        track={queue[index + 1] ?? null}
      />
    </section>
  )
}
