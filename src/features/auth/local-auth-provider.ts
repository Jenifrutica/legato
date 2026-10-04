import { getDatabase } from '../persistence'
import {
  hashPassword,
  PASSWORD_MIN_LENGTH,
  randomToken,
  sha256Base64,
  verifyPassword,
} from './password-hash'
import { AuthError } from './types'
import type { AuthProvider, AuthSignUpInput, AuthSignUpResult, AuthUser } from './types'
import type { UserRecord } from '../persistence'

const SESSION_KEY = 'legato.auth.session'
const SESSION_DAYS = 7
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function toAuthUser(record: UserRecord): AuthUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    pictureUrl: null,
    emailVerified: true,
    provider: 'local',
  }
}

/**
 * Cuentas locales en IndexedDB (PBKDF2-SHA256) como respaldo del proveedor
 * real: permite clase sin internet y los E2E. La sesión se guarda como token
 * opaco (solo su hash vive en la base de datos).
 */
export class LocalAuthProvider implements AuthProvider {
  readonly kind = 'local' as const
  readonly supportsEmailVerification = false
  readonly supportsPasswordReset = false
  readonly supportsGoogle = false
  #user: AuthUser | null = null
  #listeners = new Set<(user: AuthUser | null) => void>()

  async init(): Promise<void> {
    const db = getDatabase()
    if (db === null) {
      this.#user = null
      return
    }

    const token = this.#readToken()
    if (token === null) {
      this.#user = null
      return
    }

    const tokenHash = await sha256Base64(token)
    const session = await db.authSessions.get(tokenHash)
    if (session === undefined || session.expiresAt < Date.now()) {
      if (session !== undefined) {
        await db.authSessions.delete(tokenHash)
      }
      this.#removeToken()
      this.#user = null
      return
    }

    const record = await db.users.get(session.userId)
    if (record === undefined) {
      this.#removeToken()
      this.#user = null
      return
    }

    this.#user = toAuthUser(record)
  }

  getUser(): AuthUser | null {
    return this.#user
  }

  async signUp(input: AuthSignUpInput): Promise<AuthSignUpResult> {
    const db = this.#database()
    const email = normalizeEmail(input.email)
    if (!EMAIL_PATTERN.test(email)) {
      throw new AuthError('invalid-email')
    }
    if (input.password.length < PASSWORD_MIN_LENGTH) {
      throw new AuthError('weak-password')
    }

    const existing = await db.users.where('email').equals(email).first()
    if (existing !== undefined) {
      throw new AuthError('email-in-use')
    }

    const stored = await hashPassword(input.password)
    const now = Date.now()
    const record: UserRecord = {
      id: crypto.randomUUID(),
      email,
      name: input.name.trim() === '' ? (email.split('@')[0] ?? email) : input.name.trim(),
      passwordHash: stored.hash,
      salt: stored.salt,
      iterations: stored.iterations,
      createdAt: now,
      updatedAt: now,
    }
    await db.users.add(record)
    await this.#createSession(record.id)
    this.#setUser(toAuthUser(record))
    return { needsEmailVerification: false }
  }

  async signIn(email: string, password: string): Promise<void> {
    const db = this.#database()
    const record = await db.users.where('email').equals(normalizeEmail(email)).first()
    if (record === undefined) {
      throw new AuthError('invalid-credentials')
    }

    const valid = await verifyPassword(password, {
      hash: record.passwordHash,
      salt: record.salt,
      iterations: record.iterations,
    })
    if (!valid) {
      throw new AuthError('invalid-credentials')
    }

    await this.#createSession(record.id)
    this.#setUser(toAuthUser(record))
  }

  async resetPassword(): Promise<void> {
    throw new AuthError('not-supported')
  }

  async signOut(): Promise<void> {
    const db = getDatabase()
    const token = this.#readToken()
    if (db !== null && token !== null) {
      await db.authSessions.delete(await sha256Base64(token))
    }
    this.#removeToken()
    this.#setUser(null)
  }

  async deleteAccount(password?: string): Promise<void> {
    const db = this.#database()
    const user = this.#user
    if (user === null) {
      throw new AuthError('invalid-credentials')
    }

    const record = await db.users.get(user.id)
    if (record === undefined) {
      this.#removeToken()
      this.#setUser(null)
      return
    }

    if (password !== undefined) {
      const valid = await verifyPassword(password, {
        hash: record.passwordHash,
        salt: record.salt,
        iterations: record.iterations,
      })
      if (!valid) {
        throw new AuthError('invalid-credentials')
      }
    }

    await db.users.delete(user.id)
    await db.authSessions.where('userId').equals(user.id).delete()
    this.#removeToken()
    this.#setUser(null)
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.#listeners.add(listener)
    return () => {
      this.#listeners.delete(listener)
    }
  }

  #database() {
    const db = getDatabase()
    if (db === null) {
      throw new AuthError('not-supported', 'IndexedDB no disponible')
    }
    return db
  }

  async #createSession(userId: string): Promise<void> {
    const db = this.#database()
    const token = randomToken()
    const now = Date.now()
    await db.authSessions.put({
      tokenHash: await sha256Base64(token),
      userId,
      createdAt: now,
      expiresAt: now + SESSION_DAYS * 24 * 60 * 60 * 1000,
    })
    this.#writeToken(token)
  }

  #readToken(): string | null {
    try {
      return localStorage.getItem(SESSION_KEY)
    } catch {
      return null
    }
  }

  #writeToken(token: string): void {
    try {
      localStorage.setItem(SESSION_KEY, token)
    } catch {
      // sin persistencia
    }
  }

  #removeToken(): void {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      // sin persistencia
    }
  }

  #setUser(user: AuthUser | null): void {
    this.#user = user
    for (const listener of this.#listeners) {
      listener(user)
    }
  }
}
