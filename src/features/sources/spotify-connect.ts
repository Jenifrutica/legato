import type { SpotifyPlaybackState } from './spotify-player'
import { getSpotifyAccessToken } from './spotify'

export type SpotifyDevice = {
  id: string
  name: string
  isActive: boolean
  type: string
  restricted: boolean
}

/**
 * iPhone/iPad: el SDK (DRM) no es fiable en iOS. La vía que funciona es
 * controlar la **app de Spotify** del teléfono (Spotify Connect).
 */
export function isAppleMobile(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  const ua = navigator.userAgent
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

async function api(path: string, init?: RequestInit): Promise<Response> {
  const token = await getSpotifyAccessToken()
  if (token === null) {
    throw new Error('Sin sesión de Spotify')
  }

  return fetch(`https://api.spotify.com/v1${path}`, {
    ...init,
    headers: (() => {
      const headers = new Headers(init?.headers)
      headers.set('Authorization', `Bearer ${token}`)
      headers.set('Content-Type', 'application/json')
      return headers
    })(),
  })
}

async function ensureOk(response: Response): Promise<void> {
  if (response.ok || response.status === 204) {
    return
  }

  let message = `Spotify API ${response.status}`
  try {
    const body = (await response.json()) as { error?: { message?: string } }
    if (body.error?.message !== undefined) {
      message = `Spotify API ${response.status}: ${body.error.message}`
    }
  } catch {
    // sin cuerpo
  }
  throw new Error(message)
}

export async function listConnectDevices(): Promise<SpotifyDevice[]> {
  const response = await api('/me/player/devices')
  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as {
    devices?: Array<{
      id: string
      name: string
      is_active: boolean
      type: string
      is_restricted: boolean
    }>
  }

  return (data.devices ?? []).map((device) => ({
    id: device.id,
    name: device.name,
    isActive: device.is_active,
    type: device.type,
    restricted: device.is_restricted,
  }))
}

/** Elige un dispositivo: el activo, si no el primero disponible. */
export async function pickConnectDevice(): Promise<SpotifyDevice | null> {
  const devices = await listConnectDevices()
  if (devices.length === 0) {
    return null
  }
  return (
    devices.find((device) => device.isActive && !device.restricted) ??
    devices.find((device) => !device.restricted) ??
    devices[0] ??
    null
  )
}

export async function playUriOnDevice(deviceId: string, uri: string): Promise<void> {
  await ensureOk(
    await api(`/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [uri] }),
    }),
  )
}

export async function pauseActive(): Promise<void> {
  await ensureOk(await api('/me/player/pause', { method: 'PUT' }))
}

export async function resumeActive(): Promise<void> {
  await ensureOk(await api('/me/player/play', { method: 'PUT' }))
}

export async function nextActive(): Promise<void> {
  await ensureOk(await api('/me/player/next', { method: 'POST' }))
}

export async function previousActive(): Promise<void> {
  await ensureOk(await api('/me/player/previous', { method: 'POST' }))
}

export async function seekActive(positionMs: number): Promise<void> {
  await ensureOk(
    await api(`/me/player/seek?position_ms=${Math.max(0, Math.round(positionMs))}`, {
      method: 'PUT',
    }),
  )
}

export async function setActiveVolume(percent: number): Promise<void> {
  const clamped = Math.round(Math.min(100, Math.max(0, percent)))
  await ensureOk(await api(`/me/player/volume?volume_percent=${clamped}`, { method: 'PUT' }))
}

export async function getActivePlayback(): Promise<SpotifyPlaybackState | null> {
  const response = await api('/me/player')
  if (response.status === 204 || !response.ok) {
    return null
  }

  const data = (await response.json()) as {
    is_playing: boolean
    progress_ms: number
    item: {
      uri: string
      name: string
      duration_ms: number
      artists: Array<{ name: string }>
      album: { images: Array<{ url: string }> }
    } | null
  }

  if (data.item === null) {
    return null
  }

  return {
    trackUri: data.item.uri,
    title: data.item.name,
    artist: data.item.artists.map((artist) => artist.name).join(', '),
    artworkUrl: data.item.album.images[0]?.url ?? null,
    positionMs: data.progress_ms,
    durationMs: data.item.duration_ms,
    paused: !data.is_playing,
  }
}
