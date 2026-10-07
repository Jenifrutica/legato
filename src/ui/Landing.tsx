import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '../features/i18n'
import { LegatoLogo, LeguiMark } from './Legui'
import { LoginScreen } from './LoginScreen'
import { WaveRing } from './WaveRing'

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (element === null || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting === true) {
          setInView(true)
        }
      },
      { threshold },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, inView }
}

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-11 place-items-center border-2 border-rule bg-bg text-ink">
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        {children}
      </svg>
    </span>
  )
}

const FEATURES = [
  {
    icon: (
      <FeatureIcon>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z" />
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
      </FeatureIcon>
    ),
    title: 'f1title',
    text: 'f1text',
  },
  {
    icon: (
      <FeatureIcon>
        <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />
      </FeatureIcon>
    ),
    title: 'f2title',
    text: 'f2text',
  },
  {
    icon: (
      <FeatureIcon>
        <path d="M10 2h4" />
        <circle cx="12" cy="14" r="8" />
        <path d="M12 10v4l2.5 2.5" />
      </FeatureIcon>
    ),
    title: 'f3title',
    text: 'f3text',
  },
  {
    icon: (
      <FeatureIcon>
        <circle cx="12" cy="12" r="9" />
        <path d="M7 15c1.5-4 8.5-4 10 0M8 8.5h.01M16 8.5h.01" />
      </FeatureIcon>
    ),
    title: 'f4title',
    text: 'f4text',
  },
  {
    icon: (
      <FeatureIcon>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r=".6" fill="currentColor" />
      </FeatureIcon>
    ),
    title: 'f5title',
    text: 'f5text',
  },
  {
    icon: (
      <FeatureIcon>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        <path d="m6 6 2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
      </FeatureIcon>
    ),
    title: 'f6title',
    text: 'f6text',
  },
] as const

