export type LoopMode = 'none' | 'one' | 'all'

export type ChannelMode = 'stereo' | 'left' | 'right' | 'mono'

export type QueueTrack = {
  id: string
  title: string
  artist: string
  album: string | null
  durationSeconds: number | null
  sourceUrl: string
  artworkUrl: string | null
}

export type QueueState = {
  trackIds: string[]
  currentId: string | null
  loopMode: LoopMode
  shuffle: boolean
}

export type StructureNode = {
  id: string
  title: string
  prevId: string | null
  nextId: string | null
}
