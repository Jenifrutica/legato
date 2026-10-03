import { beforeEach, describe, expect, it } from 'vitest'
import { CONSENT_VERSION, readConsent, useConsentStore } from './consent-store'

describe('consent store', () => {
  beforeEach(() => {
    localStorage.clear()
    useConsentStore.getState().resetConsent()
    localStorage.clear()
  })

  it('empieza pendiente', () => {
    expect(readConsent().status).toBe('pending')
  })

  it('aceptar todo persiste la decision', () => {
    useConsentStore.getState().acceptAll()

    const state = useConsentStore.getState()
    expect(state.status).toBe('decided')
    expect(state.optionalAllowed).toBe(true)
    expect(localStorage.getItem('legato.consent')).toContain(`"version":${CONSENT_VERSION}`)
  })

  it('solo esenciales deja las opcionales apagadas', () => {
    useConsentStore.getState().acceptEssentialOnly()

    expect(useConsentStore.getState().optionalAllowed).toBe(false)
    expect(readConsent().optionalAllowed).toBe(false)
    expect(readConsent().status).toBe('decided')
  })

  it('una version antigua vuelve a preguntar', () => {
    localStorage.setItem(
      'legato.consent',
      JSON.stringify({ version: CONSENT_VERSION - 1, decidedAt: 1, optionalAllowed: true }),
    )

    expect(readConsent().status).toBe('pending')
  })

  it('abre y cierra las preferencias', () => {
    useConsentStore.getState().openPreferences()
    expect(useConsentStore.getState().preferencesOpen).toBe(true)

    useConsentStore.getState().closePreferences()
    expect(useConsentStore.getState().preferencesOpen).toBe(false)
  })
})
