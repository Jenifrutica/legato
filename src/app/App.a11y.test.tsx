import { screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { renderApp } from './test-auth'

async function violations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
  return results.violations
}

describe('accesibilidad de la pantalla principal', () => {
  it('no tiene violaciones de axe-core', async () => {
    const { container } = renderApp()
    await screen.findByRole('main')
    expect(await violations(container)).toEqual([])
  })

  it('la puerta de entrada tampoco tiene violaciones', async () => {
    const { container } = renderApp({ user: null })
    await screen.findByRole('tab', { name: 'Crear cuenta' })
    expect(await violations(container)).toEqual([])
  })
})
