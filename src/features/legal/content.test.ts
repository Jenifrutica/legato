import { describe, expect, it } from 'vitest'
import { LEGAL_DOCUMENTS } from './content'
import type { LegalDocumentId } from './types'

const IDS: LegalDocumentId[] = ['privacy', 'terms', 'cookies', 'accessibility']

describe('legal content', () => {
  it('tiene los cuatro documentos en los tres idiomas', () => {
    for (const language of ['es', 'en', 'pt'] as const) {
      const documents = LEGAL_DOCUMENTS[language]

      expect(documents.map((document) => document.id).sort()).toEqual([...IDS].sort())

      for (const document of documents) {
        expect(document.title.length).toBeGreaterThan(0)
        expect(document.updatedAt.length).toBeGreaterThan(0)
        expect(document.sections.length).toBeGreaterThanOrEqual(4)

        for (const section of document.sections) {
          expect(section.heading.length).toBeGreaterThan(0)
          expect(section.paragraphs.length).toBeGreaterThan(0)

          for (const paragraph of section.paragraphs) {
            expect(paragraph.length).toBeGreaterThan(20)
          }
        }
      }
    }
  })
})
