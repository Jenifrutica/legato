export type LyricLine = {
  time: number
  text: string
}

const TIME_TAG = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g
const METADATA_TAG = /^\[[a-z]+:/i

/**
 * Convierte un archivo LRC en líneas con tiempo. Ignora etiquetas de metadatos
 * (`[ar:]`, `[ti:]`…) y aplica `[offset:]` en milisegundos.
 */
export function parseLrc(input: string): LyricLine[] {
  const offsetMatch = input.match(/\[offset:\s*([+-]?\d+)\s*\]/i)
  const offset = offsetMatch === null ? 0 : Number(offsetMatch[1]) / 1000
  const lines: LyricLine[] = []

  for (const raw of input.split(/\r?\n/)) {
    const trimmed = raw.trim()
    if (trimmed === '' || METADATA_TAG.test(trimmed)) {
      continue
    }

    const times: number[] = []
    TIME_TAG.lastIndex = 0
    let match = TIME_TAG.exec(trimmed)
    while (match !== null) {
      const minutes = Number(match[1])
      const seconds = Number(match[2])
      const fraction = match[3] === undefined ? 0 : Number(`0.${match[3]}`)
      times.push(minutes * 60 + seconds + fraction + offset)
      match = TIME_TAG.exec(trimmed)
    }

    const text = trimmed.replace(TIME_TAG, '').trim()
    if (times.length === 0 || text === '') {
      continue
    }

    for (const time of times) {
      lines.push({ time: Math.max(0, time), text })
    }
  }

  return lines.sort((a, b) => a.time - b.time)
}

export function activeLineIndex(lines: LyricLine[], time: number): number {
  let active = -1
  for (let index = 0; index < lines.length; index++) {
    if (lines[index].time <= time) {
      active = index
    } else {
      break
    }
  }
  return active
}

/**
 * Avance de la letra: una línea toma el relevo un poco antes de su marca para
 * compensar la latencia de la red y del render (LRCLIB llega tras un fetch).
 */
export const LYRIC_LEAD_SECONDS = 0.25

export function lyricLead(lines: LyricLine[], index: number, lead = LYRIC_LEAD_SECONDS): number {
  const current = lines[index]
  if (current === undefined) {
    return 0
  }
  if (index === 0) {
    return Math.max(0, current.time - lead)
  }
  const previous = lines[index - 1]
  return Math.max(previous === undefined ? 0 : previous.time, current.time - lead)
}

/**
 * Índice que debe mostrarse: la línea vigente o, si la siguiente ya está a
 * menos de `lead` segundos, la siguiente (para que el relevo no llegue tarde).
 */
export function displayLineIndex(
  lines: LyricLine[],
  time: number,
  lead = LYRIC_LEAD_SECONDS,
): number {
  const active = activeLineIndex(lines, time)
  if (active < 0) {
    return 0
  }
  const following = lines[active + 1]
  if (following !== undefined && time >= lyricLead(lines, active + 1, lead)) {
    return active + 1
  }
  return active
}
