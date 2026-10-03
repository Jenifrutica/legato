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
    expect(
      screen.getAllByRole('slider', { name: 'Progreso de la canción' }).length,
    ).toBeGreaterThan(0)
    expect(screen.getByRole('region', { name: 'Reproductor' })).toBeInTheDocument()
    expect(
      screen.getAllByRole('region', { name: 'Escenario de reproducción' }).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('Biblioteca').length).toBeGreaterThan(0)
  })

  it('ofrece las pestañas del panel lateral', () => {
    render(<App />)

    expect(screen.getByRole('tab', { name: 'Biblioteca' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Playlists' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Lista' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Audio' })).toBeInTheDocument()
  })
})
