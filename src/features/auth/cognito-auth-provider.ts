import type { AuthProvider, AuthUser } from './types'

type CognitoConfig = {
  domain: string
  clientId: string
  redirectUri: string
}

type CognitoTokens = {
  idToken: string
  refreshToken: string | null
  expiresAt: number
}

type PkceState = {
  verifier: string
  state: string
}

const TOKENS_KEY = 'legato.auth.cognito.tokens'
const PKCE_KEY = 'legato.auth.cognito.pkce'

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function randomVerifier(): string {
  const bytes = new Uint8Array(48)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

async function createChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64UrlEncode(new Uint8Array(digest))
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1] ?? ''
  const normalized = payload.replaceAll('-', '+').replaceAll('_', '/')
  return JSON.parse(atob(normalized)) as Record<string, unknown>
}

function toUser(idToken: string): AuthUser {
  const claims = decodeJwtPayload(idToken)
  const email = typeof claims.email === 'string' ? claims.email : null
  const name = typeof claims.name === 'string' && claims.name.length > 0 ? claims.name : email

  return {
    id: typeof claims.sub === 'string' ? claims.sub : crypto.randomUUID(),
    name: name ?? 'Usuario',
    email,
    pictureUrl: typeof claims.picture === 'string' ? claims.picture : null,
  }
}

export class CognitoAuthProvider implements AuthProvider {
  readonly kind = 'cognito'
  #config: CognitoConfig
  #user: AuthUser | null = null
  #listeners = new Set<(user: AuthUser | null) => void>()

  constructor(config: CognitoConfig) {
    this.#config = config
  }

  async init(): Promise<void> {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code !== null) {
      const state = params.get('state')
      await this.#exchangeCode(code, state)
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    await this.#restoreSession()
  }

  getUser(): AuthUser | null {
    return this.#user
  }

  async signIn(): Promise<void> {
    const verifier = randomVerifier()
    const state = randomVerifier()
    const challenge = await createChallenge(verifier)

    sessionStorage.setItem(PKCE_KEY, JSON.stringify({ verifier, state } satisfies PkceState))

    const params = new URLSearchParams({
      client_id: this.#config.clientId,
      response_type: 'code',
      scope: 'openid email profile',
      redirect_uri: this.#config.redirectUri,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state,
    })

    window.location.assign(`https://${this.#config.domain}/oauth2/authorize?${params.toString()}`)
  }

  signOut(): Promise<void> {
    localStorage.removeItem(TOKENS_KEY)
    this.#setUser(null)

    const params = new URLSearchParams({
      client_id: this.#config.clientId,
      logout_uri: this.#config.redirectUri,
    })

    window.location.assign(`https://${this.#config.domain}/logout?${params.toString()}`)
    return Promise.resolve()
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.#listeners.add(listener)
    return () => {
      this.#listeners.delete(listener)
    }
  }

  async #exchangeCode(code: string, state: string | null): Promise<void> {
    const raw = sessionStorage.getItem(PKCE_KEY)
    sessionStorage.removeItem(PKCE_KEY)

    if (raw === null) {
      return
    }

    const pkce = JSON.parse(raw) as PkceState
    if (state !== null && state !== pkce.state) {
      return
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.#config.clientId,
      code,
      redirect_uri: this.#config.redirectUri,
      code_verifier: pkce.verifier,
    })

    const response = await fetch(`https://${this.#config.domain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!response.ok) {
      return
    }

    const data = (await response.json()) as {
      id_token: string
      refresh_token?: string
      expires_in: number
    }

    this.#storeTokens({
      idToken: data.id_token,
      refreshToken: data.refresh_token ?? null,
      expiresAt: Date.now() + data.expires_in * 1000,
    })
  }

  async #restoreSession(): Promise<void> {
    const raw = localStorage.getItem(TOKENS_KEY)
    if (raw === null) {
      return
    }

    let tokens: CognitoTokens
    try {
      tokens = JSON.parse(raw) as CognitoTokens
    } catch {
      localStorage.removeItem(TOKENS_KEY)
      return
    }

    if (tokens.expiresAt <= Date.now()) {
      if (tokens.refreshToken === null) {
        localStorage.removeItem(TOKENS_KEY)
        return
      }

      const refreshed = await this.#refresh(tokens.refreshToken)
      if (!refreshed) {
        localStorage.removeItem(TOKENS_KEY)
        return
      }

      tokens = refreshed
    }

    this.#setUser(toUser(tokens.idToken))
  }

  async #refresh(refreshToken: string): Promise<CognitoTokens | null> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.#config.clientId,
      refresh_token: refreshToken,
    })

    const response = await fetch(`https://${this.#config.domain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      id_token: string
      refresh_token?: string
      expires_in: number
    }

    const tokens: CognitoTokens = {
      idToken: data.id_token,
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    }

    this.#storeTokens(tokens)
    return tokens
  }

  #storeTokens(tokens: CognitoTokens): void {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
    this.#setUser(toUser(tokens.idToken))
  }

  #setUser(user: AuthUser | null): void {
    this.#user = user

    for (const listener of this.#listeners) {
      listener(user)
    }
  }
}