function LandingDisc() {
  return (
    <section aria-hidden="true" className="relative">
      <div className="disc-zone" style={{ '--disc': 'min(30rem, 84vw, 52dvh)' } as CSSProperties}>
        <span className="disc-field" />
        <div className="disc-wrap">
          <WaveRing active={false} analyser={null} />
          <div
            className="disc-plate"
            style={{ animationPlayState: 'running', background: 'var(--color-surface)' }}
          >
            <span aria-hidden="true" className="disc-grooves" />
            <span className="absolute top-1/2 left-1/2 size-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rule bg-accent" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function Landing() {
  const { t } = useTranslation()
  const holaRef = useRef<HTMLElement>(null)
  const [holaIn, setHolaIn] = useState(true)
  const [step, setStep] = useState(0)
  const { ref: viniloRef, inView: viniloIn } = useInView<HTMLDivElement>()
  const { ref: entrarRef, inView: entrarIn } = useInView<HTMLDivElement>(0.3)
  const talk = [t('landing.talk1'), t('landing.talk2'), t('landing.talk3')]

  function advance() {
    if (step < talk.length) {
      setStep((value) => value + 1)
    } else {
      scrollToId('vinilo')
    }
  }

  useEffect(() => {
    const element = holaRef.current
    if (element === null || typeof IntersectionObserver === 'undefined') {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setHolaIn(entry?.isIntersecting ?? false),
      { threshold: 0.5 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="min-h-dvh text-ink transition-colors duration-700 ease-out"
      style={{
        backgroundColor: holaIn ? 'var(--color-accent)' : 'var(--color-bg)',
      }}
    >
      <header className="sticky top-0 z-30 border-b-2 border-rule bg-surface text-ink">
        <div className="mx-auto flex max-w-[110rem] items-center gap-3 px-4 py-2.5 sm:px-6">
          <span className="flex shrink-0 items-center">
            <LegatoLogo className="h-7 w-auto" />
          </span>
          <span className="sr-only">Legato</span>
          <span className="ml-auto">
            <LanguageSelector compact />
          </span>
        </div>
      </header>

      {/* Fase 1 · solo Legui (fondo rojo, burbuja blanca) */}
      <section
        className="relative grid min-h-[100dvh] place-items-center px-5 py-12 lg:px-10"
        id="hola"
        ref={holaRef}
      >
        <div className="flex flex-col items-center gap-6">
          <button
            aria-label={t('landing.ctaStart')}
            className="animate-legui-bob"
            onClick={advance}
            type="button"
          >
            <LeguiMark className="w-40 drop-shadow-[0_22px_22px_rgb(19_16_12/0.25)] sm:w-56" />
          </button>

          <button
            className="relative w-full max-w-md border-2 border-rule bg-surface px-5 py-4 text-left text-ink shadow-[6px_6px_0_var(--color-rule)] transition-transform hover:-translate-y-0.5"
            onClick={advance}
            type="button"
          >
            <span
              aria-hidden="true"
              className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-t-2 border-l-2 border-rule bg-surface"
            />
            {step < talk.length ? (
              <>
                <p className="text-sm leading-relaxed text-ink">{talk[step] ?? ''}</p>
                <span className="mt-3 flex items-center gap-2 font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-accent-ink uppercase">
                  {step + 1}/{talk.length}
                  <span className="grid size-6 place-items-center border-2 border-rule">
                    <ChevronDown className="size-4 animate-bounce" />
                  </span>
                </span>
              </>
            ) : (
              <span className="flex items-center justify-between gap-3 font-display text-lg font-black tracking-[0.02em] uppercase">
                {t('landing.ctaStart')}
                <span className="grid size-6 place-items-center border-2 border-rule">
                  <ChevronDown className="size-4 animate-bounce" />
                </span>
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Fase 2 · el vinilo y la info (fondo claro, cuadrado) */}
      <section className="relative min-h-[100dvh] px-5 py-14 lg:px-10" id="vinilo">
        <div className="mx-auto max-w-[110rem]">
          <div className="grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
            <div className="max-w-2xl">
              <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1] font-black tracking-[-0.01em] uppercase">
                {t('landing.featuresTitle')}
              </h2>
              <p className="mt-3 text-ink-muted">{t('landing.featuresSub')}</p>
            </div>
            <LandingDisc />
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li
                className="border-2 border-rule bg-surface p-5 shadow-[4px_4px_0_var(--color-rule)]"
                key={feature.title}
              >
                {feature.icon}
                <h3 className="mt-4 font-display text-lg font-bold">
                  {t(`landing.${feature.title}` as 'landing.f1title')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {t(`landing.${feature.text}` as 'landing.f1text')}
                </p>
              </li>
            ))}
          </ul>

          <div
            className="mt-14 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between"
            ref={viniloRef}
          >
            <span className={viniloIn ? 'animate-legui-drop' : 'opacity-0'}>
              <LeguiMark className="w-20 drop-shadow-[0_14px_16px_rgb(19_16_12/0.2)] sm:w-24" />
            </span>
            <button
              className="border-2 border-rule bg-accent px-7 py-3 font-mono text-xs font-semibold tracking-[0.12em] text-on-accent uppercase shadow-[4px_4px_0_var(--color-rule)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              onClick={() => scrollToId('entrar')}
              type="button"
            >
              {t('landing.ctaStart')}
            </button>
          </div>
        </div>
      </section>

      {/* Fase 3 · entrar (pantalla completa) */}
      <section
        className="relative grid min-h-[100dvh] place-items-center px-5 py-20 lg:px-10"
        id="entrar"
      >
        <div className="w-full max-w-md">
          <div className="mb-5 flex items-center gap-3" ref={entrarRef}>
            <span className={entrarIn ? 'animate-legui-drop' : 'opacity-0'}>
              <LeguiMark className="w-14" />
            </span>
            <div>
              <h2 className="font-display text-xl font-black tracking-[0.04em] uppercase">
                {t('landing.loginTitle')}
              </h2>
              <p className="text-xs text-ink-muted">{t('landing.loginHint')}</p>
            </div>
          </div>
          <LoginScreen embedded />
        </div>
      </section>

      <footer className="border-t border-border px-5 py-4 text-xs text-ink-muted lg:px-10">
        <div className="mx-auto flex max-w-[110rem] flex-wrap items-center gap-x-4 gap-y-2">
          <a className="underline underline-offset-2 hover:text-accent-ink" href="#/legal/privacy">
            {t('legal.links.privacy')}
          </a>
          <a className="underline underline-offset-2 hover:text-accent-ink" href="#/legal/terms">
            {t('legal.links.terms')}
          </a>
          <a className="underline underline-offset-2 hover:text-accent-ink" href="#/legal/cookies">
            {t('legal.links.cookies')}
          </a>
          <a
            className="underline underline-offset-2 hover:text-accent-ink"
            href="#/legal/accessibility"
          >
            {t('legal.links.accessibility')}
          </a>
          <span aria-hidden="true" className="hidden sm:inline">
            ·
          </span>
          <span>{t('academic')}</span>
        </div>
      </footer>
    </div>
  )
}
