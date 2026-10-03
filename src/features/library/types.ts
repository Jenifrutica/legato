export type LibraryTrack = {
  id: string
  title: string
  artist: string
  album: string | null
  durationSeconds: number | null
  sourceUrl: string
  artworkUrl: string | null
  artworkBlob: Blob | null
  blob: Blob
  fileName: string
  fileSize: number
  mimeType: string
  /** Presente en pistas importadas; ausente en registros antiguos = audio. */
  mediaType?: 'audio' | 'video'
  /** Referencia externa (p. ej. Spotify): no tiene audio propio; se reproduce con su SDK. */
  external?: boolean
  dedupeKey: string
  addedAt: number
  sampleRate: number | null
  bitrate: number | null
  codec: string | null
  channels: number | null
}
