import { useEffect, useRef, useState } from 'react'
import { noteKey, useNotesStore } from '../features/musician'
import type { NoteTargetType } from '../features/musician'

export function NotesEditor({
  targetType,
  targetId,
  label,
  placeholder,
}: {
  targetType: NoteTargetType
  targetId: string
  label: string
  placeholder: string
}) {
  const [draft, setDraft] = useState('')
  const setText = useNotesStore((state) => state.setText)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setDraft(useNotesStore.getState().records[noteKey(targetType, targetId)]?.text ?? '')
  }, [targetType, targetId])

  useEffect(
    () => () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current)
      }
    },
    [],
  )

  function update(value: string) {
    setDraft(value)
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => setText(targetType, targetId, value), 400)
  }

  return (
    <div>
      <label
        className="block text-xs font-medium text-ink-muted"
        htmlFor={`note-${targetType}-${targetId}`}
      >
        {label}
      </label>
      <textarea
        className="mt-1 h-28 w-full resize-y border-2 border-rule bg-surface p-2 text-sm text-ink focus:border-accent focus:outline-none"
        id={`note-${targetType}-${targetId}`}
        onChange={(event) => update(event.target.value)}
        placeholder={placeholder}
        value={draft}
      />
    </div>
  )
}
