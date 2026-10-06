import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export function createWavBuffer(seconds = 30): Buffer {
  const sampleRate = 8000
  const samples = sampleRate * seconds
  const dataSize = samples * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0, 'ascii')
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8, 'ascii')
  buffer.write('fmt ', 12, 'ascii')
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36, 'ascii')
  buffer.writeUInt32LE(dataSize, 40)

  return buffer
}

export async function acceptCookies(page: Page): Promise<void> {
  const button = page.getByRole('button', { name: 'Solo esenciales' })

  if (await button.isVisible().catch(() => false)) {
    await button.click()
  }
}

/** Registra una cuenta local (modo respaldo) y entra en la app. */
export async function registerAndEnter(
  page: Page,
  options: { name?: string; email?: string; password?: string } = {},
): Promise<void> {
  const name = options.name ?? 'Jenifedora'
  const email = options.email ?? 'e2e@legato.local'
  const password = options.password ?? 'legato1234'

  await page.getByRole('tab', { name: 'Crear cuenta' }).click()
  await page.getByLabel('Nombre visible').fill(name)
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.locator('form').getByRole('button', { name: 'Crear cuenta' }).click()
  // Señal estable en móvil y escritorio: el título de la app en la barra superior.
  await expect(page.getByRole('heading', { name: 'Legato' })).toBeVisible({ timeout: 15_000 })
}

export async function createPlaylist(page: Page, name: string): Promise<void> {
  await page.getByRole('tab', { name: 'Playlists' }).click()
  await page.getByRole('button', { name: 'Nueva playlist' }).click()
  const input = page.getByPlaceholder('Nombre de la playlist')
  await input.fill(name)
  await input.press('Enter')
}

export async function importWavFiles(page: Page, names: string[]): Promise<void> {
  await page.locator('input[type="file"]').setInputFiles(
    names.map((name) => ({
      name: `${name}.wav`,
      mimeType: 'audio/wav',
      buffer: createWavBuffer(),
    })),
  )
}

export async function dragHandle(page: Page, fromLabel: string, toLabel: string): Promise<void> {
  const source = page.getByLabel(fromLabel)
  const target = page.getByLabel(toLabel)
  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()

  if (sourceBox === null || targetBox === null) {
    throw new Error('No se pudo ubicar el asa de arrastre')
  }

  const startX = sourceBox.x + sourceBox.width / 2
  const startY = sourceBox.y + sourceBox.height / 2
  const endX = targetBox.x + targetBox.width / 2
  const endY = targetBox.y + targetBox.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.waitForTimeout(120)
  await page.mouse.move(startX, startY + 12, { steps: 5 })
  await page.waitForTimeout(120)
  await page.mouse.move(endX, endY, { steps: 20 })
  await page.waitForTimeout(200)
  await page.mouse.up()
}
