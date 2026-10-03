import type { AuthProvider, AuthUser } from './types'

const STORAGE_KEY = 'legato.auth.local'

export class LocalAuthProvider implements AuthProvider {
  readonly kind = 'local'
  #user: AuthUser | null = null
  #listeners = new Set<(user: AuthUser | null) => void>()

  init(): Promise<void> {
    this.#user = this.#read()
    return Promise.resolve()
  }

  getUser(): AuthUser | null {
    return this.#user
  }

  signIn(): Promise<void> {
    const user: AuthUser = {
      id: this.#user?.id ?? crypto.randomUUID(),
      name: this.#user?.name ?? 'Perfil local',
      email: this.#user?.email ?? null,
      pictureUrl: this.#user?.pictureUrl ?? null,
    }

    this.#setUser(user)
    return Promise.resolve()
  }

  signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY)
    this.#setUser(null)
    return Promise.resolve()
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.#listeners.add(listener)
    return () => {
      this.#listeners.delete(listener)
    }
  }

  #read(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw === null ? null : (JSON.parse(raw) as AuthUser)
    } catch {
      return null
    }
  }

  #setUser(user: AuthUser | null): void {
    this.#user = user

    if (user !== null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    }

    for (const listener of this.#listeners) {
      listener(user)
    }
  }
}
