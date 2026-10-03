import { ListMusicIcon, SearchIcon } from './icons'

export function LibraryPanel() {
  return (
    <section
      aria-labelledby="biblioteca-titulo"
      className="flex min-w-0 flex-col rounded-lg border border-border bg-surface shadow-soft"
    >
      <header className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold" id="biblioteca-titulo">
            Biblioteca
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Importa archivos del equipo y organiza tus playlists.
          </p>
        </div>

        <label className="relative block w-full sm:w-64">
          <span className="sr-only">Buscar canciones</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            className="w-full rounded-full border border-border bg-bg py-2 pl-9 pr-3 text-sm placeholder:text-ink-muted focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            placeholder="Buscar canciones"
            type="search"
          />
        </label>
      </header>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="max-w-sm text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
            <ListMusicIcon className="size-7" />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold">Tu biblioteca está vacía</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Agrega archivos de audio desde tu equipo para empezar a escuchar y organizar tu música.
          </p>
          <button
            className="mt-5 rounded-full bg-primary-strong px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
            disabled
            type="button"
          >
            Importar música
          </button>
          <p className="mt-3 text-xs text-ink-muted">
            La importación se habilita en el siguiente paso del proyecto.
          </p>
        </div>
      </div>
    </section>
  )
}
