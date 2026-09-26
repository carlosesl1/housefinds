// Run in CI against the compiled app and the read-only editorial fixture server.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000'
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw Error('Visual QA requires a local fixture server.')
const output = path.resolve('output/playwright/editorial-qa')
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const checks = [], failures = []
const emptyCart = { items: [], coupons: [], totals: { total_price: '0', total_items: '0', total_shipping: '0', currency_code: 'GBP', currency_symbol: '£', currency_minor_unit: 2 }, needs_payment: false, needs_shipping: false, has_calculated_shipping: false, shipping_rates: [], items_count: 0 }
let activePage, activeWidth

async function contextFor(width) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin !== new URL(base).origin || url.pathname.startsWith('/api/checkout')) return route.abort()
    if (url.pathname === '/api/cart') return route.fulfill({ contentType: 'application/json', body: JSON.stringify(emptyCart) })
    if (url.pathname === '/api/analytics') return route.fulfill({ status: 204, body: '' })
    return route.continue()
  })
  return context
}

async function waitFont(page, selector, fragment) {
  const report = await page.locator(selector).first().evaluate(async el => {
    const style = getComputedStyle(el)
    const family = style.fontFamily.split(',')[0].trim()
    await document.fonts.load(`${style.fontStyle} ${style.fontWeight} 48px ${family}`, 'Housefinds £20')
    await document.fonts.ready
    const clean = value => value.replace(/["']/g, '').trim()
    const loaded = [...document.fonts].some(face => clean(face.family) === clean(family) && face.status === 'loaded')
    return { computed: style.fontFamily, loaded }
  })
  assert.ok(report.computed.toLowerCase().includes(fragment), JSON.stringify(report))
  assert.ok(report.loaded, `Fallback-only font: ${JSON.stringify(report)}`)
  return report
}

async function decodeImages(locator) {
  for (const img of await locator.locator('img:visible').all()) {
    await img.scrollIntoViewIfNeeded()
    await img.evaluate(image => image.decode())
    assert.ok(await img.evaluate(image => image.naturalWidth > 0))
  }
}

try {
  for (const width of [320, 390, 768, 900, 901, 1100, 1101, 1440, 1920]) {
    activeWidth = width
    const context = await contextFor(width)
    const page = await context.newPage()
    activePage = page
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    assert.equal((await page.goto(base, { waitUntil: 'networkidle' })).status(), 200)
    await waitFont(page, '#home-title', 'inter')
    await waitFont(page, '[aria-labelledby="home-title"] p', 'lora')
    await waitFont(page, '#featured-find-title', 'inter')
    await waitFont(page, '#featured-find [class*="price"]', 'inter')

    for (const selector of ['[aria-labelledby="home-title"]', '[aria-label="Shop by category"]', '#everyday-finds', '#featured-find', '[aria-labelledby="budget-title"]', '[aria-labelledby="storage-banner-title"]']) {
      const region = page.locator(selector)
      assert.equal(await region.count(), 1, `Missing discovery section ${selector}`)
      await decodeImages(region)
      const clipped = await region.evaluate(el => [...el.querySelectorAll('h1, h2, h3')].filter(node => {
        if (!node.getClientRects().length) return false
        const r = node.getBoundingClientRect()
        return node.scrollWidth > node.clientWidth + 1 || r.width > innerWidth
      }).map(node => node.textContent))
      assert.deepEqual(clipped, [], `Clipped heading at ${width}: ${selector}`)
    }

    const storage = page.locator('[aria-labelledby="storage-banner-title"]')
    const geometry = await storage.evaluate(section => {
      const title = section.querySelector('h2').getBoundingClientRect()
      const action = section.querySelector('a').getBoundingClientRect()
      const image = section.querySelector('img').getBoundingClientRect()
      const outer = section.getBoundingClientRect()
      const inside = rect => rect.left >= outer.left - 1 && rect.right <= outer.right + 1 && rect.top >= outer.top - 1 && rect.bottom <= outer.bottom + 1
      return { inside: inside(title) && inside(action), separate: image.top >= action.bottom - 1 || image.left >= title.right - 1, actionHeight: action.height }
    })
    assert.ok(geometry.inside && geometry.separate, `Storage banner overlaps its copy at ${width}`)
    assert.ok(geometry.actionHeight >= 44)
    const storageLink = storage.getByRole('link', { name: 'Explore space saving' })
    assert.equal(await storageLink.getAttribute('href'), '/shop?category=space-saving')
    await page.keyboard.press('Tab')
    await storageLink.focus()
    assert.ok(await storageLink.evaluate(el => el.matches(':focus-visible') && getComputedStyle(el).outlineStyle !== 'none'))

    const tabs = page.getByRole('tab')
    await tabs.first().focus()
    await page.keyboard.press('End')
    assert.equal(await tabs.last().getAttribute('aria-selected'), 'true')
    assert.ok(await tabs.last().evaluate(el => el === document.activeElement))
    assert.equal(await page.getByRole('tabpanel').count(), 1)
    await page.keyboard.press('Home')
    assert.equal(await tabs.first().getAttribute('aria-selected'), 'true')
    assert.ok(await page.getByRole('tabpanel').locator('a[href^="/product/"]').count() > 0)
    const viewport = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }))
    assert.ok(viewport.scroll <= viewport.viewport + 1, `Document overflow at ${width}: ${JSON.stringify(viewport)}`)
    assert.deepEqual(errors, [], 'Hydration/client errors')
    if ([390, 1440].includes(width)) {
      await page.locator('[aria-labelledby="home-title"]').screenshot({ path: path.join(output, `hero-${width}.png`) })
      await storage.screenshot({ path: path.join(output, `storage-${width}.png`) })
    }
    checks.push({ name: `Home ${width}px: images, fonts, headings, category tabs, banner and keyboard focus`, result: 'pass' })
    await context.close()
  }

  const context = await contextFor(1440)
  const page = await context.newPage()
  activePage = page
  activeWidth = 1440
  await page.goto(`${base}/collections/under-20`, { waitUntil: 'networkidle' })
  await waitFont(page, 'main h1', 'lora')
  assert.ok(await page.locator('main a[href^="/product/"]').count() > 0)
  checks.push({ name: 'Under £20 collection remains browsable with Lora heading', result: 'pass' })
  await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' })
  await waitFont(page, 'body', 'inter')
  assert.equal(await page.locator('.hf-site-header, .hf-footer').count(), 0)
  checks.push({ name: 'Checkout remains enclosed and uses Inter', result: 'pass' })
  await context.close()
} catch (error) {
  failures.push(error.stack || String(error))
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: path.join(output, `failure-${activeWidth}.png`) })
} finally {
  await browser.close()
  const report = { checks, failures, scope: 'Compiled app and local catalogue fixtures in Chromium; external browser requests and checkout submissions blocked. No orders or real payments.' }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (failures.length) process.exitCode = 1
}
