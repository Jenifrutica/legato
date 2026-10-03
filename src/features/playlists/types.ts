export type Playlist = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export type PlaylistSnapshot = Playlist & {
  trackIds: string[]
}
