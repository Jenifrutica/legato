import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProvidersStore } from './providers-store'

describe('providers store', () => {
  beforeEach(() => {
    localStorage.clear()
    useProvidersStore.setState({ enabled: { spotify: true, audius: false, jamendo: false } })
  })

  it('por defecto solo spotify activo', async () => {
    vi.resetModules()
    localStorage.clear()
    const { useProvidersStore: freshStore } = await import('./providers-store')

    expect(freshStore.getState().enabled).toEqual({
      spotify: true,
      audius: false,
      jamendo: false,
    })
  })

  it('activa y desactiva proveedores y persiste', () => {
    useProvidersStore.getState().setEnabled('jamendo', true)

    expect(useProvidersStore.getState().enabled.jamendo).toBe(true)
    expect(localStorage.getItem('legato.sources.v2')).toContain('"jamendo":true')

    useProvidersStore.getState().setEnabled('jamendo', false)
    expect(localStorage.getItem('legato.sources.v2')).toContain('"jamendo":false')
  })
})
