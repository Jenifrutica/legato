export type Rgb = { r: number; g: number; b: number }

export const WHITE: Rgb = { r: 255, g: 255, b: 255 }
export const BLACK: Rgb = { r: 0, g: 0, b: 0 }

export function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (value: number) => clampChannel(value).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3 ? normalized.replace(/(.)/g, '$1$1') : normalized
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

export function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  const t = Math.max(0, Math.min(1, amount))
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  }
}

export function lighten(color: Rgb, amount: number): Rgb {
  return mix(color, WHITE, amount)
}

export function darken(color: Rgb, amount: number): Rgb {
  return mix(color, BLACK, amount)
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const luminanceA = relativeLuminance(a)
  const luminanceB = relativeLuminance(b)
  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)
  return (lighter + 0.05) / (darker + 0.05)
}

export function isLight(color: Rgb): boolean {
  return relativeLuminance(color) > 0.5
}

export function saturation(color: Rgb): number {
  const max = Math.max(color.r, color.g, color.b) / 255
  const min = Math.min(color.r, color.g, color.b) / 255
  if (max === min) {
    return 0
  }
  const lightness = (max + min) / 2
  return lightness > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min)
}

export function ensureContrast(foreground: Rgb, background: Rgb, minRatio: number): Rgb {
  if (contrastRatio(foreground, background) >= minRatio) {
    return foreground
  }

  const toward = isLight(background) ? BLACK : WHITE
  let candidate = foreground

  for (let step = 1; step <= 20; step++) {
    candidate = mix(foreground, toward, step / 20)
    if (contrastRatio(candidate, background) >= minRatio) {
      return candidate
    }
  }

  return toward
}
