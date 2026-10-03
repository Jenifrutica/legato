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
      className={`grid place-items-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? 'size-14 bg-primary-strong text-white shadow-soft hover:scale-105'
          : `size-10 ${
              pressed === true
                ? 'bg-primary-soft text-primary-strong'
                : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
            }`
      }`}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {icon}
    </button>
  )
}
