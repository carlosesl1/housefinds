import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CART_COOKIE, getCartToken } from '@/lib/woocommerce/cart-token'
import { CommerceConnectionError, commerceFetch } from '@/lib/woocommerce/transport'
import type { WooCart } from '@/lib/woocommerce/types'
import type { CheckoutAddress } from '@/store/cart'
import { CHECKOUT_LIMIT_MINOR, checkoutCartRevision, customerFingerprint, deliveryIsReady, normaliseAddress, restoreCartAddresses, validateAddress } from '@/lib/storefront/checkout'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const CART_URL = `${WC_URL}/wp-json/wc/store/v1/cart`
const CHECKOUT_URL = `${WC_URL}/wp-json/wc/store/v1/checkout`
export const LAST_ORDER_COOKIE = 'hf_last_order'

type RequestBody = {
  billing_address?: CheckoutAddress; shipping_address?: CheckoutAddress;
  expected_total?: unknown; expected_revision?: unknown; payment_method?: string;
  payment_data?: unknown; [key: string]: unknown;
}
type ResponseBody = {
  order_id?: number; order_number?: string; order_key?: string; status?: string;
  payment_result?: unknown; [key: string]: unknown;
}
function failure(code: string, message: string, status = 422) {
  return NextResponse.json({ code, message }, { status, headers: { 'Cache-Control': 'no-store' } })
}
async function getServerCart(token: string) {
  try {
    const response = await commerceFetch(CART_URL, { method: 'GET', headers: { Accept: 'application/json', 'Cart-Token': token }, cache: 'no-store' })
    if (!response.ok) return null
    return await response.json() as WooCart
  } catch { return null }
}
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(CART_COOKIE)?.value || ''
  if (!token) return failure('housefinds_missing_cart', 'Your basket session could not be restored. Refresh your basket before checking out.', 400)
  let body: RequestBody
  try { body = await req.json() as RequestBody } catch { return failure('housefinds_invalid_checkout', 'Checkout details could not be read. Please refresh and try again.', 400) }
  if (!body || typeof body !== 'object' || !body.billing_address || !body.shipping_address) return failure('housefinds_invalid_checkout', 'Complete your contact and address details before paying.')
  const liveCart = await getServerCart(token)
  if (!liveCart?.totals || !liveCart.items?.length) return failure('housefinds_cart_unavailable', 'We could not verify your basket. Refresh the checkout before continuing.', 409)
  const total = liveCart.totals.total_price
  if (liveCart.totals.currency_code !== 'GBP' || liveCart.totals.currency_minor_unit !== 2 || !/^\d+$/.test(total)) return failure('housefinds_invalid_total', 'We could not verify the order currency and total. Contact Housefinds before paying.')
  if (Number(total) >= CHECKOUT_LIMIT_MINOR) return failure('housefinds_order_limit', 'Housefinds launch orders must remain below £135. Reduce quantity or remove an item before paying.')
  if (typeof body.expected_total !== 'string' || body.expected_total !== total) return failure('housefinds_total_changed', 'Your basket total changed. Review the updated total and confirm again.', 409)
  if (body.expected_revision !== undefined && body.expected_revision !== checkoutCartRevision(liveCart)) return failure('housefinds_cart_changed', 'Your basket contents or delivery changed. Review your order and confirm again.', 409)
  const bill = normaliseAddress(body.billing_address)
  const delivery = normaliseAddress({ ...body.shipping_address, email: bill.email, phone: bill.phone })
  if (Object.keys(validateAddress(bill)).length || Object.keys(validateAddress(delivery)).length) return failure('housefinds_invalid_address', 'Check the contact, delivery and billing address details before continuing.')
  if (!deliveryIsReady(liveCart)) return failure('housefinds_delivery_changed', 'Confirm an available delivery method for every package before paying.', 409)
  const restored = restoreCartAddresses(liveCart)
  if (customerFingerprint(delivery, bill) !== customerFingerprint(restored.address, restored.sameBilling ? restored.address : restored.billing)) return failure('housefinds_delivery_changed', 'Your address details changed. Confirm the updated details before paying.', 409)
  if (liveCart.needs_payment && body.payment_method !== 'stripe') return failure('housefinds_invalid_payment', 'Select the available card payment method before paying.')
  // Only forward supported checkout fields. Client consistency hints are not WooCommerce fields.
  const { email: _email, ...shippingAddress } = delivery
  const upstreamBody = { billing_address: bill, shipping_address: shippingAddress, ...(liveCart.needs_payment ? { payment_method: 'stripe', payment_data: body.payment_data } : {}) }
  let upstream: Response
  let text: string
  try {
    upstream = await commerceFetch(CHECKOUT_URL, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Cart-Token': token }, body: JSON.stringify(upstreamBody), cache: 'no-store', redirect: 'manual' })
    text = await upstream.text()
  } catch (error) {
    // A connection loss after dispatch (including while reading the body) is not a known decline.
    const uncertain = !(error instanceof CommerceConnectionError) || error.uncertain
    console.error('[housefinds-checkout] connection failure', { uncertain })
    return failure(uncertain ? 'housefinds_checkout_outcome_uncertain' : 'housefinds_checkout_unavailable', uncertain ? 'We could not confirm the payment result. Check your order or contact Housefinds before trying to pay again.' : 'Checkout is temporarily unavailable. No result was confirmed.', 503)
  }
  if (!upstream.ok) {
    let code = ''
    try { code = String(JSON.parse(text).code || '').slice(0, 100) } catch {}
    console.warn('[housefinds-checkout] upstream rejected checkout', { status: upstream.status, code })
    const uncertain = upstream.status >= 500 || upstream.status < 400
    return failure(uncertain ? 'housefinds_checkout_outcome_uncertain' : 'housefinds_checkout_failed', uncertain ? 'The payment result could not be confirmed. Check your order before trying again.' : 'We could not complete checkout. Check your delivery and card details, or contact Housefinds.', uncertain ? 503 : 422)
  }
  let checkout: ResponseBody
  try { checkout = JSON.parse(text) as ResponseBody } catch { return failure('housefinds_checkout_outcome_uncertain', 'The final payment result could not be read. Check your order before trying again.', 503) }
  const response = NextResponse.json({ order_id: checkout.order_id, order_number: checkout.order_number, status: checkout.status, payment_result: checkout.payment_result }, { status: upstream.status, headers: { 'Cache-Control': 'no-store' } })
  response.cookies.set(CART_COOKIE, getCartToken(upstream.headers) || token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  if (checkout.order_id && checkout.order_key && bill.email) {
    const session = { order_id: checkout.order_id, order_key: checkout.order_key, billing_email: bill.email, order_number: checkout.order_number, created_at: Date.now() }
    response.cookies.set(LAST_ORDER_COOKIE, Buffer.from(JSON.stringify(session), 'utf8').toString('base64url'), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  }
  return response
}
