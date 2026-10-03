export type AuthUser = {
  id: string
  name: string
  email: string | null
  pictureUrl: string | null
}

export type AuthProviderKind = 'local' | 'cognito'

export interface AuthProvider {
  readonly kind: AuthProviderKind
  init(): Promise<void>
  getUser(): AuthUser | null
  signIn(): Promise<void>
  signOut(): Promise<void>
  subscribe(listener: (user: AuthUser | null) => void): () => void
}

export type AuthEnv = {
  localMode: boolean
  cognitoDomain?: string
  cognitoClientId?: string
  redirectUri?: string
}
