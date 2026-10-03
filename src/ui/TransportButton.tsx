import type { ReactNode } from 'react'

export function TransportButton({
  label,
  icon,
  onClick,
  disabled = false,
  pressed,
  primary = false,
}: {
  label: string
  icon: ReactNode
  onClick?: () => void
  disabled?: boolean
  pressed?: boolean
  primary?: boolean
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className={`grid place-items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? 'size-11 bg-primary-strong text-white hover:opacity-90'
          : `size-9 ${pressed === true ? 'bg-primary-soft text-primary-strong' : 'text-ink-muted hover:text-ink'}`
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
    </button>
  )
}
