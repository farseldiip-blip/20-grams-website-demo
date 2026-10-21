'use client'

import Image from 'next/image'
import { copy, type Locale } from '@/lib/copy'
import type { MenuItem } from '@/lib/menu-types'

export function MenuCard({
  item,
  locale,
  compact = false,
}: {
  item: MenuItem
  locale: Locale
  compact?: boolean
}) {
  const ar = locale === 'ar'
  const t = copy[locale]
  const amount = item.price.replace(/\s*EGP$/, '')
  const title = ar ? item.arName : item.name

  return (
    <article className={`menu-card ${compact ? 'menu-card-compact' : ''}`}>
      <div className="menu-card-image">
        <Image
          src={item.image}
          alt={title}
          fill
          sizes="(max-width: 639px) 46vw, (max-width: 1023px) 31vw, 320px"
          className="menu-card-img"
        />
      </div>
      <div className="menu-card-content">
        <h3>{title}</h3>
        <p>{ar ? item.arDescription : item.description}</p>
        <div className="menu-card-meta">
          <strong className="menu-card-price">
            {ar ? (
              <>
                <span dir="ltr">{amount}</span> <span className="price-currency">{t.currency}</span>
              </>
            ) : (
              item.price
            )}
          </strong>
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag}>{t.tagLabels[tag] ?? tag}</span>
          ))}
        </div>
      </div>
    </article>
  )
}
