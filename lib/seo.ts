import type { Metadata } from 'next'
import type { Locale } from '@/lib/copy'

export type PageKey = 'home' | 'menu'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

type PageMeta = {
  title: string
  description: string
  ogLocale: string
  ogAlt: string
}

const META: Record<PageKey, Record<Locale, PageMeta>> = {
  home: {
    en: {
      title: '20 Grams — Specialty Coffee Bar',
      description:
        'Twenty grams. Zero compromise. Specialty coffee, barista crafted in Egypt.',
      ogLocale: 'en_US',
      ogAlt: '20 Grams wordmark on paper',
    },
    ar: {
      title: '٢٠ جرام — قهوة مختصة',
      description: 'عشرون جرامًا. بلا تنازل. قهوة مختصة على يد باريستا في مصر.',
      ogLocale: 'ar_EG',
      ogAlt: 'شعار ٢٠ جرام',
    },
  },
  menu: {
    en: {
      title: 'Menu — 20 Grams',
      description:
        'Espresso, iced, dirty, matcha, filter and bakery. The full 20 Grams menu, barista crafted in Egypt.',
      ogLocale: 'en_US',
      ogAlt: '20 Grams wordmark on paper',
    },
    ar: {
      title: 'القائمة — ٢٠ جرام',
      description:
        'إسبريسو، مثلج، ديرتي، ماتشا، فلتر ومخبوزات. قائمة ٢٠ جرام كاملة، على يد باريستا في مصر.',
      ogLocale: 'ar_EG',
      ogAlt: 'شعار ٢٠ جرام',
    },
  },
}

export function pageMeta(locale: Locale, page: PageKey): PageMeta {
  return META[page][locale]
}

export function buildMetadata(locale: Locale, page: PageKey): Metadata {
  const meta = pageMeta(locale, page)
  const path = page === 'home' ? '/' : '/menu'

  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    alternates: { canonical: path },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: path,
      siteName: '20 Grams',
      locale: meta.ogLocale,
      type: 'website',
      images: [
        {
          url: '/brand/og.jpg',
          width: 1200,
          height: 630,
          alt: meta.ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/brand/og.jpg'],
    },
  }
}
