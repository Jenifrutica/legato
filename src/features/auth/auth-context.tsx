import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createAuthProvider } from './create-auth-provider'
import type {
  AuthProvider,
  AuthProviderKind,
  AuthSignUpInput,
  AuthSignUpResult,
  AuthUser,
} from './types'

type AuthContextValue = {
  user: AuthUser | null
  ready: boolean
  kind: AuthProviderKind
  /** Sesión de invitado: no se guarda (se pierde al recargar) ni se sincroniza. */
  isGuest: boolean
  supportsEmailVerification: boolean
  supportsPasswordReset: boolean
  supportsGoogle: boolean
  signUp: (input: AuthSignUpInput) => Promise<AuthSignUpResult>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle?: () => Promise<void>
  signInAsGuest: () => void
  resendVerificationEmail?: () => Promise<void>
  refreshUser?: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: (password?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Invitado: usuario local efímero, nunca se persiste. */
const GUEST_USER: AuthUser = {
  id: 'guest',
  name: 'Invitado',
  email: null,
  pictureUrl: null,
  emailVerified: true,
  provider: 'local',
}

export function AuthContextProvider({
  children,
  provider,
}: {
  children: ReactNode
  provider?: AuthProvider
}) {
  const authProvider = useMemo(() => provider ?? createAuthProvider(), [provider])
  const [providerUser, setProviderUser] = useState<AuthUser | null>(null)
  const [guestUser, setGuestUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    // La inicialización de Firebase puede no resolver si la red la bloquea
    // (p. ej. escudos del navegador): nunca dejamos la puerta colgada.
    const timeout = new Promise<void>((resolve) => {
      setTimeout(resolve, 5000)
    })

    void Promise.race([authProvider.init().catch(() => undefined), timeout]).then(() => {
      if (active) {
        setProviderUser(authProvider.getUser())
        setReady(true)
      }
    })

    const unsubscribe = authProvider.subscribe(setProviderUser)

    return () => {
      active = false
      unsubscribe()
    }
  }, [authProvider])

  const user = guestUser ?? providerUser

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      kind: authProvider.kind,
      isGuest: guestUser !== null,
      supportsEmailVerification: authProvider.supportsEmailVerification,
      supportsPasswordReset: authProvider.supportsPasswordReset,
      supportsGoogle: authProvider.supportsGoogle,
      signUp: (input) => authProvider.signUp(input),
      signIn: (email, password) => authProvider.signIn(email, password),
      signInWithGoogle: authProvider.signInWithGoogle?.bind(authProvider),
      signInAsGuest: () => setGuestUser(GUEST_USER),
      resendVerificationEmail: authProvider.resendVerificationEmail?.bind(authProvider),
      refreshUser: authProvider.refreshUser?.bind(authProvider),
      resetPassword: (email) => authProvider.resetPassword(email),
      signOut: () => {
        setGuestUser(null)
        return authProvider.signOut()
      },
      deleteAccount: (password) => authProvider.deleteAccount(password),
    }),
    [authProvider, user, guestUser, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error('useAuth debe usarse dentro de AuthContextProvider')
  }

  return context
}
