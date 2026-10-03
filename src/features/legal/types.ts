import type { Language } from '../i18n'

export type LegalDocumentId = 'privacy' | 'terms' | 'cookies' | 'accessibility'

export type LegalSection = {
  heading: string
  paragraphs: string[]
}

export type LegalDocument = {
  id: LegalDocumentId
  title: string
  updatedAt: string
  sections: LegalSection[]
}

export type LegalDocumentsByLanguage = Record<Language, LegalDocument[]>
