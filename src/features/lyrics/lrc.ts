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
