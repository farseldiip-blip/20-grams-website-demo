'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { BrandButton } from '@/components/brand-controls'
import { useLocale } from '@/components/locale-provider'

const INTRO_KEY = '20g-intro'
const PLAY_MS = 2600
const EXIT_MS = 300

export function Intro() {
  const { t } = useLocale()
  const [state, setState] = useState<'playing' | 'leaving' | 'done'>('playing')
  const finished = useRef(false)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }

  const finish = () => {
    if (finished.current) return
    finished.current = true
    clearTimers()
    try {
      window.sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      /* private mode: the intro simply plays again next time */
    }
    document.documentElement.classList.remove('intro-active')
    setState('done')
  }

  useEffect(() => {
    let seen = false
    try {
      seen = window.sessionStorage.getItem(INTRO_KEY) === '1'
    } catch {
      seen = false
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (seen || reduced) {
      finished.current = true
      // Session storage is only readable after hydration, so the first client
      // pass has to hide the already server-rendered intro.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState('done')
      return
    }

    document.documentElement.classList.add('intro-active')
    timers.current = [
      window.setTimeout(() => setState('leaving'), PLAY_MS),
      window.setTimeout(finish, PLAY_MS + EXIT_MS),
    ]

    return () => {
      clearTimers()
      document.documentElement.classList.remove('intro-active')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state === 'done') return null

  return (
    <div
      className={`intro-screen ${state === 'leaving' ? 'is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t.introLabel}
    >
      <div className="intro-counter" aria-hidden="true">
        <div className="intro-rack">
          {Array.from({ length: 21 }, (_, i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
      </div>

      <div className="intro-lock">
        <Image
          src="/brand/logo-transparent.png"
          alt={t.alts.brand}
          width={656}
          height={624}
          priority
          className="intro-logo"
        />
      </div>

      <div className="intro-fill" aria-hidden="true" />
      <BrandButton tone="light" className="intro-skip" onClick={finish}>
        {t.skipIntro}
      </BrandButton>
    </div>
  )
}
