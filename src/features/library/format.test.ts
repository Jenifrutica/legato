import { describe, expect, it } from 'vitest'
import { formatDuration, formatFileSize, normalizeText } from './format'

describe('formatDuration', () => {
  it('formatea segundos', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(3599)).toBe('59:59')
  })

  it('maneja valores invalidos', () => {
    expect(formatDuration(null)).toBe('--:--')
    expect(formatDuration(-1)).toBe('--:--')
    expect(formatDuration(Number.NaN)).toBe('--:--')
  })
})

describe('formatFileSize', () => {
  it('formatea bytes, KB y MB', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2.0 KB')
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
    expect(formatFileSize(15 * 1024 * 1024)).toBe('15 MB')
  })
})

describe('normalizeText', () => {
  it('quita acentos y baja a minusculas', () => {
    expect(normalizeText('Canción')).toBe('cancion')
    expect(normalizeText('  ÁLBUM ')).toBe('album')
  })
})
