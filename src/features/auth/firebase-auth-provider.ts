import { getApps, initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import type { Auth, User } from 'firebase/auth'
import { AuthError } from './types'
import type { AuthProvider, AuthSignUpInput, AuthSignUpResult, AuthUser } from './types'

export type FirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
  storageBucket?: string
}

const LOGIN_AT_KEY = 'legato.auth.loginAt'
const SESSION_MS = 7 * 24 * 60 * 60 * 1000

const ERROR_MAP: Record<string, AuthError['code']> = {
  'auth/invalid-credential': 'invalid-credentials',
  'auth/wrong-password': 'invalid-credentials',
  'auth/user-not-found': 'user-not-found',
  'auth/invalid-email': 'invalid-email',
  'auth/email-already-in-use': 'email-in-use',
  'auth/weak-password': 'weak-password',
  'auth/too-many-requests': 'too-many-requests',
  'auth/requires-recent-login': 'requires-recent-login',
  'auth/network-request-failed': 'network',
}

export function toAuthError(error: unknown): AuthError {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : ''
  return new AuthError(ERROR_MAP[code] ?? 'unknown', code)
}

function emailActionSettings() {
  // El enlace de verificación vuelve a la app (no a una página genérica).
  return typeof window === 'undefined' ? undefined : { url: window.location.origin }
}

function mapUser(user: User): AuthUser {
  const google = user.providerData.some((provider) => provider.providerId === 'google.com')
  return {
    id: user.uid,
    name: user.displayName ?? user.email?.split('@')[0] ?? 'Músico',
    email: user.email,
    pictureUrl: user.photoURL,
    emailVerified: user.emailVerified,
    provider: google ? 'google' : 'firebase',
  }
}

/** Autenticación real con Firebase (correo/contraseña + Google), sesión de 7 días. */
export class FirebaseAuthProvider implements AuthProvider {
  readonly kind = 'firebase' as const
  readonly supportsEmailVerification = true
  readonly supportsPasswordReset = true
  readonly supportsGoogle = true
  #app: FirebaseApp
  #auth: Auth
  #user: AuthUser | null = null
  #listeners = new Set<(user: AuthUser | null) => void>()
  #firstAuthState: Promise<void>
  #resolveFirstAuthState: (() => void) | null = null

  constructor(config: FirebaseConfig) {
    const existing = getApps().find((app) => app.name === 'legato')
    this.#app = existing ?? initializeApp(config, 'legato')
    this.#auth = getAuth(this.#app)
    this.#firstAuthState = new Promise((resolve) => {
      this.#resolveFirstAuthState = resolve
    })

    onAuthStateChanged(this.#auth, (user) => {
      this.#setUser(user === null ? null : mapUser(user))
      if (this.#resolveFirstAuthState !== null) {
        this.#resolveFirstAuthState()
        this.#resolveFirstAuthState = null
      }
    })
  }

  async init(): Promise<void> {
    await this.#firstAuthState

    // La sesión sin correo confirmado se conserva para mostrar la pantalla de
    // verificación (con reenvío y la salida por Google); la puerta impide
    // entrar al reproductor hasta confirmar.
    const loginAt = this.#readLoginAt()
    if (this.#auth.currentUser !== null && loginAt !== null && Date.now() - loginAt > SESSION_MS) {
      await firebaseSignOut(this.#auth)
      this.#removeLoginAt()
      this.#setUser(null)
      return
    }
    if (this.#auth.currentUser !== null && loginAt === null) {
      this.#writeLoginAt()
    }
  }

  getUser(): AuthUser | null {
    return this.#user
  }

  async signUp(input: AuthSignUpInput): Promise<AuthSignUpResult> {
    try {
      const credential = await createUserWithEmailAndPassword(
        this.#auth,
        input.email.trim(),
        input.password,
      )
      if (input.name.trim() !== '') {
        await updateProfile(credential.user, { displayName: input.name.trim() })
      }
      // Se mantiene la sesión, pero la puerta deja al usuario en la pantalla
      // de verificación hasta confirmar el correo.
      this.#writeLoginAt()
      this.#setUser(mapUser(credential.user))
      await sendEmailVerification(credential.user, emailActionSettings())
      return { needsEmailVerification: true }
    } catch (error) {
      throw toAuthError(error)
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const credential = await signInWithEmailAndPassword(this.#auth, email.trim(), password)
      this.#writeLoginAt()
      this.#setUser(mapUser(credential.user))
      if (!credential.user.emailVerified) {
        // La puerta mostrará la pantalla de verificación; reenvía el enlace.
        await sendEmailVerification(credential.user, emailActionSettings()).catch(() => undefined)
      }
    } catch (error) {
      throw error instanceof AuthError ? error : toAuthError(error)
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const credential = await signInWithPopup(this.#auth, new GoogleAuthProvider())
      this.#writeLoginAt()
      this.#setUser(mapUser(credential.user))
    } catch (error) {
      throw toAuthError(error)
    }
  }

  async resendVerificationEmail(): Promise<void> {
    const user = this.#auth.currentUser
    if (user === null) {
      throw new AuthError('user-not-found')
    }
    try {
      await sendEmailVerification(user, emailActionSettings())
    } catch (error) {
      throw toAuthError(error)
    }
  }

  async refreshUser(): Promise<void> {
    const user = this.#auth.currentUser
    if (user === null) {
      return
    }
    await user.reload()
    this.#setUser(mapUser(user))
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.#auth, email.trim())
    } catch (error) {
      throw toAuthError(error)
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.#auth)
    this.#removeLoginAt()
    this.#setUser(null)
  }

  async deleteAccount(password?: string): Promise<void> {
    const user = this.#auth.currentUser
    if (user === null) {
      throw new AuthError('invalid-credentials')
    }
    try {
      const isPasswordAccount = user.providerData.some(
        (provider) => provider.providerId === 'password',
      )
      if (password !== undefined && isPasswordAccount && user.email !== null) {
        const credential = EmailAuthProvider.credential(user.email, password)
        await reauthenticateWithCredential(user, credential)
      }
      await deleteUser(user)
      this.#removeLoginAt()
      this.#setUser(null)
    } catch (error) {
      throw toAuthError(error)
    }
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.#listeners.add(listener)
    return () => {
      this.#listeners.delete(listener)
    }
  }

  #readLoginAt(): number | null {
    try {
      const raw = localStorage.getItem(LOGIN_AT_KEY)
      const value = raw === null ? Number.NaN : Number(raw)
      return Number.isFinite(value) ? value : null
    } catch {
      return null
    }
  }

  #writeLoginAt(): void {
    try {
      localStorage.setItem(LOGIN_AT_KEY, String(Date.now()))
    } catch {
      // sin persistencia
    }
  }

  #removeLoginAt(): void {
    try {
      localStorage.removeItem(LOGIN_AT_KEY)
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
