import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlayerStore } from '../player'
import type { QueueTrack } from '../player'
import { ListMusicIcon } from './icons'
export function QueueActions({ track }: { track: QueueTrack }) {
  const { t } = useTranslation()
  const enqueue = usePlayerStore((state) => state.enqueue)
  const playNext = usePlayerStore((state) => state.playNext)
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState<'end' | 'next' | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (notice === null) {
      return
    }
    const timer = window.setTimeout(() => setNotice(null), 2000)
    return () => window.clearTimeout(timer)
  }, [notice])

  return (
    <div className="relative flex shrink-0 items-center" ref={rootRef}>
      <button
        aria-label={t('queue.addToList', { title: track.title })}
        className="grid size-8 shrink-0 place-items-center border-2 border-rule/40 bg-surface text-ink-muted transition-colors hover:text-ink"
        onClick={() => {
          enqueue(track)
          setNotice('end')
        }}
        title={t('queue.addToList', { title: track.title })}
        type="button"
      >
        <ListMusicIcon className="size-4" />
      </button>

      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('queue.actionsLabel', { title: track.title })}
        className="grid h-8 w-5 shrink-0 place-items-center border-2 border-l-0 border-rule/40 bg-surface text-ink-muted transition-colors hover:text-ink"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span aria-hidden="true" className="font-mono text-[0.6875rem]">
          ▾
        </span>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 z-30 mt-1 w-44 border-2 border-rule bg-surface shadow-[4px_4px_0_var(--color-rule)]"
          role="menu"
        >
          <button
            className="block w-full px-3 py-2 text-left font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors hover:bg-accent-soft"
            onClick={() => {
              enqueue(track)
              setOpen(false)
              setNotice('end')
            }}
            role="menuitem"
            type="button"
          >
            {t('queue.addToEnd')}
          </button>
          <button
            className="block w-full border-t border-border px-3 py-2 text-left font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors hover:bg-accent-soft"
            onClick={() => {
              playNext(track)
              setOpen(false)
              setNotice('next')
            }}
            role="menuitem"
            type="button"
          >
            {t('queue.playNext')}
          </button>
        </div>
      )}

      <span aria-live="polite" className="sr-only">
        {notice === null ? '' : notice === 'end' ? t('queue.addedToEnd') : t('queue.addedNext')}
      </span>
    </div>
  )
}
