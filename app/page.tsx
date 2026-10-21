import type { Metadata } from 'next'
import { HomePage } from '@/components/home-page'
import { getLocale } from '@/lib/locale'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getLocale(), 'home')
}

export default function Page() {
  return <HomePage />
}
