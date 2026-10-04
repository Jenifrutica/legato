import { beforeEach, describe, expect, it } from 'vitest'
import { useTrackAnalysisStore } from './analysis-store'

beforeEach(() => {
  useTrackAnalysisStore.getState().hydrate([])
})

describe('store de análisis por pista', () => {
  it('hidrata registros y limita el BPM', () => {
    useTrackAnalysisStore.getState().hydrate([{ trackId: 'a', bpm: 90, key: 'Am', updatedAt: 1 }])
    expect(useTrackAnalysisStore.getState().records.a?.bpm).toBe(90)

    useTrackAnalysisStore.getState().setBpm('a', 999)
    expect(useTrackAnalysisStore.getState().records.a?.bpm).toBe(240)
  })

  it('crea el registro al fijar la tonalidad y permite limpiarla', () => {
    useTrackAnalysisStore.getState().setKey('b', 'C')
    expect(useTrackAnalysisStore.getState().records.b).toMatchObject({ bpm: null, key: 'C' })

    useTrackAnalysisStore.getState().setKey('b', null)
    expect(useTrackAnalysisStore.getState().records.b?.key).toBeNull()
  })

  it('mantiene el BPM al cambiar la tonalidad y permite borrar el BPM', () => {
    useTrackAnalysisStore.getState().setBpm('c', 120)
    useTrackAnalysisStore.getState().setKey('c', 'G')
    expect(useTrackAnalysisStore.getState().records.c?.bpm).toBe(120)

    useTrackAnalysisStore.getState().setBpm('c', null)
    expect(useTrackAnalysisStore.getState().records.c?.bpm).toBeNull()
  })

  it('guarda y borra los acordes detectados sin perder el resto', () => {
    useTrackAnalysisStore.getState().setDetectedChords('d', [{ time: 0, duration: 2, chord: 'C' }])
    useTrackAnalysisStore.getState().setBpm('d', 100)

    expect(useTrackAnalysisStore.getState().records.d?.detectedChords).toEqual([
      { time: 0, duration: 2, chord: 'C' },
    ])
    expect(useTrackAnalysisStore.getState().records.d?.bpm).toBe(100)

    useTrackAnalysisStore.getState().setDetectedChords('d', null)
    expect(useTrackAnalysisStore.getState().records.d?.detectedChords).toBeNull()
    expect(useTrackAnalysisStore.getState().records.d?.bpm).toBe(100)
  })
})
