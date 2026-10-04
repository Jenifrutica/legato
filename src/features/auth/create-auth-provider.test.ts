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

  it('cae al respaldo local sin configuración', () => {
    expect(resolveAuthMode({ mode: 'local' })).toBe('local')
    expect(resolveAuthMode({ mode: 'firebase' })).toBe('local')
  })

  it('Cognito solo si se pide y está completo', () => {
    expect(resolveAuthMode({ mode: 'cognito', cognitoDomain: 'd', cognitoClientId: 'c' })).toBe(
      'cognito',
    )
    expect(resolveAuthMode({ mode: 'cognito' })).toBe('local')
  })

  it('el modo local explícito gana aunque haya Firebase', () => {
    expect(resolveAuthMode({ mode: 'local', firebase })).toBe('local')
  })
})
