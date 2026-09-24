import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000'
const output = path.resolve('editorial-qa')
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const checks = []
const allFailures = []
const emptyCart = { items: [], coupons: [], totals: { total_price: '0', total_items: '0', total_shipping: '0', currency_code: 'GBP', currency_symbol: '£', currency_minor_unit: 2 }, needs_payment: false, needs_shipping: false, has_calculated_shipping: false, shipping_rates: [], items_count: 0 }
async function contextFor(width) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
  await context.route('**/api/cart', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(emptyCart) }))
  await context.route('**/api/checkout**', route => route.abort())
  return context
}
async function waitFont(page, selector, fragment) {
  const report = await page.locator(selector).first().evaluate(async (el) => {
    const style = getComputedStyle(el)
    const family = style.fontFamily.split(',')[0].trim()
    await document.fonts.load(`${style.fontWeight} 48px ${family}`, 'Housefinds £20')
    await document.fonts.ready
    const clean = value => value.replace(/["']/g, '').trim()
    const faces = [...document.fonts].filter(face => clean(face.family) === clean(family)).map(face => ({ family: face.family, status: face.status, weight: face.weight }))
    return { computed: style.fontFamily, faces }
  })
  assert.ok(report.computed.toLowerCase().includes(fragment), JSON.stringify(report))
  assert.ok(report.faces.some(face => face.status === 'loaded'), `Fallback-only font: ${JSON.stringify(report)}`)
  return report
}
function luminance(rgb) {
  const channel = x => { const c = x / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4 }
  return .2126 * channel(rgb[0]) + .7152 * channel(rgb[1]) + .0722 * channel(rgb[2])
}
try {
  for (const width of [320, 360, 390, 540, 768, 1024, 1100, 1440, 1920]) {
    const context = await contextFor(width)
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(base, { waitUntil: 'networkidle' })
    assert.equal(response.status(), 200)
    const heroFont = await waitFont(page, 'main h1', 'lora')
    await waitFont(page, '#featured-find-title', 'lora')
    await waitFont(page, '#featured-find [class*="price"]', 'inter')
    assert.equal(await page.locator('[data-promotion]').count(), 3)
    for (const banner of await page.locator('[data-promotion]').all()) {
      await banner.scrollIntoViewIfNeeded()
      await banner.locator('img').evaluate(async img => { if (!img.complete) await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject }); await img.decode() })
      const geometry = await banner.evaluate(el => {
        const outer = el.getBoundingClientRect()
        const copy = el.querySelector('[data-campaign-layer="content"]').getBoundingClientRect()
        const art = el.querySelector('[data-campaign-layer="image"]').getBoundingClientRect()
        const failures = []
        for (const node of el.querySelectorAll('h3, [id$="-action"], [class*="description"]')) {
          const r = node.getBoundingClientRect()
          if (r.left < outer.left - 1 || r.right > outer.right + 1 || r.top < outer.top - 1 || r.bottom > outer.bottom + 1 || node.scrollWidth > node.clientWidth + 1) failures.push(node.textContent)
        }
        const img = el.querySelector('img')
        return { failures, below: art.top >= copy.bottom - 1, src: img.currentSrc, loaded: img.naturalWidth > 0,
          id: el.dataset.promotion, font: getComputedStyle(el.querySelector('h3')).fontFamily,
          motion: getComputedStyle(el).transitionDuration }
      })
      assert.deepEqual(geometry.failures, [], `Overflow at ${width}: ${geometry.id}`)
      assert.ok(geometry.loaded)
      assert.ok(geometry.font.toLowerCase().includes('lora'))
      assert.equal(decodeURIComponent(geometry.src).includes('/mobile/'), width < 768)
      if (width < 768) assert.ok(geometry.below, `Art covers text at ${width}`)
      await banner.focus()
      assert.equal(await banner.evaluate(el => el.matches(':focus-visible') && getComputedStyle(el).outlineStyle !== 'none'), true)
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
    const dark = await page.locator('#featured-find .hf-eyebrow').evaluate(el => ({
      color: getComputedStyle(el).color, background: getComputedStyle(el.closest('section').firstElementChild).backgroundColor,
    }))
    const fg = dark.color.match(/[\d.]+/g).slice(0, 3).map(Number)
    const bg = dark.background.match(/[\d.]+/g).slice(0, 3).map(Number)
    const ratio = (Math.max(luminance(fg), luminance(bg)) + .05) / (Math.min(luminance(fg), luminance(bg)) + .05)
    assert.ok(ratio >= 4.5, `Dark eyebrow contrast ${ratio}`)
    if ([390, 1440].includes(width)) {
      await page.locator('[data-promotion-group="discovery"]').screenshot({ path: path.join(output, `campaigns-${width}.png`) })
      await page.locator('#featured-find').screenshot({ path: path.join(output, `featured-${width}.png`) })
    }
    assert.deepEqual(errors, [], 'Next hydration/client errors')
    checks.push({ name: `Home ${width}px`, result: 'pass', editorial: heroFont.computed, loadedFaces: heroFont.faces, darkEyebrowContrast: Number(ratio.toFixed(2)) })
    await context.close()
  }
  const context = await contextFor(1440)
  const page = await context.newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  const homePreloads = await page.locator('link[rel="preload"][as="font"]').evaluateAll(nodes => nodes.map(n => new URL(n.href).pathname))
  const editorialFamily = (await waitFont(page, 'main h1', 'lora')).computed.split(',')[0].replace(/["']/g, '').trim()
  const editorialUrls = await page.evaluate(family => {
    const out = []
    for (const sheet of document.styleSheets) for (const rule of (() => { try { return [...sheet.cssRules] } catch { return [] } })()) {
      if (rule.type === CSSRule.FONT_FACE_RULE && rule.style.fontFamily.replace(/["']/g, '').trim() === family) {
        const match = rule.style.getPropertyValue('src').match(/url\(["']?([^"')]+)["']?\)/)
        if (match) out.push(new URL(match[1], sheet.href || location.href).pathname)
      }
    }
    return out
  }, editorialFamily)
  assert.ok(editorialUrls.some(url => homePreloads.includes(url)), 'Home editorial font is not preloaded')
  await page.goto(`${base}/collections/under-20`, { waitUntil: 'networkidle' })
  await waitFont(page, 'main h1', 'lora')
  await page.screenshot({ path: path.join(output, 'collection-1440.png'), fullPage: false })
  checks.push({ name: 'Collection heading and Home font preload', result: 'pass' })
  await context.close()
  const checkoutContext = await contextFor(390)
  const checkout = await checkoutContext.newPage()
  await checkout.goto(`${base}/checkout`, { waitUntil: 'networkidle' })
  const checkoutPreloads = await checkout.locator('link[rel="preload"][as="font"]').evaluateAll(nodes => nodes.map(n => new URL(n.href).pathname))
  const checkoutFonts = await checkout.evaluate(() => performance.getEntriesByType('resource').filter(r => r.name.includes('.woff')).map(r => new URL(r.name).pathname))
  assert.ok(editorialUrls.every(url => !checkoutPreloads.includes(url) && !checkoutFonts.includes(url)), 'Checkout downloaded the editorial font')
  checks.push({ name: 'Checkout does not preload or download Lora', result: 'pass' })
  await checkoutContext.close()
} catch (error) {
  allFailures.push(error.stack || String(error))
} finally {
  await browser.close()
  const report = { checks, failures: allFailures, scope: 'Compiled Next.js app, self-hosted final fonts; read-only local product fixtures; Chromium, not a payment or physical-device test.' }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (allFailures.length) process.exitCode = 1
}
