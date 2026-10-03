import { useTranslation } from 'react-i18next'
import { useHistoryStore } from '../features/history'
import { RedoIcon, UndoIcon } from './icons'

export function HistoryButtons() {
  const { t } = useTranslation()
  const canUndo = useHistoryStore((state) => state.canUndo)
  const canRedo = useHistoryStore((state) => state.canRedo)
  const undo = useHistoryStore((state) => state.undo)
  const redo = useHistoryStore((state) => state.redo)

  return (
    <div className="flex items-center gap-1">
      <button
        aria-label={t('history.undo')}
        className=" p-2 text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canUndo}
        onClick={undo}
        type="button"
      >
        <UndoIcon className="size-4" />
      </button>
      <button
        aria-label={t('history.redo')}
        className=" p-2 text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canRedo}
        onClick={redo}
        type="button"
      >
        <RedoIcon className="size-4" />
      </button>
    </div>
  )
}
