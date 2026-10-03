import { beforeEach, describe, expect, it } from 'vitest'
import { useProvidersStore } from './providers-store'

describe('providers store', () => {
  beforeEach(() => {
    localStorage.clear()
    useProvidersStore.setState({ enabled: { spotify: true, audius: true, jamendo: true } })
  })

  it('activa y desactiva proveedores y persiste', () => {
    useProvidersStore.getState().setEnabled('jamendo', false)

    expect(useProvidersStore.getState().enabled.jamendo).toBe(false)
    expect(useProvidersStore.getState().enabled.audius).toBe(true)
    expect(localStorage.getItem('legato.sources')).toContain('"jamendo":false')
  })
})
