import { chromium } from 'playwright-core'
import fs from 'node:fs'

const BASE = process.env.QA_BASE ?? 'http://localhost:3000'
const OUT = 'screenshots'
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const report = []

for (const width of [390, 1440]) {
  const height = width === 390 ? 844 : 900
  for (const locale of ['en', 'ar']) {
    for (const [name, path] of [
      ['home', '/'],
      ['menu', '/menu'],
    ]) {
      const context = await browser.newContext({ viewport: { width, height } })
      await context.addInitScript(() => {
        try {
          sessionStorage.setItem('20g-intro', '1')
        } catch {
          /* about:blank */
        }
      })
      if (locale === 'ar') {
        await context.addCookies([
          {
            name: '20g-locale',
            value: 'ar',
            url: BASE,
            expires: Math.floor(Date.now() / 1000) + 3600,
          },
        ])
      }
      const page = await context.newPage()
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(200)

      const data = await page.evaluate(() => {
        const header = document.querySelector('.site-header')
        const rect = header.getBoundingClientRect()
        const style = getComputedStyle(header)
        const brand = document.querySelector('.site-header .brand-logo').getBoundingClientRect()
        const hero = document.querySelector('.hero-section')?.getBoundingClientRect()
        const heroMeta = document.querySelector('.hero-meta')?.getBoundingClientRect()
        const heroLogo = document.querySelector('.hero-main-logo')?.getBoundingClientRect()
        const heroBottom = document.querySelector('.hero-bottom')?.getBoundingClientRect()
        const menuCopy = document.querySelector('.menu-hero-copy')?.getBoundingClientRect()
        const menuHero = document.querySelector('.menu-hero')?.getBoundingClientRect()
        return {
          viewport: { width: window.innerWidth, height: window.innerHeight },
          header: {
            top: Math.round(rect.top * 100) / 100,
            bottom: Math.round(rect.bottom * 100) / 100,
            height: Math.round(rect.height * 100) / 100,
            borderColor: style.borderBottomColor,
            background: style.backgroundColor,
          },
          brand: { top: brand.top, bottom: brand.bottom, height: brand.height },
          hero: hero
            ? {
                top: Math.round(hero.top * 100) / 100,
                bottom: Math.round(hero.bottom * 100) / 100,
                height: Math.round(hero.height * 100) / 100,
              }
            : null,
          heroMetaTop: heroMeta ? Math.round(heroMeta.top * 100) / 100 : null,
          heroLogoTop: heroLogo ? Math.round(heroLogo.top * 100) / 100 : null,
          heroLogoBottom: heroLogo ? Math.round(heroLogo.bottom * 100) / 100 : null,
          heroContentBottom: heroBottom ? Math.round(heroBottom.bottom * 100) / 100 : null,
          menuHeroTop: menuHero ? Math.round(menuHero.top * 100) / 100 : null,
          menuCopyTop: menuCopy ? Math.round(menuCopy.top * 100) / 100 : null,
          toggleDisplay: getComputedStyle(document.querySelector('.site-header .nav-toggle')).display,
          languageDisplay: getComputedStyle(document.querySelector('.site-header .language-switch')).display,
          desktopNavDisplay: getComputedStyle(document.querySelector('.site-header .desktop-nav')).display,
        }
      })

      let ok = true
      const fail = (label, details) => {
        ok = false
        console.log(`FAIL ${name} ${width} ${locale} ${label}`, details)
      }
      if (Math.abs(data.header.height - (width === 390 ? 64 : 72)) > 0.5) {
        fail('header height', data.header)
      }
      if (data.header.top !== 0) fail('header top', data.header)
      if (data.header.borderColor !== 'rgba(0, 0, 0, 0)') fail('border at rest', data.header)
      if (name === 'home') {
        if (data.hero.bottom < height - 1 || data.hero.bottom > height + 120) {
          fail('hero fills viewport below nav', data.hero)
        }
        if (data.heroContentBottom > height) fail('hero content cut off', data)
        if (!(data.heroMetaTop > data.header.bottom)) fail('hero meta below nav', data)
        if (!(data.heroLogoTop > data.header.bottom)) fail('hero logo below nav', data)
      } else {
        if (Math.abs(data.menuHeroTop - data.header.bottom) > 1) fail('menu hero starts below nav', data)
        if (!(data.menuCopyTop > data.header.bottom)) fail('menu copy below nav', data)
      }
      if (width === 390) {
        if (!['flex', 'inline-flex'].includes(data.toggleDisplay)) fail('nav toggle visibility', data.toggleDisplay)
      } else if (data.toggleDisplay !== 'none') {
        fail('nav toggle visibility', data.toggleDisplay)
      }
      if (data.languageDisplay === 'none') fail('language switch hidden', data)
      if (data.desktopNavDisplay !== (width === 1440 ? 'flex' : 'none')) {
        fail('desktop nav visibility', data.desktopNavDisplay)
      }

      await page.screenshot({ path: `${OUT}/navbar-top-${name}-${width}-${locale}.png` })
      report.push({ width, locale, name, data, pass: ok })
      await context.close()
    }
  }
}

await browser.close()
fs.writeFileSync(`${OUT}/navbar-top-report.json`, JSON.stringify(report, null, 2))
const failed = report.filter((entry) => !entry.pass)
console.log(`REPORT ${report.length} runs, failures: ${failed.length}`)
console.log('RESULT:', failed.length === 0 ? 'PASS' : 'FAIL')
