import { cookies } from 'next/headers'
import type { Locale } from '@/lib/copy'
import { LOCALE_COOKIE } from '@/lib/locale-shared'

export { LOCALE_COOKIE, LOCALE_MAX_AGE } from '@/lib/locale-shared'

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  return store.get(LOCALE_COOKIE)?.value === 'ar' ? 'ar' : 'en'
}
