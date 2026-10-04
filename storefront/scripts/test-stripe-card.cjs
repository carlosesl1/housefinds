const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
function load(file, imports, globals = {}) {
  const module = { exports: {} }
  const js = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  vm.runInNewContext(js, { module, exports: module.exports, require: (id) => { if (!(id in imports)) throw Error(id); return imports[id] }, URL, Response, AbortController, console, ...globals })
  return module.exports
}
const helpers = load('lib/storefront/checkout.ts', {})
const stripeResponse = load('lib/storefront/stripe-response.ts', {})
const address = { first_name: 'Test', last_name: 'Checkout', address_1: '1 Test Street', city: 'London', postcode: 'SW1A 1AA', country: 'GB', email: 'test@example.com' }
function harness(reply, initialStorage = new Map(), options = {}) {
  const state = [], refs = [], redirects = [], confirmations = [], posts = [], statusChecks = []
  let cursor = 0, refCursor = 0, response = reply
  const stripe = { createPaymentMethod: async () => ({ paymentMethod: { id: 'pm_fixture' } }), confirmCardPayment: async (secret) => { confirmations.push(secret); return options.confirmation || { paymentIntent: { status: 'succeeded' } } } }
  const referenceValues = [{}, { update() {} }, stripe, false]
  const storage = { getItem: (key) => initialStorage.get(key) || null, setItem: (key, value) => initialStorage.set(key, value), removeItem: (key) => initialStorage.delete(key) }
  const jsx = (type, props) => ({ type, props })
  const component = load('components/checkout/stripe-card-form.tsx', {
    'react': { useRef: () => { const i = refCursor++; return refs[i] || (refs[i] = { current: referenceValues[i] }) }, useState: (initial) => { const i = cursor++; if (!(i in state)) state[i] = i < 3 ? true : initial; return [state[i], (value) => { state[i] = value }] }, useEffect: (effect, deps) => { if (deps.length === 0) effect() } },
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/link': {}, '@heroicons/react/24/outline': {}, '@/lib/storefront/checkout': helpers, '@/lib/storefront/stripe-response': stripeResponse,
  }, {
    process: { env: { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_fixture' } },
    sessionStorage: storage,
    window: { location: { origin: 'https://store.example', assign: (url) => redirects.push(url) }, setTimeout: (callback, ms) => ms === 1500 ? (queueMicrotask(callback), 0) : setTimeout(callback, ms) }, clearTimeout,
    fetch: async (url, request) => { if (url === '/api/checkout/status') { statusChecks.push(JSON.parse(request.body)); return new Response(JSON.stringify(options.orderStatus || { order_id: 123, status: 'processing', paid: true })) }; posts.push(JSON.parse(request.body)); if (response instanceof Error) throw response; return new Response(JSON.stringify(response.body), { status: response.status || 200 }) },
  })
  function render() { cursor = 0; refCursor = 0; return component.StripeCardForm({ address, expectedTotal: '1190', disabled: false }) }
  function button(node) { if (!node || typeof node !== 'object') return null; if (node.type === 'button' && node.props.onClick && node.props.children?.[1] === 'Pay £11.90') return node; for (const child of [node.props?.children].flat(Infinity)) { const found = button(child); if (found) return found }; return null }
  return { state, posts, statusChecks, redirects, confirmations, storage: initialStorage, setReply: (value) => { response = value }, render, async pay() { const pay = button(render()); assert.ok(pay); assert.equal(pay.props.disabled, false); pay.props.onClick(); await new Promise(setImmediate); await new Promise(setImmediate) } }
}
const paid = { body: { order_id: 123, status: 'processing', payment_result: { payment_status: 'success' } } }
;(async () => {
  const decline = harness({ status: 422, body: { code: 'housefinds_checkout_failed', message: 'Card declined' } })
  await decline.pay()
  assert.equal(decline.state[4], false)
  assert.equal(decline.state[6], 'Card declined')
  assert.equal(decline.storage.has(helpers.PAYMENT_PENDING_KEY), false)
  assert.equal(decline.redirects.length, 0)
  // Retry in the same mounted component after a known decline.
  decline.setReply(paid)
  await decline.pay()
  assert.equal(decline.posts.length, 2)
  assert.equal(decline.redirects[0], '/order-confirmation')
  console.log('PASS known decline preserves retry; successful retry reaches receipt')
  const network = harness(new Error('Response lost after dispatch'))
  await network.pay()
  assert.equal(network.posts.length, 1)
  assert.equal(network.state[4], true)
  assert.equal(network.storage.has(helpers.PAYMENT_PENDING_KEY), true)
  const reloaded = harness(paid, network.storage)
  reloaded.render()
  assert.equal(reloaded.state[4], true)
  console.log('PASS lost response blocks a second payment and remains blocked after reload')
  const challengeReply = { body: { order_id: 123, status: 'pending', payment_result: { payment_status: 'success', payment_details: [], redirect_url: '#wc-stripe-confirm-pi:123:pi_fixture_secret_fixture:nonce' } } }
  const challenge = harness(challengeReply)
  await challenge.pay()
  assert.equal(challenge.confirmations.length, 1, 'Gateway 11 confirmation redirect must invoke Stripe authentication')
  assert.equal(challenge.redirects[0], '/order-confirmation')
  assert.equal(challenge.statusChecks.length, 1)
  assert.equal(challenge.statusChecks[0].confirm_payment, true)
  console.log('PASS gateway 11 confirmation redirect invokes 3DS')
  const hostedChallenge = harness({ body: { order_id: 123, status: 'pending', payment_result: { payment_status: 'success', redirect_url: 'https://hooks.stripe.com/3d_secure_2/hosted?payment_intent=pi_fixture&payment_intent_client_secret=pi_fixture_secret_fixture' } } })
  await hostedChallenge.pay()
  assert.equal(hostedChallenge.confirmations.length, 1)
  assert.equal(hostedChallenge.redirects[0], '/order-confirmation')
  console.log('PASS installed gateway hosted 3DS response invokes Stripe.js')
  const authenticationFailed = harness(challengeReply, new Map(), { confirmation: { error: { type: 'card_error', message: 'Authentication failed', payment_intent: { status: 'requires_payment_method' } } } })
  await authenticationFailed.pay()
  assert.equal(authenticationFailed.state[4], false)
  assert.equal(authenticationFailed.state[6], 'Authentication failed')
  assert.equal(authenticationFailed.storage.has(helpers.PAYMENT_PENDING_KEY), false)
  authenticationFailed.setReply(paid)
  await authenticationFailed.pay()
  assert.equal(authenticationFailed.redirects[0], '/order-confirmation')
  console.log('PASS failed authentication permits a new payment attempt')
  const verifiedFailure = harness(challengeReply, new Map(), { confirmation: { error: { type: 'invalid_request_error', message: 'Authentication failed' } }, orderStatus: { order_id: 123, status: 'failed', paid: false } })
  await verifiedFailure.pay()
  assert.equal(verifiedFailure.state[4], false, 'A server-verified failed authentication must allow recovery')
  assert.equal(verifiedFailure.storage.has(helpers.PAYMENT_PENDING_KEY), false)
  assert.equal(verifiedFailure.statusChecks[0].confirm_payment, undefined)
  console.log('PASS server-verified authentication failure clears the pending guard')
  const pending = harness(challengeReply, new Map(), { orderStatus: { order_id: 123, status: 'pending', paid: false } })
  await pending.pay()
  assert.equal(pending.statusChecks.length, 9)
  assert.equal(pending.statusChecks.filter((check) => check.confirm_payment === true).length, 1)
  assert.equal(pending.posts.length, 1)
  assert.equal(pending.redirects.length, 0)
  assert.equal(pending.state[4], true)
  assert.equal(pending.storage.has(helpers.PAYMENT_PENDING_KEY), true)
  console.log('PASS pending webhook never claims payment completion or repeats checkout')
})().catch((error) => { console.error(error); process.exitCode = 1 })

