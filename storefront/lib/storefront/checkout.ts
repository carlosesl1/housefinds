import type { CheckoutAddress } from '@/store/cart'
import type { WooCart } from '@/lib/woocommerce/types'

export const CHECKOUT_LIMIT_MINOR = 13_500
export const DELIVERY_ESTIMATE = 'Around 14 days'
export const CHECKOUT_DRAFT_KEY = 'hf_checkout_draft_v1'
export const PAYMENT_PENDING_KEY = 'hf_payment_pending_v1'
export const DRAFT_TTL_MS = 30 * 60 * 1000
export const EMPTY_ADDRESS: CheckoutAddress = {
  first_name: '', last_name: '', address_1: '', address_2: '', city: '',
  state: '', postcode: '', country: 'GB', email: '', phone: '',
}
export type AddressErrors = Partial<Record<keyof CheckoutAddress, string>>
export type CheckoutDraft = {
  address: CheckoutAddress
  billing: CheckoutAddress
  sameBilling: boolean
}
const addressKeys = ['first_name', 'last_name', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'email', 'phone'] as const

/** Formatting only; delivery eligibility is decided by WooCommerce, not this regex. */
export function normalisePostcode(value: string) {
  const code = value.toUpperCase().replace(/\s/g, '')
  return code.length > 3 ? `${code.slice(0, -3)} ${code.slice(-3)}` : code
}
export function validUKPostcode(value: string) {
  return /^(GIR 0AA|[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i.test(normalisePostcode(value.trim()))
}
export function normaliseAddress(input: Partial<CheckoutAddress>): CheckoutAddress {
  const result: CheckoutAddress = { ...EMPTY_ADDRESS }
  for (const key of addressKeys) result[key] = String(input[key] || '').trim().slice(0, 200)
  result.country = String(input.country || 'GB').trim().toUpperCase()
  result.postcode = normalisePostcode(result.postcode)
  result.email = result.email?.toLowerCase() || ''
  return result
}
export function validateAddress(address: CheckoutAddress, contact = true): AddressErrors {
  const errors: AddressErrors = {}
  if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email?.trim() || '')) errors.email = 'Enter a valid email address, for example you@example.com.'
  if (!address.first_name.trim()) errors.first_name = 'Enter your first name.'
  if (!address.last_name.trim()) errors.last_name = 'Enter your last name.'
  if (!address.address_1.trim()) errors.address_1 = 'Enter your house number or name and street.'
  if (!address.city.trim()) errors.city = 'Enter your town or city.'
  if (!validUKPostcode(address.postcode)) errors.postcode = 'Enter a UK postcode, for example SW1A 1AA.'
  if (address.country.toUpperCase() !== 'GB') errors.country = 'This checkout currently supports UK addresses.'
  return errors
}
export function addressFingerprint(address: CheckoutAddress) {
  const clean = normaliseAddress(address)
  return JSON.stringify(addressKeys.map((key) => String(clean[key] || '').toLowerCase()))
}
export function customerFingerprint(address: CheckoutAddress, billing: CheckoutAddress) {
  return `${addressFingerprint(address)}|${addressFingerprint(billing)}`
}
export function restoreCartAddresses(cart: WooCart): CheckoutDraft {
  const delivery = cart.shipping_address || {}
  const bill = cart.billing_address || {}
  const shippingSource = delivery.address_1 || delivery.postcode ? delivery : bill
  const address = normaliseAddress({ ...shippingSource, email: bill.email || '', phone: shippingSource.phone || bill.phone || '' })
  const billing = normaliseAddress({ ...bill, email: address.email, phone: address.phone })
  const sameBilling = !bill.address_1 || addressFingerprint(address) === addressFingerprint(billing)
  return { address, billing: sameBilling ? address : billing, sameBilling }
}
export function deliveryIsReady(cart: WooCart | null) {
  if (!cart) return false
  if (!cart.needs_shipping) return true
  return Boolean(cart.has_calculated_shipping && cart.shipping_rates.length && cart.shipping_rates.every((pkg) => pkg.shipping_rates.some((rate) => rate.selected)))
}
/** Non-personal basket revision used to reject stale totals/contents before charging. */
export function checkoutCartRevision(cart: Pick<WooCart, 'items' | 'totals' | 'shipping_rates'>) {
  return JSON.stringify({
    items: cart.items.map((item) => [item.key, item.id, item.quantity, item.totals.line_total]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
    total: cart.totals.total_price,
    currency: cart.totals.currency_code,
    minorUnit: cart.totals.currency_minor_unit,
    shipping: cart.shipping_rates.map((pkg) => [pkg.package_id, pkg.shipping_rates.filter((rate) => rate.selected).map((rate) => rate.rate_id).sort()]).sort((a, b) => Number(a[0]) - Number(b[0])),
  })
}
export function draftBasketKey(cart: WooCart) {
  return [...new Set(cart.items.map((item) => item.id))].sort((a, b) => a - b).join(',')
}
export function decodeCheckoutDraft(raw: string | null, basketKey: string, now = Date.now()): CheckoutDraft | null {
  if (!raw || raw.length > 12_000) return null
  try {
    const data = JSON.parse(raw)
    if (data.version !== 1 || data.basket !== basketKey || !Number.isFinite(data.savedAt) || now - data.savedAt > DRAFT_TTL_MS || data.savedAt > now || !data.address || !data.billing || typeof data.sameBilling !== 'boolean') return null
    return { address: normaliseAddress(data.address), billing: normaliseAddress(data.billing), sameBilling: data.sameBilling }
  } catch { return null }
}
export function encodeCheckoutDraft(draft: CheckoutDraft, basketKey: string, now = Date.now()) {
  // Explicit allowlist: never persist card details, payment secrets or arbitrary form values.
  return JSON.stringify({ version: 1, basket: basketKey, savedAt: now, address: normaliseAddress(draft.address), billing: normaliseAddress(draft.billing), sameBilling: draft.sameBilling })
}
export function isSafePaymentRedirect(value: string, origin: string) {
  try {
    const url = new URL(value, origin)
    return !url.username && !url.password && url.protocol === 'https:'
  } catch { return false }
}
export function paymentOutcomeIsUncertain(status: number, code: string) {
  return code === 'housefinds_checkout_outcome_uncertain' || status >= 500
}
