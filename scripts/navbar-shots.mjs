import { chromium } from 'playwright-core'
import fs from 'node:fs'

const BASE = process.env.QA_BASE ?? 'http://localhost:3000'
const OUT = 'screenshots'
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const report = []

async function newPage(width, height, locale) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  })
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
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('/_vercel/insights/')) {
      errors.push(`http ${res.status()}: ${res.url()}`)
    }
  })
  return { context, page, errors }
}

async function load(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto'
  })
  await page.locator('.site-header').waitFor({ state: 'visible' })
}

async function settle(page) {
  await page.waitForTimeout(120)
  let last = -1
  for (let index = 0; index < 30; index += 1) {
    const y = await page.evaluate(() => window.scrollY)
    if (Math.abs(y - last) < 0.5) return y
    last = y
    await page.waitForTimeout(80)
  }
  return last
}

async function metrics(page) {
  return page.evaluate(() => {
    const header = document.querySelector('.site-header')
    const rect = header.getBoundingClientRect()
    const style = getComputedStyle(header)
    const tabs = document.querySelector('.menu-controls-wrap')
    const tabsRect = tabs?.getBoundingClientRect()
    const brand = document.querySelector('.site-header .brand-link').getBoundingClientRect()
    const language = document.querySelector('.site-header .language-switch').getBoundingClientRect()
    const desktopNav = document.querySelector('.site-header .desktop-nav')
    const toggle = document.querySelector('.site-header .nav-toggle')
    const isRtl = document.documentElement.dir === 'rtl'
    const points = [0.15, 0.5, 0.85].map((fraction) => {
      const element = document.elementFromPoint(window.innerWidth * fraction, 14)
      return Boolean(element?.closest('.site-header'))
    })
    return {
      scrollY: Math.round(window.scrollY * 100) / 100,
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      header: {
        top: Math.round(rect.top * 100) / 100,
        bottom: Math.round(rect.bottom * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
        position: style.position,
        zIndex: style.zIndex,
        background: style.backgroundColor,
        borderColor: style.borderBottomColor,
      },
      tabsTop: tabsRect ? Math.round(tabsRect.top * 100) / 100 : null,
      tabsHeight: tabsRect ? Math.round(tabsRect.height * 100) / 100 : null,
      tabsZ: tabs ? getComputedStyle(tabs).zIndex : null,
      mainBottom: Math.round(document.querySelector('main').getBoundingClientRect().bottom * 100) / 100,
      headerPointsTopmost: points,
      brandLeft: Math.round(brand.left * 100) / 100,
      brandRight: Math.round(brand.right * 100) / 100,
      languageLeft: Math.round(language.left * 100) / 100,
      languageRight: Math.round(language.right * 100) / 100,
      navVisible: desktopNav ? getComputedStyle(desktopNav).display !== 'none' : false,
      toggleVisible: toggle ? getComputedStyle(toggle).display !== 'none' : false,
      isRtl,
      horizontalScroll: document.documentElement.scrollWidth - window.innerWidth,
      curtainZ: getComputedStyle(document.querySelector('.page-curtain')).zIndex,
      logoHeight: Math.round(
        document.querySelector('.site-header .brand-logo').getBoundingClientRect().height * 100,
      ) / 100,
    }
  })
}

function assert(condition, label, details) {
  if (!condition) {
    console.log(`FAIL ${label}`, details ?? '')
    return false
  }
  return true
}

for (const width of [390, 1440]) {
  const height = width === 390 ? 844 : 900
  for (const locale of ['en', 'ar']) {
    const expectedHeight = width === 390 ? 64 : 72

    for (const [name, path] of [
      ['home', '/'],
      ['menu', '/menu'],
    ]) {
      const { context, page, errors } = await newPage(width, height, locale)
      await load(page, path)

      let ok = true
      const start = await metrics(page)
      ok = assert(start.header.position === 'sticky', `${name} ${width} ${locale} sticky`, start.header) && ok
      ok = assert(Math.abs(start.header.height - expectedHeight) <= 0.5, `${name} ${width} ${locale} height`, start.header) && ok
      ok = assert(start.header.top === 0, `${name} ${width} ${locale} top at load`, start.header) && ok
      ok = assert(start.header.zIndex === '75', `${name} ${width} ${locale} z-index`, start.header) && ok
      ok = assert(start.curtainZ === '70', `${name} ${width} ${locale} curtain below`, start.curtainZ) && ok
      ok = assert(start.headerPointsTopmost.every(Boolean), `${name} ${width} ${locale} topmost at load`, start.headerPointsTopmost) && ok
      ok = assert(start.horizontalScroll <= 1, `${name} ${width} ${locale} h-scroll`, start.horizontalScroll) && ok
      ok = assert(start.brandLeft >= 0 && start.brandRight <= width, `${name} ${width} ${locale} brand in view`, start) && ok
      ok = assert(start.languageLeft >= 0 && start.languageRight <= width, `${name} ${width} ${locale} switch in view`, start) && ok
      if (locale === 'ar') {
        ok = assert(start.brandLeft > start.languageLeft, `${name} ${width} ar mirrored`, start) && ok
      } else {
        ok = assert(start.brandLeft < start.languageLeft, `${name} ${width} en order`, start) && ok
      }

      const steps = 14
      const maxScroll = start.scrollHeight - height
      for (let step = 0; step <= steps; step += 1) {
        await page.evaluate((y) => window.scrollTo(0, y), (maxScroll * step) / steps)
        await page.waitForTimeout(35)
        const m = await metrics(page)
        const label = `${name} ${width} ${locale} step ${step} y=${m.scrollY}`
        ok = assert(m.header.top === 0, `${label} pinned`, m.header) && ok
        ok = assert(Math.abs(m.header.height - expectedHeight) <= 0.5, `${label} height`, m.header) && ok
        ok = assert(m.headerPointsTopmost.every(Boolean), `${label} topmost`, m.headerPointsTopmost) && ok
        ok = assert(m.languageLeft >= 0 && m.languageRight <= width, `${label} switch visible`, m) && ok
        ok = assert(m.horizontalScroll <= 1, `${label} h-scroll`, m.horizontalScroll) && ok
        if (name === 'menu' && m.tabsTop !== null) {
          const stickyRange =
            m.tabsTop <= m.header.bottom + 1 &&
            m.mainBottom >= m.header.bottom + m.tabsHeight + 1
          if (stickyRange) {
            ok = assert(Math.abs(m.tabsTop - m.header.bottom) <= 1, `${label} tabs below nav`, {
              tabsTop: m.tabsTop,
              headerBottom: m.header.bottom,
            }) && ok
          }
        }
      }

      const end = await metrics(page)
      const scrolledBorder = end.header.borderColor !== 'rgba(0, 0, 0, 0)'
      ok = assert(scrolledBorder, `${name} ${width} ${locale} border after scroll`, end.header.borderColor) && ok
      ok = assert(end.scrollY > 40, `${name} ${width} ${locale} scrolled full page`, end.scrollY) && ok
      ok = assert(!end.navVisible || end.navVisible, 'nav check noop') && ok

      // Anchor landing checks.
      const anchors = []
      if (name === 'home') {
        for (const id of ['story', 'branches', 'gallery']) {
          await page.evaluate((target) => {
            window.location.hash = target
          }, id)
          await settle(page)
          const anchor = await page.evaluate((target) => {
            const header = document.querySelector('.site-header').getBoundingClientRect()
            const targetRect = document.getElementById(target).getBoundingClientRect()
            return {
              id: target,
              headerBottom: Math.round(header.bottom * 100) / 100,
              targetTop: Math.round(targetRect.top * 100) / 100,
              scrollY: Math.round(window.scrollY),
            }
          }, id)
          anchors.push(anchor)
          ok = assert(
            anchor.targetTop >= anchor.headerBottom - 1,
            `${name} ${width} ${locale} #${id} clears nav`,
            anchor,
          ) && ok
        }
      }

      // Mid-scroll screenshot with the bar over content.
      let shotY
      if (name === 'home') {
        shotY = await page.evaluate(() => {
          const target = document.getElementById('dirty')
          return target.getBoundingClientRect().top + window.scrollY - 220
        })
      } else {
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.waitForTimeout(80)
        shotY = await page.evaluate(() => {
          const header = document.querySelector('.site-header').getBoundingClientRect()
          const tabs = document.querySelector('.menu-controls-wrap').getBoundingClientRect()
          const cards = [...document.querySelectorAll('.menu-card')]
          const card = cards[5] ?? cards[0]
          return (
            card.getBoundingClientRect().top +
            window.scrollY -
            (header.bottom + tabs.height + 14)
          )
        })
      }
      await page.evaluate((y) => window.scrollTo(0, y), shotY)
      await page.waitForTimeout(150)
      const mid = await metrics(page)
      await page.screenshot({ path: `${OUT}/navbar-${name}-${width}-${locale}.png` })
      ok = assert(mid.header.top === 0, `${name} ${width} ${locale} mid pinned`, mid.header) && ok
      ok = assert(mid.headerPointsTopmost.every(Boolean), `${name} ${width} ${locale} mid topmost`, mid.headerPointsTopmost) && ok
      if (name === 'menu') {
        ok = assert(Math.abs(mid.tabsTop - mid.header.bottom) <= 1, `${name} ${width} ${locale} mid tabs`, mid) && ok
      }

      // Deep link into /menu#dirty on a fresh document.
      let deepLink = null
      if (name === 'menu') {
        await load(page, '/menu#dirty')
        await settle(page)
        deepLink = await page.evaluate(() => {
          const header = document.querySelector('.site-header').getBoundingClientRect()
          const tabs = document.querySelector('.menu-controls-wrap').getBoundingClientRect()
          const target = document.getElementById('dirty').getBoundingClientRect()
          const selected = document.querySelector('.category-tabs .is-selected')?.textContent
          return {
            headerBottom: Math.round(header.bottom * 100) / 100,
            tabsBottom: Math.round(tabs.bottom * 100) / 100,
            targetTop: Math.round(target.top * 100) / 100,
            selected,
          }
        })
        ok = assert(
          deepLink.targetTop >= deepLink.tabsBottom - 1,
          `${name} ${width} ${locale} #dirty clears tabs`,
          deepLink,
        ) && ok
        ok = assert(
          deepLink.targetTop <= deepLink.tabsBottom + 40,
          `${name} ${width} ${locale} #dirty lands close`,
          deepLink,
        ) && ok
      }

      report.push({
        width,
        locale,
        name,
        expectedHeight,
        start,
        end,
        anchors,
        deepLink,
        mid: { scrollY: mid.scrollY, header: mid.header, tabsTop: mid.tabsTop },
        errors,
        pass: ok,
      })

      await context.close()
    }
  }
}

await browser.close()
fs.writeFileSync(`${OUT}/navbar-report.json`, JSON.stringify(report, null, 2))
const failed = report.filter((entry) => !entry.pass)
console.log(`REPORT ${report.length} runs, failures: ${failed.length}`)
for (const entry of report) {
  if (!entry.pass) console.log('FAILED RUN', entry.name, entry.width, entry.locale)
  if (entry.errors.length) console.log('ERRORS', entry.name, entry.width, entry.locale, entry.errors)
}
const ar = report.find((entry) => entry.width === 390 && entry.locale === 'ar' && entry.name === 'home')
if (ar) {
  console.log('AR 390 header:', JSON.stringify(ar.start.header))
  console.log('AR 390 brand/switch:', ar.start.brandLeft, ar.start.brandRight, ar.start.languageLeft, ar.start.languageRight)
}
console.log('RESULT:', failed.length === 0 ? 'PASS' : 'FAIL')
