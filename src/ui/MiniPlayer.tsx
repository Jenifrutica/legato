import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useSpotifyStore } from '../features/sources'
import { usePlayerStore } from '../player'
import { DiscVideo } from './DiscVideo'
import { useVideoPrefs } from './video-prefs'
import {
  DiscMark,
  PauseFillIcon,
  PauseIcon,
  PlayFillIcon,
  PlayIcon,
  SkipBackFillIcon,
  SkipForwardFillIcon,
} from './icons'

const STORAGE_KEY = 'legato.mini'
const SIZE = 64
const MARGIN = 12
const PIP_SIZE = 300

type Offset = { right: number; bottom: number }

type PipApi = {
  requestWindow: (options: { width: number; height: number }) => Promise<Window>
}

function getPipApi(): PipApi | null {
  if (typeof window === 'undefined') {
    return null
  }

  const api = (window as unknown as { documentPictureInPicture?: PipApi }).documentPictureInPicture
  return api ?? null
}

function readOffset(): Offset {
  if (typeof localStorage === 'undefined') {
    return { right: 20, bottom: 20 }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<Offset>
      if (typeof parsed.right === 'number' && typeof parsed.bottom === 'number') {
        return { right: parsed.right, bottom: parsed.bottom }
      }
    }
  } catch {
    // sin persistencia
  }

  return { right: 20, bottom: 20 }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Reproductor circular flotante: la portada (o el video) en un disco. Los
 * controles aparecen al pasar el mouse; en video, el disco queda quieto y
 * reproduce el mp4.
 */
