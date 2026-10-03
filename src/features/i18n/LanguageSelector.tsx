import { useTranslation } from 'react-i18next'
import { setLanguage } from './i18n'
import type { Language } from './i18n'

const OPTIONS: Array<{ value: Language; label: string }> = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
]

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation()

  return (
    <select
      aria-label={t('language.label')}
      className="rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-primary focus:border-primary focus:outline-none"
      onChange={(event) => setLanguage(event.target.value as Language)}
      value={i18n.language}
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {compact ? option.value.toUpperCase() : option.label}
        </option>
      ))}
    </select>
  )
}
