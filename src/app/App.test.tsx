import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('muestra el nombre del proyecto', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Legato' })).toBeInTheDocument()
  })

  it('expone los landmarks principales del shell', () => {
    render(<App />)

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Progreso de la canción' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Reproductor' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Escenario de reproducción' })).toBeInTheDocument()
    expect(screen.getAllByText('Biblioteca').length).toBeGreaterThan(0)
  })
})
