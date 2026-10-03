import { afterEach, describe, expect, it } from 'vitest'
import { i18n, setLanguage } from './i18n'

describe('i18n', () => {
  afterEach(async () => {
    localStorage.clear()
    await i18n.changeLanguage('es')
  })

  it('traduce en los tres idiomas', async () => {
    await i18n.changeLanguage('en')
    expect(i18n.t('nav.library')).toBe('Library')

    await i18n.changeLanguage('pt')
    expect(i18n.t('player.play')).toBe('Reproduzir')

    await i18n.changeLanguage('es')
    expect(i18n.t('player.play')).toBe('Reproducir')
  })

  it('persiste el idioma y actualiza el documento', () => {
    setLanguage('pt')

    expect(localStorage.getItem('legato.language')).toBe('pt')
    expect(document.documentElement.lang).toBe('pt')
  })
})
