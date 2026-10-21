'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BrandButton } from '@/components/brand-controls'
import { useLocale } from '@/components/locale-provider'
import { useSmartNavigate } from '@/components/transition'
import { instagramUrl } from '@/lib/branches'

export function Mark({
  light = false,
  alt,
  priority = false,
  className = '',
}: {
  light?: boolean
  alt: string
  priority?: boolean
  className?: string
}) {
  return (
    <Image
      src="/brand/logo-transparent.png"
      alt={alt}
      width={656}
      height={624}
      priority={priority}
      className={`brand-logo ${light ? 'brand-logo-light' : ''} ${className}`}
    />
  )
}

export function LanguageSwitch() {
  const { locale, setLocale, t } = useLocale()
  return (
    <div className="language-switch" role="group" aria-label={t.switchAria}>
      <button
        type="button"
        lang="en"
        className={locale === 'en' ? 'active' : ''}
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
      <span className="language-divider" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        lang="ar"
        className={locale === 'ar' ? 'active' : ''}
        aria-pressed={locale === 'ar'}
        onClick={() => setLocale('ar')}
      >
        عربي
      </button>
    </div>
  )
}

export function Header() {
  const { t } = useLocale()
  const pathname = usePathname()
  const onNavigate = useSmartNavigate()
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const onMenuPage = pathname.startsWith('/menu')
  // The panel belongs to the route it was opened on, so a route change closes it
  // without an extra render pass.
  const open = menuPath === pathname
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > 4)
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }
    frame = window.requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [pathname])


  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuPath(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const links = [
    { href: '/#story', label: t.nav.story },
    { href: '/#branches', label: t.nav.branches },
    { href: '/#gallery', label: t.nav.gallery },
  ]

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Link href="/" aria-label={t.homeAria} className="brand-link" onClick={onNavigate}>
          <Mark alt={t.alts.brand} priority />
        </Link>

        <div className="header-end">
          <nav className="desktop-nav" aria-label={t.primaryNav}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={onNavigate}>
                {link.label}
              </Link>
            ))}
            <Link
              href="/menu"
              className={onMenuPage ? 'is-active' : ''}
              aria-current={onMenuPage ? 'page' : undefined}
              onClick={onNavigate}
            >
              {t.nav.menu}
            </Link>
          </nav>

          <LanguageSwitch />

          <BrandButton
            tone="secondary"
            className="nav-toggle"
            ariaLabel={open ? t.closeMenu : t.openMenu}
            ariaExpanded={open}
            ariaControls="mobile-menu"
            onClick={() => setMenuPath(open ? null : pathname)}
          >
            {open ? t.closeShort : t.nav.menu}
          </BrandButton>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label={t.mobileNav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(event) => {
                setMenuPath(null)
                onNavigate(event)
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/menu"
            onClick={(event) => {
              setMenuPath(null)
              onNavigate(event)
            }}
          >
            {t.nav.menu}
          </Link>
        </nav>
      )}
    </header>
  )
}

export function BottomNav() {
  const { t } = useLocale()
  const pathname = usePathname()
  const onNavigate = useSmartNavigate()
  const onMenu = pathname.startsWith('/menu')
  const onHome = pathname === '/'
  const [section, setSection] = useState('')

  // Highlights the section currently under the reading line on the home page.
  useEffect(() => {
    if (pathname !== '/') return

    const elements = ['story', 'branches', 'gallery']
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (!elements.length) return

    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.42
      let current = ''
      for (const element of elements) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= line && rect.bottom > line) {
          current = element.id
          break
        }
      }
      setSection(current)
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    frame = window.requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  return (
    <nav className="bottom-nav" aria-label={t.mobileNav}>
      <Link
        href="/"
        className={onHome && !section ? 'is-active' : ''}
        aria-current={onHome && !section ? 'page' : undefined}
        onClick={() => setSection('')}
      >
        <span>{t.home}</span>
      </Link>
      <Link
        href="/#story"
        className={onHome && section === 'story' ? 'is-active' : ''}
        onClick={onNavigate}
      >
        <span>{t.nav.story}</span>
      </Link>
      <Link
        href="/menu"
        className={`bottom-menu ${onMenu ? 'is-active' : ''}`}
        aria-current={onMenu ? 'page' : undefined}
        onClick={onNavigate}
      >
        <Image
          src="/brand/logo-transparent.png"
          alt=""
          width={656}
          height={624}
          className="bottom-mark"
        />
        <span>{t.nav.menu}</span>
      </Link>
      <Link
        href="/#branches"
        className={onHome && section === 'branches' ? 'is-active' : ''}
        onClick={onNavigate}
      >
        <span>{t.nav.branches}</span>
      </Link>
      <Link
        href="/#gallery"
        className={onHome && section === 'gallery' ? 'is-active' : ''}
        onClick={onNavigate}
      >
        <span>{t.nav.gallery}</span>
      </Link>
    </nav>
  )
}

export function Footer() {
  const { t } = useLocale()
  const onNavigate = useSmartNavigate()

  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <Mark light alt={t.alts.brand} />
          <p className="footer-tagline">{t.tagline}</p>
          <span className="footer-since font-mono">{t.facts[2]}</span>
        </div>

        <nav className="footer-col" aria-label={t.footerExplore}>
          <span className="font-mono">{t.footerExplore}</span>
          <Link href="/menu" onClick={onNavigate}>
            {t.nav.menu}
          </Link>
          <Link href="/#story" onClick={onNavigate}>
            {t.nav.story}
          </Link>
          <Link href="/#branches" onClick={onNavigate}>
            {t.nav.branches}
          </Link>
          <Link href="/#gallery" onClick={onNavigate}>
            {t.nav.gallery}
          </Link>
        </nav>

        <div className="footer-col">
          <span className="font-mono">{t.footerConnect}</span>
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            @20grams_eg
          </a>
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            {t.order}
          </a>
        </div>
      </div>

      <div className="container footer-bottom font-mono">
        <span>{t.copyright}</span>
        <span>{t.location}</span>
      </div>
    </footer>
  )
}
