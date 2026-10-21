'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { copy, type Copy, type Locale } from '@/lib/copy'
import { LOCALE_COOKIE, LOCALE_MAX_AGE } from '@/lib/locale-shared'

type LocaleApi = {
  locale: Locale
  ar: boolean
  t: Copy
  setLocale: (locale: Locale) => void
  toggle: () => void
}

const LocaleContext = createContext<LocaleApi | null>(null)

export function LocaleProvider({ initial, children }: { initial: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initial)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    const root = document.documentElement
    root.lang = next
    root.dir = next === 'ar' ? 'rtl' : 'ltr'
    try {
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${LOCALE_MAX_AGE};samesite=lax`
      window.localStorage.setItem(LOCALE_COOKIE, next)
    } catch {
      /* storage can be blocked; the DOM still switches for this visit */
    }
  }, [])

  const value = useMemo<LocaleApi>(
    () => ({
      locale,
      ar: locale === 'ar',
      t: copy[locale],
      setLocale,
      toggle: () => setLocale(locale === 'en' ? 'ar' : 'en'),
    }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useLocale must be used inside LocaleProvider')
  return value
}
