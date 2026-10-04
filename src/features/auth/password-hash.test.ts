import { describe, expect, it } from 'vitest'
import {
  constantTimeEqual,
  hashPassword,
  PBKDF2_ITERATIONS,
  randomToken,
  sha256Base64,
  verifyPassword,
} from './password-hash'

describe('password-hash', () => {
  it('hashea con salt distinto y verifica correctamente', async () => {
    const first = await hashPassword('secreta123')
    const second = await hashPassword('secreta123')

    expect(first.hash).not.toBe(second.hash)
    expect(first.salt).not.toBe(second.salt)
    expect(first.iterations).toBe(PBKDF2_ITERATIONS)

    expect(await verifyPassword('secreta123', first)).toBe(true)
    expect(await verifyPassword('otra-cosa', first)).toBe(false)
  })

  it('constantTimeEqual compara sin filtrar longitud', () => {
    expect(constantTimeEqual('abc', 'abc')).toBe(true)
    expect(constantTimeEqual('abc', 'abd')).toBe(false)
    expect(constantTimeEqual('abc', 'abcd')).toBe(false)
    expect(constantTimeEqual('', '')).toBe(true)
  })

  it('randomToken y sha256Base64 son estables y no reversibles', async () => {
    const token = randomToken()
    expect(token.length).toBeGreaterThan(30)
    expect(token).not.toContain('+')

    const first = await sha256Base64(token)
    const second = await sha256Base64(token)
    expect(first).toBe(second)
    expect(first).not.toBe(token)
  })
})
