'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { BrandButton, BrandLink } from '@/components/brand-controls'
import { MenuCard } from '@/components/menu-card'
import { useLocale } from '@/components/locale-provider'
import { useDocumentMeta } from '@/components/use-document-meta'
import { BottomNav, Footer, Header } from '@/components/site-shell'
import { MENU_CATEGORIES, type MenuCategory } from '@/lib/copy'
import menu from '@/lib/menu.json'

export function MenuPage({ initialCategory = 'All' }: { initialCategory?: MenuCategory }) {
  const { locale, t } = useLocale()
  const [category, setCategory] = useState<MenuCategory>(initialCategory)
  const [query, setQuery] = useState('')

  useDocumentMeta(locale, 'menu')

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return menu.filter((item) => {
      const inCategory = category === 'All' || item.category === category
      if (!inCategory) return false
      if (!needle) return true
      const haystack = `${item.name} ${item.arName} ${item.description} ${item.arDescription} ${item.category}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [category, query])

  // `/menu#dirty` arrives from the home page: open the Dirty shelf and show it.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    if (hash.toLowerCase() === 'dirty') {
      // The hash only exists on the client; the server renders the unfiltered shelf.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate-then-sync deep link
      setCategory('Dirty')
    }
    const target = document.getElementById(hash)
    if (target) {
      window.requestAnimationFrame(() =>
        target.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    }
  }, [])

  const selectCategory = (next: MenuCategory) => {
    setCategory(next)
    const url = new URL(window.location.href)
    if (next === 'All') url.searchParams.delete('category')
    else url.searchParams.set('category', next)
    url.hash = ''
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
  }

  const reset = () => {
    setQuery('')
    selectCategory('All')
  }

  return (
    <>
      <Header />
      <main>
        <section className="menu-hero">
          <div className="container menu-hero-grid">
            <div className="menu-hero-copy">
              <BrandLink href="/" tone="secondary" className="back-link">
                {t.backHome}
              </BrandLink>
              <div className="section-label font-mono">
                <span>{t.menuMeta}</span>
              </div>
              <h1 className="display-heading">
                {t.menuTitle.map((line, index) => (
                  <span key={line}>
                    {index > 0 && <br />}
                    {line}
                  </span>
                ))}
                <span>.</span>
              </h1>
              <p className="body-copy">{t.menuIntro}</p>
            </div>
            <div className="menu-hero-media">
              <Image
                src="/images/storefront.webp"
                alt={t.alts.storefront}
                fill
                priority
                sizes="(max-width: 900px) 92vw, 480px"
                className="cover"
              />
            </div>
          </div>
        </section>

        <div className="menu-controls-wrap">
          <div className="container menu-controls">
            <div className="category-tabs" role="tablist" aria-label={t.menuMeta}>
              {MENU_CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={category === value}
                  className={category === value ? 'is-selected' : ''}
                  onClick={() => selectCategory(value)}
                >
                  {t.categoryLabels[value]}
                </button>
              ))}
            </div>

            <div className="search-box">
              <label className="sr-only" htmlFor="menu-search">
                {t.searchAria}
              </label>
              <input
                id="menu-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.searchPlaceholder}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <section className="section menu-results" id="dirty">
          <div className="container">
            <div className="results-meta font-mono">
              <span>
                {String(items.length).padStart(2, '0')} / {t.itemsLabel}
              </span>
              <span>{t.categoryLabels[category]}</span>
            </div>

            {items.length > 0 ? (
              <div className="menu-grid">
                {items.map((item) => (
                  <MenuCard key={item.id} item={item} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="menu-empty">
                <h2>{t.emptyTitle}</h2>
                <p>{t.emptyText}</p>
                <BrandButton tone="secondary" onClick={reset}>
                  {t.resetFilters}
                </BrandButton>
              </div>
            )}
          </div>
        </section>

        <section className="menu-end">
          <div className="container menu-end-inner">
            <h2 className="display-heading">
              {t.endTitle[0]}
              <br />
              <span>{t.endTitle[1]}.</span>
            </h2>
            <BrandLink href="/#branches" tone="light">
              {t.find}
            </BrandLink>
          </div>
        </section>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
