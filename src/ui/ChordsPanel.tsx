import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { parseChordPro, transposeSong, useChordStore } from '../features/musician'
import type { ChordProLine, ChordToken } from '../features/musician'
import { usePlayerStore } from '../player'

const SECTION_KEYS = {
  chorus: 'chords.sections.chorus',
  verse: 'chords.sections.verse',
  bridge: 'chords.sections.bridge',
  tab: 'chords.sections.tab',
} as const

function melodyTokens(tokens: ChordToken[]) {
  return tokens.map((token, index) => (
    <ruby key={index}>
      {token.text}
      <rt className="font-mono text-[0.6875rem] leading-tight font-medium text-accent-ink">
        {token.chord ?? ''}
      </rt>
    </ruby>
  ))
}

export function ChordsPanel() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const trackId = currentTrack?.id ?? null
  const setText = useChordStore((state) => state.setText)
  const clear = useChordStore((state) => state.clear)
  const [draft, setDraft] = useState('')
  const [semitones, setSemitones] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
        {melodyTokens(line.tokens)}
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
                    clear(trackId)
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

          <div>
            <label className="block text-xs font-medium text-ink-muted" htmlFor="chords-editor">
              {t('chords.editor')}
            </label>
            <textarea
              className="mt-1 h-36 w-full resize-y border-2 border-rule bg-surface p-2 font-mono text-xs text-ink focus:border-accent focus:outline-none"
              id="chords-editor"
              onChange={(event) => updateDraft(event.target.value)}
              placeholder={t('chords.placeholder')}
              value={draft}
            />
          </div>

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

          <p className="text-xs leading-relaxed text-ink-muted">{t('chords.hint')}</p>
        </>
      )}
    </section>
  )
}
