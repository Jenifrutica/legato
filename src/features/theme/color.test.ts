import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  darken,
  ensureContrast,
  hexToRgb,
  isLight,
  lighten,
  mix,
  rgbToHex,
  saturation,
  WHITE,
} from './color'

describe('color utilities', () => {
  it('convierte entre rgb y hex', () => {
    expect(rgbToHex({ r: 228, g: 87, b: 46 })).toBe('#e4572e')
    expect(hexToRgb('#e4572e')).toEqual({ r: 228, g: 87, b: 46 })
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('calcula contraste', () => {
    expect(contrastRatio(WHITE, { r: 0, g: 0, b: 0 })).toBeCloseTo(21, 0)
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 1)
  })

  it('detecta colores claros y saturacion', () => {
    expect(isLight(WHITE)).toBe(true)
    expect(isLight({ r: 20, g: 20, b: 20 })).toBe(false)
    expect(saturation({ r: 255, g: 0, b: 0 })).toBeCloseTo(1, 1)
    expect(saturation({ r: 128, g: 128, b: 128 })).toBe(0)
  })

  it('mezcla y ajusta luminosidad', () => {
    expect(mix(WHITE, { r: 0, g: 0, b: 0 }, 1)).toEqual({ r: 0, g: 0, b: 0 })
    expect(mix(WHITE, { r: 0, g: 0, b: 0 }, 0.5).r).toBeCloseTo(127.5, 1)
    expect(lighten({ r: 0, g: 0, b: 0 }, 1)).toEqual(WHITE)
    expect(darken(WHITE, 1)).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('ensureContrast lleva el color al ratio minimo', () => {
    const background = { r: 250, g: 246, b: 240 }
    const yellow = { r: 255, g: 230, b: 0 }
    expect(contrastRatio(yellow, background)).toBeLessThan(4.5)

    const adjusted = ensureContrast(yellow, background, 4.5)
    expect(contrastRatio(adjusted, background)).toBeGreaterThanOrEqual(4.5)
  })

  it('ensureContrast no cambia colores que ya cumplen', () => {
    const background = WHITE
    const ink = { r: 20, g: 20, b: 20 }
    expect(ensureContrast(ink, background, 4.5)).toEqual(ink)
  })
})
