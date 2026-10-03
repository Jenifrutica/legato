import { contrastRatio, darken, ensureContrast, mix, rgbToHex, WHITE, type Rgb } from './color'
import type { AlbumPalette } from './palette'

export type AlbumTheme = {
  background: string
  surface: string
  surface2: string
  border: string
  ink: string
  inkMuted: string
  primary: string
  primaryStrong: string
  primarySoft: string
  accent: string
  accentSoft: string
  glow: string
}

const INK_BASE: Rgb = { r: 34, g: 30, b: 28 }

export function deriveTheme(palette: AlbumPalette): AlbumTheme {
  const background = mix(WHITE, palette.dominant, 0.12)
  const surface = mix(WHITE, palette.dominant, 0.04)
  const surface2 = mix(WHITE, palette.dominant, 0.18)
  const border = mix(WHITE, palette.muted, 0.38)

  const ink = ensureContrast(INK_BASE, background, 7)
  const inkMuted = ensureContrast(mix(ink, background, 0.4), background, 4.5)

  const primaryStrong = ensureContrast(palette.vibrant, WHITE, 4.5)
  const primary = ensureContrast(palette.vibrant, background, 3)
  const primarySoft = mix(WHITE, palette.vibrant, 0.16)
  const accent = ensureContrast(palette.muted, background, 3)
  const accentSoft = mix(WHITE, palette.muted, 0.22)
  const glow = rgbToHex(
    darken(palette.vibrant, contrastRatio(palette.vibrant, WHITE) > 4.5 ? 0.1 : 0),
  )

  return {
    background: rgbToHex(background),
    surface: rgbToHex(surface),
    surface2: rgbToHex(surface2),
    border: rgbToHex(border),
    ink: rgbToHex(ink),
    inkMuted: rgbToHex(inkMuted),
    primary: rgbToHex(primary),
    primaryStrong: rgbToHex(primaryStrong),
    primarySoft: rgbToHex(primarySoft),
    accent: rgbToHex(accent),
    accentSoft: rgbToHex(accentSoft),
    glow: glow,
  }
}

const THEME_VARIABLES: Array<[keyof AlbumTheme, string]> = [
  ['background', '--album-bg'],
  ['surface', '--album-surface'],
  ['surface2', '--album-surface-2'],
  ['border', '--album-border'],
  ['ink', '--album-ink'],
  ['inkMuted', '--album-ink-muted'],
  ['primary', '--album-primary'],
  ['primaryStrong', '--album-primary-strong'],
  ['primarySoft', '--album-primary-soft'],
  ['accent', '--album-accent'],
  ['accentSoft', '--album-accent-soft'],
  ['glow', '--album-glow'],
]

export function applyAlbumTheme(theme: AlbumTheme): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  for (const [key, variable] of THEME_VARIABLES) {
    root.style.setProperty(variable, theme[key])
  }
  root.classList.add('album-theme')
}

export function clearAlbumTheme(): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  for (const [, variable] of THEME_VARIABLES) {
    root.style.removeProperty(variable)
  }
  root.classList.remove('album-theme')
}
