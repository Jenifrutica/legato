import { expect, test } from '@playwright/test'
import { acceptCookies, importWavFiles, registerAndEnter } from './fixtures'

test('volumen y velocidad funcionan en local (escritorio)', async ({ page }) => {
  await page.goto('/')
  await registerAndEnter(page)
  await acceptCookies(page)
  await importWavFiles(page, ['V'])
  await page.getByRole('button', { name: 'Reproducir V' }).click()
  await expect(page.getByRole('button', { name: 'Pausar' }).first()).toBeVisible()

  const volume = page.locator('input[aria-label="Volumen"]:visible')
  await volume.fill('40')
  expect(await page.evaluate(() => window.__legato.getMediaElement().volume)).toBeCloseTo(0.4, 3)

  const speed = page.locator('button[aria-label^="Velocidad"]:visible')
  await speed.click()
  await expect(speed).toHaveText('0.9x')
  expect(await page.evaluate(() => window.__legato.getMediaElement().playbackRate)).toBeCloseTo(
    0.9,
    3,
  )

  await speed.click()
  await expect(speed).toHaveText('0.75x')

  await speed.click()
  await expect(speed).toHaveText('0.5x')

  await speed.click()
  await expect(speed).toHaveText('1x')
})

test('en móvil la barra tiene volumen y velocidad', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await registerAndEnter(page)
  await acceptCookies(page)
  await importWavFiles(page, ['M'])
  await page.getByRole('button', { name: 'Reproducir M' }).click()
  await expect(page.getByRole('button', { name: 'Pausar' }).first()).toBeVisible()

  const volume = page.locator('input[aria-label="Volumen"]:visible')
  await volume.fill('30')
  expect(await page.evaluate(() => window.__legato.getMediaElement().volume)).toBeCloseTo(0.3, 3)

  const speed = page.locator('button[aria-label^="Velocidad"]:visible')
  await speed.click()
  expect(await page.evaluate(() => window.__legato.getMediaElement().playbackRate)).toBeCloseTo(
    0.9,
    3,
  )
})
