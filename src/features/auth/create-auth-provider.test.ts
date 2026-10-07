import { describe, expect, it } from 'vitest'
import { resolveAuthMode } from './create-auth-provider'
import type { AuthEnv } from './types'

const firebase: AuthEnv['firebase'] = {
  apiKey: 'key',
  authDomain: 'legato.firebaseapp.com',
  projectId: 'legato',
  appId: 'app',
}

describe('resolveAuthMode', () => {
  it('usa Firebase cuando está configurado', () => {
    expect(resolveAuthMode({ mode: 'firebase', firebase })).toBe('firebase')
    expect(resolveAuthMode({ mode: 'firebase' })).toBe('local')
  })

  it('el modo local explícito gana', () => {
    expect(resolveAuthMode({ mode: 'local', firebase })).toBe('local')
  })
})
