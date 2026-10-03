import type { SourceTrack } from './types'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI ?? 'http://127.0.0.1:5173'
const SCOPES =
  'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state playlist-read-private'
const TOKENS_KEY = 'legato.spotify.tokens'
const PKCE_KEY = 'legato.spotify.pkce'
const ACCOUNTS = 'https://accounts.spotify.com'
const API = 'https://api.spotify.com/v1'

type SpotifyTokens = {
  accessToken: string
  refreshToken: string | null
  expiresAt: number
}

export function isSpotifyConfigured(): boolean {
  return typeof CLIENT_ID === 'string' && CLIENT_ID.length > 0
}

export function isSpotifyConnected(): boolean {
  return readTokens() !== null
}

export function disconnectSpotify(): void {
  localStorage.removeItem(TOKENS_KEY)
}

function readTokens(): SpotifyTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    return raw === null ? null : (JSON.parse(raw) as SpotifyTokens)
  } catch {
    return null
  }
}

function storeTokens(tokens: SpotifyTokens): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

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

export async function connectSpotify(): Promise<void> {
  if (!isSpotifyConfigured()) {
    return
  }

  const verifier = randomVerifier()
  const state = randomVerifier()
  const challenge = await createChallenge(verifier)
  sessionStorage.setItem(PKCE_KEY, JSON.stringify({ verifier, state }))

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  })

  window.location.assign(`${ACCOUNTS}/authorize?${params.toString()}`)
}

export async function handleSpotifyRedirect(): Promise<boolean> {
  if (!isSpotifyConfigured()) {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (code === null) {
    return false
  }

  const raw = sessionStorage.getItem(PKCE_KEY)
  sessionStorage.removeItem(PKCE_KEY)
  if (raw === null) {
    return false
  }

  const { verifier, state } = JSON.parse(raw) as { verifier: string; state: string }
  if (params.get('state') !== state) {
    return false
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  })

  const response = await fetch(`${ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    return false
  }

  const data = (await response.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  storeTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: Date.now() + data.expires_in * 1000,
  })
  window.history.replaceState({}, '', window.location.pathname)
  return true
}

async function getAccessToken(): Promise<string | null> {
  const tokens = readTokens()
  if (tokens === null) {
    return null
  }

  if (tokens.expiresAt > Date.now() + 30_000) {
    return tokens.accessToken
  }

  if (tokens.refreshToken === null) {
    return null
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    refresh_token: tokens.refreshToken,
  })

  const response = await fetch(`${ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  const updated: SpotifyTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? tokens.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  storeTokens(updated)
  return updated.accessToken
}

export async function getSpotifyAccessToken(): Promise<string | null> {
  return getAccessToken()
}

export async function getSpotifyProfile(): Promise<{ name: string } | null> {
  const token = await getAccessToken()
  if (token === null) {
    return null
  }

  const response = await fetch(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(await describeError(response))
  }

  const data = (await response.json()) as { display_name?: string }
  return { name: data.display_name ?? 'Spotify' }
}

async function describeError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } }
    const message = body.error?.message
    return message === undefined ? `HTTP ${response.status}` : `HTTP ${response.status}: ${message}`
  } catch {
    return `HTTP ${response.status}`
  }
}

type SpotifyTrack = {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: { name: string; images: Array<{ url: string }> }
  duration_ms: number
  preview_url: string | null
  external_urls: { spotify: string }
}

export function mapSpotifyTrack(track: SpotifyTrack): SourceTrack {
  return {
    id: track.id,
    sourceId: 'spotify',
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(', '),
    album: track.album.name,
    durationSeconds: track.duration_ms / 1000,
    streamUrl: track.preview_url,
    artworkUrl: track.album.images[0]?.url ?? null,
    downloadable: false,
    externalUrl: track.external_urls.spotify,
  }
}

export async function searchSpotify(query: string): Promise<SourceTrack[]> {
  const token = await getAccessToken()
  if (token === null) {
    throw new Error('not-connected')
  }

  const params = new URLSearchParams({ q: query, type: 'track', limit: '10' })
  const response = await fetch(`${API}/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(await describeError(response))
  }

  const data = (await response.json()) as { tracks?: { items: SpotifyTrack[] } }

  return (data.tracks?.items ?? []).map(mapSpotifyTrack)
}

export type SpotifyPlaylistSummary = {
  id: string
  name: string
  trackCount: number
  artworkUrl: string | null
}

type SpotifyPlaylistItem = {
  id: string
  name: string
  images?: Array<{ url: string }>
  tracks?: { total?: number }
}

/** Playlists de la cuenta conectada (requiere scope playlist-read-private). */
export async function fetchSpotifyPlaylists(): Promise<SpotifyPlaylistSummary[]> {
  const token = await getAccessToken()
  if (token === null) {
    throw new Error('not-connected')
  }

  const response = await fetch(`${API}/me/playlists?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(await describeError(response))
  }

  const data = (await response.json()) as { items?: Array<SpotifyPlaylistItem | null> }

  return (data.items ?? [])
    .filter((item): item is SpotifyPlaylistItem => item !== null)
    .map((item) => ({
      id: item.id,
      name: item.name,
      trackCount: item.tracks?.total ?? 0,
      artworkUrl: item.images?.[0]?.url ?? null,
    }))
}

/** Pistas de una playlist de Spotify como referencias externas (con tope). */
export async function fetchSpotifyPlaylistTracks(
  playlistId: string,
  limit = 100,
): Promise<SourceTrack[]> {
  const token = await getAccessToken()
  if (token === null) {
    throw new Error('not-connected')
  }

  const tracks: SourceTrack[] = []
  let offset = 0

  while (tracks.length < limit) {
    const response = await fetch(
      `${API}/playlists/${playlistId}/tracks?limit=50&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    if (!response.ok) {
      throw new Error(await describeError(response))
    }

    const data = (await response.json()) as {
      items?: Array<{ track?: (SpotifyTrack & { is_local?: boolean }) | null } | null>
      next?: string | null
    }

    for (const item of data.items ?? []) {
      const track = item?.track
      if (track === null || track === undefined || track.is_local === true || track.id === '') {
        continue
      }
      tracks.push(mapSpotifyTrack(track))
    }

    if (data.next === null || data.next === undefined) {
      break
    }
    offset += 50
  }

  return tracks.slice(0, limit)
}
