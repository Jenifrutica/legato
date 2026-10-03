import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('muestra el nombre del proyecto', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Legato' })).toBeInTheDocument()
  })
})
