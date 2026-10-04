import { expect, test } from '@playwright/test'
import { acceptCookies, createPlaylist, registerAndEnter } from './fixtures'

test('carga, consentimiento, idioma y paginas legales', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Legato').first()).toBeVisible()

  await registerAndEnter(page)
  await acceptCookies(page)
  await expect(page.getByRole('button', { name: 'Solo esenciales' })).toHaveCount(0)

  await page.getByLabel('Idioma').first().selectOption('en')
  await expect(page.getByRole('tab', { name: 'Library' })).toBeVisible()

  await page.getByRole('link', { name: 'Privacy' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeVisible()
  await page.getByRole('link', { name: 'Back to the app' }).click()
  await expect(page.getByRole('tab', { name: 'Library' })).toBeVisible()

  await page.getByLabel('Language').first().selectOption('es')
  await expect(page.getByRole('tab', { name: 'Biblioteca' })).toBeVisible()
})

test('crear playlist con deshacer y rehacer', async ({ page }) => {
  await page.goto('/')
  await registerAndEnter(page)
  await acceptCookies(page)

  await createPlaylist(page, 'E2E Set')

  await page.getByRole('tab', { name: 'Biblioteca' }).click()
  await page.getByRole('button', { name: 'Deshacer' }).click()

  await page.getByRole('tab', { name: 'Playlists' }).click()
  await expect(page.getByRole('button', { name: /^E2E Set/ })).toHaveCount(0)

  await page.getByRole('tab', { name: 'Biblioteca' }).click()
  await page.getByRole('button', { name: 'Rehacer' }).click()

  await page.getByRole('tab', { name: 'Playlists' }).click()
  await expect(page.getByRole('button', { name: /^E2E Set/ })).toBeVisible()
})
