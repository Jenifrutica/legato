import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDuration, useLibraryStore } from '../features/library'
import { parseChordPro, transposeSong, useChordStore } from '../features/musician'
import {
  chordsFromSpotifySegments,
  detectBpmFromBlob,
  detectChordsFromBlob,
  spotifyKeyName,
  useTrackAnalysisStore,
} from '../features/musician'
import type { ChordProLine, ChordToken, DetectedChord } from '../features/musician'
import { useLyrics } from '../features/lyrics'
import {
  fetchSpotifyAudioAnalysis,
  fetchSpotifyTrackPreview,
  isSpotifyConnected,
} from '../features/sources'
import { usePlayerStore } from '../player'

const SECTION_KEYS = {
  chorus: 'chords.sections.chorus',
  verse: 'chords.sections.verse',
  bridge: 'chords.sections.bridge',
  tab: 'chords.sections.tab',
} as const

function chordAt(events: DetectedChord[], time: number): string | null {
  let found: string | null = null
  for (const event of events) {
    if (event.time <= time + 0.05) {
      found = event.chord
    } else {
      break
    }
  }
  return found
}

export function ChordsPanel() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const trackId = currentTrack?.id ?? null
  const libraryTrack = useLibraryStore((state) =>
    trackId === null ? null : (state.tracks.find((item) => item.id === trackId) ?? null),
  )
  const record = useTrackAnalysisStore((state) =>
    trackId === null ? null : (state.records[trackId] ?? null),
  )
  const setDetectedChords = useTrackAnalysisStore((state) => state.setDetectedChords)
  const setDetectedBeats = useTrackAnalysisStore((state) => state.setDetectedBeats)
  const setBpm = useTrackAnalysisStore((state) => state.setBpm)
  const setKey = useTrackAnalysisStore((state) => state.setKey)
  const setText = useChordStore((state) => state.setText)
  const clearSheet = useChordStore((state) => state.clear)
  const [draft, setDraft] = useState('')
  const [semitones, setSemitones] = useState(0)
  const [detecting, setDetecting] = useState<'local' | 'spotify' | null>(null)
  const [spotifyError, setSpotifyError] = useState<string | null>(null)
  const [spotifyNotice, setSpotifyNotice] = useState<string | null>(null)
  const attempted = useRef<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lyrics = useLyrics(
    currentTrack === null
      ? null
      : {
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          durationSeconds: currentTrack.durationSeconds,
          trackId: currentTrack.id,
        },
  )

  const canDetect =
    trackId !== null &&
    libraryTrack !== null &&
    libraryTrack.external !== true &&
    libraryTrack.blob.size > 0

  const spotifyTrackId =
    currentTrack?.sourceUrl.startsWith('spotify:track:') === true
      ? currentTrack.sourceUrl.slice('spotify:track:'.length)
      : null
  const isSpotifyExternal = spotifyTrackId !== null && libraryTrack?.external === true

  async function runDetection() {
    if (trackId === null || libraryTrack === null || detecting !== null) {
      return
    }

    setDetecting('local')
    setSpotifyError(null)
    setSpotifyNotice(null)
    // Deja que la UI pinte el estado antes del cálculo pesado.
    await new Promise((resolve) => setTimeout(resolve, 30))
    const chords = await detectChordsFromBlob(libraryTrack.blob)
    setDetectedChords(trackId, chords)
    setDetecting(null)
  }

  /** Si Spotify bloquea su análisis, se intenta el preview de 30 s (audio descargable). */
  async function detectFromPreview(id: string): Promise<'ok' | 'none' | 'failed'> {
    let url: string | null
    try {
      url = await fetchSpotifyTrackPreview(id)
    } catch {
      return 'failed'
    }
    if (url === null || url === '') {
      return 'none'
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        return 'failed'
      }
      const blob = await response.blob()
      const chords = await detectChordsFromBlob(blob)
      if (chords === null) {
        return 'failed'
      }
      if (trackId !== null) {
        setDetectedChords(trackId, chords)
        const bpm = await detectBpmFromBlob(blob)
        const current = useTrackAnalysisStore.getState().records[trackId]
        if (bpm !== null && (current?.bpm ?? null) === null) {
          setBpm(trackId, bpm)
        }
      }
      return 'ok'
    } catch {
      return 'failed'
    }
  }

  async function runSpotifyAnalysis() {
    if (trackId === null || spotifyTrackId === null || detecting !== null) {
      return
    }

    setDetecting('spotify')
    setSpotifyError(null)
    setSpotifyNotice(null)

    try {
      const analysis = await fetchSpotifyAudioAnalysis(spotifyTrackId)
      setDetectedChords(trackId, chordsFromSpotifySegments(analysis.segments))
      if (analysis.beats.length > 0) {
        setDetectedBeats(trackId, analysis.beats)
      }
      const current = useTrackAnalysisStore.getState().records[trackId]
      if ((current?.bpm ?? null) === null && analysis.tempo > 0) {
        setBpm(trackId, Math.round(analysis.tempo))
      }
      if ((current?.key ?? null) === null) {
        const keyName = spotifyKeyName(analysis.key, analysis.mode)
        if (keyName !== null) {
          setKey(trackId, keyName)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'error'
      const preview = await detectFromPreview(spotifyTrackId)
      if (preview === 'ok') {
        setSpotifyNotice(t('chords.previewDetected', { error: message }))
      } else {
        const reason =
          preview === 'none' ? t('chords.spotifyNoPreview') : t('chords.spotifyPreviewFailed')
        setSpotifyError(`${message} · ${reason}`)
      }
    } finally {
      setDetecting(null)
    }
  }

  function retryDetection() {
    if (canDetect) {
      void runDetection()
    } else if (isSpotifyExternal) {
      void runSpotifyAnalysis()
    }
  }

  useEffect(() => {
    if (trackId === null || detecting !== null) {
      return
    }
    if (record?.detectedChords != null) {
      return
    }
    if (attempted.current.has(trackId)) {
      return
    }
    if (canDetect) {
      attempted.current.add(trackId)
      void runDetection()
    } else if (isSpotifyExternal && isSpotifyConnected()) {
      attempted.current.add(trackId)
      void runSpotifyAnalysis()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, canDetect, isSpotifyExternal])

  useEffect(() => {
    setDraft(trackId === null ? '' : (useChordStore.getState().records[trackId]?.text ?? ''))
    setSemitones(0)
  }, [trackId])

  useEffect(
    () => () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current)
      }
    },
    [],
  )

  function updateDraft(value: string) {
    setDraft(value)
    if (trackId === null) {
      return
    }
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => setText(trackId, value), 400)
  }

  async function handleFile(file: File | undefined) {
    if (file === undefined || trackId === null) {
      return
    }
    const text = await file.text()
    setDraft(text)
    setText(trackId, text)
  }

  const song = parseChordPro(draft)
  const transposed = transposeSong(song, semitones)
  const hasSheet = draft.trim() !== ''
  const detected = record?.detectedChords ?? null

  function renderLine(line: ChordProLine, index: number) {
    if (line.type === 'empty') {
      return <div className="h-3" key={index} />
    }
    if (line.type === 'section') {
      const sectionKey = SECTION_KEYS[line.label as keyof typeof SECTION_KEYS]
      return (
        <p
          className="mt-3 font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-ink uppercase"
          key={index}
        >
          {sectionKey === undefined ? line.label : t(sectionKey)}
        </p>
      )
    }
    if (line.type === 'comment') {
      return (
        <p className="text-sm text-ink-muted italic" key={index}>
          {line.text}
        </p>
      )
    }
    return (
      <p className="font-serif text-sm leading-relaxed whitespace-pre-wrap" key={index}>
        {line.tokens.map((token: ChordToken, tokenIndex: number) => (
          <ruby key={tokenIndex}>
            {token.text}
            <rt className="font-mono text-[0.6875rem] leading-tight font-medium text-accent-ink">
              {token.chord ?? ''}
            </rt>
          </ruby>
        ))}
      </p>
    )
  }

  return (
    <section aria-label={t('chords.title')} className="flex flex-col gap-4 p-5">
      <h3 className="font-display text-base font-semibold">{t('chords.title')}</h3>

      {trackId === null ? (
        <p className="text-xs leading-relaxed text-ink-muted">{t('chords.emptyTrack')}</p>
      ) : (
        <>
          <div>
            <p className="truncate text-sm font-medium text-ink" title={currentTrack?.title}>
              {currentTrack?.title}
            </p>
            <p className="truncate text-xs text-ink-muted">{currentTrack?.artist}</p>
          </div>

          {detecting !== null && (
            <p className="text-xs text-ink-muted" role="status">
              {detecting === 'spotify' ? t('chords.spotifyDetecting') : t('chords.detecting')}
            </p>
          )}

          {!canDetect && !isSpotifyExternal && (
            <p className="text-xs leading-relaxed text-ink-muted">
              {t('chords.detectUnavailable')}
            </p>
          )}

          {isSpotifyExternal && !isSpotifyConnected() && (
            <p className="text-xs leading-relaxed text-ink-muted">
              {t('chords.spotifyNotConnected')}
            </p>
          )}

          {isSpotifyExternal && spotifyError !== null && (
            <div className="flex flex-col gap-2">
              <p className="text-xs leading-relaxed text-ink-muted" role="status">
                {t('chords.spotifyError', { error: spotifyError })}
              </p>
              <button
                className="self-start border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink"
                onClick={() => void runSpotifyAnalysis()}
                type="button"
              >
                {t('chords.spotifyDetect')}
              </button>
            </div>
          )}

          {spotifyNotice !== null && (
            <p className="text-xs leading-relaxed text-ink-muted" role="status">
              {spotifyNotice}
            </p>
          )}

          {detected !== null && detected.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.6875rem] tracking-[0.1em] text-accent-ink uppercase">
                  {t('chords.detected')}
                </span>
                <button
                  className="border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink"
                  onClick={retryDetection}
                  type="button"
                >
                  {t('chords.detectAgain')}
                </button>
                <button
                  className="border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-danger hover:text-danger"
                  onClick={() => {
                    if (trackId !== null) {
                      setDetectedChords(trackId, null)
                    }
                  }}
                  type="button"
                >
                  {t('chords.clearDetected')}
                </button>
              </div>

              {lyrics.lines.length > 0 ? (
                <div className="border-2 border-rule bg-surface p-3">
                  <p className="mb-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase">
                    {t('chords.withLyrics')}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {lyrics.lines.map((line, index) => (
                      <div key={index}>
                        <span className="block font-mono text-[0.6875rem] leading-tight font-semibold text-accent-ink">
                          {chordAt(detected, line.time) ?? ' '}
                        </span>
                        <span className="font-serif text-sm text-ink">{line.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-ink-muted">{t('chords.noLyrics')}</p>
              )}

              <details className="border-2 border-rule/40 bg-surface p-3">
                <summary className="cursor-pointer font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase">
                  {t('chords.timeline')}
                </summary>
                <ol className="mt-2 flex flex-col">
                  {detected.map((event, index) => (
                    <li
                      className="flex items-center justify-between border-b border-border py-1"
                      key={`${event.time}-${index}`}
                    >
                      <span className="font-mono text-sm font-semibold text-ink">
                        {event.chord}
                      </span>
                      <span className="font-mono text-xs text-ink-muted">
                        {formatDuration(event.time)}
                      </span>
                    </li>
                  ))}
                </ol>
              </details>
            </>
          )}

          {!detecting &&
            detected !== null &&
            detected.length === 0 &&
            (canDetect || isSpotifyExternal) && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs leading-relaxed text-ink-muted">
                  {t('chords.detectedEmpty')}
                </p>
                <button
                  className="border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink"
                  onClick={retryDetection}
                  type="button"
                >
                  {t('chords.detectAgain')}
                </button>
              </div>
            )}

          {isSpotifyExternal &&
            isSpotifyConnected() &&
            detecting === null &&
            detected === null &&
            spotifyError === null && (
              <button
                className="self-start border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink"
                onClick={() => void runSpotifyAnalysis()}
                type="button"
              >
                {t('chords.spotifyDetect')}
              </button>
            )}

          <details className="border-2 border-rule/40 bg-surface p-3">
            <summary className="cursor-pointer font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase">
              {t('chords.manual')}
            </summary>

            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink">
                  {t('chords.import')}
                  <input
                    accept=".cho,.pro,.chordpro,.txt,text/plain"
                    className="hidden"
                    onChange={(event) => void handleFile(event.target.files?.[0])}
                    type="file"
                  />
                </label>

                <div
                  aria-label={t('chords.transpose')}
                  className="flex items-center gap-1"
                  role="group"
                >
                  <button
                    aria-label={t('chords.down')}
                    className="border-2 border-rule/40 px-2 py-1 font-mono text-xs text-ink-muted transition-colors hover:border-accent hover:text-ink"
                    onClick={() => setSemitones((value) => Math.max(-11, value - 1))}
                    type="button"
                  >
                    −
                  </button>
                  <span className="w-9 text-center font-mono text-xs tabular-nums text-ink">
                    {semitones > 0 ? `+${semitones}` : semitones}
                  </span>
                  <button
                    aria-label={t('chords.up')}
                    className="border-2 border-rule/40 px-2 py-1 font-mono text-xs text-ink-muted transition-colors hover:border-accent hover:text-ink"
                    onClick={() => setSemitones((value) => Math.min(11, value + 1))}
                    type="button"
                  >
                    +
                  </button>
                  {semitones !== 0 && (
                    <button
                      className="ml-1 border-2 border-rule/40 px-2 py-1 font-mono text-[0.6875rem] tracking-[0.08em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink"
                      onClick={() => setSemitones(0)}
                      type="button"
                    >
                      {t('chords.reset')}
                    </button>
                  )}
                </div>

                {hasSheet && (
                  <button
                    className="ml-auto border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-danger hover:text-danger"
                    onClick={() => {
                      if (trackId !== null) {
                        clearSheet(trackId)
                      }
                      setDraft('')
                      setSemitones(0)
                    }}
                    type="button"
                  >
                    {t('chords.clear')}
                  </button>
                )}
              </div>

              {transposed.key !== null && (
                <p className="font-mono text-xs text-ink-muted">
                  {t('chords.key', { key: transposed.key })}
                </p>
              )}

              <textarea
                aria-label={t('chords.editor')}
                className="h-32 w-full resize-y border-2 border-rule bg-surface p-2 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                onChange={(event) => updateDraft(event.target.value)}
                placeholder={t('chords.placeholder')}
                value={draft}
              />

              {hasSheet && (
                <div className="border-2 border-rule bg-surface p-3">
                  <p className="mb-1 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase">
                    {t('chords.preview')}
                  </p>
                  {transposed.title !== null && (
                    <p className="font-display text-sm font-semibold">{transposed.title}</p>
                  )}
                  {transposed.artist !== null && (
                    <p className="text-xs text-ink-muted">{transposed.artist}</p>
                  )}
                  <div className="mt-2">{transposed.lines.map(renderLine)}</div>
                </div>
              )}
            </div>
          </details>

          <p className="text-xs leading-relaxed text-ink-muted">{t('chords.hint')}</p>
        </>
      )}
    </section>
  )
}
