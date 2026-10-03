import { DiscMark } from './icons'

export function VinylStage() {
  return (
    <section
      aria-label="Escenario de reproducción"
      className="rounded-lg border border-border bg-surface p-6 shadow-soft sm:p-8"
    >
      <div className="relative mx-auto aspect-square w-full max-w-80">
        <div className="absolute -inset-5 rounded-full border border-wood/50 sm:-inset-7" />
        <div className="absolute -inset-10 rounded-full border border-wood/25 sm:-inset-14" />

        <div
          className="absolute inset-0 rounded-full shadow-disc"
          style={{
            background:
              'repeating-radial-gradient(circle at center, #221e1b 0 2px, #2f2a26 2px 5px)',
          }}
        />

        <div className="absolute inset-[31%] grid place-items-center rounded-full bg-primary-soft">
          <DiscMark className="size-10 text-primary-strong sm:size-12" />
        </div>

        <svg
          aria-hidden="true"
          className="absolute -right-3 -top-2 w-24 text-wood sm:-right-5 sm:w-28"
          fill="none"
          viewBox="0 0 96 96"
        >
          <circle cx="78" cy="16" fill="currentColor" r="8" />
          <path d="M78 16 38 60" stroke="currentColor" strokeLinecap="round" strokeWidth="6" />
          <rect
            fill="#2b2622"
            height="22"
            rx="5"
            transform="rotate(-46 28 62)"
            width="14"
            x="21"
            y="51"
          />
        </svg>
      </div>

      <div className="mt-8 text-center sm:mt-10">
        <p className="font-display text-lg font-semibold">Sin reproducción</p>
        <p className="mt-1 text-sm text-ink-muted">Importa una canción y pulsa reproducir.</p>
      </div>
    </section>
  )
}
