export type ChordToken = {
  chord: string | null
  text: string
}

export type ChordProLine =
  | { type: 'lyrics'; tokens: ChordToken[] }
  | { type: 'section'; label: string }
  | { type: 'comment'; text: string }
  | { type: 'empty' }

export type ChordProSong = {
  title: string | null
  artist: string | null
  key: string | null
  metadata: Record<string, string>
  lines: ChordProLine[]
}

const SECTION_STARTS: Record<string, string> = {
  start_of_chorus: 'chorus',
  soc: 'chorus',
  start_of_verse: 'verse',
  sov: 'verse',
  start_of_bridge: 'bridge',
  sob: 'bridge',
  start_of_tab: 'tab',
  sot: 'tab',
}

const SECTION_ENDS = new Set([
  'end_of_chorus',
  'eoc',
  'end_of_verse',
  'eov',
  'end_of_bridge',
  'eob',
  'end_of_tab',
  'eot',
])

const METADATA_KEYS: Record<string, 'title' | 'artist' | 'key'> = {
  title: 'title',
  t: 'title',
  artist: 'artist',
  key: 'key',
}

/** Convierte una línea con `[Acorde]` en tokens acorde/texto. */
export function parseChordProLine(line: string): ChordToken[] {
  const tokens: ChordToken[] = []
  const pattern = /\[([^\]]*)\]/g
  let chord: string | null = null
  let buffer = ''
  let last = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(line)) !== null) {
    buffer += line.slice(last, match.index)
    if (buffer !== '' || chord !== null) {
      tokens.push({ chord, text: buffer })
    }
    chord = match[1] ?? null
    buffer = ''
    last = pattern.lastIndex
  }

  buffer += line.slice(last)
  if (buffer !== '' || chord !== null) {
    tokens.push({ chord, text: buffer })
  }

  return tokens
}

/** Parser ChordPro propio: directivas, secciones, comentarios y acordes sobre letra. */
export function parseChordPro(text: string): ChordProSong {
  const metadata: Record<string, string> = {}
  const lines: ChordProLine[] = []
  let title: string | null = null
  let artist: string | null = null
  let key: string | null = null

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd()
    const directive = /^\{\s*([a-zA-Z_]+)\s*(?::\s*(.*?))?\s*\}$/.exec(line.trim())

    if (directive !== null) {
      const name = (directive[1] ?? '').toLowerCase()
      const value = (directive[2] ?? '').trim()

      if (name === 'comment' || name === 'c') {
        lines.push({ type: 'comment', text: value })
        continue
      }

      const section = SECTION_STARTS[name]
      if (section !== undefined) {
        lines.push({ type: 'section', label: section })
        continue
      }

      if (SECTION_ENDS.has(name)) {
        continue
      }

      metadata[name] = value
      const mapped = METADATA_KEYS[name]
      if (mapped === 'title' && value !== '') {
        title = value
      } else if (mapped === 'artist' && value !== '') {
        artist = value
      } else if (mapped === 'key' && value !== '') {
        key = value
      }
      continue
    }

    if (line.trim() === '') {
      lines.push({ type: 'empty' })
      continue
    }

    if (line.trimStart().startsWith('#')) {
      lines.push({ type: 'comment', text: line.trimStart().slice(1).trim() })
      continue
    }

    lines.push({ type: 'lyrics', tokens: parseChordProLine(line) })
  }

  return { title, artist, key, metadata, lines }
}

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export function noteIndex(note: string): number {
  const sharp = SHARP_NOTES.indexOf(note)
  if (sharp >= 0) {
    return sharp
  }
  return FLAT_NOTES.indexOf(note)
}

export function transposeChord(chord: string, semitones: number): string {
  if (chord === '' || semitones === 0) {
    return chord
  }

  const match = /^([A-G][#b]?)(.*)$/.exec(chord)
  if (match === null) {
    return chord
  }

  const root = match[1] ?? ''
  const rest = match[2] ?? ''
  const index = noteIndex(root)
  if (index < 0) {
    return chord
  }

  const target = (((index + semitones) % 12) + 12) % 12
  const preferFlat = root.includes('b') || rest.includes('b')
  const transposedRoot = (preferFlat ? FLAT_NOTES : SHARP_NOTES)[target]
  const transposedRest = rest.replace(
    /\/([A-G][#b]?)/g,
    (_full, bass: string) => `/${transposeChord(bass, semitones)}`,
  )

  return `${transposedRoot}${transposedRest}`
}

/** Transporta todos los acordes de la canción (y su tonalidad) sin tocar la letra. */
export function transposeSong(song: ChordProSong, semitones: number): ChordProSong {
  if (semitones === 0) {
    return song
  }

  return {
    ...song,
    key: song.key === null ? null : transposeChord(song.key, semitones),
    lines: song.lines.map((line) =>
      line.type === 'lyrics'
        ? {
            type: 'lyrics',
            tokens: line.tokens.map((token) => ({
              chord: token.chord === null ? null : transposeChord(token.chord, semitones),
              text: token.text,
            })),
          }
        : line,
    ),
  }
}
