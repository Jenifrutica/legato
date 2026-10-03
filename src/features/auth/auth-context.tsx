import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createAuthProvider } from './create-auth-provider'
import type { AuthProvider, AuthProviderKind, AuthUser } from './types'

type AuthContextValue = {
  user: AuthUser | null
  kind: AuthProviderKind
  signIn: () => Promise<void>
  signOut: () => Promise<void>
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
      signIn: () => authProvider.signIn(),
      signOut: () => authProvider.signOut(),
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
