import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlayerStore } from '../player'
import { XIcon } from './icons'
import { StructureView } from './StructureView'

const STORAGE_KEY = 'legato.musicians'

type SavedState = {
  open: boolean
  top: number
}

function readSaved(): SavedState {
  if (typeof localStorage === 'undefined') {
    return { open: false, top: 420 }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<SavedState>
      const top = Number(parsed.top)
      return { open: parsed.open === true, top: Number.isFinite(top) ? top : 420 }
    }
  } catch {
    // ignorar almacenamiento no disponible
  }

  return { open: false, top: 420 }
}

/**
 * Panel de músicos: una hoja deslizante con pestaña arrastrable.
 * Se minimiza (pestaña sola) o se maximiza (hoja completa); la posición
 * de la pestaña y el estado se recuerdan.
 */
export function MusiciansPanel() {
  const { t } = useTranslation()
  const saved = useRef(readSaved())
  const [open, setOpen] = useState(saved.current.open)
  const [tabTop, setTabTop] = useState(saved.current.top)
  const drag = useRef<{ startY: number; startTop: number; moved: boolean } | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  const queueStructure = usePlayerStore((state) => state.queueStructure)
  const currentTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null)

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ open, top: Math.round(tabTop) } satisfies SavedState),
      )
    } catch {
      // sin persistencia
    }
  }, [open, tabTop])

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    sheetRef.current?.focus()
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    drag.current = { startY: event.clientY, startTop: tabTop, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current
    if (current === null) {
      return
    }

    const delta = event.clientY - current.startY
    if (Math.abs(delta) > 4) {
      current.moved = true
    }
    const maxTop = typeof window === 'undefined' ? 600 : window.innerHeight - 140
    setTabTop(Math.min(Math.max(72, current.startTop + delta), maxTop))
  }

  function onPointerUp() {
    const current = drag.current
    drag.current = null
    if (current !== null && !current.moved) {
      setOpen((value) => !value)
    }
  }

  return (
    <>
      <button
        aria-expanded={open}
        className="fixed right-0 z-40 hidden cursor-grab border-2 border-r-0 border-rule bg-surface px-1.5 py-4 font-mono text-[0.6875rem] tracking-[0.24em] text-ink uppercase shadow-[-3px_3px_0_var(--color-rule)] select-none active:cursor-grabbing lg:right-[25rem] lg:block xl:right-[27rem]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ top: tabTop, writingMode: 'vertical-rl', touchAction: 'none' }}
        title={t('structure.region')}
        type="button"
      >
        {t('playlists.structure')}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 hidden bg-ink/20 lg:block"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            aria-label={t('structure.region')}
            aria-modal="true"
            className="absolute top-0 right-0 flex h-dvh w-[min(32rem,92vw)] flex-col border-l-2 border-rule bg-surface"
            onClick={(event) => event.stopPropagation()}
            ref={sheetRef}
            role="dialog"
            tabIndex={-1}
          >
            <header className="flex items-center gap-3 border-b-2 border-rule px-4 py-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-black tracking-[0.06em] uppercase">
                  {t('playlists.structure')}
                </h2>
                <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
                  {queueStructure.length} nodos · doble enlace
                </p>
              </div>
              <button
                aria-label={t('cookies.close')}
                className="border-2 border-rule bg-surface p-2 text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                onClick={() => setOpen(false)}
                type="button"
              >
                <XIcon className="size-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <StructureView currentId={currentTrackId} nodes={queueStructure} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
