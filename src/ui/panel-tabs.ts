import { create } from 'zustand'

export type PanelTab = 'library' | 'search' | 'playlists' | 'queue' | 'audio'

export const PANEL_TABS: PanelTab[] = ['library', 'search', 'playlists', 'queue', 'audio']

export const PANEL_TAB_KEYS = {
  library: 'tabs.library',
  search: 'tabs.search',
  playlists: 'tabs.playlists',
  queue: 'tabs.queue',
  audio: 'tabs.audio',
} as const

type PanelTabState = {
  tab: PanelTab
  setTab: (tab: PanelTab) => void
}

/** Pestaña activa del panel, compartida entre la barra lateral (escritorio) y la navegación inferior (móvil). */
export const usePanelTabStore = create<PanelTabState>((set) => ({
  tab: 'library',
  setTab: (tab) => set({ tab }),
}))

type MusiciansPanelState = {
  open: boolean
  setOpen: (open: boolean) => void
}

/** Visibilidad del panel de músicos (hoja), para abrirlo también desde la barra superior en móvil. */
export const useMusiciansPanelStore = create<MusiciansPanelState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))
