import { expect, test } from '@playwright/test'
import { acceptCookies, createPlaylist, importWavFiles, registerAndEnter } from './fixtures'

test('vaciar la biblioteca pide confirmación y la deja vacía', async ({ page }) => {
  await page.goto('/')
  await registerAndEnter(page)
  await acceptCookies(page)
  await importWavFiles(page, ['A', 'B'])
  await expect(page.getByText('2 canción(es) importada(s)')).toBeVisible()

  // El primer clic pide confirmación; no borra todavía.
  await page.getByRole('button', { name: 'Eliminar todo' }).click()
  await expect(page.getByRole('button', { name: /Eliminar 2 canciones/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reproducir A' })).toBeVisible()

  // Cancelar no borra.
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page.getByRole('button', { name: 'Reproducir A' })).toBeVisible()

  // Confirmar borra todo.
  await page.getByRole('button', { name: 'Eliminar todo' }).click()
  await page.getByRole('button', { name: /Eliminar 2 canciones/ }).click()
  await expect(page.getByText('Biblioteca vaciada.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reproducir A' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Eliminar todo' })).toHaveCount(0)
})

test('al vaciar la biblioteca las playlists quedan a 0 canciones', async ({ page }) => {
  await page.goto('/')
  await registerAndEnter(page)
  await acceptCookies(page)
  await importWavFiles(page, ['A', 'B'])

  await createPlaylist(page, 'Set')
  await page.getByRole('tab', { name: 'Biblioteca' }).click()
  await page.getByLabel('Agregar A a una playlist').click()
  await page.getByRole('menuitem', { name: 'Set' }).click()

  await page.getByRole('tab', { name: 'Playlists' }).click()
  await expect(page.getByRole('button', { name: /^Set/ })).toContainText('1')

  await page.getByRole('tab', { name: 'Biblioteca' }).click()
  await page.getByRole('button', { name: 'Eliminar todo' }).click()
  await page.getByRole('button', { name: /Eliminar 2 canciones/ }).click()

  await page.getByRole('tab', { name: 'Playlists' }).click()
  await expect(page.getByRole('button', { name: /^Set/ })).toContainText('0')
})
