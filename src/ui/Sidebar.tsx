import type { ReactNode } from 'react'
import {
  AccessibilityIcon,
  DiscMark,
  FolderIcon,
  LibraryIcon,
  ListMusicIcon,
  SettingsIcon,
} from './icons'

function NavItem({
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
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
        active ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted'
      }`}
    >
      {icon}
      <span>{label}</span>
    </li>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden border-r border-border bg-surface/70 px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[17rem] lg:flex-col lg:gap-8 lg:pb-36">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-ink text-bg">
          <DiscMark className="size-6" />
        </span>
        <span className="font-display text-2xl font-semibold tracking-tight">Legato</span>
      </div>

      <nav aria-label="Biblioteca">
        <ul className="flex flex-col gap-1">
          <NavItem icon={<LibraryIcon className="size-5 shrink-0" />} label="Biblioteca" active />
          <NavItem icon={<ListMusicIcon className="size-5 shrink-0" />} label="Playlists" />
          <NavItem icon={<FolderIcon className="size-5 shrink-0" />} label="Carpetas" />
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-4 border-t border-border pt-5">
        <ul className="flex flex-col gap-1">
          <NavItem icon={<AccessibilityIcon className="size-5 shrink-0" />} label="Accesibilidad" />
          <NavItem icon={<SettingsIcon className="size-5 shrink-0" />} label="Ajustes" />
        </ul>
        <p className="px-3 text-xs leading-relaxed text-ink-muted">
          Proyecto académico sin fines de lucro · ES / EN / PT
        </p>
      </div>
    </aside>
  )
}
