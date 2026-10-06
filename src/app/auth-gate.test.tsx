import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp, TEST_USER } from './test-auth'

describe('AuthGate con correo sin verificar', () => {
  it('muestra la verificación y permite entrar sin verificar', async () => {
    renderApp({ user: { ...TEST_USER, emailVerified: false } })

    const continueButton = await screen.findByRole('button', { name: 'Entrar sin verificar' })
    await userEvent.click(continueButton)

    expect(await screen.findByRole('main')).toBeInTheDocument()
  })
})
