import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp, TEST_USER } from './test-auth'

describe('AuthGate', () => {
  it('entra directo aunque el correo no esté verificado', async () => {
    renderApp({ user: { ...TEST_USER, emailVerified: false } })

    expect(await screen.findByRole('main')).toBeInTheDocument()
  })

  it('permite entrar como invitado', async () => {
    renderApp({ user: null })

    const guest = await screen.findByRole('button', { name: 'Entrar como invitado' })
    await userEvent.click(guest)

    expect(await screen.findByRole('main')).toBeInTheDocument()
  })
})
