import { expect, test } from '@playwright/test'
import { acceptCookies, createPlaylist, dragHandle, importWavFiles } from './fixtures'

test('regresion #12: reordenar la playlist no cambia la cancion en curso', async ({ page }) => {
  await page.goto('/')
  await acceptCookies(page)

  await importWavFiles(page, ['A', 'B', 'C'])
  await expect(page.getByText('3 canción(es) importada(s)')).toBeVisible()

  await createPlaylist(page, 'Set')
  await page.getByRole('tab', { name: 'Biblioteca' }).click()

  for (const name of ['A', 'B', 'C']) {
    await page.getByLabel(`Agregar ${name} a una playlist`).selectOption({ label: 'Set' })
  }

  await page.getByRole('tab', { name: 'Playlists' }).click()
  await page.getByRole('button', { name: /^Set/ }).click()

  const panel = page.getByRole('region', { name: 'Set' })
  await expect(panel.getByLabel('Reordenar C')).toBeVisible()

  await panel.getByRole('button', { name: 'Reproducir A' }).click()
  await expect(page.getByText('A', { exact: true }).first()).toBeVisible()

  await dragHandle(page, 'Reordenar C', 'Reordenar A')

  await expect(panel.locator('li').first()).toContainText('C')
  await expect(panel.getByRole('button', { name: 'Reproducir A' })).toBeVisible()

  await page.getByRole('button', { name: 'Siguiente' }).click()
  await expect(page.getByText('B', { exact: true }).first()).toBeVisible()
})

test('persistencia: biblioteca y playlists sobreviven a la recarga', async ({ page }) => {
  await page.goto('/')
  await acceptCookies(page)

  await importWavFiles(page, ['A'])
  await expect(page.getByText('1 canción(es) importada(s)')).toBeVisible()

  await createPlaylist(page, 'Persistente')
  await page.getByRole('tab', { name: 'Biblioteca' }).click()
  await page.getByLabel('Agregar A a una playlist').selectOption({ label: 'Persistente' })

  await page.waitForTimeout(800)
  await page.reload()

  await page.getByRole('tab', { name: 'Playlists' }).click()
  await expect(page.getByRole('button', { name: /^Persistente/ })).toBeVisible()

  await page.getByRole('tab', { name: 'Biblioteca' }).click()
  await expect(page.getByText('A', { exact: true }).first()).toBeVisible()
})
