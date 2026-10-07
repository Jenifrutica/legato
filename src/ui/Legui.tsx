import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { XIcon } from './icons'

const INK = '#13100c'
const PAPER = '#f6f2ea'

type MarkProps = {
  className?: string
}

/**
 * Las formas de Legui. Con `onDark` se invierte el disco (papel) y la
 * etiqueta (tinta) para que el personaje se lea sobre fondos oscuros.
 */
function LeguiShapes({ onDark = false }: { onDark?: boolean }) {
  const stroke = onDark ? PAPER : INK
  return (
    <>
      <g stroke={stroke} strokeLinecap="round" strokeWidth={13}>
        <path d="M85 156V172" />
        <path d="M115 156V172" />
      </g>
      <g fill="var(--color-accent, #e14a1f)" stroke={stroke} strokeWidth={4}>
        <ellipse cx="83" cy="181" rx="15" ry="9" />
        <ellipse cx="117" cy="181" rx="15" ry="9" />
      </g>
      <circle cx="100" cy="90" fill={onDark ? PAPER : INK} r="68" />
      <g fill="none" opacity={onDark ? 0.14 : 0.17} stroke={onDark ? INK : PAPER} strokeWidth={1.2}>
        <circle cx="100" cy="90" r="32" />
        <circle cx="100" cy="90" r="40" />
        <circle cx="100" cy="90" r="48" />
        <circle cx="100" cy="90" r="56" />
        <circle cx="100" cy="90" r="63" />
      </g>
      <path
        d="M52 56q18-20 46-24"
        fill="none"
        opacity={onDark ? 0.16 : 0.22}
        stroke={onDark ? INK : PAPER}
        strokeLinecap="round"
        strokeWidth={6}
      />
      <circle
        cx="100"
        cy="90"
        fill={onDark ? INK : PAPER}
        r="31"
        stroke={onDark ? PAPER : INK}
        strokeWidth={3.5}
      />
      <circle cx="90" cy="86" fill={onDark ? PAPER : INK} r="3.6" />
      <circle cx="110" cy="86" fill={onDark ? PAPER : INK} r="3.6" />
      <path
        d="M92 96q8 7 16 0"
        fill="none"
        stroke={onDark ? PAPER : INK}
        strokeLinecap="round"
        strokeWidth={2.8}
      />
      <circle cx="73" cy="104" fill="var(--color-accent, #e14a1f)" opacity={0.9} r="6" />
      <circle cx="127" cy="104" fill="var(--color-accent, #e14a1f)" opacity={0.9} r="6" />
    </>
  )
}

/** Legui suelto (disco en tinta). */
export function LeguiMark({ className }: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <LeguiShapes />
    </svg>
  )
}

/** Legui encerrado en un "sticker" de papel, legible sobre cualquier fondo. */
export function LeguiSticker({ className = 'size-9' }: MarkProps) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full border-2 border-rule bg-[#f6f2ea] ${className}`}
    >
      <LeguiMark className="size-[80%]" />
    </span>
  )
}

/**
 * El wordmark: "LEGAT" con Legui haciendo de "o", al mismo tamaño que las
 * letras (la "o" remata un poco, como una O redonda). Las coordenadas salen de
 * medir Archivo 900 a 200 px (ancho 728, altura de mayúscula 138).
 */
export function LegatoLogo({ className, onDark = false }: MarkProps & { onDark?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="-8.3 -162 902.4 223.6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        fill={onDark ? PAPER : INK}
        fontFamily="'Archivo Variable', Archivo, system-ui, sans-serif"
        fontSize={200}
        fontWeight={900}
        x="0"
        y="0"
      >
        LEGAT
      </text>
      <g transform="translate(797.7 -69) scale(1.06544) translate(-100 -90)">
        <LeguiShapes onDark={onDark} />
      </g>
    </svg>
  )
}

/** Legui acompañando un mensaje: un sticker y una burbuja de diálogo. */
export function LeguiBubble({
  children,
  className = '',
  bubbleClassName = '',
  size = 'size-12',
  onDismiss,
}: {
  children: ReactNode
  className?: string
  bubbleClassName?: string
  size?: string
  onDismiss?: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <LeguiSticker className={size} />
      <div
        className={`relative max-w-prose border-2 border-rule bg-surface px-3 py-2 text-sm leading-relaxed text-ink shadow-[3px_3px_0_var(--color-rule)] ${bubbleClassName}`}
      >
        <span
          aria-hidden="true"
          className="absolute top-1/2 -left-[7px] size-3 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-rule bg-surface"
        />
        {onDismiss !== undefined && (
          <button
            aria-label={t('cookies.close')}
            className="absolute -top-2 -right-2 grid size-6 place-items-center border-2 border-rule bg-surface text-ink transition-transform hover:-translate-y-0.5"
            onClick={onDismiss}
            type="button"
          >
            <XIcon className="size-3" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

/**
 * Legui suelto (sin círculo) con un bocadillo interactivo: al tocar la
 * mascota va cambiando el mensaje. Pensado para la landing.
 */
export function LeguiTalk({
  messages,
  hint,
  className = '',
}: {
  messages: string[]
  hint?: string
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const message = messages[index] ?? ''

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <button
        aria-label={hint ?? 'Legui'}
        className="animate-legui-bob shrink-0"
        onClick={() => setIndex((value) => (value + 1) % messages.length)}
        type="button"
      >
        <LeguiMark className="w-24 drop-shadow-[0_14px_16px_rgb(19_16_12/0.22)] sm:w-32" />
      </button>
      <div className="relative max-w-sm rounded-3xl border-2 border-rule bg-surface px-4 py-3 text-sm leading-relaxed text-ink shadow-[0_20px_40px_-26px_rgb(19_16_12/0.55)]">
        <span
          aria-hidden="true"
          className="absolute top-1/2 -left-[8px] size-3 -translate-y-1/2 rotate-45 rounded-[3px] border-b-2 border-l-2 border-rule bg-surface"
        />
        <p>{message}</p>
        {hint !== undefined && (
          <span className="mt-1 block font-mono text-[0.625rem] tracking-[0.14em] text-ink-muted uppercase">
            {hint}
          </span>
        )}
      </div>
    </div>
  )
}
