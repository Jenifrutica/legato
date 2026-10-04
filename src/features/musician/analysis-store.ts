import { create } from 'zustand'
import { clampBpm } from '../../player'
import type { DetectedChord } from './chord-detect'

export const KEY_OPTIONS = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

export const ALL_KEY_OPTIONS = [...KEY_OPTIONS, ...KEY_OPTIONS.map((key) => `${key}m`)] as const

export type TrackAnalysis = {
  trackId: string
  bpm: number | null
  key: string | null
  detectedChords?: DetectedChord[] | null
  updatedAt: number
}

type AnalysisState = {
  records: Record<string, TrackAnalysis>
  hydrate: (records: TrackAnalysis[]) => void
  setBpm: (trackId: string, bpm: number | null) => void
  setKey: (trackId: string, key: string | null) => void
  setDetectedChords: (trackId: string, chords: DetectedChord[] | null) => void
}

function recordFor(
  current: TrackAnalysis | undefined,
  trackId: string,
  patch: { bpm?: number | null; key?: string | null; detectedChords?: DetectedChord[] | null },
): TrackAnalysis {
  return {
    trackId,
    bpm: patch.bpm === undefined ? (current?.bpm ?? null) : patch.bpm,
    key: patch.key === undefined ? (current?.key ?? null) : patch.key,
    detectedChords:
      patch.detectedChords === undefined ? (current?.detectedChords ?? null) : patch.detectedChords,
    updatedAt: Date.now(),
  }
}

export const useTrackAnalysisStore = create<AnalysisState>((set) => ({
  records: {},

  hydrate: (records) => {
    const next: Record<string, TrackAnalysis> = {}
    for (const record of records) {
      next[record.trackId] = record
    }
    set({ records: next })
  },

  setBpm: (trackId, bpm) =>
    set((state) => ({
      records: {
        ...state.records,
        [trackId]: recordFor(state.records[trackId], trackId, {
          bpm: bpm === null ? null : clampBpm(bpm),
        }),
      },
    })),

  setKey: (trackId, key) =>
    set((state) => ({
      records: {
        ...state.records,
        [trackId]: recordFor(state.records[trackId], trackId, {
          key: key === null || key === '' ? null : key,
        }),
      },
    })),

  setDetectedChords: (trackId, chords) =>
    set((state) => ({
      records: {
        ...state.records,
        [trackId]: recordFor(state.records[trackId], trackId, { detectedChords: chords }),
      },
    })),
}))
