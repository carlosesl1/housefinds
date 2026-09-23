import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const origin = process.env.CHECKOUT_QA_URL || 'http://127.0.0.1:3000'
if (new URL(origin).hostname !== '127.0.0.1' && new URL(origin).hostname !== 'localhost') throw Error('Checkout browser tests are restricted to local test servers.')
await fs.mkdir('checkout-qa', { recursive: true })
const fakeStripe = `window.Stripe = () => ({
  elements: () => ({ create: () => {
    const handlers = {}; let node;
    return { on(name, cb) { handlers[name] = cb }, mount(target) {
      target.innerHTML = '<label style="display:block;font-size:16px">Card details<input aria-label="Card details" style="display:block;width:100%;height:28px;font-size:16px" placeholder="Card number / expiry / CVC" /></label>';
      node = target.querySelector('input'); node.addEventListener('input', () => handlers.change?.({complete: node.value === 'fixture-complete'}));
      setTimeout(() => handlers.ready?.(), 20);
    }, update(opts) { if (node) node.disabled = opts.disabled }, focus() { node?.focus() }, unmount() { node?.parentElement?.remove() } }
  } }),
  createPaymentMethod: async (data) => { window.__billingDetails = data.billing_details; return {paymentMethod:{id:'pm_fixture_only'}} },
  confirmCardPayment: async () => ({paymentIntent:{status:'succeeded'}})
});`
const browser = await chromium.launch({ headless: true })
const results = []
function fixture() {
  return { items: [{ key: 'qa-item', id: 900001, quantity: 1, name: 'QA Kitchen Tool', short_description: '', variation: [{attribute:'Colour',value:'White'}], images: [], prices: {price:'2000',currency_minor_unit:2,currency_symbol:'£'}, totals: { line_total:'2000',line_subtotal:'2000',currency_minor_unit:2,currency_symbol:'£',currency_code:'GBP' } }], items_count:1,
    totals: { total_price:'2000', total_items:'2000', total_items_tax:'0', total_fees:'0', total_fees_tax:'0', total_discount:'0', total_discount_tax:'0', total_shipping:'0',total_shipping_tax:'0',total_tax:'0',currency_minor_unit:2,currency_symbol:'£',currency_code:'GBP' },
    billing_address:{country:'GB'},shipping_address:{country:'GB'},coupons:[],needs_payment:true,needs_shipping:true,has_calculated_shipping:false,shipping_rates:[] }
}
async function setup(width = 390) {
  const context = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 1000 }, reducedMotion: 'reduce' })
  let cart = fixture(), outcome = 'success', paymentCalls = 0, paymentBody = null, failCart = false, scriptFailures = 0
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.href === 'https://js.stripe.com/v3/') {
      if (scriptFailures > 0) { scriptFailures--; return route.abort('failed') }
      return route.fulfill({contentType:'application/javascript',body:fakeStripe})
    }
    // Nothing in this suite can reach WordPress, Stripe or a real payment endpoint.
    if (url.origin !== origin) return route.abort('blockedbyclient')
    if (url.pathname === '/api/analytics') return route.fulfill({status:204,body:''})
    if (url.pathname === '/api/cart') {
      if (failCart) return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Fixture connection failure'})})
      const action = url.searchParams.get('action')
      const body = route.request().postDataJSON()
      if (action === 'update-customer') { cart.billing_address = body.billing_address; cart.shipping_address = body.shipping_address; cart.has_calculated_shipping = true; cart.shipping_rates = [{package_id:0,name:'Delivery',shipping_rates:[{rate_id:'free:1',selected:true,name:'Standard UK delivery',description:'',delivery_time:'Around 14 days',price:'0'}]}] }
      if (action === 'apply-coupon') {
        if (body.code !== 'QA10') return route.fulfill({status:422,contentType:'application/json',body:JSON.stringify({message:'That discount code is not valid.'})})
        cart.coupons = [{code:'QA10',discount_type:'fixed_cart',totals:{total_discount:'200'}}]; cart.totals.total_discount = '200'; cart.totals.total_price = '1800'
      }
      return route.fulfill({contentType:'application/json',body:JSON.stringify(cart)})
    }
    if (url.pathname === '/api/checkout') {
      paymentCalls++; paymentBody = route.request().postDataJSON()
      await new Promise((resolve) => setTimeout(resolve, 200))
      if (outcome === 'uncertain') return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({code:'housefinds_checkout_outcome_uncertain',message:'Fixture uncertain result'})})
      if (outcome === 'decline') return route.fulfill({status:422,contentType:'application/json',body:JSON.stringify({code:'housefinds_checkout_failed',message:'Your card was declined. Try a different card.'})})
      return route.fulfill({contentType:'application/json',body:JSON.stringify({order_id:900001,status:'processing',payment_result:{payment_status:'success'}})})
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({status:404,contentType:'application/json',body:'{}'})
    return route.continue()
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  return { page, context, errors, setOutcome(v) { outcome=v }, setFailCart(v) {failCart=v}, failStripeOnce() {scriptFailures=1}, get calls(){return paymentCalls}, get body(){return paymentBody} }
}
async function fillDetails(page) {
  await page.getByRole('heading',{name:'1. Contact & address'}).waitFor()
  await page.locator('#delivery-email').fill('checkout@example.com')
  await page.locator('#delivery-first-name').fill('Checkout')
  await page.locator('#delivery-last-name').fill('Tester')
  await page.locator('#delivery-address-1').fill('10 Test Street')
  await page.locator('#delivery-city').fill('London')
  await page.locator('#delivery-postcode').fill('sw1a1aa')
}
async function continuePayment(page) {
  await page.getByRole('button',{name:'Continue to delivery',exact:true}).click()
  await page.getByRole('button',{name:'Continue to payment',exact:true}).click()
  await page.getByLabel('Card details',{exact:true}).fill('fixture-complete')
}
async function checkLayout(page) {
  const size = await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,inputs:[...document.querySelectorAll('input:not([type=radio]):not([type=checkbox])')].filter((e)=>e.getBoundingClientRect().height>0).map((e)=>Number.parseFloat(getComputedStyle(e).fontSize)),ids:[...document.querySelectorAll('[id]')].map((e)=>e.id)}))
  assert.ok(size.scroll <= size.width + 1, `Horizontal overflow: ${JSON.stringify(size)}`)
  assert.ok(size.inputs.every((font) => font >= 16), 'Input fonts must be 16px or larger')
  assert.equal(new Set(size.ids).size, size.ids.length, 'IDs must be unique')
}
async function test(name, fn) { try { await fn(); results.push({name,passed:true}); console.log('PASS',name) } catch(error) { results.push({name,passed:false,error:String(error)}); throw error } }
try {
  await test('Mobile: guest form, optional fields, error focus and same-tab recovery', async () => {
    const s=await setup(); await s.page.goto(`${origin}/checkout`); await fillDetails(s.page); await checkLayout(s.page)
    assert.equal(await s.page.locator('#delivery-phone').isVisible(), false)
    await s.page.locator('#delivery-email').fill('not-an-email'); await s.page.getByRole('button',{name:'Continue to delivery',exact:true}).click()
    await s.page.waitForFunction(()=>document.activeElement?.id==='delivery-email')
    await s.page.locator('#delivery-email').fill('checkout@example.com'); await s.page.waitForTimeout(450); await s.page.reload()
    await s.page.locator('#delivery-email').waitFor(); assert.equal(await s.page.locator('#delivery-email').inputValue(),'checkout@example.com')
    await s.page.screenshot({path:'checkout-qa/mobile-details.png',fullPage:true}); assert.deepEqual(s.errors,[]); await s.context.close()
  })
  await test('Mobile: billing is independent; payment has an exact total and double-click guard', async () => {
    const s=await setup(); await s.page.goto(`${origin}/checkout`); await fillDetails(s.page)
    await s.page.getByLabel('Billing address is the same as delivery').uncheck(); await s.page.locator('#billing-address-1').fill('22 Billing Lane')
    await continuePayment(s.page); await checkLayout(s.page); await s.page.screenshot({path:'checkout-qa/mobile-payment.png',fullPage:true})
    await s.page.getByRole('button',{name:'Pay £20.00',exact:true}).evaluate((el)=>{el.click();el.click()})
    await s.page.waitForURL('**/order-confirmation'); assert.equal(s.calls,1); assert.equal(s.body.shipping_address.address_1,'10 Test Street'); assert.equal(s.body.billing_address.address_1,'22 Billing Lane'); assert.ok(s.body.expected_revision); assert.deepEqual(s.errors,[]); await s.context.close()
  })
  await test('Desktop: one order summary, inline coupon errors and total re-confirmation', async () => {
    const s=await setup(1440); await s.page.goto(`${origin}/checkout`); await fillDetails(s.page); await continuePayment(s.page)
    await s.page.getByText('Have a discount code?',{exact:true}).click(); await s.page.getByLabel('Discount code',{exact:true}).fill('WRONG'); await s.page.getByRole('button',{name:'Apply',exact:true}).click(); await s.page.getByText('That discount code is not valid.',{exact:true}).waitFor()
    await s.page.getByLabel('Discount code',{exact:true}).fill('QA10'); await s.page.getByRole('button',{name:'Apply',exact:true}).click(); await s.page.getByRole('button',{name:'Confirm updated total'}).waitFor(); assert.equal(await s.page.getByRole('button',{name:'Pay £18.00',exact:true}).isDisabled(),true)
    await s.page.getByRole('button',{name:'Confirm updated total'}).click(); assert.equal(await s.page.getByRole('button',{name:'Pay £18.00',exact:true}).isEnabled(),true)
    await checkLayout(s.page); await s.page.screenshot({path:'checkout-qa/desktop-payment.png',fullPage:true}); assert.deepEqual(s.errors,[]); await s.context.close()
  })
  await test('Known card decline is recoverable without losing entered details', async () => {
    const s=await setup(); s.setOutcome('decline'); await s.page.goto(`${origin}/checkout`); await fillDetails(s.page); await continuePayment(s.page)
    await s.page.getByRole('button',{name:'Pay £20.00',exact:true}).click(); await s.page.getByText('Your card was declined. Try a different card.',{exact:true}).waitFor(); assert.equal(await s.page.getByRole('button',{name:'Pay £20.00',exact:true}).isEnabled(),true); assert.equal(s.calls,1); await s.context.close()
  })
  await test('Uncertain payment is blocked across reload; no second checkout POST', async () => {
    const s=await setup(); s.setOutcome('uncertain'); await s.page.goto(`${origin}/checkout`); await fillDetails(s.page); await continuePayment(s.page)
    await s.page.getByRole('button',{name:'Pay £20.00',exact:true}).click(); await s.page.getByRole('heading',{name:'Please check your payment before trying again.'}).waitFor(); await s.page.reload(); await s.page.getByRole('heading',{name:'Please check your payment before trying again.'}).waitFor(); assert.equal(s.calls,1); assert.equal(await s.page.getByRole('button',{name:'Pay £20.00',exact:true}).count(),0); await s.context.close()
  })
  await test('Stripe loader can recover after a failed script request', async () => {
    const s=await setup(); s.failStripeOnce(); await s.page.goto(`${origin}/checkout`); await fillDetails(s.page); await s.page.getByRole('button',{name:'Continue to delivery',exact:true}).click(); await s.page.getByRole('button',{name:'Continue to payment',exact:true}).click(); await s.page.getByRole('button',{name:'Reload secure card fields'}).click(); await s.page.getByLabel('Card details',{exact:true}).fill('fixture-complete'); assert.equal(await s.page.getByRole('button',{name:'Pay £20.00',exact:true}).isEnabled(),true); await s.context.close()
  })
  await test('Initial cart failure is not presented as an empty basket', async () => {
    const s=await setup(); s.setFailCart(true); await s.page.goto(`${origin}/checkout`); await s.page.getByRole('heading',{name:'Let’s reconnect your basket.'}).waitFor(); assert.equal(await s.page.getByRole('heading',{name:'Your basket is empty.'}).count(),0); s.setFailCart(false); await s.page.getByRole('button',{name:'Try again',exact:true}).click(); await s.page.getByRole('heading',{name:'Checkout',exact:true}).waitFor(); await s.context.close()
  })
} finally { await fs.writeFile('checkout-qa/results.json',JSON.stringify({results,liveCommerceRequests:0},null,2)); await browser.close() }
