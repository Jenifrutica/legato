import { expect, test } from '@playwright/test'
import { acceptCookies, createPlaylist, dragHandle, importWavFiles } from './fixtures'

test('cola: añadir al final, reproducir siguiente, quitar y reordenar sin cambiar lo que suena', async ({
  page,
}) => {
  await page.goto('/')
  await acceptCookies(page)

  await importWavFiles(page, ['A', 'B', 'C'])
  await expect(page.getByText('3 canción(es) importada(s)')).toBeVisible()

  // Contexto limpio: playlist con A, se reproduce desde ahí → cola [A].
  await createPlaylist(page, 'Cola')
  await page.getByRole('tab', { name: 'Biblioteca' }).click()
  await page.getByLabel('Agregar A a una playlist').selectOption({ label: 'Cola' })
  await page.getByRole('tab', { name: 'Playlists' }).click()
  await page.getByRole('button', { name: /^Cola/ }).click()
  await page.getByRole('button', { name: 'Reproducir A' }).click()
  await expect(page.getByRole('button', { name: 'Pausar', exact: true }).last()).toBeVisible()

  // B al final y C como siguiente → [A, C, B]
  await page.getByRole('tab', { name: 'Biblioteca' }).click()
  await page.getByRole('button', { name: 'Opciones de cola para B' }).click()
  await page.getByRole('menuitem', { name: 'Añadir al final' }).click()
  await page.getByRole('button', { name: 'Opciones de cola para C' }).click()
  await page.getByRole('menuitem', { name: 'Reproducir siguiente' }).click()

  await page.getByRole('tab', { name: 'Cola' }).click()
  const rows = page.getByRole('list', { name: 'Cola' }).getByRole('listitem')

  await expect(rows).toHaveCount(3)
  await expect(rows.nth(0)).toContainText('A')
  await expect(rows.nth(1)).toContainText('C')
  await expect(rows.nth(2)).toContainText('B')

  await page.getByRole('button', { name: 'Quitar C de la cola' }).click()
  await expect(rows).toHaveCount(2)
  await expect(rows.nth(1)).toContainText('B')

  await dragHandle(page, 'Reordenar en la cola B', 'Reordenar en la cola A')
  await expect(rows.nth(0)).toContainText('B')
  await expect(rows.nth(1)).toContainText('A')

  // El fix #12 también aplica a la cola: sigue sonando A aunque cambie de posición.
  await expect(page.locator('main h1')).toContainText('A')
  await expect(page.getByRole('button', { name: 'Pausar', exact: true }).last()).toBeVisible()
})
