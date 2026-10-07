import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLyricsStore } from '../features/lyrics'
import { useMusicianStore } from '../features/musician'
import { usePlayerStore } from '../player'
import { ChordsPanel } from './ChordsPanel'
import { XIcon } from './icons'
import { useMusiciansPanelStore, usePanelVisibilityStore } from './panel-tabs'
import { MetronomePanel } from './MetronomePanel'
import { NotesPanel } from './NotesPanel'
import { StructureView } from './StructureView'
import { TrackAnalysisPanel } from './TrackAnalysisPanel'

const STORAGE_KEY = 'legato.musicians'
// Posición heredada por defecto (antes 420); se migra a la nueva para que la
// pestaña baje aunque ya hubiera un valor guardado sin haberla arrastrado.
const LEGACY_DEFAULT_TOP = 420
const DEFAULT_TOP =
  typeof window === 'undefined' ? LEGACY_DEFAULT_TOP : Math.round(window.innerHeight * 0.62)

type SavedState = {
  open: boolean
  top: number
}

function readSaved(): SavedState {
  if (typeof localStorage === 'undefined') {
    return { open: false, top: DEFAULT_TOP }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<SavedState>
      const top = Number(parsed.top)
      const valid = Number.isFinite(top) && top !== LEGACY_DEFAULT_TOP
      return { open: parsed.open === true, top: valid ? top : DEFAULT_TOP }
    }
  } catch {
    // ignorar almacenamiento no disponible
  }

  return { open: false, top: DEFAULT_TOP }
}

/**
 * Panel de músicos: una hoja deslizante con pestaña arrastrable.
 * Se minimiza (pestaña sola) o se maximiza (hoja completa); la posición
 * de la pestaña y el estado se recuerdan.
 */
export function MusiciansPanel() {
  const { t } = useTranslation()
  const saved = useRef(readSaved())
  const open = useMusiciansPanelStore((state) => state.open)
  const setOpen = useMusiciansPanelStore((state) => state.setOpen)
  const collapsed = usePanelVisibilityStore((state) => state.collapsed)
  const toggleCollapsed = usePanelVisibilityStore((state) => state.toggle)
  // La "costura" del panel: a 25/27rem cuando está abierto; al borde si está plegado.
  const seamRight = collapsed ? 'lg:right-0' : 'lg:right-[25rem] xl:right-[27rem]'
  const [tabTop, setTabTop] = useState(saved.current.top)
  const drag = useRef<{ startY: number; startTop: number; moved: boolean } | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  const queueStructure = usePlayerStore((state) => state.queueStructure)
  const currentTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null)
  const lyricsEnabled = useLyricsStore((state) => state.enabled)
  const toggleLyrics = useLyricsStore((state) => state.toggle)
  const musicianEnabled = useMusicianStore((state) => state.enabled)
  const [tab, setTab] = useState<'structure' | 'practice' | 'chords' | 'notes'>('structure')
  const activeTab = musicianEnabled ? tab : 'structure'

  useEffect(() => {
    if (saved.current.open) {
      setOpen(true)
    }
    // Solo al montar: restaura el estado guardado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      setOpen(!open)
    }
  }

  return (
    <>
      <div
        className={`fixed z-40 hidden flex-col gap-5 lg:flex ${seamRight}`}
        style={{ top: tabTop }}
      >
        <button
          aria-expanded={open}
          className="cursor-grab border-2 border-r-0 border-rule bg-surface px-2 py-4 font-mono text-[0.6875rem] tracking-[0.24em] text-ink uppercase shadow-[-3px_3px_0_var(--color-rule)] select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ writingMode: 'vertical-rl', touchAction: 'none' }}
          title={t('structure.region')}
          type="button"
        >
          {t('playlists.structure')}
        </button>

        <button
          aria-label={collapsed ? t('panel.show') : t('panel.hide')}
          className="grid cursor-pointer place-items-center border-2 border-r-0 border-rule bg-surface px-2 py-2 text-ink shadow-[-3px_3px_0_var(--color-rule)] transition-colors hover:bg-accent-soft"
          onClick={toggleCollapsed}
          style={{ touchAction: 'none' }}
          title={collapsed ? t('panel.show') : t('panel.hide')}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {collapsed ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
          </svg>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/20"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            aria-label={t('structure.region')}
            aria-modal="true"
            className="absolute top-0 right-0 flex h-dvh w-full flex-col border-l-2 border-rule bg-surface lg:w-[min(32rem,92vw)]"
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
                  {activeTab === 'structure'
                    ? `${queueStructure.length} nodos · doble enlace`
                    : t('musician.subtitle')}
                </p>
              </div>
              <button
                aria-pressed={lyricsEnabled}
                className={`border-2 border-rule px-3 py-2 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-transform hover:-translate-y-0.5 ${
                  lyricsEnabled ? 'bg-accent text-on-accent' : 'bg-surface text-ink-muted'
                }`}
                onClick={toggleLyrics}
                type="button"
              >
                {t('lyrics.toggle')}
              </button>
              <button
                aria-label={t('cookies.close')}
                className="border-2 border-rule bg-surface p-2 text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                onClick={() => setOpen(false)}
                type="button"
              >
                <XIcon className="size-4" />
              </button>
            </header>

            {musicianEnabled && (
              <div
                aria-label={t('musician.tabs')}
                className="flex flex-wrap border-b-2 border-rule"
                role="tablist"
              >
                {(
                  [
                    ['structure', t('playlists.structure')],
                    ['practice', t('musician.practice')],
                    ['chords', t('chords.tab')],
                    ['notes', t('notes.tab')],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    aria-selected={activeTab === id}
                    className={`px-4 py-2 font-mono text-[0.6875rem] tracking-[0.12em] uppercase transition-colors ${
                      activeTab === id
                        ? 'bg-accent text-on-accent'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                    key={id}
                    onClick={() => setTab(id)}
                    role="tab"
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto">
              {activeTab === 'structure' && (
                <StructureView currentId={currentTrackId} nodes={queueStructure} />
              )}
              {activeTab === 'practice' && (
                <>
                  <TrackAnalysisPanel />
                  <div className="border-t-2 border-rule" />
                  <MetronomePanel />
                </>
              )}
              {activeTab === 'chords' && <ChordsPanel />}
              {activeTab === 'notes' && <NotesPanel />}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
