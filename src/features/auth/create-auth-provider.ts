import { CognitoAuthProvider } from './cognito-auth-provider'
import { LocalAuthProvider } from './local-auth-provider'
import type { AuthEnv, AuthProvider } from './types'

export function readAuthEnv(): AuthEnv {
  return {
    localMode: import.meta.env.VITE_LOCAL_MODE !== 'false',
    cognitoDomain: import.meta.env.VITE_COGNITO_DOMAIN,
    cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  }
}

export function createAuthProvider(env: AuthEnv = readAuthEnv()): AuthProvider {
  const hasCognitoConfig =
    env.cognitoDomain !== undefined &&
    env.cognitoDomain.length > 0 &&
    env.cognitoClientId !== undefined &&
    env.cognitoClientId.length > 0

  if (!env.localMode && hasCognitoConfig) {
    return new CognitoAuthProvider({
      domain: env.cognitoDomain as string,
      clientId: env.cognitoClientId as string,
      redirectUri: env.redirectUri ?? window.location.origin,
    })
  }

  return new LocalAuthProvider()
}
