import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { XIcon } from '../../ui/icons'
import { useA11yStore } from './a11y-store'
import type { ColorBlindMode } from './types'

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium">{label}</span>
      <input
        checked={checked}
        className="size-5 accent-primary"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  )
}

export function A11yPanel() {
  const { t } = useTranslation()
  const open = useA11yStore((state) => state.panelOpen)
  const preferences = useA11yStore((state) => state.preferences)
  const setPreference = useA11yStore((state) => state.setPreference)
  const reset = useA11yStore((state) => state.reset)
  const closePanel = useA11yStore((state) => state.closePanel)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      closeRef.current?.focus()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closePanel])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/20"
      onClick={closePanel}
      role="presentation"
    >
      <div
        aria-label={t('a11y.title')}
        aria-modal="true"
        className="h-full w-full max-w-sm overflow-y-auto border-l border-border bg-surface p-5 shadow-soft"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{t('a11y.title')}</h2>
          <button
            aria-label={t('a11y.close')}
            className=" p-2 text-ink-muted transition-colors hover:text-ink"
            onClick={closePanel}
            ref={closeRef}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">
              {t('a11y.textScale')}{' '}
              <span className="font-mono text-ink-muted">{preferences.textScale}%</span>
            </span>
            <input
              className="h-1.5 cursor-pointer accent-primary"
              max={200}
              min={100}
              onChange={(event) => setPreference('textScale', Number(event.target.value))}
              step={5}
              type="range"
              value={preferences.textScale}
            />
          </label>

          <Toggle
            checked={preferences.dyslexiaFont}
            label={t('a11y.dyslexiaFont')}
            onChange={(value) => setPreference('dyslexiaFont', value)}
          />
          <Toggle
            checked={preferences.highContrast}
            label={t('a11y.highContrast')}
            onChange={(value) => setPreference('highContrast', value)}
          />
          <Toggle
            checked={preferences.reducedMotion}
            label={t('a11y.reducedMotion')}
            onChange={(value) => setPreference('reducedMotion', value)}
          />
          <Toggle
            checked={preferences.largeControls}
            label={t('a11y.largeControls')}
            onChange={(value) => setPreference('largeControls', value)}
          />

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">{t('a11y.colorBlind')}</span>
            <select
              className=" border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
              onChange={(event) =>
                setPreference('colorBlind', event.target.value as ColorBlindMode)
              }
              value={preferences.colorBlind}
            >
              <option value="none">{t('a11y.colorBlindNone')}</option>
              <option value="deuteranopia">{t('a11y.colorBlindDeuteranopia')}</option>
              <option value="protanopia">{t('a11y.colorBlindProtanopia')}</option>
            </select>
          </label>

          <button
            className="self-start  border border-border px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-accent hover:text-accent"
            onClick={reset}
            type="button"
          >
            {t('a11y.reset')}
          </button>

          <section className="border-t border-border pt-4 text-xs leading-relaxed text-ink-muted">
            <h3 className="font-display text-sm font-semibold text-ink">
              {t('a11y.statementTitle')}
            </h3>
            <p className="mt-2">{t('a11y.statement')}</p>
            <a
              className="mt-2 inline-block font-medium text-ink underline underline-offset-2"
              href="mailto:jenifer.urbano@campusucc.edu.co"
            >
              jenifer.urbano@campusucc.edu.co
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
