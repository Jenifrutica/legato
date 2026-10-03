export type CapsuleContext = 'mostPlayed' | 'forgotten' | 'oneYearAgo' | 'newDiscovery'

export type CapsuleSlide = {
  trackId: string
  title: string
  artist: string
  album: string | null
  artworkUrl: string | null
  /** Segundo donde arranca el fragmento (0–30). */
  startSeconds: number
  context: CapsuleContext
  playCount: number
  addedAt: number
}

export type NostalgiaCapsule = {
  date: string
  userId: string
  expiresAt: number
  slides: CapsuleSlide[]
}
