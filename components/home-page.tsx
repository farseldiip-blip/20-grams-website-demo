'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BrandLink } from '@/components/brand-controls'
import { Intro } from '@/components/intro'
import { MenuCard } from '@/components/menu-card'
import { useLocale } from '@/components/locale-provider'
import { useDocumentMeta } from '@/components/use-document-meta'
import { useSmartNavigate } from '@/components/transition'
import { BottomNav, Footer, Header } from '@/components/site-shell'
import { mapUrl, branches } from '@/lib/branches'
import { MENU_CATEGORIES } from '@/lib/copy'
import menu from '@/lib/menu.json'

const FEATURED = ['dirty-spanish', 'matcha-cloud', 'flat-white', 'cinnamon-roll']
const featured = FEATURED.map((id) => menu.find((item) => item.id === id)).filter(
  (item): item is (typeof menu)[number] => Boolean(item),
)

export function HomePage() {
  const { locale, t } = useLocale()
  const onNavigate = useSmartNavigate()

  useDocumentMeta(locale, 'home')

  const gallery = [
    { src: '/images/storefront.webp', alt: t.alts.storefront },
    { src: '/images/pourover.webp', alt: t.alts.pours },
    { src: '/images/dirty.webp', alt: t.alts.dirty },
  ]

  return (
    <>
      <Intro />
      <Header />
      <main>
        <section className="hero-section">
          <div className="container hero-inner">
            <div className="hero-meta font-mono">
              <span>{t.heroMeta}</span>
              <span aria-hidden="true">● ◌ ◎</span>
            </div>

            <div className="hero-logo-wrap">
              <Image
                src="/brand/logo-transparent.png"
                alt={t.alts.brand}
                width={656}
                height={624}
                priority
                className="hero-main-logo"
              />
            </div>

            <div className="hero-bottom">
              <div className="hero-copy">
                <h1 className="hero-heading">
                  <span className="sr-only">20 Grams — </span>
                  {t.tagline}
                </h1>
                <p className="hero-intro">{t.intro}</p>
              </div>
              <div className="hero-side">
                <div className="hero-actions">
                  <BrandLink href="/menu">{t.explore}</BrandLink>
                  <BrandLink href="/#branches" tone="secondary">
                    {t.find}
                  </BrandLink>
                </div>
                <div className="hero-coords font-mono">
                  {t.coords.split('\n').map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((group) => (
              <div className="marquee-group" key={group}>
                {t.marquee.map((word) => (
                  <span key={`${group}-${word}`}>
                    {word}
                    <i>✦</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="section dose-section" id="story">
          <div className="container">
            <div className="section-label font-mono">
              <span>(01)</span>
              <span>{t.doseLabel}</span>
            </div>

            <div className="dose-grid">
              <div className="dose-copy">
                <h2 className="display-heading">
                  {t.doseTitle[0]}
                  <br />
                  <em>{t.doseTitle[1]}</em>
                  <br />
                  {t.doseTitle[2]}.
                </h2>
                <p className="body-copy">{t.storyText}</p>
              </div>
              <div className="dose-number" aria-hidden="true">
                {t.doseNumber}
                <span>{t.doseUnit}</span>
              </div>
            </div>

            <div className="facts">
              {t.facts.map((fact, index) => (
                <div key={fact}>
                  <span className="font-mono">0{index + 1}</span>
                  <strong>{fact}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dirty-section" id="dirty">
          <div className="container dirty-inner">
            <div className="section-label font-mono">
              <span>(02)</span>
              <span>{t.dirtyLabel}</span>
            </div>
            <div className="dirty-copy">
              <h2 className="display-heading">
                {t.dirtyTitle[0]}
                <br />
                {t.dirtyTitle[1]}
              </h2>
              <p>{t.dirtyText}</p>
              <BrandLink href="/menu#dirty" tone="light">
                {t.fullMenu}
              </BrandLink>
            </div>
            <div className="dirty-photo">
              <Image
                src="/images/dirty.webp"
                alt={t.alts.dirty}
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
                className="cover"
              />
            </div>
          </div>
        </section>

        <section className="section menu-teaser">
          <div className="container">
            <div className="section-label font-mono">
              <span>(03)</span>
              <span>{t.teaserLabel}</span>
            </div>

            <div className="teaser-heading">
              <h2 className="display-heading">
                {t.teaserTitle[0]}
                <br />
                {t.teaserTitle[1]}
                <br />
                {t.teaserTitle[2]}
              </h2>
              <BrandLink href="/menu">{t.fullMenu}</BrandLink>
            </div>

            <div className="category-row">
              {MENU_CATEGORIES.filter((category) => category !== 'All').map((category) => (
                <Link
                  key={category}
                  href={`/menu?category=${category}`}
                  className={category === 'Dirty' ? 'selected' : ''}
                  onClick={onNavigate}
                >
                  {t.categoryLabels[category]}
                </Link>
              ))}
            </div>

            <div className="menu-cards">
              {featured.map((item) => (
                <MenuCard key={item.id} item={item} locale={locale} compact />
              ))}
            </div>
          </div>
        </section>

        <section className="tv-section">
          <div className="container">
            <div className="tv-frame tv-lines">
              <div className="tv-top font-mono">
                <span>{t.tvLabel}</span>
                <span className="tv-rec">{t.tvStatus}</span>
              </div>
              <h2 className="display-heading">
                {t.tvTitle[0]}
                <br />
                <span>{t.tvTitle[1]}</span>
              </h2>
              <div className="tv-screen">
                <Image
                  src="/images/pourover.webp"
                  alt={t.alts.pours}
                  fill
                  sizes="(max-width: 900px) 92vw, 1100px"
                  className="tv-image"
                />
                <div className="tv-static" aria-hidden="true" />
              </div>
              <div className="tv-footer font-mono">
                <span>{t.tvFooter}</span>
                <span aria-hidden="true">● ● ●</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section branches-section" id="branches">
          <div className="container">
            <div className="section-label font-mono">
              <span>(04)</span>
              <span>{t.branchesLabel}</span>
            </div>

            <div className="branches-header">
              <h2 className="display-heading">{t.branchesTitle}.</h2>
              <p>
                {t.branchesIntro.split('\n').map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>

            <div className="branch-list">
              {branches.map((branch, index) => (
                <a
                  key={branch.name.en}
                  href={mapUrl(branch.mapQuery)}
                  target="_blank"
                  rel="noreferrer"
                  className={`branch-row ${branch.isNew ? 'new-branch' : ''}`}
                >
                  <span className="font-mono branch-index">
                    <span dir="ltr">{String(index + 1).padStart(2, '0')}</span>
                    <span aria-hidden="true">·</span>
                    <span>{branch.area[locale]}</span>
                  </span>
                  <strong>
                    {branch.name[locale]}
                    {branch.isNew && <span className="branch-badge font-mono">{t.newBadge}</span>}
                  </strong>
                  <span className="branch-action font-mono">{t.directions}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="gallery-section" id="gallery">
          <div className="container gallery-inner">
            <div className="section-label font-mono">
              <span>(05)</span>
              <span>{t.galleryLabel}</span>
            </div>

            <div className="gallery-grid">
              {gallery.map((photo, index) => (
                <figure className="gallery-item" key={photo.src}>
                  <div className="gallery-frame">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 700px) 92vw, 33vw"
                      className="cover"
                    />
                  </div>
                  <figcaption className="font-mono">
                    0{index + 1} / {t.galleryCaptions[index]}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
