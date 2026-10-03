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
      className={`grid place-items-center border-2 border-rule transition-transform disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? 'size-16 bg-accent text-on-accent shadow-[6px_6px_0_var(--color-rule)] enabled:hover:-translate-y-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-[2px_2px_0_var(--color-rule)]'
          : `size-11 shadow-[3px_3px_0_var(--color-rule)] enabled:hover:-translate-y-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-none ${
              pressed === true
                ? 'bg-accent-soft text-ink'
                : 'bg-surface text-ink-muted hover:text-ink'
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
