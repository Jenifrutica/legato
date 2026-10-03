import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LibraryIcon, ListMusicIcon, SettingsIcon } from './icons'

function MobileNavItem({
  icon,
  label,
  active = false,
}: {
  icon: ReactNode
  label: string
  active?: boolean
}) {
  return (
    <li
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center gap-1 border-t-2 py-2 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase ${
        active ? 'border-accent text-ink' : 'border-transparent text-ink-muted'
      }`}
    >
      {icon}
      <span>{label}</span>
    </li>
  )
}

export function MobileNav() {
  const { t } = useTranslation()

  return (
    <nav aria-label={t('nav.main')} className="border-t-2 border-rule bg-surface lg:hidden">
      <ul className="grid grid-cols-3">
        <MobileNavItem icon={<LibraryIcon className="size-5" />} label={t('nav.library')} active />
        <MobileNavItem icon={<ListMusicIcon className="size-5" />} label={t('nav.playlists')} />
        <MobileNavItem icon={<SettingsIcon className="size-5" />} label={t('nav.settings')} />
      </ul>
    </nav>
  )
}
