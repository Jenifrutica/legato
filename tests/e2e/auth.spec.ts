import { expect, test } from '@playwright/test'
import { acceptCookies, registerAndEnter } from './fixtures'

test('login obligatorio: registro, salida, error de contraseña y entrada', async ({ page }) => {
  await page.goto('/')

  // La puerta bloquea la app sin sesión
  await expect(page.getByRole('tab', { name: 'Biblioteca' })).toHaveCount(0)
  await expect(page.getByRole('tab', { name: 'Crear cuenta' })).toBeVisible()

  await registerAndEnter(page)
  await acceptCookies(page)
  await expect(page.getByRole('tab', { name: 'Biblioteca' })).toBeVisible()

  await page.getByRole('button', { name: 'Salir' }).click()
  await expect(page.getByRole('tab', { name: 'Entrar' })).toBeVisible()

  await page.getByLabel('Correo').fill('e2e@legato.local')
  await page.getByLabel('Contraseña').fill('incorrecta1')
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('Correo o contraseña incorrectos.')).toBeVisible()

  await page.getByLabel('Contraseña').fill('legato1234')
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('tab', { name: 'Biblioteca' })).toBeVisible()
})

test('eliminar cuenta borra el usuario y vuelve a la puerta', async ({ page }) => {
  await page.goto('/')
  await registerAndEnter(page)
  await acceptCookies(page)

  await page.getByRole('button', { name: 'Ajustes' }).click()
  await page.getByRole('button', { name: 'Eliminar cuenta' }).click()
  await page.getByLabel('Escribe tu contraseña para confirmar').fill('legato1234')
  await page.getByRole('button', { name: 'Eliminar definitivamente' }).click()

  await expect(page.getByRole('tab', { name: 'Crear cuenta' })).toBeVisible()

  await page.getByLabel('Correo').fill('e2e@legato.local')
  await page.getByLabel('Contraseña').fill('legato1234')
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('Correo o contraseña incorrectos.')).toBeVisible()
})
