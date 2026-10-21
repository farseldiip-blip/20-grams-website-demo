/**
 * One-off asset preparation.
 *
 * Source photos live in scripts/assets-src (not served, kept for reproducibility).
 * Output goes to public/images as compressed WebP plus brand derivatives.
 *
 * Run: node scripts/prepare-images.mjs
 */
import sharp from 'sharp'
import { mkdir, access } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const src = path.join(root, 'scripts', 'assets-src')
const out = path.join(root, 'public', 'images')
const brand = path.join(root, 'public', 'brand')

await mkdir(out, { recursive: true })
await mkdir(brand, { recursive: true })

const exists = async (p) => access(p).then(() => true, () => false)

/* ---------- logo derivatives (same artwork as public/brand/logo.png) ---------- */
const logoBox = { left: 240, top: 256, width: 600, height: 568 } // measured content box

// Remove the white background: black artwork on transparency, antialiasing preserved.
const { data, info } = await sharp(path.join(brand, 'logo.png'))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const rgba = Buffer.alloc(info.width * info.height * 4)
for (let i = 0; i < info.width * info.height; i++) {
  const s = i * 4
  const luma = Math.round(0.299 * data[s] + 0.587 * data[s + 1] + 0.114 * data[s + 2])
  rgba[s] = 10
  rgba[s + 1] = 10
  rgba[s + 2] = 10
  rgba[s + 3] = 255 - luma
}

const logoPng = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toBuffer()

const pad = 28
await sharp(logoPng)
  .extract({
    left: Math.max(0, logoBox.left - pad),
    top: Math.max(0, logoBox.top - pad),
    width: logoBox.width + pad * 2,
    height: logoBox.height + pad * 2,
  })
  .png({ compressionLevel: 9 })
  .toFile(path.join(brand, 'logo-transparent.png'))

// Favicon / app icons: logo centred on the brand paper, generous breathing room.
const iconCanvas = 512
const iconLogo = await sharp(logoPng)
  .extract(logoBox)
  .resize({ width: 330, height: 330, fit: 'inside' })
  .toBuffer({ resolveWithObject: true })

await sharp({
  create: { width: iconCanvas, height: iconCanvas, channels: 4, background: '#f6f4ef' },
})
  .composite([
    {
      input: iconLogo.data,
      left: Math.round((iconCanvas - iconLogo.info.width) / 2),
      top: Math.round((iconCanvas - iconLogo.info.height) / 2),
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, 'app', 'icon.png'))

await sharp(path.join(root, 'app', 'icon.png'))
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, 'app', 'apple-icon.png'))

// Open Graph card, 1200x630.
const ogLogo = await sharp(logoPng)
  .extract(logoBox)
  .resize({ width: 470, height: 470, fit: 'inside' })
  .toBuffer({ resolveWithObject: true })

await sharp({
  create: { width: 1200, height: 630, channels: 4, background: '#f6f4ef' },
})
  .composite([
    {
      input: ogLogo.data,
      left: Math.round((1200 - ogLogo.info.width) / 2),
      top: Math.round((630 - ogLogo.info.height) / 2),
    },
    {
      input: Buffer.from(
        '<svg width="1200" height="630"><rect x="0" y="618" width="1200" height="12" fill="#ff4a1c"/></svg>',
      ),
      left: 0,
      top: 0,
    },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path.join(brand, 'og.jpg'))

/* ---------- photography ---------- */
async function webp(input, name, { width, height, position = 'attention', quality = 80 } = {}) {
  let img = sharp(input).rotate()
  if (width && height) img = img.resize({ width, height, fit: 'cover', position })
  else img = img.resize({ width, withoutEnlargement: false })
  const file = path.join(out, name)
  const info = await img.webp({ quality, effort: 6 }).toFile(file)
  console.log(name.padEnd(26), `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(0)}kb`)
}

// Real 20 Grams photography. Crops remove the social-post text overlays.
// Fractions are relative to the poster artwork so the crop survives a resized source.
async function cropPoster(source, target, top, bottom) {
  const { width, height } = await sharp(source).metadata()
  const y = Math.round(height * top)
  const h = Math.round(height * bottom) - y
  await sharp(source)
    .flatten({ background: '#ffffff' })
    .extract({ left: 0, top: y, width, height: h })
    .png()
    .toFile(target)
}

const storefront = path.join(out, '_storefront-full.png')
const dirty = path.join(out, '_dirty-full.png')

await cropPoster(path.join(src, 'posters', 'storefront.png'), storefront, 0.095, 0.875)
await cropPoster(path.join(src, 'posters', 'dirty-drinks.png'), dirty, 0.13, 0.695)

await webp(storefront, 'storefront.webp', { width: 1008, height: 1008 })
await webp(dirty, 'dirty.webp', { width: 1600, height: 1120 })

// Three real details from the dirty-drinks poster.

await webp(path.join(src, 'latte.jpg'), 'latte.webp', { width: 1000, height: 1250 })
await webp(path.join(src, 'pourover.jpg'), 'pourover.webp', { width: 1400, height: 933 })
await webp(path.join(src, 'matcha.jpg'), 'matcha.webp', { width: 1000, height: 1000 })
await webp(path.join(src, 'croissant.jpg'), 'croissant.webp', { width: 1000, height: 1000 })
await webp(path.join(src, 'iced.jpg'), 'iced.webp', { width: 1000, height: 1250 })
await webp(path.join(src, 'americano.jpg'), 'americano.webp', { width: 1000, height: 1250 })
await webp(path.join(src, 'cups.jpg'), 'cups.webp', { width: 1000, height: 1250 })
await webp(path.join(src, 'beans.jpg'), 'beans.webp', { width: 1600, height: 1200 })

if (await exists(storefront)) {
  const { unlink } = await import('node:fs/promises')
  await unlink(storefront)
  await unlink(dirty)
}

console.log('done')
