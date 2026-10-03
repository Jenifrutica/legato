export type LibraryTrack = {
  id: string
  title: string
  artist: string
  album: string | null
  durationSeconds: number | null
  sourceUrl: string
  artworkUrl: string | null
  fileName: string
  fileSize: number
  mimeType: string
  dedupeKey: string
  addedAt: number
}
