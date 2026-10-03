import { useEffect, useRef, useState } from 'react'
import type { LyricLine } from './lrc'
import { fetchLyrics, type LyricsQuery } from './provider'

export type LyricsStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export type LyricsState = {
  status: LyricsStatus
  lines: LyricLine[]
  source: 'lrclib' | null
}

const IDLE: LyricsState = { status: 'idle', lines: [], source: null }
const TIMEOUT_MS = 8_000

export function useLyrics(query: LyricsQuery | null): LyricsState {
  const [state, setState] = useState<LyricsState>(IDLE)
  const cache = useRef<Map<string, LyricLine[]>>(new Map())

  const key =
    query === null
      ? null
      : `${query.title}|${query.artist}|${query.album ?? ''}|${query.durationSeconds ?? ''}`

  useEffect(() => {
    if (query === null || key === null) {
      setState(IDLE)
      return
    }

    const cached = cache.current.get(key)
    if (cached !== undefined) {
      setState({ status: 'ready', lines: cached, source: 'lrclib' })
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
    setState({ status: 'loading', lines: [], source: null })

    void fetchLyrics(query, controller.signal).then((lines) => {
      if (controller.signal.aborted) {
        return
      }
      if (lines === null || lines.length === 0) {
        setState({ status: 'empty', lines: [], source: null })
        return
      }
      cache.current.set(key, lines)
      setState({ status: 'ready', lines, source: 'lrclib' })
    })

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
