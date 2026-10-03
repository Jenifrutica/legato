export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia'

export type A11yPreferences = {
  textScale: number
  dyslexiaFont: boolean
  highContrast: boolean
  reducedMotion: boolean
  colorBlind: ColorBlindMode
  largeControls: boolean
}

export const DEFAULT_A11Y_PREFERENCES: A11yPreferences = {
  textScale: 100,
  dyslexiaFont: false,
  highContrast: false,
  reducedMotion: false,
  colorBlind: 'none',
  largeControls: false,
}
