import { expect, test } from '@playwright/test'
import { acceptCookies, registerAndEnter } from './fixtures'

test.use({
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
    ],
  },
})

test('modo micrófono: pide permiso, escucha y se detiene', async ({ page }) => {
  await page.goto('/')
  await registerAndEnter(page)
  await acceptCookies(page)

  await page.getByRole('tab', { name: 'Audio' }).click()
  await page.getByRole('button', { name: 'Escuchar por micrófono' }).click()
  await expect(page.getByText('En vivo')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Detener micrófono' })).toBeVisible()

  await page.getByRole('button', { name: 'Detener micrófono' }).click()
  await expect(page.getByRole('button', { name: 'Escuchar por micrófono' })).toBeVisible()
})
