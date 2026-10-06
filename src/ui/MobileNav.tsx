import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderIcon, LibraryIcon, ListMusicIcon, SearchIcon, VolumeIcon } from './icons'
import { PANEL_TAB_KEYS, PANEL_TABS, usePanelTabStore } from './panel-tabs'
import type { PanelTab } from './panel-tabs'

const TAB_ICONS: Record<PanelTab, ReactNode> = {
  library: <LibraryIcon className="size-5" />,
  search: <SearchIcon className="size-5" />,
  playlists: <FolderIcon className="size-5" />,
  queue: <ListMusicIcon className="size-5" />,
  audio: <VolumeIcon className="size-5" />,
}

/** Navegación inferior del móvil: los cinco paneles, con una sola barra funcional. */
export function MobileNav() {
  const { t } = useTranslation()
  const tab = usePanelTabStore((state) => state.tab)
  const setTab = usePanelTabStore((state) => state.setTab)

  function open(next: PanelTab) {
    setTab(next)
    document
      .getElementById('panel-principal')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      aria-label={t('nav.main')}
      className="border-t-2 border-rule bg-surface lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {PANEL_TABS.map((candidate) => {
          const active = tab === candidate
          return (
            <li key={candidate}>
              <button
                aria-current={active ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-1 border-t-2 py-2 text-[0.6875rem] font-semibold tracking-[0.06em] uppercase transition-colors ${
                  active ? 'border-accent text-ink' : 'border-transparent text-ink-muted'
                }`}
                onClick={() => open(candidate)}
                type="button"
              >
                {TAB_ICONS[candidate]}
                <span>{t(PANEL_TAB_KEYS[candidate])}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
