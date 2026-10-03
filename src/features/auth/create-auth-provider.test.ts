import { describe, expect, it } from 'vitest'
import { CognitoAuthProvider } from './cognito-auth-provider'
import { createAuthProvider } from './create-auth-provider'
import { LocalAuthProvider } from './local-auth-provider'

describe('createAuthProvider', () => {
  it('usa perfil local en modo local', () => {
    expect(createAuthProvider({ localMode: true })).toBeInstanceOf(LocalAuthProvider)
  })

  it('usa Cognito cuando hay configuracion completa', () => {
    const provider = createAuthProvider({
      localMode: false,
      cognitoDomain: 'legato-123.auth.us-east-1.amazoncognito.com',
      cognitoClientId: 'abc123',
    })

    expect(provider).toBeInstanceOf(CognitoAuthProvider)
    expect(provider.kind).toBe('cognito')
  })

  it('cae a perfil local si falta configuracion de Cognito', () => {
    expect(createAuthProvider({ localMode: false })).toBeInstanceOf(LocalAuthProvider)
    expect(
      createAuthProvider({ localMode: false, cognitoDomain: 'legato-123.example.com' }),
    ).toBeInstanceOf(LocalAuthProvider)
    expect(createAuthProvider({ localMode: false, cognitoClientId: 'abc123' })).toBeInstanceOf(
      LocalAuthProvider,
    )
  })
})
