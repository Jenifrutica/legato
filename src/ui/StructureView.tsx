import type { StructureNode } from '../player'

function LinkArrow() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 text-wood"
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
  const titleOf = (id: string | null): string => {
    if (id === null) {
      return 'null'
    }

    return nodes.find((node) => node.id === id)?.title ?? '—'
  }

  if (nodes.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-ink-muted">
        No hay nodos que mostrar. Agrega canciones a una playlist o reproduce algo.
      </p>
    )
  }

  return (
    <div className="p-5">
      <p className="text-xs text-ink-muted">
        length: {nodes.length} · head: {nodes[0].title} · tail: {nodes[nodes.length - 1].title}
      </p>

      <ol className="mt-4 flex items-center gap-1 overflow-x-auto pb-3">
        {nodes.map((node, index) => (
          <li className="flex shrink-0 items-center gap-1" key={node.id}>
            {index > 0 && <LinkArrow />}
            <div
              aria-label={`Nodo ${index + 1} de ${nodes.length}: ${node.title}. Anterior: ${titleOf(node.prevId)}. Siguiente: ${titleOf(node.nextId)}.`}
              className={`w-44 rounded-md border p-3 transition-colors ${
                node.id === currentId ? 'border-primary bg-primary-soft' : 'border-border bg-bg'
              }`}
              tabIndex={0}
            >
              <span className="block text-[0.625rem] uppercase tracking-wide text-ink-muted">
                nodo {index + 1}
                {node.id === currentId ? ' · sonando' : ''}
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium">{node.title}</span>
              <span className="mt-1 flex flex-col text-[0.625rem] text-ink-muted">
                <span className="truncate">prev: {titleOf(node.prevId)}</span>
                <span className="truncate">next: {titleOf(node.nextId)}</span>
              </span>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs leading-relaxed text-ink-muted">
        Nodos reales de la lista doblemente enlazada: cada tarjeta conoce su prev y su next. El nodo
        resaltado es el que está sonando y conserva su identidad aunque muevas o elimines otros (fix
        #12).
      </p>
    </div>
  )
}
