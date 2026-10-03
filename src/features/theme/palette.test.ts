import { describe, expect, it } from 'vitest'
import { deriveTheme } from './album-theme'
import { contrastRatio, hexToRgb } from './color'
import { derivePalette, extractClusters } from './palette'

function pixelData(colors: Array<[number, number, number]>, repeats = 40): Uint8ClampedArray {
  const values: number[] = []
  for (const [r, g, b] of colors) {
    for (let index = 0; index < repeats; index++) {
      values.push(r, g, b, 255)
    }
  }
  return new Uint8ClampedArray(values)
}

describe('palette', () => {
  it('extrae clusters dominantes ignorando transparencia', () => {
    const data = new Uint8ClampedArray([255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 10])
    const clusters = extractClusters(data)

    expect(clusters).toHaveLength(1)
    expect(clusters[0]?.color.r).toBe(255)
  })

  it('deriva dominante, vibrante y apagado', () => {
    const palette = derivePalette(
      extractClusters(
        pixelData([
          [220, 60, 40],
          [40, 90, 200],
          [245, 240, 235],
        ]),
      ),
    )

    expect(palette.dominant.r).toBeGreaterThan(0)
    expect(palette.vibrant).toBeDefined()
    expect(palette.muted).toBeDefined()
  })

  it('deriva un tema con contraste suficiente', () => {
    const palette = derivePalette(
      extractClusters(
        pixelData([
          [210, 70, 50],
          [30, 80, 180],
        ]),
      ),
    )
    const theme = deriveTheme(palette)

    const background = hexToRgb(theme.background)
    const ink = hexToRgb(theme.ink)
    const inkMuted = hexToRgb(theme.inkMuted)

    expect(contrastRatio(ink, background)).toBeGreaterThanOrEqual(7)
    expect(contrastRatio(inkMuted, background)).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(hexToRgb(theme.primaryStrong), { r: 255, g: 255, b: 255 }),
    ).toBeGreaterThanOrEqual(4.5)
    expect(theme.background.startsWith('#')).toBe(true)
  })
})
