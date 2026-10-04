export const CHUNK_BYTES = 700 * 1024

export type FileManifest = {
  size: number
  mime: string
  chunks: number
}

/** Id de documento seguro para Firestore a partir de una ruta tipo `users/x/songs/y`. */
export function fileIdFromPath(path: string): string {
  return path.replaceAll('/', '__')
}

export function splitBytes(
  bytes: Uint8Array<ArrayBuffer>,
  chunkBytes = CHUNK_BYTES,
): Uint8Array<ArrayBuffer>[] {
  const chunks: Uint8Array<ArrayBuffer>[] = []
  for (let start = 0; start < bytes.length; start += chunkBytes) {
    chunks.push(bytes.slice(start, start + chunkBytes))
  }
  return chunks.length === 0 ? [new Uint8Array(0)] : chunks
}

export function joinBytes(chunks: Uint8Array<ArrayBuffer>[]): Uint8Array<ArrayBuffer> {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

export function bytesToBase64(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = ''
  const step = 8192
  for (let start = 0; start < bytes.length; start += step) {
    binary += String.fromCharCode(...bytes.subarray(start, start + step))
  }
  return btoa(binary)
}

export function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}
