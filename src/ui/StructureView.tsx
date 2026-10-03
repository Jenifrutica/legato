import { useTranslation } from 'react-i18next'
import type { StructureNode } from '../player'

function LinkArrow() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 text-ink-muted"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
    >
      <path d="M4 12h16" />
      <path d="m15 7 5 5-5 5" />
    </svg>
  )
}

export function StructureView({
  nodes,
  currentId,
}: {
  nodes: StructureNode[]
  currentId: string | null
}) {
  const { t } = useTranslation()

  const titleOf = (id: string | null): string => {
    if (id === null) {
      return 'null'
    }

    return nodes.find((node) => node.id === id)?.title ?? '—'
  }

  if (nodes.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-ink-muted">{t('structure.empty')}</p>
  }

  return (
    <section aria-label={t('structure.region')} className="p-5">
      <p className="font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase">
        {t('structure.summary', {
          length: nodes.length,
          head: nodes[0].title,
          tail: nodes[nodes.length - 1].title,
        })}
      </p>

      <ol className="mt-4 flex items-center gap-1 overflow-x-auto pb-3">
        {nodes.map((node, index) => {
          const active = node.id === currentId
          return (
            <li className="flex shrink-0 items-center gap-1" key={node.id}>
              {index > 0 && <LinkArrow />}
              <div
                aria-label={t('structure.nodeLabel', {
                  index: index + 1,
                  total: nodes.length,
                  title: node.title,
                  prev: titleOf(node.prevId),
                  next: titleOf(node.nextId),
                })}
                className={`w-44 border-2 p-3 ${
                  active
                    ? 'border-rule bg-accent text-on-accent'
                    : 'border-rule/40 bg-surface text-ink'
                }`}
                tabIndex={0}
              >
                <span
                  className={`block font-mono text-[0.6875rem] tracking-[0.14em] uppercase ${
                    active ? 'text-on-accent/80' : 'text-ink-muted'
                  }`}
                >
                  {t('structure.node', { index: index + 1 })}
                  {active ? t('structure.playing') : ''}
                </span>
                <span className="mt-0.5 block truncate text-sm font-semibold">{node.title}</span>
                <span
                  className={`mt-1 flex flex-col font-mono text-[0.6875rem] ${
                    active ? 'text-on-accent/80' : 'text-ink-muted'
                  }`}
                >
                  <span className="truncate">
                    {t('structure.prev', { title: titleOf(node.prevId) })}
                  </span>
                  <span className="truncate">
                    {t('structure.next', { title: titleOf(node.nextId) })}
                  </span>
                </span>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="text-xs leading-relaxed text-ink-muted">{t('structure.explain')}</p>
    </section>
  )
}
