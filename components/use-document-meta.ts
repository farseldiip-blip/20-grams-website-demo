'use client'

import { useEffect } from 'react'
import { isRtl, type Locale } from '@/lib/copy'
import { pageMeta, type PageKey } from '@/lib/seo'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

/**
 * Keeps `<html lang>`, `dir` and the page metadata in sync when the visitor
 * flips language without a reload. The server already renders the right values
 * on first paint; this only matters after the toggle.
 */
export function useDocumentMeta(locale: Locale, page: PageKey) {
  useEffect(() => {
    const meta = pageMeta(locale, page)
    const root = document.documentElement
    root.lang = locale
    root.dir = isRtl(locale) ? 'rtl' : 'ltr'

    document.title = meta.title
    setMeta('name', 'description', meta.description)
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:locale', meta.ogLocale)
  }, [locale, page])
}
