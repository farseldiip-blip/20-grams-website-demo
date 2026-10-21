import { chromium } from 'playwright-core'
import fs from 'node:fs'

const BASE = process.env.QA_BASE ?? 'http://localhost:3000'
const OUT = 'screenshots'
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const report = []

const sizes = [
  { width: 390, height: 844, shot: true },
  { width: 1440, height: 900, shot: true },
  { width: 1920, height: 1080, shot: true },
  { width: 2560, height: 1440, shot: false },
]
const locales = ['en', 'ar']

async function newPage({ width, height }, locale) {
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
      { name: '20g-locale', value: 'ar', url: BASE, expires: Math.floor(Date.now() / 1000) + 3600 },
    ])
  }
  const page = await context.newPage()
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('response', (res) => {
    if (res.status() >= 400) errors.push(`http ${res.status()}: ${res.url()}`)
  })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.locator('.marquee').waitFor({ state: 'visible' })
  return { context, page, errors }
}

async function setProgress(page, progress) {
  return page.evaluate((p) => {
    const track = document.querySelector('.marquee-track')
    if (!track) return null
    const animations = track.getAnimations()
    for (const animation of animations) {
      animation.pause()
      const duration = animation.effect.getComputedTiming().duration
      animation.currentTime = duration * p
    }
    return animations.map((animation) => ({
      name: animation.animationName,
      duration: animation.effect.getComputedTiming().duration,
    }))
  }, progress)
}

async function measure(page) {
  return page.evaluate(() => {
    const marquee = document.querySelector('.marquee')
    const track = document.querySelector('.marquee-track')
    const groups = [...document.querySelectorAll('.marquee-group')]
    if (!marquee || !track) return null
    const marqueeRect = marquee.getBoundingClientRect()
    const rects = groups.map((group) => {
      const rect = group.getBoundingClientRect()
      return { left: rect.left, right: rect.right, width: rect.width }
    })
    const sorted = [...rects].sort((a, b) => a.left - b.left)
    let maxGap = 0
    for (let index = 1; index < sorted.length; index += 1) {
      maxGap = Math.max(maxGap, sorted[index].left - sorted[index - 1].right)
    }
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    return {
      viewport: window.innerWidth,
      marqueeWidth: Math.round(marqueeRect.width * 100) / 100,
      marqueeLeft: Math.round(marqueeRect.left * 100) / 100,
      marqueeRight: Math.round(marqueeRect.right * 100) / 100,
      trackWidth: Math.round(track.scrollWidth * 100) / 100,
      halfWidth: Math.round((track.scrollWidth / 2) * 100) / 100,
      groups: groups.length,
      groupWidth: Math.round(rects[0].width * 100) / 100,
      firstLeft: Math.round(first.left * 100) / 100,
      lastRight: Math.round(last.right * 100) / 100,
      edgeStartCovered: first.left <= marqueeRect.left + 1,
      edgeEndCovered: last.right >= marqueeRect.right - 1,
      maxGap: Math.round(maxGap * 100) / 100,
      horizontalScroll: document.documentElement.scrollWidth - window.innerWidth,
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
    }
  })
}

for (const size of sizes) {
  for (const locale of locales) {
    const { context, page, errors } = await newPage(size, locale)
    await page.evaluate(() => window.scrollTo(0, 0))

    const checks = []
    for (const progress of [0, 0.25, 0.5, 0.75, 0.99]) {
      await setProgress(page, progress)
      const metrics = await measure(page)
      checks.push({ progress, ...metrics })
    }

    const bidi = await page.evaluate(() => {
      const coords = document.querySelector('.hero-coords')
      if (!coords) return null
      const style = getComputedStyle(coords)
      return {
        dir: coords.getAttribute('dir'),
        unicodeBidi: style.unicodeBidi,
        direction: style.direction,
        text: coords.innerText,
        lines: [...coords.children].map((span) => ({
          dir: span.getAttribute('dir'),
          unicodeBidi: getComputedStyle(span).unicodeBidi,
          text: span.textContent,
        })),
      }
    })

    const menuBidi = await page.evaluate(async () => {
      const response = await fetch('/menu')
      const html = await response.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      return {
        prices: [...doc.querySelectorAll('.menu-card-price')].slice(0, 4).map((el) => el.textContent),
        branches: [...doc.querySelectorAll('.branch-row strong')].map((el) => el.textContent),
        heroMeta: doc.querySelector('.hero-meta span')?.textContent ?? null,
      }
    })

    report.push({
      width: size.width,
      locale,
      checks,
      bidi,
      menuBidi,
      errors,
    })

    if (size.shot) {
      await setProgress(page, 0.33)
      await page.locator('.marquee').screenshot({
        path: `${OUT}/marquee-${size.width}-${locale}.png`,
      })

      if (size.width === 1440 && locale === 'ar') {
        await setProgress(page, 0.5)
        await page.locator('.marquee').screenshot({
          path: `${OUT}/marquee-1440-ar-loop-end.png`,
        })

        const box = await page.locator('.hero-coords').boundingBox()
        if (box) {
          await page.screenshot({
            path: `${OUT}/hero-coords-1440-ar.png`,
            clip: {
              x: Math.max(0, box.x - 28),
              y: Math.max(0, box.y - 20),
              width: Math.min(1440, box.width + 56),
              height: box.height + 40,
            },
          })
        }
      }
    }

    await context.close()
  }
}

await browser.close()
fs.writeFileSync(`${OUT}/marquee-report.json`, JSON.stringify(report, null, 2))

let failed = false
for (const entry of report) {
  for (const check of entry.checks) {
    const ok =
      check.marqueeWidth >= check.viewport - 1 &&
      check.halfWidth >= check.marqueeWidth - 1 &&
      check.edgeStartCovered &&
      check.edgeEndCovered &&
      check.maxGap <= 1.5 &&
      check.horizontalScroll <= 1
    if (!ok) {
      failed = true
      console.log(
        `FAIL ${entry.width} ${entry.locale} @${check.progress}:`,
        JSON.stringify(check),
      )
    }
  }
  if (entry.errors.length) {
    console.log(`ERRORS ${entry.width} ${entry.locale}:`, entry.errors)
  }
}

const sample = report.find((entry) => entry.width === 390 && entry.locale === 'ar')
console.log('AR 390 dir/lang:', sample.checks[0].dir, sample.checks[0].lang)
console.log('AR 390 copies:', sample.checks[0].groups, 'group', sample.checks[0].groupWidth, 'track', sample.checks[0].trackWidth)
console.log('Bidi:', JSON.stringify(sample.bidi, null, 2))
console.log('Menu bidi:', JSON.stringify(sample.menuBidi, null, 2))
console.log(failed ? 'RESULT: FAIL' : 'RESULT: PASS')
