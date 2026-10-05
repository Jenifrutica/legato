import { describe, expect, it } from 'vitest'
import { activeLineIndex, displayLineIndex, lyricLead, parseLrc } from './lrc'

describe('parser LRC', () => {
  it('convierte marcas de tiempo y ordena las líneas', () => {
    const lines = parseLrc('[00:12.50]Segunda\n[00:05.00]Primera')

    expect(lines).toEqual([
      { time: 5, text: 'Primera' },
      { time: 12.5, text: 'Segunda' },
    ])
  })

  it('ignora metadatos y líneas vacías', () => {
    const lines = parseLrc('[ar:Trío Ámbar]\n[ti:Nocturno]\n\n[00:01.00]Hola')

    expect(lines).toHaveLength(1)
    expect(lines[0]?.text).toBe('Hola')
  })

  it('aplica el offset en milisegundos', () => {
    const lines = parseLrc('[offset:+500]\n[00:10.00]Tarde')

    expect(lines[0]?.time).toBe(10.5)
  })

  it('admite varias marcas en la misma línea', () => {
    const lines = parseLrc('[00:10.00][00:20.00]Estribillo')

    expect(lines.map((line) => line.time)).toEqual([10, 20])
  })

  it('descarta líneas sin texto o sin tiempo y no produce tiempos negativos', () => {
    const lines = parseLrc('[00:01.00]\n[ar:x]\n[offset:-5000]\n[00:10.00]Tarde')

    expect(lines).toEqual([{ time: 5, text: 'Tarde' }])
  })
})

describe('línea activa', () => {
  const lines = [
    { time: 0, text: 'a' },
    { time: 10, text: 'b' },
    { time: 20, text: 'c' },
  ]

  it('devuelve la última línea cuyo tiempo ya pasó', () => {
    expect(activeLineIndex(lines, 5)).toBe(0)
    expect(activeLineIndex(lines, 12)).toBe(1)
    expect(activeLineIndex(lines, 99)).toBe(2)
  })

  it('devuelve -1 antes de la primera línea', () => {
    expect(activeLineIndex([{ time: 4, text: 'x' }], 1)).toBe(-1)
  })
})

describe('avance de la letra', () => {
  const lines = [
    { time: 0, text: 'a' },
    { time: 10, text: 'b' },
    { time: 20, text: 'c' },
  ]

  it('la primera línea arranca suavemente y arranca en 0 como muy pronto', () => {
    expect(lyricLead(lines, 0)).toBe(0)
    expect(lyricLead([{ time: 5, text: 'x' }], 0)).toBe(4.75)
  })

  it('el avance no adelanta a la línea anterior', () => {
    expect(lyricLead(lines, 1)).toBe(9.75)
    expect(
      lyricLead(
        [
          { time: 10, text: 'a' },
          { time: 10.1, text: 'b' },
        ],
        1,
      ),
    ).toBe(10)
  })

  it('cambia de línea hasta 0.25 s antes de la marca para evitar el retraso', () => {
    expect(displayLineIndex(lines, 9.6)).toBe(0)
    expect(displayLineIndex(lines, 9.85)).toBe(1)
    expect(displayLineIndex(lines, 10.1)).toBe(1)
    expect(displayLineIndex(lines, 19.85)).toBe(2)
    expect(displayLineIndex(lines, 5)).toBe(0)
  })

  it('antes de la primera línea el héroe enseña la primera', () => {
    expect(displayLineIndex([{ time: 4, text: 'x' }], 1)).toBe(0)
  })
})
