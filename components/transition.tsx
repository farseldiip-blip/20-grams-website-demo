'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'

type Phase = 'idle' | 'cover' | 'reveal'

const TransitionContext = createContext<{ onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void }>({
  onNavigate: () => {},
})

const COVER_MS = 420
const REVEAL_MS = 620

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>('idle')
  const pending = useRef<string | null>(null)
  const origin = useRef(pathname)

  const onNavigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const anchor = event.currentTarget
      const href = anchor.getAttribute('href')
      if (!href || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const url = new URL(href, window.location.href)
      if (url.origin !== window.location.origin) return
      // Same document: let Next/browser handle the hash scroll.
      if (url.pathname === window.location.pathname) return
      // Motion-sensitive visitors get the instant route change.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      event.preventDefault()
      pending.current = href
      origin.current = pathname
      setPhase('cover')
    },
    [pathname],
  )

  useEffect(() => {
    if (phase !== 'cover') return
    const timer = window.setTimeout(() => {
      if (pending.current) router.push(pending.current)
    }, COVER_MS)
    return () => window.clearTimeout(timer)
  }, [phase, router])

  useEffect(() => {
    if (phase !== 'cover' || pathname === origin.current) return
    const timer = window.setTimeout(() => setPhase('reveal'), 80)
    return () => window.clearTimeout(timer)
  }, [phase, pathname])

  useEffect(() => {
    if (phase !== 'reveal') return
    const timer = window.setTimeout(() => {
      setPhase('idle')
      pending.current = null
    }, REVEAL_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  // Never leave the curtain stuck if a navigation is cancelled.
  useEffect(() => {
    if (phase === 'idle') return
    const timer = window.setTimeout(() => {
      setPhase('idle')
      pending.current = null
    }, 6000)
    return () => window.clearTimeout(timer)
  }, [phase])

  return (
    <TransitionContext.Provider value={{ onNavigate }}>
      {children}
      <div className={`page-curtain ${phase}`} aria-hidden="true">
        <Image
          src="/brand/logo-transparent.png"
          alt=""
          width={656}
          height={624}
          priority
          className="curtain-logo"
        />
      </div>
    </TransitionContext.Provider>
  )
}

export function useSmartNavigate() {
  return useContext(TransitionContext).onNavigate
}
