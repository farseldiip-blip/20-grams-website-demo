import type { Metadata } from 'next'
import { MenuPage } from '@/components/menu-page'
import { MENU_CATEGORIES, type MenuCategory } from '@/lib/copy'
import { getLocale } from '@/lib/locale'
import { buildMetadata } from '@/lib/seo'

type PageProps = {
  searchParams: Promise<{ category?: string | string[] }>
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getLocale(), 'menu')
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const raw = Array.isArray(params.category) ? params.category[0] : params.category
  const initialCategory: MenuCategory = MENU_CATEGORIES.includes(raw as MenuCategory)
    ? (raw as MenuCategory)
    : 'All'

  return <MenuPage initialCategory={initialCategory} />
}
