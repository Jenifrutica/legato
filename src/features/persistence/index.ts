export { getDatabase } from './db'
export type {
  AnalysisRecord,
  AuthSessionRecord,
  ChordRecord,
  LyricsRecord,
  NoteRecord,
  PlaylistRecord,
  SessionRecord,
  SetlistRecord,
  SongRecord,
  UserRecord,
} from './db'
export { recordToTrack, trackToRecord } from './mappers'
export {
  adoptOrphanData,
  deleteUserData,
  getActiveUserId,
  hydrateStores,
  resetStores,
  saveCurrentSession,
  setActiveUserId,
  startPersistence,
  stopPersistence,
  syncAnalysis,
  syncChords,
  syncLyrics,
  syncNotes,
  syncPlaylists,
  syncSetlists,
  syncSongs,
} from './persistence'
