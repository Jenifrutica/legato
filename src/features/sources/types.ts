export type SourceId = 'spotify' | 'audius' | 'jamendo'

export type SourceTrack = {
  id: string
  sourceId: SourceId
  title: string
  artist: string
  album: string | null
  durationSeconds: number | null
  streamUrl: string | null
  artworkUrl: string | null
  downloadable: boolean
  externalUrl: string | null
}
