import { screen } from '@testing-library/react'
import { renderApp } from './test-auth'

describe('App', () => {
  it('muestra el nombre del proyecto', async () => {
    renderApp()
    expect(await screen.findByRole('heading', { level: 1, name: 'Legato' })).toBeInTheDocument()
  })

  it('expone los landmarks principales del shell', async () => {
    renderApp()

    expect(await screen.findByRole('main')).toBeInTheDocument()
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

  it('ofrece las pestañas del panel lateral', async () => {
    renderApp()

    expect(await screen.findByRole('tab', { name: 'Biblioteca' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Playlists' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Lista' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Audio' })).toBeInTheDocument()
  })

  it('sin sesión muestra la puerta de entrada', async () => {
    renderApp({ user: null })

    expect(await screen.findByRole('tab', { name: 'Crear cuenta' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Biblioteca' })).not.toBeInTheDocument()
  })
})
