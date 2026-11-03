// Run against next start with WOOCOMMERCE_URL=http://127.0.0.1:4016.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { catalogue, emptyCart } from './catalog-fixtures.mjs'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3015'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw Error('Local QA only')
const output = 'output/playwright/catalog-qa'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, channel: process.env.QA_BROWSER_CHANNEL || 'chrome' })
const checks = []
let activePage

async function setup(width) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
  let failAdd = false
  const requests = [], errors = []
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== new URL(base).origin) return route.abort()
    if (url.pathname.startsWith('/api/checkout')) return route.abort()
    if (url.pathname === '/api/analytics') return route.fulfill({ status: 204, body: '' })
    if (url.pathname === '/api/cart') {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON()
        requests.push(body)
        if (failAdd) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Please try adding this item again.' }) })
        const product = catalogue.find(item => item.id === body.id)
        assert.ok(product, 'Only local fixture products can be added')
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ...emptyCart, items_count: 1, items: [{ ...product, key: 'catalog-qa-item', quantity: 1, variation: [], totals: { line_total: product.prices.price, currency_minor_unit: 2, currency_symbol: '£' } }], totals: { ...emptyCart.totals, total_items: product.prices.price, total_price: product.prices.price } }) })
      }
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(emptyCart) })
    }
    return route.continue()
  })
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  activePage = page
  return { context, page, errors, requests, failAdd() { failAdd = true } }
}

async function layout(page, width) {
  const report = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, clipped: [...document.querySelectorAll('main h1, main h2, main h3')].filter(el => el.getClientRects().length && el.scrollWidth > el.clientWidth + 1).map(el => el.textContent) }))
  assert.ok(report.scroll <= report.width + 1, `Overflow at ${width}: ${JSON.stringify(report)}`)
  assert.deepEqual(report.clipped, [], `Clipped headings at ${width}`)
}

