import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { AuthContextProvider } from '../features/auth'
import type { AuthProvider, AuthUser } from '../features/auth'
import { AuthGate } from './App'

export const TEST_USER: AuthUser = {
  id: 'u-test',
  name: 'Pruebas',
  email: 'pruebas@legato.local',
  pictureUrl: null,
  emailVerified: true,
  provider: 'local',
}

export function createTestAuthProvider(options: { user?: AuthUser | null } = {}): AuthProvider {
  let current: AuthUser | null = options.user === undefined ? TEST_USER : options.user
  return {
    kind: 'local',
    supportsEmailVerification: false,
    supportsPasswordReset: false,
    supportsGoogle: false,
    init: async () => {},
    getUser: () => current,
    signUp: async () => ({ needsEmailVerification: false }),
    signIn: async () => {},
    resetPassword: async () => {},
    signOut: async () => {
      current = null
    },
    deleteAccount: async () => {
      current = null
    },
    subscribe: () => () => {},
  }
}

export function renderApp(options: { user?: AuthUser | null } = {}): ReturnType<typeof render> {
  const provider = createTestAuthProvider(options)
  const ui: ReactElement = (
    <AuthContextProvider provider={provider}>
      <AuthGate />
    </AuthContextProvider>
  )
  return render(ui)
}
