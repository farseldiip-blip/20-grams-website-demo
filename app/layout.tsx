import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cairo, DM_Mono, Manrope } from 'next/font/google'
import { LocaleProvider } from '@/components/locale-provider'
import { TransitionProvider } from '@/components/transition'
import { getLocale } from '@/lib/locale'
import './globals.css'

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

const arabic = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  applicationName: '20 Grams',
  authors: [{ name: '20 Grams' }],
  creator: '20 Grams',
  formatDetection: { telephone: false, address: false, email: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
  themeColor: '#f6f4ef',
}

// Runs before the page paints: a returning visitor never sees the intro flash.
const INTRO_FLAG = `try{if(sessionStorage.getItem('20g-intro')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.intro='done'}}catch(e){}`

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${sans.variable} ${mono.variable} ${arabic.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: INTRO_FLAG }} />
        <LocaleProvider initial={locale}>
          <TransitionProvider>{children}</TransitionProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
