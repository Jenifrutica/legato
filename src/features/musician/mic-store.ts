import { create } from 'zustand'
import { BeatDetector } from '../../player'
import { useTrackAnalysisStore } from './analysis-store'
import type { TrackAnalysis } from './analysis-store'
import { chordFromChroma, chromaFromMagnitudes, majorityChord } from './chord-detect'
import type { DetectedChord } from './chord-detect'
import {
  estimateBpmFromBeats,
  MicAnalyzer,
  MIC_LATENCY_SECONDS,
  phaseFromBeats,
} from './mic-analyzer'

export type MicError = 'denied' | 'unavailable' | 'unknown' | null

export type MicSessionOptions = {
  getTrackId: () => string | null
  getPosition: () => number | null
}

/** No se pisa un análisis de archivo local con lo oído por micrófono. */
export function shouldSaveMicChords(
  existing: TrackAnalysis | null,
  micChordCount: number,
): boolean {
  if (micChordCount < 2) {
    return false
  }
  const hasAudioAnalysis =
    (existing?.detectedChords?.length ?? 0) > 0 && existing?.detectedChordsSource === 'audio'
  return !hasAudioAnalysis
}

type Session = {
  trackId: string | null
  labels: Array<string | null>
  events: Array<{ time: number; chord: string }>
  beats: number[]
  lastBeatAt: number
}

function newSession(trackId: string | null): Session {
  return { trackId, labels: [], events: [], beats: [], lastBeatAt: 0 }
}

let analyzer: MicAnalyzer | null = null
let detector: BeatDetector | null = null
let timer: ReturnType<typeof setInterval> | null = null
let options: MicSessionOptions | null = null
let session = newSession(null)

export function getMicAnalyser(): MicAnalyzer | null {
  return analyzer !== null && analyzer.listening ? analyzer : null
}

function finalizeSession(): void {
  const trackId = session.trackId
  if (trackId === null) {
    return
  }

  const store = useTrackAnalysisStore.getState()
  const existing = store.records[trackId] ?? null

  if (shouldSaveMicChords(existing, session.events.length)) {
    const chords: DetectedChord[] = session.events.map((event, index) => ({
      time: event.time,
      duration: (session.events[index + 1]?.time ?? event.time + 2) - event.time,
      chord: event.chord,
    }))
    store.setDetectedChords(trackId, chords, 'mic')
  }

  const bpm = estimateBpmFromBeats(session.beats)
  if (bpm !== null) {
    if ((existing?.bpm ?? null) === null) {
      store.setBpm(trackId, bpm)
    }
    if ((existing?.beatOffset ?? null) === null) {
      store.setBeatOffset(trackId, phaseFromBeats(session.beats, bpm))
    }
  }

  if (session.beats.length >= 4 && (existing?.detectedBeats?.length ?? 0) === 0) {
    store.setDetectedBeats(trackId, session.beats)
  }
}

function poll(): void {
  const analyzerNow = analyzer
  if (analyzerNow === null || options === null) {
    return
  }

  const trackId = options.getTrackId()
  if (trackId !== session.trackId) {
    finalizeSession()
    session = newSession(trackId)
  }
  if (trackId === null) {
    return
  }

  const position = options.getPosition()
  if (position === null) {
    return
  }

  // Acordes: croma del espectro + voto mayoritario de la ventana.
  const levels = analyzerNow.getLevels()
  if (levels.length > 0) {
    const chroma = chromaFromMagnitudes(levels, analyzerNow.sampleRate, analyzerNow.frameSize)
    session.labels.push(chordFromChroma(chroma))
    if (session.labels.length > 5) {
      session.labels.shift()
    }
    const consensus = majorityChord(session.labels)
    if (consensus !== null) {
      if (consensus !== session.events[session.events.length - 1]?.chord) {
        session.events.push({ time: Math.max(0, position), chord: consensus })
      }
      useMicStore.setState({ liveChord: consensus })
    }
  }

  // Golpes: banda del bombo con el mismo detector y compensación de latencia.
  if (detector !== null) {
    const now = performance.now()
    const energy = detector.process(analyzerNow.getBeatBass(), now)
    if (energy > 0.75 && now - session.lastBeatAt > 250) {
      session.lastBeatAt = now
      session.beats.push(Math.max(0, position - MIC_LATENCY_SECONDS))
      const bpm = estimateBpmFromBeats(session.beats)
      if (bpm !== null) {
        useMicStore.setState({ bpm })
      }
    }
  }
}

type MicState = {
  status: 'idle' | 'requesting' | 'listening' | 'error'
  error: MicError
  liveChord: string | null
  bpm: number | null
  start: (sessionOptions: MicSessionOptions) => Promise<void>
  stop: () => void
}

export const useMicStore = create<MicState>((set) => ({
  status: 'idle',
  error: null,
  liveChord: null,
  bpm: null,

  start: async (sessionOptions) => {
    if (getMicAnalyser() !== null) {
      return
    }

    set({ status: 'requesting', error: null, liveChord: null, bpm: null })
    const created = new MicAnalyzer()
    const result = await created.start()

    if (!result.ok) {
      set({ status: 'error', error: result.error })
      return
    }

    analyzer = created
    options = sessionOptions
    detector = new BeatDetector('normal')
    session = newSession(sessionOptions.getTrackId())
    timer = setInterval(poll, 120)
    set({ status: 'listening', error: null })
  },

  stop: () => {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
    finalizeSession()
    analyzer?.stop()
    analyzer = null
    detector = null
    options = null
    session = newSession(null)
    set({ status: 'idle', liveChord: null, bpm: null })
  },
}))
