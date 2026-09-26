// Test only the compiled local app. All basket/address/Stripe data is simulated.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const origin = process.env.QA_BASE_URL || 'http://127.0.0.1:3000'
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw Error('CTA tests require a local fixture server.')
const output = 'output/playwright/button-qa'
await fs.mkdir(output, { recursive: true })
const white = 'rgb(255, 255, 255)'
const greens = ['rgb(53, 95, 74)', 'rgb(41, 75, 58)']
const results = [], failures = []
const browser = await chromium.launch({ headless: true })
function basket(empty = false) {
  const currency = { currency_code: 'GBP', currency_symbol: '£', currency_minor_unit: 2 }
  return {
    items: empty ? [] : [{ key: 'colour-qa', id: 91001, quantity: 1, name: 'Oil Spray Bottle', variation: [], images: [],
      prices: { price: '1190', ...currency }, totals: { line_total: '1190', line_subtotal: '1190', ...currency } }],
    items_count: empty ? 0 : 1, coupons: [], billing_address: { country: 'GB' }, shipping_address: { country: 'GB' },
    totals: { total_price: empty ? '0' : '1190', total_items: empty ? '0' : '1190', total_items_tax: '0', total_discount: '0', total_discount_tax: '0', total_shipping: '0', total_shipping_tax: '0', total_fees: '0', total_fees_tax: '0', total_tax: '0', ...currency },
    needs_payment: !empty, needs_shipping: !empty, has_calculated_shipping: false, shipping_rates: [],
  }
}
const stripeStub = `window.Stripe = () => ({ elements: () => ({ create: () => {
  const handlers = {}; let input;
  return { on(n, cb) { handlers[n] = cb }, mount(target) {
    target.innerHTML = '<input aria-label="Fixture card details" placeholder="Simulated card field — no payment" />';
    input = target.querySelector('input'); input.addEventListener('input', () => handlers.change?.({complete:true}));
    setTimeout(() => handlers.ready?.(), 20);
  }, update(o) { if (input) input.disabled = o.disabled }, focus() { input?.focus() }, unmount() { input?.remove() } }
} }), createPaymentMethod: async () => { throw Error('Payments are prohibited in colour tests') } });`
async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}
async function checkWhite(page, locator, label) {
  await locator.scrollIntoViewIfNeeded()
  const isControl = await locator.evaluate(el => el.matches('a, button') && !el.matches(':disabled, [aria-disabled="true"]'))
  for (const state of isControl ? ['normal', 'hover', 'focus'] : ['normal']) {
    if (state === 'normal') await page.mouse.move(0, 0)
    if (state === 'hover') await locator.hover()
    if (state === 'focus') { await page.keyboard.press('Tab'); await locator.focus() }
    await settle(page)
    const actual = await locator.evaluate(el => ({
      foreground: getComputedStyle(el).color,
      background: getComputedStyle(el).backgroundColor,
      icons: [...el.querySelectorAll('svg')].map(svg => ({ color: getComputedStyle(svg).color, stroke: getComputedStyle(svg).stroke })),
    }))
    assert.equal(actual.foreground, white, `${label}/${state}: ${JSON.stringify(actual)}`)
    for (const icon of actual.icons) {
      assert.equal(icon.color, white, `${label}/${state}: icon must inherit white`)
      if (icon.stroke !== 'none') assert.equal(icon.stroke, white, `${label}/${state}: outline icon must be white`)
    }
  }
  results.push({ name: label, passed: true })
}
async function scan(page, label, requireCTA = true) {
  const count = await page.locator('a, button, [id$="-action"]').evaluateAll((nodes, palette) => {
    let n = 0
    for (const node of nodes) {
      const box = node.getBoundingClientRect(), style = getComputedStyle(node)
      // A keyboard-only skip link has geometry but is clipped and non-interactive
      // until focused. It is covered separately, not hovered while hidden.
      if (box.width > 0 && box.height > 0 && style.opacity !== '0' && style.visibility !== 'hidden' && style.pointerEvents !== 'none' && palette.includes(style.backgroundColor)) node.setAttribute('data-colour-test', String(n++))
    }
    return n
  }, greens)
  if (requireCTA) assert.ok(count > 0, `${label}: expected a rendered green CTA`)
  for (let i = 0; i < count; i++) {
    const locator = page.locator(`[data-colour-test="${i}"]`)
    await checkWhite(page, locator, `${label}: ${(await locator.textContent()).trim().replace(/\s+/g, ' ')}`)
  }
}
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 1000 }, reducedMotion: 'reduce' })
    let cart = basket(), paymentRequests = 0
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url())
      if (url.href === 'https://js.stripe.com/v3/') return route.fulfill({ contentType: 'application/javascript', body: stripeStub })
      if (url.origin !== origin) return route.abort('blockedbyclient')
      if (url.pathname === '/api/checkout') { paymentRequests++; return route.abort('blockedbyclient') }
      if (url.pathname === '/api/analytics') return route.fulfill({ status: 204, body: '' })
      if (url.pathname === '/api/cart') {
        if (request.method() !== 'GET') {
          if (url.searchParams.get('action') !== 'update-customer') return route.abort('blockedbyclient')
          const data = request.postDataJSON()
          cart.billing_address = data.billing_address; cart.shipping_address = data.shipping_address
          cart.has_calculated_shipping = true
          cart.shipping_rates = [{ package_id: 0, shipping_rates: [{ rate_id: 'free:1', name: 'Standard UK delivery', selected: true, price: '0', delivery_time: 'Around 14 days', description: '' }] }]
        }
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify(cart) })
      }
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
      return route.continue()
    })
    const page = await context.newPage()
    await page.goto(origin, { waitUntil: 'networkidle' })
    const skip = page.getByRole('link', { name: 'Skip to content', exact: true })
    await page.keyboard.press('Tab'); await skip.focus()
    assert.equal(await skip.evaluate(el => getComputedStyle(el).color), white)
    await skip.evaluate(el => el.blur())
    await scan(page, `Home ${width}`)
    // Light and inverted controls must NOT become white-on-white.
    for (const selector of ['.hf-button-secondary', '.hf-button-tertiary']) {
      const button = page.locator(selector).first()
      if (await button.count()) assert.notEqual(await button.evaluate(el => getComputedStyle(el).color), white, `Light control ${selector}`)
    }
    await page.getByRole('button', { name: 'Open cart', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: /Your cart/ })
    const checkout = drawer.getByRole('link', { name: 'Continue to checkout', exact: true })
    await checkWhite(page, checkout, `Cart drawer ${width}`)
    // Reproduce the original failure: an unlayered reset beats text-white.
    const regression = await page.addStyleTag({ content: 'a { color: inherit; }' })
    await settle(page)
    await page.waitForFunction(() => {
      const link = document.querySelector('[role="dialog"] a[href="/checkout"]')
      return link && getComputedStyle(link).color !== 'rgb(255, 255, 255)'
    })
    assert.notEqual(await checkout.evaluate(el => getComputedStyle(el).color), white, 'Regression probe must reproduce dark text')
    await regression.evaluate(el => el.remove()); await settle(page)
    await checkWhite(page, checkout, `Cart drawer restored ${width}`)
    assert.notEqual(await drawer.getByRole('link', { name: 'View full cart', exact: true }).evaluate(el => getComputedStyle(el).color), white)
    await drawer.locator('aside').screenshot({ path: `${output}/cart-drawer-${width}.png` })
    await page.keyboard.press('Escape')
    for (const route of ['/shop', '/product/oil-spray-bottle', '/cart']) {
      await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' })
      // The catalogue now uses open product links, without an unrelated filled CTA.
      await scan(page, `${route} ${width}`, route !== '/shop')
    }
    await page.goto(`${origin}/checkout`, { waitUntil: 'networkidle' })
    const fields = { email: 'colour-test@example.com', 'first-name': 'Visual', 'last-name': 'Test', 'address-1': '10 Test Street', city: 'London', postcode: 'SW1A 1AA' }
    for (const [name, value] of Object.entries(fields)) await page.locator(`#delivery-${name}`).fill(value)
    await checkWhite(page, page.getByRole('button', { name: 'Continue to delivery', exact: true }), `Checkout details ${width}`)
    await page.getByRole('button', { name: 'Continue to delivery', exact: true }).click()
    await checkWhite(page, page.getByRole('button', { name: 'Continue to payment', exact: true }), `Checkout delivery ${width}`)
    await page.getByRole('button', { name: 'Continue to payment', exact: true }).click()
    const pay = page.getByRole('button', { name: 'Pay £11.90', exact: true })
    await checkWhite(page, pay, `Checkout payment disabled ${width}`)
    await page.getByLabel('Fixture card details').fill('fixture-complete')
    await checkWhite(page, pay, `Checkout payment enabled ${width}`)
    // Never click Pay. Check empty-basket recovery without touching the backend.
    cart = basket(true)
    await page.goto(`${origin}/cart`, { waitUntil: 'networkidle' })
    await scan(page, `Empty cart ${width}`)
    await page.getByRole('button', { name: 'Open cart', exact: true }).click()
    await checkWhite(page, page.getByRole('dialog').getByRole('link', { name: 'Browse products', exact: true }), `Empty drawer ${width}`)
    assert.equal(paymentRequests, 0, 'Colour QA must never submit checkout')
    await context.close()
  }
} catch (error) {
  failures.push(error.stack || String(error))
} finally {
  await browser.close()
  const report = { checks: results, failures, scope: 'Compiled app with simulated cart/address/card fields at 390 and 1440px; no orders, real payments, or physical-device tests.' }
  await fs.writeFile(`${output}/results.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (failures.length) process.exitCode = 1
}
