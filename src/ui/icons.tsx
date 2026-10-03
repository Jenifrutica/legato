import type { ReactNode } from 'react'

type IconProps = {
  className?: string
}

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  )
}

export function DiscMark({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.75} />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth={1.75} />
      <circle cx="12" cy="12" fill="currentColor" r="1" />
    </svg>
  )
}

export function PlayIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M7 4.5 19 12 7 19.5V4.5Z" />
    </Icon>
  )
}

export function PauseIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M9 5v14M15 5v14" />
    </Icon>
  )
}

export function SkipBackIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M18 5v14" />
      <path d="M15 12 6 7v10l9-5Z" />
    </Icon>
  )
}

export function SkipForwardIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M6 5v14" />
      <path d="m9 12 9-5v10l-9-5Z" />
    </Icon>
  )
}

export function ShuffleIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="m15 15 6 6" />
      <path d="m4 4 5 5" />
    </Icon>
  )
}

export function RepeatIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </Icon>
  )
}

export function VolumeIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a10 10 0 0 1 0 14" />
    </Icon>
  )
}

export function TimerIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M10 2h4" />
      <circle cx="12" cy="14" r="8" />
      <path d="M12 10v4l2.5 2.5" />
    </Icon>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </Icon>
  )
}

export function LibraryIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
    </Icon>
  )
}

export function ListMusicIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 12H3M16 6H3M12 18H3" />
      <circle cx="19" cy="16" r="2.5" />
      <path d="M21.5 16V6l-2.5 1" />
    </Icon>
  )
}

export function FolderIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </Icon>
  )
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Icon>
  )
}

export function AccessibilityIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="4.5" r="1.75" />
      <path d="M4.5 9h15" />
      <path d="M12 9v6" />
      <path d="m12 15-3 6" />
      <path d="m12 15 3 6" />
    </Icon>
  )
}

export function UploadIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 20h16" />
    </Icon>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  )
}
