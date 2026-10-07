import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../features/auth'
import { buildCapsule, usePlayLogStore, type CapsuleContext } from '../features/capsule'
import type { NostalgiaCapsule as NostalgiaCapsuleData } from '../features/capsule'
import { useLibraryStore } from '../features/library'
import { usePlaylistsStore } from '../features/playlists'
import { usePlayerStore } from '../player'
import { DiscMark, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon, XIcon } from './icons'

const SLIDE_MS = 15_000

const CONTEXT_KEYS = {
  mostPlayed: 'capsule.context.mostPlayed',
  forgotten: 'capsule.context.forgotten',
  oneYearAgo: 'capsule.context.oneYearAgo',
  newDiscovery: 'capsule.context.newDiscovery',
} as const satisfies Record<CapsuleContext, string>

function today(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function NostalgiaCapsule() {
  const { t } = useTranslation()
  const tracks = useLibraryStore((state) => state.tracks)
  const log = usePlayLogStore((state) => state.log)
  const { user } = useAuth()

  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<NostalgiaCapsuleData | null>(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [savedId, setSavedId] = useState<string | null>(null)
  const startedAt = useRef(0)

  const capsule = useMemo(
    () =>
      buildCapsule({
        tracks,
        log,
        date: today(),
        userId: user?.id ?? 'local',
        now: Date.now(),
      }),
    [tracks, log, user?.id],
  )

  // La cápsula se congela al abrir: registrar la escucha del fragmento
  // no debe reordenar las tarjetas a mitad de sesión.
  const active = session ?? capsule
  const slides = active.slides
  const total = slides.length
  const slide = slides[index] ?? null

  const close = useCallback(() => {
    setOpen(false)
    setSession(null)
    setPlaying(false)
    usePlayerStore.getState().pause()
  }, [])

  const goTo = useCallback(
    (nextIndex: number) => {
      if (slides.length === 0) {
        return
      }
      const bounded = (nextIndex + slides.length) % slides.length
      setIndex(bounded)
      setElapsed(0)
      startedAt.current = performance.now()
      setSavedId(null)
    },
    [slides.length],
  )

  const advance = useCallback(() => {
    if (index + 1 < slides.length) {
      goTo(index + 1)
    } else {
      close()
    }
  }, [close, goTo, index, slides.length])

  // El fragmento suena SOLO cuando el usuario lo pide con un botón: nada
  // se reproduce de forma automática al abrir (ni al cambiar de tarjeta).
  useEffect(() => {
    if (!open || !playing || slide === null || tracks.length === 0) {
      return
    }

    startedAt.current = performance.now()
    setElapsed(0)
    usePlayerStore.getState().playTracks(tracks, slide.trackId, null)
    const seekTimer = window.setTimeout(
      () => usePlayerStore.getState().seek(slide.startSeconds),
      300,
    )

    return () => window.clearTimeout(seekTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, playing, slide?.trackId, tracks.length])

  // Temporizador de 15 s por tarjeta (solo mientras se está reproduciendo).
  useEffect(() => {
    if (!open || !playing || slide === null) {
      return
    }

    const interval = window.setInterval(() => {
      if (performance.now() - startedAt.current >= SLIDE_MS) {
        advance()
      } else {
        setElapsed(performance.now() - startedAt.current)
      }
    }, 120)

    return () => window.clearInterval(interval)
  }, [advance, open, playing, slide])

  const togglePlaying = useCallback(() => {
    setPlaying((value) => {
      const next = !value
      if (!next) {
        usePlayerStore.getState().pause()
      } else {
        startedAt.current = performance.now()
        setElapsed(0)
      }
      return next
    })
  }, [])

  // Teclado del visor: Esc cierra, flechas navegan, espacio reproduce/pausa.
  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
      } else if (event.key === 'ArrowLeft') {
        goTo(index - 1)
      } else if (event.key === 'ArrowRight') {
        goTo(index + 1)
      } else if (event.key === ' ') {
        event.preventDefault()
        togglePlaying()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close, goTo, index, open, togglePlaying])

  function playFull() {
    if (slide === null) {
      return
    }
    usePlayerStore.getState().playTracks(tracks, slide.trackId, null)
    usePlayerStore.getState().seek(0)
    close()
  }

  function saveFavorite() {
    if (slide === null) {
      return
    }
    const track = tracks.find((item) => item.id === slide.trackId)
    if (track === undefined) {
      return
    }

    const store = usePlaylistsStore.getState()
    const name = t('capsule.favorites')
    let target = store.playlists.find((playlist) => playlist.name === name)
    if (target === undefined) {
      const id = store.createPlaylist(name)
      target = usePlaylistsStore.getState().playlists.find((playlist) => playlist.id === id)
    }
    if (target !== undefined) {
      usePlaylistsStore.getState().addTrackToPlaylist(target.id, track)
      setSavedId(track.id)
    }
  }

  return (
    <>
      <div aria-label={t('capsule.title')} className="flex items-center gap-2" role="group">
        {(total === 0 ? [null] : slides).map((item, tileIndex) => (
          <button
            aria-label={item === null ? t('capsule.open') : `${t('capsule.open')}: ${item.title}`}
            className="relative size-11 shrink-0 border-2 border-rule bg-surface-2 shadow-[3px_3px_0_var(--color-rule)] transition-transform hover:-translate-y-0.5"
            key={item?.trackId ?? 'vacia'}
            onClick={() => {
              setSession(capsule)
              setIndex(tileIndex)
              setSavedId(null)
              setOpen(true)
            }}
            type="button"
          >
            {item?.artworkUrl != null ? (
              <img alt="" className="size-full object-cover" src={item.artworkUrl} />
            ) : (
              <span className="grid size-full place-items-center text-ink-muted">
                <DiscMark className="size-5" />
              </span>
            )}
            {tileIndex === 0 && item !== null && (
              <span className="absolute -top-1.5 -right-1.5 size-2.5 border border-rule bg-accent" />
            )}
          </button>
        ))}
      </div>

      {open &&
        createPortal(
          <div
            aria-label={t('capsule.title')}
            aria-modal="true"
            className="fixed inset-0 z-50 bg-ink text-bg"
            role="dialog"
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-1/3 h-1/3 bg-accent" />

            <div className="relative flex h-full flex-col">
              <header className="flex items-center gap-3 p-4">
                <span className="font-mono text-[0.6875rem] tracking-[0.2em] uppercase">
                  {t('capsule.title')}
                </span>
                <span className="ml-auto font-mono text-xs text-bg/70">
                  {total > 0 ? t('capsule.progress', { index: index + 1, total }) : ''}
                </span>
                <button
                  aria-label={t('capsule.close')}
                  className="border-2 border-bg/60 p-2 text-bg transition-transform hover:-translate-y-0.5"
                  onClick={close}
                  type="button"
                >
                  <XIcon className="size-4" />
                </button>
              </header>

              <div className="flex flex-1 items-center justify-center px-6">
                {slide === null ? (
                  <p className="max-w-sm border-2 border-bg/40 bg-surface p-6 text-center text-sm text-ink">
                    {t('capsule.empty')}
                  </p>
                ) : (
                  <article className="w-full max-w-md border-2 border-rule bg-surface text-ink shadow-[8px_8px_0_var(--color-rule)]">
                    <div className="relative aspect-square w-full overflow-hidden border-b-2 border-rule bg-surface-2">
                      {slide.artworkUrl !== null ? (
                        <img
                          alt={t('vinyl.coverAlt', { title: slide.title })}
                          className="size-full object-cover"
                          src={slide.artworkUrl}
                        />
                      ) : (
                        <span className="grid size-full place-items-center text-ink-muted">
                          <DiscMark className="size-16" />
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-accent-ink uppercase">
                        {t(CONTEXT_KEYS[slide.context])}
                      </p>
                      <h2 className="mt-2 font-display text-3xl leading-[0.95] font-black uppercase">
                        {slide.title}
                      </h2>
                      <p className="mt-2 text-sm text-ink-muted">
                        {slide.artist}
                        {slide.album === null ? '' : ` · ${slide.album}`}
                      </p>
                      <p className="mt-3 font-serif text-base">
                        {slide.playCount === 0
                          ? t('capsule.noteZero')
                          : t('capsule.note', { count: slide.playCount })}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          className="border-2 border-rule bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-[3px_3px_0_var(--color-rule)] transition-transform hover:-translate-y-0.5"
                          onClick={playFull}
                          type="button"
                        >
                          {t('capsule.full')}
                        </button>
                        <button
                          className="border-2 border-rule bg-surface px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
                          onClick={saveFavorite}
                          type="button"
                        >
                          {savedId === slide.trackId ? t('capsule.saved') : t('capsule.save')}
                        </button>
                        <button
                          className="border-2 border-rule bg-surface px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
                          onClick={() => {
                            const track = tracks.find((item) => item.id === slide.trackId)
                            if (track !== undefined) {
                              usePlayerStore.getState().enqueue(track)
                            }
                          }}
                          type="button"
                        >
                          {t('queue.addToEnd')}
                        </button>
                      </div>
                    </div>
                  </article>
                )}
              </div>

              <footer className="flex items-center gap-4 p-6">
                <button
                  aria-label={t('capsule.prev')}
                  className="border-2 border-bg/60 p-3 text-bg disabled:opacity-40"
                  disabled={total === 0}
                  onClick={() => goTo(index - 1)}
                  type="button"
                >
                  <SkipBackIcon className="size-5" />
                </button>
                <button
                  aria-label={playing ? t('capsule.pause') : t('capsule.play')}
                  className="border-2 border-bg/60 bg-accent p-3 text-on-accent disabled:opacity-40"
                  disabled={total === 0}
                  onClick={togglePlaying}
                  type="button"
                >
                  {playing ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
                </button>
                <button
                  aria-label={t('capsule.next')}
                  className="border-2 border-bg/60 p-3 text-bg disabled:opacity-40"
                  disabled={total === 0}
                  onClick={() => goTo(index + 1)}
                  type="button"
                >
                  <SkipForwardIcon className="size-5" />
                </button>

                <span aria-hidden="true" className="relative ml-auto h-1.5 flex-1 bg-bg/20">
                  <span
                    className="absolute inset-y-0 left-0 bg-accent"
                    style={{ width: `${Math.min(100, (elapsed / SLIDE_MS) * 100)}%` }}
                  />
                </span>
              </footer>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
