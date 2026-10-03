import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useSpotifyStore } from '../features/sources'
import { usePlayerStore } from '../player'
import { DiscMark, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from './icons'

const STORAGE_KEY = 'legato.mini'
const SIZE = 64
const MARGIN = 12

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

  const spotifyActive = spotifyPlayback !== null
  const externalCurrent =
    currentTrack !== null &&
    (currentTrack.external === true || currentTrack.sourceUrl.startsWith('spotify:'))
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const title = spotifyActive ? spotifyPlayback.title : (currentTrack?.title ?? '')
  const artist = spotifyActive ? spotifyPlayback.artist : (currentTrack?.artist ?? '')
  const artworkUrl = spotifyActive ? spotifyPlayback.artworkUrl : (currentTrack?.artworkUrl ?? null)

  return (
    <div className="flex h-dvh items-center gap-3 bg-ink px-3 text-bg">
      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-rule bg-surface-2">
        {artworkUrl !== null ? (
          <img alt="" className="size-full object-cover" src={artworkUrl} />
        ) : (
          <DiscMark className="size-5 text-ink-muted" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-black uppercase">{title}</p>
        <p className="truncate text-xs text-bg/70">{artist}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          aria-label={t('player.previous')}
          className="border-2 border-bg/50 p-2 text-bg transition-transform hover:-translate-y-0.5"
          onClick={() => {
            if (spotifyActive && !externalCurrent) {
              void spotifyPrevious()
            } else {
              previous()
            }
          }}
          type="button"
        >
          <SkipBackIcon className="size-4" />
        </button>
        <button
          aria-label={isPlaying ? t('player.pause') : t('player.play')}
          className="border-2 border-rule bg-accent p-2 text-on-accent transition-transform hover:-translate-y-0.5"
          onClick={() => {
            if (spotifyActive) {
              void spotifyToggle()
            } else {
              void toggle()
            }
          }}
          type="button"
        >
          {isPlaying ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
        </button>
        <button
          aria-label={t('player.next')}
          className="border-2 border-bg/50 p-2 text-bg transition-transform hover:-translate-y-0.5"
          onClick={() => {
            if (spotifyActive && !externalCurrent) {
              void spotifyNext()
            } else {
              next()
            }
          }}
          type="button"
        >
          <SkipForwardIcon className="size-4" />
        </button>
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

  if (!hasTrack) {
    return null
  }

  async function openPip() {
    const api = getPipApi()
    if (api === null) {
      return
    }

    try {
      const pipWindow = await api.requestWindow({ width: 320, height: 132 })
      for (const node of Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))) {
        pipWindow.document.head.appendChild(node.cloneNode(true))
      }
      pipWindow.document.body.style.margin = '0'
      pipWindow.document.title = 'Legato'
      pipWindow.addEventListener('pagehide', () => setPip(null))
      setPip(pipWindow)
    } catch {
      // el usuario canceló la ventana
    }
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
