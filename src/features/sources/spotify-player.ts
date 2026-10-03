export type SpotifyPlaybackState = {
  trackUri: string | null
  title: string
  artist: string
  artworkUrl: string | null
  positionMs: number
  durationMs: number
  paused: boolean
}

export type SpotifyBridge = {
  playUris: (uris: string[], positionMs?: number) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  next: () => Promise<void>
  previous: () => Promise<void>
  seek: (positionMs: number) => Promise<void>
  setVolume: (value: number) => Promise<void>
  getState: () => Promise<SpotifyPlaybackState | null>
}

type SdkTrack = {
  uri: string
  name: string
  artists: Array<{ name: string }>
  album: { images: Array<{ url: string }> }
}

type SdkState = {
  paused: boolean
  position: number
  duration: number
  track_window: { current_track: SdkTrack }
}

type SdkPlayer = {
  connect: () => Promise<boolean>
  disconnect: () => void
  addListener: (event: string, callback: (payload: unknown) => void) => void
  getCurrentState: () => Promise<SdkState | null>
  setVolume: (value: number) => Promise<void>
}

declare global {
  interface Window {
    Spotify?: { Player: new (options: Record<string, unknown>) => SdkPlayer }
    onSpotifyWebPlaybackSDKReady?: () => void
  }
}

let sdkPromise: Promise<void> | null = null

export function loadSpotifySdk(): Promise<void> {
  if (sdkPromise !== null) {
    return sdkPromise
  }

  sdkPromise = new Promise((resolve, reject) => {
    if (window.Spotify !== undefined) {
      resolve()
      return
    }

    window.onSpotifyWebPlaybackSDKReady = () => resolve()
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    script.onerror = () => reject(new Error('No se pudo cargar Spotify SDK'))
    document.body.appendChild(script)
  })

  return sdkPromise
}

function toPlaybackState(state: SdkState | null): SpotifyPlaybackState | null {
  if (state === null) {
    return null
  }

  const track = state.track_window.current_track
  return {
    trackUri: track.uri,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(', '),
    artworkUrl: track.album.images[0]?.url ?? null,
    positionMs: state.position,
    durationMs: state.duration,
    paused: state.paused,
  }
}

export async function createSpotifyBridge(options: {
  getToken: () => Promise<string | null>
  onState: (state: SpotifyPlaybackState | null) => void
}): Promise<{ bridge: SpotifyBridge; deviceId: string; disconnect: () => void }> {
  await loadSpotifySdk()
  const sdk = window.Spotify
  if (sdk === undefined) {
    throw new Error('Spotify SDK no disponible')
  }

  const player = new sdk.Player({
    name: 'Legato',
    getOAuthToken: (callback: (token: string) => void) => {
      void options.getToken().then((token) => callback(token ?? ''))
    },
    volume: 1,
  })

  const deviceId = await new Promise<string>((resolve, reject) => {
    player.addListener('ready', (payload) => {
      resolve((payload as { device_id: string }).device_id)
    })
    player.addListener('not_ready', () => reject(new Error('Dispositivo no disponible')))
    player.addListener('authentication_error', () => reject(new Error('Error de autenticación')))
    player.addListener('account_error', () => reject(new Error('Se requiere Spotify Premium')))
    player.addListener('initialization_error', () => reject(new Error('Error al iniciar Spotify')))
    void player.connect()
  })

  player.addListener('player_state_changed', (payload) => {
    options.onState(toPlaybackState(payload as SdkState | null))
  })

  const api = async (path: string, init?: RequestInit): Promise<void> => {
    const token = await options.getToken()
    if (token === null) {
      throw new Error('Sin sesión de Spotify')
    }

    const headers = new Headers(init?.headers)
    headers.set('Authorization', `Bearer ${token}`)
    headers.set('Content-Type', 'application/json')

    const response = await fetch(`https://api.spotify.com/v1${path}`, {
      ...init,
      headers,
    })

    if (!response.ok && response.status !== 204) {
      throw new Error(`Spotify API ${response.status}`)
    }
  }

  const bridge: SpotifyBridge = {
    playUris: (uris, positionMs) =>
      api(`/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris, position_ms: positionMs }),
      }),
    pause: () => api(`/me/player/pause?device_id=${deviceId}`, { method: 'PUT' }),
    resume: () => api(`/me/player/play?device_id=${deviceId}`, { method: 'PUT' }),
    next: () => api('/me/player/next', { method: 'POST' }),
    previous: () => api('/me/player/previous', { method: 'POST' }),
    seek: (positionMs) =>
      api(`/me/player/seek?position_ms=${Math.max(0, Math.round(positionMs))}`, { method: 'PUT' }),
    setVolume: (value) => player.setVolume(Math.min(1, Math.max(0, value))),
    getState: async () => toPlaybackState(await player.getCurrentState()),
  }

  return { bridge, deviceId, disconnect: () => player.disconnect() }
}
