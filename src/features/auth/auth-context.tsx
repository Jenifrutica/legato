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
  kind: AuthProviderKind
  supportsEmailVerification: boolean
  supportsPasswordReset: boolean
  supportsGoogle: boolean
  signUp: (input: AuthSignUpInput) => Promise<AuthSignUpResult>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle?: () => Promise<void>
  resendVerificationEmail?: () => Promise<void>
  refreshUser?: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: (password?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthContextProvider({
  children,
  provider,
}: {
  children: ReactNode
  provider?: AuthProvider
}) {
  const authProvider = useMemo(() => provider ?? createAuthProvider(), [provider])
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    let active = true

    void authProvider.init().then(() => {
      if (active) {
        setUser(authProvider.getUser())
      }
    })

    const unsubscribe = authProvider.subscribe(setUser)

    return () => {
      active = false
      unsubscribe()
    }
  }, [authProvider])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      kind: authProvider.kind,
      supportsEmailVerification: authProvider.supportsEmailVerification,
      supportsPasswordReset: authProvider.supportsPasswordReset,
      supportsGoogle: authProvider.supportsGoogle,
      signUp: (input) => authProvider.signUp(input),
      signIn: (email, password) => authProvider.signIn(email, password),
      signInWithGoogle: authProvider.signInWithGoogle?.bind(authProvider),
      resendVerificationEmail: authProvider.resendVerificationEmail?.bind(authProvider),
      refreshUser: authProvider.refreshUser?.bind(authProvider),
      resetPassword: (email) => authProvider.resetPassword(email),
      signOut: () => authProvider.signOut(),
      deleteAccount: (password) => authProvider.deleteAccount(password),
    }),
    [authProvider, user],
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
