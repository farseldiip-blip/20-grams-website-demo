import type { Locale } from '@/lib/copy'

type Branch = {
  area: Record<Locale, string>
  name: Record<Locale, string>
  mapQuery: string
  isNew?: boolean
}

export const branches: Branch[] = [
  {
    area: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
    name: { en: 'Arkan Plaza', ar: 'أركان بلازا' },
    mapQuery: '20 Grams Arkan Plaza Sheikh Zayed Cairo',
  },
  {
    area: { en: 'New Cairo', ar: 'القاهرة الجديدة' },
    name: { en: 'Leven Square', ar: 'ليفن سكوير' },
    mapQuery: '20 Grams Leven Square New Cairo',
    isNew: true,
  },
  {
    area: { en: 'New Cairo', ar: 'القاهرة الجديدة' },
    name: { en: 'Garden 8', ar: 'جاردن 8' },
    mapQuery: '20 Grams Garden 8 New Cairo',
  },
  {
    area: { en: 'New Cairo', ar: 'القاهرة الجديدة' },
    name: { en: 'O West', ar: 'أو ويست' },
    mapQuery: '20 Grams O West New Cairo',
  },
  {
    area: { en: 'North Coast', ar: 'الساحل الشمالي' },
    name: { en: 'LaVista', ar: 'لافيستا' },
    mapQuery: '20 Grams LaVista North Coast Egypt',
  },
  {
    area: { en: 'North Coast', ar: 'الساحل الشمالي' },
    name: { en: 'Ras El Hikma Cascada', ar: 'رأس الحكمة كاسكادا' },
    mapQuery: '20 Grams Ras El Hikma Cascada North Coast',
  },
]

export const mapUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export const instagramUrl = 'https://instagram.com/20grams_eg'
