import { beforeEach, describe, expect, it } from 'vitest'
import { useA11yStore } from './a11y-store'

describe('a11y store', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.style.removeProperty('--a11y-text-scale')
    useA11yStore.getState().reset()
    document.documentElement.className = ''
    document.documentElement.style.removeProperty('--a11y-text-scale')
  })

  it('aplica y persiste las preferencias', () => {
    const store = useA11yStore.getState()
    store.setPreference('highContrast', true)
    store.setPreference('dyslexiaFont', true)
    store.setPreference('textScale', 150)

    expect(document.documentElement.classList.contains('a11y-contrast')).toBe(true)
    expect(document.documentElement.classList.contains('a11y-dyslexia')).toBe(true)
    expect(document.documentElement.style.getPropertyValue('--a11y-text-scale')).toBe('1.5')
    expect(localStorage.getItem('legato.a11y')).toContain('150')
  })

  it('aplica los modos de daltonismo y controles grandes', () => {
    const store = useA11yStore.getState()
    store.setPreference('colorBlind', 'deuteranopia')
    store.setPreference('largeControls', true)

    expect(document.documentElement.classList.contains('a11y-cb-deuteranopia')).toBe(true)
    expect(document.documentElement.classList.contains('a11y-cb-protanopia')).toBe(false)
    expect(document.documentElement.classList.contains('a11y-large-controls')).toBe(true)
  })

  it('reset vuelve a los valores por defecto', () => {
    const store = useA11yStore.getState()
    store.setPreference('reducedMotion', true)
    store.reset()

    expect(document.documentElement.classList.contains('a11y-reduced-motion')).toBe(false)
    expect(useA11yStore.getState().preferences.reducedMotion).toBe(false)
    expect(useA11yStore.getState().preferences.textScale).toBe(100)
  })

  it('abre y cierra el panel', () => {
    useA11yStore.getState().openPanel()
    expect(useA11yStore.getState().panelOpen).toBe(true)

    useA11yStore.getState().closePanel()
    expect(useA11yStore.getState().panelOpen).toBe(false)
  })
})
