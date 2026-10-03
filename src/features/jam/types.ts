export type JamParticipant = {
  id: string
  name: string
  isHost: boolean
}

export type JamSession = {
  id: string
  participants: JamParticipant[]
  queueTrackIds: string[]
  currentTrackId: string | null
  positionSeconds: number
  isPlaying: boolean
}

export type JamUser = {
  id: string
  name: string
}

export interface JamProvider {
  connect(sessionId: string, user: JamUser): Promise<void>
  disconnect(): Promise<void>
  getSession(): JamSession | null
  setQueue(trackIds: string[]): Promise<void>
  play(trackId: string, positionSeconds: number): Promise<void>
  pause(positionSeconds: number): Promise<void>
  subscribe(listener: (session: JamSession | null) => void): () => void
}
