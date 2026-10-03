import { describe, expect, it } from 'vitest'
import { applyOutputDevice, listOutputDevices, supportsOutputSelection } from './output-devices'

describe('output devices', () => {
  it('detecta soporte de setSinkId (jsdom no lo soporta)', () => {
    expect(supportsOutputSelection()).toBe(false)
  })

  it('lista vacia cuando no hay mediaDevices', async () => {
    expect(await listOutputDevices()).toEqual([])
  })

  it('aplicar un dispositivo sin setSinkId devuelve false', async () => {
    const audio = new Audio()
    expect(await applyOutputDevice(audio, 'default')).toBe(false)
  })
})
