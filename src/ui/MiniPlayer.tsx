import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSpotifyStore } from '../features/sources'
import { usePlayerStore } from '../player'
import { DiscMark, PauseIcon, PlayIcon } from './icons'

const STORAGE_KEY = 'legato.mini'
const SIZE = 64
const MARGIN = 12

type Offset = { right: number; bottom: number }

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

export function MiniPlayer() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const status = usePlayerStore((state) => state.status)
  const toggle = usePlayerStore((state) => state.toggle)
  const spotifyPlayback = useSpotifyStore((state) => state.playback)
  const spotifyToggle = useSpotifyStore((state) => state.toggle)
  const [offset, setOffset] = useState<Offset>(() => readOffset())
  const drag = useRef<{ x: number; y: number; start: Offset; moved: boolean } | null>(null)

  const spotifyActive = spotifyPlayback !== null
  const isPlaying = spotifyActive ? !spotifyPlayback.paused : status === 'playing'
  const title = spotifyActive ? spotifyPlayback.title : (currentTrack?.title ?? null)
  const artworkUrl = spotifyActive
    ? spotifyPlayback.artworkUrl
    : (currentTrack?.artworkUrl ?? null)
  const hasTrack = spotifyActive || currentTrack !== null

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

    if (spotifyActive) {
      void spotifyToggle()
    } else {
      void toggle()
    }
  }

  return (
    <button
      aria-label={`${isPlaying ? t('player.pause') : t('player.play')} · ${title ?? ''}`}
      className="fixed z-40 hidden size-16 cursor-grab touch-none overflow-hidden rounded-full border-2 border-rule bg-surface shadow-[5px_5px_0_var(--color-rule)] active:cursor-grabbing lg:block"
      onClick={(event) => {
        if (event.detail === 0) {
          if (spotifyActive) {
            void spotifyToggle()
          } else {
            void toggle()
          }
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ right: offset.right, bottom: offset.bottom }}
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
  )
}
