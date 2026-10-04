export type AuthProviderKind = 'local' | 'firebase' | 'cognito'

export type AuthUser = {
  id: string
  name: string
  email: string | null
  pictureUrl: string | null
  emailVerified: boolean
  /** Proveedor con el que entró (google cuando es OAuth). */
  provider: AuthProviderKind | 'google'
}

export type AuthSignUpInput = {
  email: string
  password: string
  name: string
}

export type AuthSignUpResult = {
  needsEmailVerification: boolean
}

export type AuthErrorCode =
  | 'invalid-credentials'
  | 'invalid-email'
  | 'email-in-use'
  | 'weak-password'
  | 'email-not-verified'
  | 'user-not-found'
  | 'too-many-requests'
  | 'requires-recent-login'
  | 'provider-not-configured'
  | 'not-supported'
  | 'network'
  | 'unknown'

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code)
    this.name = 'AuthError'
    this.code = code
  }
}

export interface AuthProvider {
  readonly kind: AuthProviderKind
  readonly supportsEmailVerification: boolean
  readonly supportsPasswordReset: boolean
  readonly supportsGoogle: boolean
  init(): Promise<void>
  getUser(): AuthUser | null
  signUp(input: AuthSignUpInput): Promise<AuthSignUpResult>
  signIn(email: string, password: string): Promise<void>
  signInWithGoogle?(): Promise<void>
  resendVerificationEmail?(): Promise<void>
  /** Relee el usuario (p. ej. tras confirmar el correo). */
  refreshUser?(): Promise<void>
  resetPassword(email: string): Promise<void>
  signOut(): Promise<void>
  deleteAccount(password?: string): Promise<void>
  subscribe(listener: (user: AuthUser | null) => void): () => void
}

export type AuthEnv = {
  mode: AuthProviderKind
  cognitoDomain?: string
  cognitoClientId?: string
  redirectUri?: string
  firebase?: {
    apiKey: string
    authDomain: string
    projectId: string
    appId: string
    storageBucket?: string
  }
}
