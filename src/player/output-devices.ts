export type OutputDevice = {
  id: string
  label: string
}

type SinkElement = HTMLMediaElement & {
  setSinkId?: (sinkId: string) => Promise<void>
}

export function supportsOutputSelection(): boolean {
  if (typeof HTMLMediaElement === 'undefined') {
    return false
  }

  return typeof (HTMLMediaElement.prototype as SinkElement).setSinkId === 'function'
}

export async function listOutputDevices(): Promise<OutputDevice[]> {
  if (typeof navigator === 'undefined' || navigator.mediaDevices === undefined) {
    return []
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices
      .filter((device) => device.kind === 'audiooutput')
      .map((device) => ({ id: device.deviceId, label: device.label }))
  } catch {
    return []
  }
}

export async function applyOutputDevice(
  element: HTMLMediaElement,
  deviceId: string,
): Promise<boolean> {
  const sink = element as SinkElement
  if (typeof sink.setSinkId !== 'function') {
    return false
  }

  try {
    await sink.setSinkId(deviceId)
    return true
  } catch {
    return false
  }
}
