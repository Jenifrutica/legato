import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Language } from '../i18n'
import { LEGAL_DOCUMENTS } from './content'
import type { LegalDocumentId } from './types'

const LEGAL_IDS: LegalDocumentId[] = ['privacy', 'terms', 'cookies', 'accessibility']

export function useHashRoute(): string {
  const [hash, setHash] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hash,
  )

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return hash
}

export function LegalPage() {
  const { t, i18n } = useTranslation()
  const hash = useHashRoute()
  const match = /^#\/legal\/([a-z]+)$/.exec(hash)

  if (match === null) {
    return null
  }

  const id = LEGAL_IDS.find((candidate) => candidate === match[1])
  if (id === undefined) {
    return null
  }

  const language: Language = i18n.language === 'en' || i18n.language === 'pt' ? i18n.language : 'es'
  const document = LEGAL_DOCUMENTS[language].find((item) => item.id === id)

  if (document === undefined) {
    return null
  }

  return (
    <div
      aria-label={document.title}
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-bg"
      role="dialog"
    >
      <div className="mx-auto max-w-3xl px-5 py-8">
        <a
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-strong underline underline-offset-2"
          href="#/"
        >
          {t('legal.back')}
        </a>

        <h1 className="mt-4 font-display text-3xl font-semibold">{document.title}</h1>
        <p className="mt-2 text-xs text-ink-muted">
          {t('legal.updated', { date: document.updatedAt })}
        </p>

        {document.sections.map((section) => (
          <section className="mt-6" key={section.heading}>
            <h2 className="font-display text-lg font-semibold">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p className="mt-2 text-sm leading-relaxed text-ink-muted" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
