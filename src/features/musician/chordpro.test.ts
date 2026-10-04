import { describe, expect, it } from 'vitest'
import { parseChordPro, parseChordProLine, transposeChord, transposeSong } from './chordpro'

describe('parseChordProLine', () => {
  it('asigna cada acorde al texto que le sigue', () => {
    expect(parseChordProLine('[C]Hola [G]mundo')).toEqual([
      { chord: 'C', text: 'Hola ' },
      { chord: 'G', text: 'mundo' },
    ])
  })

  it('admite acordes sin letra y texto sin acordes', () => {
    expect(parseChordProLine('[Am]')).toEqual([{ chord: 'Am', text: '' }])
    expect(parseChordProLine('solo letra')).toEqual([{ chord: null, text: 'solo letra' }])
  })
})

describe('parseChordPro', () => {
  const text = [
    '{title: Mi canción}',
    '{artist: Alguien}',
    '{key: G}',
    '{comment: Intro}',
    '{start_of_chorus}',
    '[G]Canta [D]conmigo',
    '{end_of_chorus}',
    '',
    '# nota',
  ].join('\n')

  it('lee metadatos, secciones, comentarios y vacíos', () => {
    const song = parseChordPro(text)

    expect(song.title).toBe('Mi canción')
    expect(song.artist).toBe('Alguien')
    expect(song.key).toBe('G')
    expect(song.lines.some((line) => line.type === 'section' && line.label === 'chorus')).toBe(true)
    expect(song.lines.filter((line) => line.type === 'comment')).toHaveLength(2)
    expect(song.lines.some((line) => line.type === 'empty')).toBe(true)
  })

  it('guarda directivas desconocidas en metadatos sin romper', () => {
    const song = parseChordPro('{tempo: 120}\n[C]Hola')

    expect(song.metadata.tempo).toBe('120')
    expect(song.lines[0]?.type).toBe('lyrics')
  })
})

describe('transposeChord', () => {
  it('transporta mayores, menores y séptimas', () => {
    expect(transposeChord('C', 2)).toBe('D')
    expect(transposeChord('Am', 3)).toBe('Cm')
    expect(transposeChord('C7', -1)).toBe('B7')
  })

  it('cruza la octava y respeta bemoles y sostenidos', () => {
    expect(transposeChord('B', 1)).toBe('C')
    expect(transposeChord('Bb', 2)).toBe('C')
    expect(transposeChord('F#', 1)).toBe('G')
  })

  it('transporta el bajo de los acordes con barra', () => {
    expect(transposeChord('G/B', 2)).toBe('A/C#')
    expect(transposeChord('D/F#', -1)).toBe('C#/F')
  })

  it('deja intacto lo que no es un acorde', () => {
    expect(transposeChord('N.C.', 2)).toBe('N.C.')
    expect(transposeChord('C', 0)).toBe('C')
  })
})

describe('transposeSong', () => {
  it('transporta acordes y tonalidad sin tocar la letra', () => {
    const song = parseChordPro('{key: G}\n[G]Hola [Em]mundo')
    const up = transposeSong(song, 2)

    expect(up.key).toBe('A')
    const line = up.lines[0]
    expect(line?.type).toBe('lyrics')
    if (line?.type === 'lyrics') {
      expect(line.tokens.map((token) => token.chord)).toEqual(['A', 'F#m'])
      expect(line.tokens.map((token) => token.text)).toEqual(['Hola ', 'mundo'])
    }
  })
})