try {
  for (const width of [320, 390, 768, 1440]) {
    const s = await setup(width), { page } = s
    assert.equal((await page.goto(`${base}/shop`)).status(), 200)
    await page.getByRole('heading', { name: 'Explore all finds' }).waitFor()
    assert.equal(await page.locator('.hf-product-card').count(), 6)
    await layout(page, width)
    for (const img of await page.locator('main img').all()) {
      await img.scrollIntoViewIfNeeded()
      await img.evaluate(el => el.decode())
    }
    await page.evaluate(() => scrollTo(0, 0))
    await page.screenshot({ path: `${output}/shop-${width}.png`, fullPage: true })
    const filters = page.getByRole('complementary', { name: 'Filter products' }).locator('details')
    assert.equal(await filters.evaluate(el => el.open), width > 800)
    await filters.locator('summary').focus()
    assert.ok(await filters.locator('summary').evaluate(el => el.matches(':focus-visible') && getComputedStyle(el).outlineStyle !== 'none'))
    if (width <= 800) await filters.locator('summary').press('Enter')
    assert.ok(await page.getByRole('navigation', { name: 'Filter by price' }).isVisible())
    checks.push(`${width}px: images, no overflow, keyboard focus, responsive filters`)

    if ([390, 1440].includes(width)) {
      await page.getByRole('navigation', { name: 'Filter by category' }).getByRole('link', { name: /Kitchen Tools/ }).click()
      await page.waitForURL(/category=kitchen-tools/)
      await page.getByRole('heading', { name: 'A little less effort. A lot more kitchen.' }).waitFor()
      await page.waitForFunction(() => document.title.includes('Kitchen Tools'))
      assert.equal(await page.locator('.hf-product-card').count(), 2)
      const currentFilters = page.getByRole('complementary', { name: 'Filter products' }).locator('details')
      if (!await currentFilters.evaluate(el => el.open)) await currentFilters.locator('summary').click()
      await page.getByRole('navigation', { name: 'Filter by price' }).getByRole('link', { name: /Under £10/ }).click()
      await page.waitForURL(/price=under-10/)
      await page.locator('summary').filter({ hasText: 'Sort:' }).click()
      await page.getByRole('navigation', { name: 'Sort products' }).getByRole('link', { name: 'Price: high to low' }).click()
      await page.waitForURL(/sort=price-high/)
      assert.ok(page.url().includes('category=kitchen-tools') && page.url().includes('price=under-10'))
      await page.getByRole('searchbox', { name: 'Search this collection' }).fill('zzzznotafind')
      await page.getByRole('search', { name: 'Search this collection' }).getByRole('button', { name: 'Search', exact: true }).click()
      await page.getByRole('heading', { name: 'No finds for this combination yet.' }).waitFor()
      await page.waitForFunction(() => [...document.querySelectorAll('meta[name="robots"]')].some(meta => meta.content.includes('noindex')))
      assert.ok(page.url().includes('category=kitchen-tools') && page.url().includes('sort=price-high'))
      await page.getByRole('link', { name: 'Remove filter: Search: zzzznotafind', exact: true }).click()
      await page.getByRole('heading', { name: 'Kitchen Tools', exact: true }).waitFor()
      assert.equal(await page.locator('.hf-product-card').count(), 2)
      await page.reload()
      assert.equal(await page.getByRole('link', { name: 'Remove filter: Under £10', exact: true }).count(), 1)
      checks.push(`${width}px: category, range, sort, scoped search, empty-state recovery and reload`)

      await page.goto(`${base}/shop`)
      const finder = page.locator('details').filter({ has: page.getByText('Not sure where to start?', { exact: true }) })
      await finder.locator('summary').click()
      await page.getByRole('radio', { name: 'Make cooking easier', exact: true }).check()
      await page.getByRole('radio', { name: 'Under £10', exact: true }).check()
      await page.getByRole('link', { name: 'Show my finds', exact: true }).click()
      await page.waitForURL(/category=kitchen-tools.*price=under-10/)
      await page.getByRole('heading', { name: 'Kitchen Tools', exact: true }).waitFor()
      assert.equal(await page.locator('.hf-product-card').count(), 2)
      checks.push(`${width}px: two-choice finder reaches the matching category and budget`)

      await page.goto(`${base}/shop?stock=in-stock`)
      assert.equal(await page.locator('.hf-product-card').count(), 5)
      const variable = page.locator('.hf-product-card').filter({ has: page.getByRole('heading', { name: 'Stainless Steel Cutting Board' }) })
      assert.equal(await variable.getByRole('button', { name: 'Add to cart' }).count(), 0)
      assert.ok((await variable.getByRole('link', { name: /Choose options for/ }).getAttribute('href')).startsWith('/product/'))
      const simple = page.locator('.hf-product-card').filter({ has: page.getByRole('heading', { name: 'Oil Spray Bottle' }) })
      const add = simple.getByRole('button', { name: 'Add to cart', exact: true })
      await add.click()
      const cart = page.getByRole('dialog', { name: /Your cart/ })
      await cart.getByRole('heading', { name: 'Oil Spray Bottle' }).waitFor()
      assert.deepEqual(s.requests[0], { id: 92001, quantity: 1 })
      await page.keyboard.press('Escape')
      await cart.waitFor({ state: 'hidden' })
      await page.waitForFunction(() => document.activeElement?.textContent === 'Add to cart')
      s.failAdd()
      await add.click()
      await cart.getByText('We could not update your cart.', { exact: true }).waitFor()
      await cart.getByText('Please try adding this item again.', { exact: true }).waitFor()
      await page.keyboard.press('Escape')
      checks.push(`${width}px: availability, option safety, quick add, cart error, Escape and focus return`)

      await page.goto(`${base}/shop?q=returns`)
      await page.waitForURL(/\/search\?q=returns/)
      assert.ok(await page.locator('main a[href="/returns"]').count() > 0)
      checks.push(`${width}px: support queries reach customer care`)
    }
    assert.deepEqual(s.errors, [], 'Browser/hydration errors')
    await s.context.close()
  }
  console.log(JSON.stringify({ checks, scope: 'Compiled local app, read-only Woo fixtures, mocked cart. No real orders or payments.' }, null, 2))
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ checks }, null, 2))
} catch (error) {
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({ path: `${output}/failure.png`, fullPage: true })
    console.error(await activePage.evaluate(() => ({ url: location.href, title: document.title, titles: [...document.querySelectorAll('title')].map(el => el.textContent), headings: [...document.querySelectorAll('main h1, main h2')].map(el => el.textContent) })))
  }
  console.error(error)
  process.exitCode = 1
} finally { await browser.close() }
