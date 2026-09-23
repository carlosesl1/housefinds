const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
function moduleAt(file, imports = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  const result = ts.transpileModule(source, { fileName: file, reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } })
  assert.equal((result.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error).length, 0, `Syntax: ${file}`)
  const module = { exports: {} }
  vm.runInNewContext(result.outputText, { module, exports: module.exports, require: (id) => { if (!(id in imports)) throw Error(`Unexpected runtime dependency: ${id}`); return imports[id] }, console: { error() {}, warn() {}, log() {} }, process: { env: {} }, Buffer, URL, Response, setTimeout, clearTimeout }, { filename: file })
  return module.exports
}
const helpers = moduleAt('lib/storefront/checkout.ts')
const address = { ...helpers.EMPTY_ADDRESS, first_name: 'Checkout', last_name: 'Tester', email: 'checkout@example.com', address_1: '10 Test Street', city: 'London', postcode: 'SW1A 1AA' }
function cartFixture() {
  return {
    items: [{ key: 'fixture-key', id: 900001, quantity: 1, name: 'QA Kitchen Tool', totals: { line_total: '2000' }, variation: [], images: [] }],
    totals: { total_price: '2000', total_items: '2000', total_shipping: '0', total_fees: '0', total_discount: '0', total_tax: '0', currency_code: 'GBP', currency_minor_unit: 2, currency_symbol: '£' },
    billing_address: { ...address }, shipping_address: { ...address }, coupons: [], items_count: 1, needs_payment: true, needs_shipping: true, has_calculated_shipping: true,
    shipping_rates: [{ package_id: 0, name: 'Delivery', shipping_rates: [{ rate_id: 'free_shipping:1', selected: true, price: '0', name: 'Standard UK delivery', delivery_time: '', description: '' }] }],
  }
}
const checks = []
function test(name, run) { checks.push({ name, run }) }
test('Postcodes are normalised, not represented as a delivery lookup', () => { assert.equal(helpers.normalisePostcode('sw1a1aa'), 'SW1A 1AA'); assert.equal(helpers.validUKPostcode('GIR0AA'), true); assert.equal(helpers.validUKPostcode('12345'), false) })
test('Optional phone, county and apartment are not required', () => { assert.equal(Object.keys(helpers.validateAddress(address)).length, 0); assert.equal(Object.keys(helpers.validateAddress({ ...address, email: '' })).length, 1) })
test('Separate billing is restored rather than overwritten', () => { const c = cartFixture(); c.billing_address.address_1 = '22 Billing Lane'; const data = helpers.restoreCartAddresses(c); assert.equal(data.sameBilling, false); assert.equal(data.address.address_1, address.address_1); assert.equal(data.billing.address_1, '22 Billing Lane') })
test('Delivery requires a selection for every package', () => { const c = cartFixture(); assert.equal(helpers.deliveryIsReady(c), true); c.shipping_rates.push({ package_id: 1, shipping_rates: [{ selected: false, rate_id: 'other' }] }); assert.equal(helpers.deliveryIsReady(c), false); c.shipping_rates[1].shipping_rates[0].selected = true; assert.equal(helpers.deliveryIsReady(c), true); c.has_calculated_shipping = false; assert.equal(helpers.deliveryIsReady(c), false) })
test('Same-price item substitutions change the checkout revision', () => { const c = cartFixture(); const key = helpers.checkoutCartRevision(c); c.items[0].id += 1; assert.notEqual(helpers.checkoutCartRevision(c), key) })
test('Drafts are basket-scoped and expire after thirty minutes', () => { const raw = helpers.encodeCheckoutDraft({ address, billing: address, sameBilling: true }, '1', 100); assert.ok(helpers.decodeCheckoutDraft(raw, '1', 500)); assert.equal(helpers.decodeCheckoutDraft(raw, '2', 500), null); assert.equal(helpers.decodeCheckoutDraft(raw, '1', 100 + helpers.DRAFT_TTL_MS + 1), null); assert.equal(helpers.decodeCheckoutDraft('{oops', '1'), null) })
test('Draft encoding drops payment secrets and unknown values', () => { const raw = helpers.encodeCheckoutDraft({ address: { ...address, card_number: 'sensitive', client_secret: 'secret' }, billing: address, sameBilling: true }, '1'); assert.equal(raw.includes('sensitive'), false); assert.equal(raw.includes('client_secret'), false) })
test('Uncertain payment outcomes remain separate from known rejections', () => { assert.equal(helpers.paymentOutcomeIsUncertain(503, ''), true); assert.equal(helpers.paymentOutcomeIsUncertain(422, 'housefinds_checkout_failed'), false); assert.equal(helpers.paymentOutcomeIsUncertain(409, 'housefinds_total_changed'), false) })
test('Payment redirects cannot use script, HTTP or embedded credentials', () => { assert.equal(helpers.isSafePaymentRedirect('javascript:alert(1)', 'https://example.com'), false); assert.equal(helpers.isSafePaymentRedirect('http://example.com', 'https://example.com'), false); assert.equal(helpers.isSafePaymentRedirect('https://user:secret@example.com', 'https://example.com'), false); assert.equal(helpers.isSafePaymentRedirect('/order-confirmation', 'https://example.com'), true) })
let currentCart, upstreamCalls, upstreamStatus, upstreamText, upstreamThrows
const fakeResponse = (data, options = {}) => ({ status: options.status || 200, body: data, cookies: { entries: [], set(...entry) { this.entries.push(entry) } } })
const route = moduleAt('app/api/checkout/route.ts', {
  'next/headers': { cookies: async () => ({ get: () => ({ value: 'fixture-token' }) }) },
  'next/server': { NextResponse: { json: fakeResponse } },
  '@/lib/woocommerce/cart-token': { CART_COOKIE: 'hf_cart', getCartToken: () => '' },
  '@/lib/woocommerce/transport': { CommerceConnectionError: class extends Error {}, commerceFetch: async (_url, options) => {
    if (options.method === 'GET') return new Response(JSON.stringify(currentCart))
    upstreamCalls.push(JSON.parse(options.body))
    if (upstreamThrows) throw new Error('connection lost')
    return new Response(upstreamText, { status: upstreamStatus })
  } },
  '@/lib/storefront/checkout': helpers,
})
function resetRoute() { currentCart = cartFixture(); upstreamCalls = []; upstreamStatus = 200; upstreamThrows = false; upstreamText = JSON.stringify({ order_id: 123, order_key: 'private-order-key', order_number: '123', status: 'processing', payment_result: { payment_status: 'success' } }) }
function request(overrides = {}) { return { json: async () => ({ billing_address: address, shipping_address: address, payment_method: 'stripe', payment_data: [], expected_total: currentCart.totals.total_price, expected_revision: helpers.checkoutCartRevision(currentCart), ...overrides }) } }
test('Server refuses a missing or changed expected total without charging', async () => { resetRoute(); const r = await route.POST(request({ expected_total: undefined })); assert.equal(r.body.code, 'housefinds_total_changed'); assert.equal(upstreamCalls.length, 0) })
test('Server refuses changed contents at the same price without charging', async () => { resetRoute(); const r = await route.POST(request({ expected_revision: 'stale' })); assert.equal(r.body.code, 'housefinds_cart_changed'); assert.equal(upstreamCalls.length, 0) })
test('Server refuses a changed delivery address without charging', async () => { resetRoute(); const r = await route.POST(request({ shipping_address: { ...address, address_1: 'Another street' } })); assert.equal(r.body.code, 'housefinds_delivery_changed'); assert.equal(upstreamCalls.length, 0) })
test('Server keeps the £135 limit', async () => { resetRoute(); currentCart.totals.total_price = '13500'; const r = await route.POST(request()); assert.equal(r.body.code, 'housefinds_order_limit'); assert.equal(upstreamCalls.length, 0) })
test('Server sends distinct billing and shipping and no client hints to Woo', async () => { resetRoute(); const billing = { ...address, address_1: 'Billing street' }; currentCart.billing_address = billing; const r = await route.POST(request({ billing_address: billing })); assert.equal(r.status, 200); assert.equal(upstreamCalls.length, 1); assert.equal(upstreamCalls[0].billing_address.address_1, 'Billing street'); assert.equal(upstreamCalls[0].shipping_address.address_1, address.address_1); assert.equal('expected_total' in upstreamCalls[0], false); assert.equal('order_key' in r.body, false); assert.ok(r.cookies.entries.some((entry) => entry[0] === 'hf_last_order')) })
test('Zero-payment orders bypass Stripe payment data, using Woo totals', async () => { resetRoute(); currentCart.totals.total_price = '0'; currentCart.needs_payment = false; const r = await route.POST(request({ payment_method: undefined })); assert.equal(r.status, 200); assert.equal('payment_method' in upstreamCalls[0], false) })
test('Lost checkout responses never get automatically retried', async () => { resetRoute(); upstreamThrows = true; const r = await route.POST(request()); assert.equal(r.status, 503); assert.equal(r.body.code, 'housefinds_checkout_outcome_uncertain'); assert.equal(upstreamCalls.length, 1) })
test('Malformed success responses are treated as uncertain', async () => { resetRoute(); upstreamText = '<html>upstream error</html>'; const r = await route.POST(request()); assert.equal(r.body.code, 'housefinds_checkout_outcome_uncertain') })
test('Checkout files have valid TS/TSX syntax and expected interaction guards', () => {
  for (const file of ['app/checkout/page.tsx', 'components/checkout/checkout-fields.tsx', 'components/checkout/checkout-summary.tsx', 'components/checkout/stripe-card-form.tsx', 'store/cart.ts']) {
    const output = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { fileName: file, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }); assert.equal((output.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error).length, 0, file)
  }
  const card = fs.readFileSync(path.join(root, 'components/checkout/stripe-card-form.tsx'), 'utf8')
  assert.ok(card.includes('busyRef.current = true')); assert.ok(card.includes("card.on('ready'")); assert.ok(card.includes('sessionStorage.setItem(PAYMENT_PENDING_KEY'))
  const summary = fs.readFileSync(path.join(root, 'components/checkout/checkout-summary.tsx'), 'utf8')
  assert.ok(summary.includes('useId()')); assert.ok(summary.includes('total_fees'))
})
;(async () => { for (const { name, run } of checks) { await run(); console.log(`PASS ${name}`) }; console.log(`\n${checks.length} checkout checks passed. No live orders or payments.`) })().catch((e) => { console.error(e); process.exit(1) })
