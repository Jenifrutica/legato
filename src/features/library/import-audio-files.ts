import { parseBuffer } from 'music-metadata'
import type { LibraryTrack } from './types'

export const MAX_AUDIO_FILE_BYTES = 200 * 1024 * 1024

const AUDIO_EXTENSIONS = [
  'mp3',
  'm4a',
  'aac',
  'wav',
  'flac',
  'ogg',
  'oga',
  'opus',
  'webm',
  'aiff',
  'aif',
]

export type ImportErrorCode = 'unsupported' | 'tooLarge' | 'duplicate'

export type ImportError = {
  fileName: string
  code: ImportErrorCode
}

export type ImportResult = {
  tracks: LibraryTrack[]
  errors: ImportError[]
}

type ParsedMetadata = {
  title: string | null
  artist: string | null
  album: string | null
  duration: number | null
  artwork: Blob | null
}

export function isAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/')) {
    return true
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  return AUDIO_EXTENSIONS.includes(extension)
}

export function createDedupeKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export async function importAudioFiles(
  files: File[],
  existingKeys: Set<string> = new Set(),
): Promise<ImportResult> {
  const tracks: LibraryTrack[] = []
  const errors: ImportError[] = []
  const seen = new Set(existingKeys)

  for (const file of files) {
    if (!isAudioFile(file)) {
      errors.push({ fileName: file.name, code: 'unsupported' })
      continue
    }

    if (file.size > MAX_AUDIO_FILE_BYTES) {
      errors.push({ fileName: file.name, code: 'tooLarge' })
      continue
    }

    const dedupeKey = createDedupeKey(file)
    if (seen.has(dedupeKey)) {
      errors.push({ fileName: file.name, code: 'duplicate' })
      continue
    }

    seen.add(dedupeKey)
    const metadata = await readMetadata(file)
    const artworkUrl = metadata.artwork === null ? null : URL.createObjectURL(metadata.artwork)

    tracks.push({
      id: crypto.randomUUID(),
      title: metadata.title ?? stripExtension(file.name),
      artist: metadata.artist ?? 'Artista desconocido',
      album: metadata.album,
      durationSeconds: metadata.duration,
      sourceUrl: URL.createObjectURL(file),
      artworkUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type === '' ? 'audio/desconocido' : file.type,
      dedupeKey,
      addedAt: Date.now(),
    })
  }

  return { tracks, errors }
}

async function readMetadata(file: File): Promise<ParsedMetadata> {
  try {
    const buffer = await file.arrayBuffer()
    const parsed = await parseBuffer(
      new Uint8Array(buffer),
      file.type === '' ? undefined : file.type,
    )
    const common = parsed.common
    const picture = common.picture?.[0] ?? null

    return {
      title: common.title?.trim() ?? null,
      artist: common.artist?.trim() ?? null,
      album: common.album?.trim() ?? null,
      duration: parsed.format.duration ?? null,
      artwork:
        picture === null
          ? null
          : new Blob([new Uint8Array(picture.data)], { type: picture.format }),
    }
  } catch {
    return { title: null, artist: null, album: null, duration: null, artwork: null }
  }
}

function stripExtension(name: string): string {
  const index = name.lastIndexOf('.')
  return index > 0 ? name.slice(0, index) : name
}
