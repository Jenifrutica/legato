import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDatabase } from '../persistence'
import { LocalAuthProvider } from './local-auth-provider'

async function resetDatabase(): Promise<void> {
  const db = getDatabase()
  if (db !== null) {
    await db.users.clear()
    await db.authSessions.clear()
  }
  localStorage.clear()
}

describe('LocalAuthProvider (cuentas en IndexedDB)', () => {
  beforeEach(resetDatabase)

  it('registra una cuenta y la sesión persiste al reabrir', async () => {
    const provider = new LocalAuthProvider()
    await provider.init()
    expect(provider.getUser()).toBeNull()

    const result = await provider.signUp({
      email: 'Jeni@Example.com',
      password: '12345678',
      name: 'jenifedora',
    })

    expect(result.needsEmailVerification).toBe(false)
    expect(provider.getUser()?.name).toBe('jenifedora')
    expect(provider.getUser()?.email).toBe('jeni@example.com')
    expect(provider.getUser()?.provider).toBe('local')

    const second = new LocalAuthProvider()
    await second.init()
    expect(second.getUser()?.email).toBe('jeni@example.com')
  })

  it('rechaza correos repetidos y contraseñas cortas', async () => {
    const provider = new LocalAuthProvider()
    await provider.signUp({ email: 'a@b.com', password: '12345678', name: 'A' })

    await expect(
      provider.signUp({ email: 'A@B.com', password: '87654321', name: 'B' }),
    ).rejects.toMatchObject({ code: 'email-in-use' })

    const other = new LocalAuthProvider()
    await expect(
      other.signUp({ email: 'c@d.com', password: '123', name: 'C' }),
    ).rejects.toMatchObject({ code: 'weak-password' })
    await expect(
      other.signUp({ email: 'sin-arroba', password: '12345678', name: 'D' }),
    ).rejects.toMatchObject({ code: 'invalid-email' })
  })

  it('inicia sesión y rechaza credenciales incorrectas', async () => {
    const provider = new LocalAuthProvider()
    await provider.signUp({ email: 'a@b.com', password: '12345678', name: 'A' })
    await provider.signOut()
    expect(provider.getUser()).toBeNull()

    await expect(provider.signIn('a@b.com', 'mala')).rejects.toMatchObject({
      code: 'invalid-credentials',
    })
    await expect(provider.signIn('no@existe.com', '12345678')).rejects.toMatchObject({
      code: 'invalid-credentials',
    })

    await provider.signIn('a@b.com', '12345678')
    expect(provider.getUser()?.email).toBe('a@b.com')
  })

  it('signOut revoca la sesión y borra el token', async () => {
    const provider = new LocalAuthProvider()
    await provider.signUp({ email: 'a@b.com', password: '12345678', name: 'A' })
    await provider.signOut()

    expect(localStorage.getItem('legato.auth.session')).toBeNull()
    const second = new LocalAuthProvider()
    await second.init()
    expect(second.getUser()).toBeNull()
    expect(await getDatabase()?.authSessions.count()).toBe(0)
  })

  it('deleteAccount exige la contraseña y borra usuario y sesiones', async () => {
    const provider = new LocalAuthProvider()
    await provider.signUp({ email: 'a@b.com', password: '12345678', name: 'A' })

    await expect(provider.deleteAccount('mala')).rejects.toMatchObject({
      code: 'invalid-credentials',
    })

    await provider.deleteAccount('12345678')
    expect(provider.getUser()).toBeNull()
    expect(await getDatabase()?.users.count()).toBe(0)
    expect(await getDatabase()?.authSessions.count()).toBe(0)
  })

  it('notifica a los suscriptores y permite desuscribirse', async () => {
    const provider = new LocalAuthProvider()
    const listener = vi.fn()
    const unsubscribe = provider.subscribe(listener)

    await provider.signUp({ email: 'a@b.com', password: '12345678', name: 'A' })
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ email: 'a@b.com' }))

    unsubscribe()
    await provider.signOut()
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
