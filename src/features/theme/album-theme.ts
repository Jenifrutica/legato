import { contrastRatio, darken, ensureContrast, mix, rgbToHex, WHITE, type Rgb } from './color'
import type { AlbumPalette } from './palette'

export type AlbumTheme = {
  background: string
  surface: string
  surface2: string
  border: string
  rule: string
  ink: string
  inkMuted: string
  primary: string
  primaryStrong: string
  primarySoft: string
  onPrimary: string
  accent: string
  accentInk: string
  accentSoft: string
  onAccent: string
  darkPrimary: string
  darkPrimaryStrong: string
  darkPrimarySoft: string
  darkOnPrimary: string
  darkAccent: string
  darkAccentInk: string
  darkAccentSoft: string
  darkOnAccent: string
}

const INK_BASE: Rgb = { r: 19, g: 16, b: 12 }
const BONE: Rgb = { r: 244, g: 239, b: 230 }
const DARK_BASE: Rgb = { r: 11, g: 14, b: 20 }

export function deriveTheme(palette: AlbumPalette): AlbumTheme {
  const background = mix(WHITE, palette.dominant, 0.06)
  const surface = mix(WHITE, palette.dominant, 0.02)
  const surface2 = mix(WHITE, palette.dominant, 0.14)
  const border = mix(WHITE, palette.muted, 0.38)

  const ink = ensureContrast(INK_BASE, background, 7)
  const inkMuted = ensureContrast(mix(ink, background, 0.38), background, 4.5)
  const rule = ink
  const primary = ink
  const primaryStrong = darken(ink, contrastRatio(ink, WHITE) > 10 ? 0.2 : 0)
  const primarySoft = surface2
  const onPrimary = ensureContrast(background, primaryStrong, 4.5)

  const accent = ensureContrast(palette.vibrant, background, 3)
  const accentInk = ensureContrast(palette.vibrant, background, 4.5)
  const accentSoft = mix(background, palette.vibrant, 0.22)
  const onAccent = ensureContrast(ink, accent, 4.5)

  const darkPrimary = ensureContrast(BONE, DARK_BASE, 7)
  const darkPrimaryStrong = WHITE
  const darkPrimarySoft = mix(DARK_BASE, WHITE, 0.14)
  const darkOnPrimary = ensureContrast(DARK_BASE, darkPrimary, 4.5)
  const darkAccent = ensureContrast(palette.vibrant, DARK_BASE, 4.5)
  const darkAccentInk = ensureContrast(palette.vibrant, DARK_BASE, 4.5)
  const darkAccentSoft = mix(DARK_BASE, palette.vibrant, 0.3)
  const darkOnAccent = ensureContrast(INK_BASE, darkAccent, 4.5)

  return {
    background: rgbToHex(background),
    surface: rgbToHex(surface),
    surface2: rgbToHex(surface2),
    border: rgbToHex(border),
    rule: rgbToHex(rule),
    ink: rgbToHex(ink),
    inkMuted: rgbToHex(inkMuted),
    primary: rgbToHex(primary),
    primaryStrong: rgbToHex(primaryStrong),
    primarySoft: rgbToHex(primarySoft),
    onPrimary: rgbToHex(onPrimary),
    accent: rgbToHex(accent),
    accentInk: rgbToHex(accentInk),
    accentSoft: rgbToHex(accentSoft),
    onAccent: rgbToHex(onAccent),
    darkPrimary: rgbToHex(darkPrimary),
    darkPrimaryStrong: rgbToHex(darkPrimaryStrong),
    darkPrimarySoft: rgbToHex(darkPrimarySoft),
    darkOnPrimary: rgbToHex(darkOnPrimary),
    darkAccent: rgbToHex(darkAccent),
    darkAccentInk: rgbToHex(darkAccentInk),
    darkAccentSoft: rgbToHex(darkAccentSoft),
    darkOnAccent: rgbToHex(darkOnAccent),
  }
}

const THEME_VARIABLES: Array<[keyof AlbumTheme, string]> = [
  ['background', '--album-bg'],
  ['surface', '--album-surface'],
  ['surface2', '--album-surface-2'],
  ['border', '--album-border'],
  ['rule', '--album-rule'],
  ['ink', '--album-ink'],
  ['inkMuted', '--album-ink-muted'],
  ['primary', '--album-primary'],
  ['primaryStrong', '--album-primary-strong'],
  ['primarySoft', '--album-primary-soft'],
  ['onPrimary', '--album-on-primary'],
  ['accent', '--album-accent'],
  ['accentInk', '--album-accent-ink'],
  ['accentSoft', '--album-accent-soft'],
  ['onAccent', '--album-on-accent'],
  ['darkPrimary', '--album-dark-primary'],
  ['darkPrimaryStrong', '--album-dark-primary-strong'],
  ['darkPrimarySoft', '--album-dark-primary-soft'],
  ['darkOnPrimary', '--album-dark-on-primary'],
  ['darkAccent', '--album-dark-accent'],
  ['darkAccentInk', '--album-dark-accent-ink'],
  ['darkAccentSoft', '--album-dark-accent-soft'],
  ['darkOnAccent', '--album-dark-on-accent'],
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
