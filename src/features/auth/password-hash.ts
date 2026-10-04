export const PBKDF2_ITERATIONS = 310_000
export const PASSWORD_MIN_LENGTH = 8

export type StoredPassword = {
  hash: string
  salt: string
  iterations: number
}

function bytesToBase64(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

export function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<string> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    256,
  )
  return bytesToBase64(new Uint8Array(bits))
}

/** Comparación en tiempo constante entre dos cadenas base64. */
export function constantTimeEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length)
  let diff = a.length === b.length ? 0 : 1
  for (let index = 0; index < length; index++) {
    diff |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0)
  }
  return diff === 0
}

export async function hashPassword(
  password: string,
  iterations = PBKDF2_ITERATIONS,
): Promise<StoredPassword> {
  const salt = randomBytes(16)
  return {
    hash: await derive(password, salt, iterations),
    salt: bytesToBase64(salt),
    iterations,
  }
}

export async function verifyPassword(password: string, stored: StoredPassword): Promise<boolean> {
  const candidate = await derive(password, base64ToBytes(stored.salt), stored.iterations)
  return constantTimeEqual(candidate, stored.hash)
}

/** Token de sesión aleatorio (base64url). */
export function randomToken(bytes = 32): string {
  return bytesToBase64(randomBytes(bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

/** SHA-256 en base64 (para no guardar el token de sesión en claro). */
export async function sha256Base64(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return bytesToBase64(new Uint8Array(digest))
}
