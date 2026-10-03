export type Playlist = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export type PlaylistSnapshot = Playlist & {
  trackIds: string[]
}

export type PlaylistStructureNode = {
  id: string
  title: string
  prevId: string | null
  nextId: string | null
}

export type PlaylistRestoreRecord = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  trackIds: string[]
}
