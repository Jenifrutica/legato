import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalAuthProvider } from './local-auth-provider'

describe('LocalAuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('inicia sin usuario', async () => {
    const provider = new LocalAuthProvider()
    await provider.init()
    expect(provider.getUser()).toBeNull()
  })

  it('signIn crea un perfil local y lo persiste', async () => {
    const provider = new LocalAuthProvider()
    await provider.init()
    await provider.signIn()

    const user = provider.getUser()
    expect(user?.name).toBe('Perfil local')
    expect(user?.id).toBeTruthy()
    expect(localStorage.getItem('legato.auth.local')).toContain('Perfil local')
  })

  it('restaura la sesion desde localStorage', async () => {
    const first = new LocalAuthProvider()
    await first.init()
    await first.signIn()

    const second = new LocalAuthProvider()
    await second.init()

    expect(second.getUser()?.id).toBe(first.getUser()?.id)
  })

  it('signOut limpia la sesion', async () => {
    const provider = new LocalAuthProvider()
    await provider.init()
    await provider.signIn()
    await provider.signOut()

    expect(provider.getUser()).toBeNull()
    expect(localStorage.getItem('legato.auth.local')).toBeNull()
  })

  it('notifica a los suscriptores y permite desuscribirse', async () => {
    const provider = new LocalAuthProvider()
    const listener = vi.fn()
    const unsubscribe = provider.subscribe(listener)

    await provider.signIn()

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ name: 'Perfil local' }))

    unsubscribe()
    await provider.signOut()
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
