import { CognitoAuthProvider } from './cognito-auth-provider'
import { FirebaseAuthProvider } from './firebase-auth-provider'
import { LocalAuthProvider } from './local-auth-provider'
import type { AuthEnv, AuthProvider, AuthProviderKind } from './types'

function envValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function readAuthEnv(): AuthEnv {
  const mode = envValue(import.meta.env.VITE_AUTH_MODE)
  const apiKey = envValue(import.meta.env.VITE_FIREBASE_API_KEY)
  const authDomain = envValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
  const projectId = envValue(import.meta.env.VITE_FIREBASE_PROJECT_ID)
  const appId = envValue(import.meta.env.VITE_FIREBASE_APP_ID)
  const cognitoDomain = envValue(import.meta.env.VITE_COGNITO_DOMAIN)
  const cognitoClientId = envValue(import.meta.env.VITE_COGNITO_CLIENT_ID)

  return {
    mode:
      mode === 'firebase' || mode === 'cognito' || mode === 'local'
        ? (mode as AuthProviderKind)
        : 'firebase',
    cognitoDomain,
    cognitoClientId,
    redirectUri: envValue(import.meta.env.VITE_COGNITO_REDIRECT_URI),
    firebase:
      apiKey !== undefined &&
      authDomain !== undefined &&
      projectId !== undefined &&
      appId !== undefined
        ? { apiKey, authDomain, projectId, appId }
        : undefined,
  }
}

/** Decide el proveedor real: Firebase si está configurado, si no el respaldo local. */
export function resolveAuthMode(env: AuthEnv): AuthProviderKind {
  if (
    env.mode === 'cognito' &&
    env.cognitoDomain !== undefined &&
    env.cognitoClientId !== undefined
  ) {
    return 'cognito'
  }
  if (env.mode === 'local') {
    return 'local'
  }
  return env.firebase !== undefined ? 'firebase' : 'local'
}

export function createAuthProvider(env: AuthEnv = readAuthEnv()): AuthProvider {
  const mode = resolveAuthMode(env)

  if (mode === 'firebase' && env.firebase !== undefined) {
    return new FirebaseAuthProvider(env.firebase)
  }

  if (mode === 'cognito' && env.cognitoDomain !== undefined && env.cognitoClientId !== undefined) {
    return new CognitoAuthProvider({
      domain: env.cognitoDomain,
      clientId: env.cognitoClientId,
      redirectUri: env.redirectUri ?? window.location.origin,
    })
  }

  return new LocalAuthProvider()
}
