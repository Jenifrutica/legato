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
    await page.getByLabel(`Agregar ${name} a una playlist`).click()
    await page.getByRole('menuitem', { name: 'Set' }).click()
  }

  await page.getByRole('tab', { name: 'Playlists' }).click()
  await page.getByRole('button', { name: /^Set/ }).click()

  const panel = page.getByRole('region', { name: 'Set' })
  await expect(panel.getByLabel('Reordenar C')).toBeVisible()

  const heroControls = page.locator('main')
  await panel.getByRole('button', { name: 'Reproducir A' }).click()
  await expect(
    heroControls.getByRole('button', { name: 'Pausar', exact: true }).last(),
  ).toBeVisible()
  await heroControls.getByRole('button', { name: 'Pausar', exact: true }).last().click()
  await expect(
    heroControls.getByRole('button', { name: 'Reproducir', exact: true }).last(),
  ).toBeVisible()
  await panel.getByRole('button', { name: 'Reproducir A' }).click()
  await expect(
    heroControls.getByRole('button', { name: 'Pausar', exact: true }).last(),
  ).toBeVisible()
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
  await page.getByLabel('Agregar A a una playlist').click()
  await page.getByRole('menuitem', { name: 'Persistente' }).click()

  await page.waitForTimeout(800)
  await page.reload()

  await page.getByRole('tab', { name: 'Playlists' }).click()
  await expect(page.getByRole('button', { name: /^Persistente/ })).toBeVisible()

  await page.getByRole('tab', { name: 'Biblioteca' }).click()
  await expect(page.getByText('A', { exact: true }).first()).toBeVisible()
})

test('crear playlist desde Agregar a… cuando aún no hay ninguna', async ({ page }) => {
  await page.goto('/')
  await acceptCookies(page)

  await importWavFiles(page, ['A'])
  await expect(page.getByText('1 canción(es) importada(s)')).toBeVisible()

  await page.getByLabel('Agregar A a una playlist').click()
  await page.getByRole('menuitem', { name: /Nueva playlist/ }).click()
  await expect(page.getByText('Agregada a la playlist.')).toBeVisible()

  await page.getByRole('tab', { name: 'Playlists' }).click()
  await expect(page.getByRole('button', { name: /^Mi lista/ })).toBeVisible()
})
