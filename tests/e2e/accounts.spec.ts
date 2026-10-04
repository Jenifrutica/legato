import { expect, test } from '@playwright/test'
import { acceptCookies, importWavFiles, registerAndEnter } from './fixtures'

test('cambiar de cuenta no hereda nada de la anterior', async ({ page }) => {
  await page.goto('/')
  await registerAndEnter(page, { email: 'cuenta-a@legato.local' })
  await acceptCookies(page)

  await importWavFiles(page, ['A'])
  await expect(page.getByText('1 canción(es) importada(s)')).toBeVisible()
  await page.getByRole('button', { name: 'Reproducir A' }).click()
  await expect(page.getByRole('button', { name: 'Pausar' }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Salir' }).click()
  await expect(page.getByRole('tab', { name: 'Crear cuenta' })).toBeVisible()

  await registerAndEnter(page, { email: 'cuenta-b@legato.local' })
  await acceptCookies(page)

  // Nada del usuario anterior: ni reproducción, ni biblioteca, ni historial.
  await expect(page.getByRole('heading', { name: 'Sin reproducción' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Pausar' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Deshacer' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Rehacer' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Reproducir A' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Agregar / })).toHaveCount(0)
})
