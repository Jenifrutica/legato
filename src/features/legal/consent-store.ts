import { create } from 'zustand'

export const CONSENT_VERSION = 1
const STORAGE_KEY = 'legato.consent'

export type ConsentStatus = 'pending' | 'decided'

export type ConsentSnapshot = {
  status: ConsentStatus
  optionalAllowed: boolean
  decidedAt: number | null
}

type StoredConsent = {
  version: number
  decidedAt: number | null
  optionalAllowed: boolean
}

export function readConsent(): ConsentSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      return { status: 'pending', optionalAllowed: false, decidedAt: null }
    }

    const parsed = JSON.parse(raw) as StoredConsent
    if (parsed.version !== CONSENT_VERSION || parsed.decidedAt === null) {
      return { status: 'pending', optionalAllowed: false, decidedAt: null }
    }

    return {
      status: 'decided',
      optionalAllowed: parsed.optionalAllowed,
      decidedAt: parsed.decidedAt,
    }
  } catch {
    return { status: 'pending', optionalAllowed: false, decidedAt: null }
  }
}

function persist(optionalAllowed: boolean): number {
  const decidedAt = Date.now()
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: CONSENT_VERSION, decidedAt, optionalAllowed }),
    )
  } catch {
    return decidedAt
  }

  return decidedAt
}

type ConsentState = ConsentSnapshot & {
  preferencesOpen: boolean
  acceptAll: () => void
  acceptEssentialOnly: () => void
  openPreferences: () => void
  closePreferences: () => void
  resetConsent: () => void
}

const initial = readConsent()

export const useConsentStore = create<ConsentState>((set) => ({
  status: initial.status,
  optionalAllowed: initial.optionalAllowed,
  decidedAt: initial.decidedAt,
  preferencesOpen: false,

  acceptAll: () =>
    set({
      status: 'decided',
      optionalAllowed: true,
      decidedAt: persist(true),
      preferencesOpen: false,
    }),

  acceptEssentialOnly: () =>
    set({
      status: 'decided',
      optionalAllowed: false,
      decidedAt: persist(false),
      preferencesOpen: false,
    }),

  openPreferences: () => set({ preferencesOpen: true }),
  closePreferences: () => set({ preferencesOpen: false }),

  resetConsent: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      set({ status: 'pending', optionalAllowed: false, decidedAt: null, preferencesOpen: false })
      return
    }

    set({ status: 'pending', optionalAllowed: false, decidedAt: null, preferencesOpen: false })
  },
}))
