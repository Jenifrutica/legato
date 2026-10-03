import { render } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('accesibilidad de la pantalla principal', () => {
  it('no tiene violaciones de axe-core', async () => {
    const { container } = render(<App />)

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })
})
