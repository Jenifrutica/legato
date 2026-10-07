import { expect, test } from '@playwright/test'
import { acceptCookies, importWavFiles, registerAndEnter } from './fixtures'

test.use({ viewport: { width: 390, height: 844 } })

test('navegación inferior y panel de músicos en móvil', async ({ page }) => {
  await page.goto('/')
  await registerAndEnter(page)
  await acceptCookies(page)
  await importWavFiles(page, ['A'])

  // La navegación inferior cambia de panel (Buscar y Playlists).
  await page.getByRole('button', { name: 'Playlists' }).last().click()
  await expect(page.getByRole('button', { name: 'Nueva playlist' })).toBeVisible()

  await page.getByRole('button', { name: 'Buscar' }).last().click()
  await expect(page.getByRole('searchbox')).toBeVisible()

  // El panel de músicos abre a pantalla completa.
  await page.getByRole('button', { name: 'Panel de músicos' }).click()
  await expect(page.getByRole('heading', { name: 'Estructura' })).toBeVisible()
})

test('no hay desbordamiento horizontal a 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')

  const landing = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(landing).toBeLessThanOrEqual(1)

  await registerAndEnter(page)
  await acceptCookies(page)

  const app = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(app).toBeLessThanOrEqual(1)
})