function PipContent() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const toggle = usePlayerStore((state) => state.toggle)
  const next = usePlayerStore((state) => state.next)
  const previous = usePlayerStore((state) => state.previous)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)
  const spotifyToggle = useSpotifyStore((state) => state.toggle)
  const spotifyNext = useSpotifyStore((state) => state.next)
  const spotifyPrevious = useSpotifyStore((state) => state.previous)
  const videoInDisc = useVideoPrefs((state) => state.inDisc)
  const [hover, setHover] = useState(false)

  const spotifyActive = spotifyPlayback !== null
  const externalCurrent =
    currentTrack !== null &&
    (currentTrack.external === true || currentTrack.sourceUrl.startsWith('spotify:'))
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const artworkUrl = spotifyActive ? spotifyPlayback.artworkUrl : (currentTrack?.artworkUrl ?? null)
  const isVideo = !spotifyActive && currentTrack?.mediaType === 'video'
  const showVideo = isVideo && videoInDisc && currentTrack !== null

  function handlePrevious() {
    if (spotifyActive && !externalCurrent) {
      void spotifyPrevious()
    } else {
      previous()
    }
  }

  function handleNext() {
    if (spotifyActive && !externalCurrent) {
      void spotifyNext()
    } else {
      next()
    }
  }

  function handleToggle() {
    if (spotifyActive) {
      void spotifyToggle()
    } else {
      void toggle()
    }
  }

  return (
    <div className="grid h-dvh w-screen place-items-center bg-transparent">
      <div
        className="relative aspect-square w-[96vmin] overflow-hidden rounded-full border-2 border-rule bg-surface-2"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {showVideo ? (
          <DiscVideo src={currentTrack.sourceUrl} />
        ) : artworkUrl !== null ? (
          <img
            alt=""
            className="motion-reduce:animate-none absolute inset-0 size-full animate-disc object-cover"
            src={artworkUrl}
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-ink-muted">
            <DiscMark className="size-20" />
          </span>
        )}

        <div
          className={`absolute inset-0 grid grid-cols-3 place-items-center bg-ink/35 text-bg transition-opacity duration-200 ${
            hover ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            aria-label={t('player.previous')}
            className="grid size-14 place-items-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] transition-transform hover:scale-110 active:scale-95"
            onClick={handlePrevious}
            type="button"
          >
            <SkipBackFillIcon className="size-8" />
          </button>
          <button
            aria-label={isPlaying ? t('player.pause') : t('player.play')}
            className="grid size-16 place-items-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] transition-transform hover:scale-110 active:scale-95"
            onClick={handleToggle}
            type="button"
          >
            {isPlaying ? (
              <PauseFillIcon className="size-10" />
            ) : (
              <PlayFillIcon className="size-10" />
            )}
          </button>
          <button
            aria-label={t('player.next')}
            className="grid size-14 place-items-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] transition-transform hover:scale-110 active:scale-95"
            onClick={handleNext}
            type="button"
          >
            <SkipForwardFillIcon className="size-8" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function MiniPlayer() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const toggle = usePlayerStore((state) => state.toggle)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)
  const spotifyToggle = useSpotifyStore((state) => state.toggle)

  const [offset, setOffset] = useState<Offset>(() => readOffset())
  const [pip, setPip] = useState<Window | null>(null)
  const drag = useRef<{ x: number; y: number; start: Offset; moved: boolean } | null>(null)
  const pipWindowRef = useRef<Window | null>(null)
  const openPipRef = useRef<() => void>(() => {})
  const wasPlayingRef = useRef(false)

  const spotifyActive = spotifyPlayback !== null
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const title = spotifyActive ? spotifyPlayback.title : (currentTrack?.title ?? null)
  const artworkUrl = spotifyActive ? spotifyPlayback.artworkUrl : (currentTrack?.artworkUrl ?? null)
  const hasTrack = spotifyActive || currentTrack !== null
  const canFloat = getPipApi() !== null

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offset))
    } catch {
      // sin persistencia
    }
  }, [offset])

  async function openPip() {
    const api = getPipApi()
    const existing = pipWindowRef.current
    if (api === null || (existing !== null && !existing.closed)) {
      return
    }

    try {
      const pipWindow = await api.requestWindow({ width: PIP_SIZE, height: PIP_SIZE })
      for (const node of Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))) {
        pipWindow.document.head.appendChild(node.cloneNode(true))
      }
      pipWindow.document.documentElement.style.background = 'transparent'
      pipWindow.document.body.style.margin = '0'
      pipWindow.document.body.style.background = 'transparent'
      pipWindow.document.title = 'Legato'
      const clear = () => {
        pipWindowRef.current = null
        setPip(null)
      }
      pipWindow.addEventListener('pagehide', clear)
      pipWindow.addEventListener('unload', clear)
      pipWindowRef.current = pipWindow
      setPip(pipWindow)
    } catch {
      // el navegador exige un gesto del usuario o el usuario canceló
    }
  }

  openPipRef.current = () => {
    void openPip()
  }

  // Si el usuario cierra la ventanita, se limpia para poder reabrirla luego.
  useEffect(() => {
    if (pip === null) {
      return
    }
    const timer = window.setInterval(() => {
      if (pip.closed) {
        pipWindowRef.current = null
        setPip(null)
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [pip])

  // Como Spotify: al ocultarse la pestaña intenta abrir (o reabrir) el flotante.
  useEffect(() => {
    if (!canFloat || !hasTrack) {
      return
    }
    const onVisibilityChange = () => {
      const existing = pipWindowRef.current
      if (document.visibilityState === 'hidden' && (existing === null || existing.closed)) {
        openPipRef.current()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [canFloat, hasTrack])

  // Y al empezar a reproducir (el play es un gesto): si el flotante no está,
  // se abre; así, si lo cierras, vuelve en cuanto das play otra vez.
  useEffect(() => {
    if (!canFloat || !hasTrack) {
      return
    }
    const existing = pipWindowRef.current
    if (isPlaying && !wasPlayingRef.current && (existing === null || existing.closed)) {
      openPipRef.current()
    }
    wasPlayingRef.current = isPlaying
  }, [canFloat, hasTrack, isPlaying])

  if (!hasTrack) {
    return null
  }

  function togglePlayback() {
    if (spotifyActive) {
      void spotifyToggle()
    } else {
      void toggle()
    }
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    drag.current = { x: event.clientX, y: event.clientY, start: offset, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current
    if (current === null) {
      return
    }

    const dx = event.clientX - current.x
    const dy = event.clientY - current.y
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      current.moved = true
    }

    if (current.moved) {
      setOffset({
        right: clamp(current.start.right - dx, MARGIN, window.innerWidth - SIZE - MARGIN),
        bottom: clamp(current.start.bottom - dy, MARGIN, window.innerHeight - SIZE - MARGIN),
      })
    }
  }

  function onPointerUp() {
    const current = drag.current
    drag.current = null
    if (current === null || current.moved) {
      return
    }

    togglePlayback()
  }

  return (
    <>
      {pip === null && (
        <div
          className="fixed z-[60] hidden flex-col items-end gap-1 lg:flex"
          style={{ right: offset.right, bottom: offset.bottom }}
        >
          {canFloat && (
            <button
              aria-label={t('player.float')}
              className="grid size-6 place-items-center border-2 border-rule bg-surface text-ink-muted shadow-[2px_2px_0_var(--color-rule)] transition-transform hover:-translate-y-0.5 hover:text-ink"
              onClick={() => void openPip()}
              title={t('player.float')}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <rect height="12" width="14" x="3" y="5" />
                <path d="M21 9v10H9" />
              </svg>
            </button>
          )}

          <button
            aria-label={`${isPlaying ? t('player.pause') : t('player.play')} · ${title ?? ''}`}
            className="relative size-16 cursor-grab touch-none overflow-hidden rounded-full border-2 border-rule bg-surface shadow-[5px_5px_0_var(--color-rule)] active:cursor-grabbing"
            onClick={(event) => {
              if (event.detail === 0) {
                togglePlayback()
              }
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            title={title ?? ''}
            type="button"
          >
            {artworkUrl !== null ? (
              <img
                alt=""
                className="motion-reduce:animate-none absolute inset-0 size-full animate-disc object-cover"
                src={artworkUrl}
                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center bg-surface-2 text-ink-muted">
                <DiscMark className="size-6" />
              </span>
            )}

            <span className="absolute inset-0 grid place-items-center bg-ink/35 text-bg">
              {isPlaying ? <PauseIcon className="size-6" /> : <PlayIcon className="size-6" />}
            </span>
          </button>
        </div>
      )}

      {pip !== null && createPortal(<PipContent />, pip.document.body)}
    </>
  )
}
