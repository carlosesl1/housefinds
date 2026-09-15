import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CART_COOKIE, getCartToken } from '@/lib/woocommerce/cart-token'
import { CommerceConnectionError, commerceFetch } from '@/lib/woocommerce/transport'
import { displayProductName } from '@/lib/woocommerce/presentation'
import { isOperationalAttributeName } from '@/lib/storefront/catalog'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const STORE_API = `${WC_URL}/wp-json/wc/store/v1`
const CART_URL = `${STORE_API}/cart`
const ALLOWED_CART_ACTIONS = new Set([
  'add-item',
  'remove-item',
  'update-item',
  'update-customer',
  'select-shipping-rate',
  'apply-coupon',
  'remove-coupon',
])

type StoreTerm = { name: string; slug: string }
type StoreAttribute = { name: string; taxonomy?: string | null; terms?: StoreTerm[] }
type StoreVariationSummary = { id: number; attributes?: Array<{ name: string; value: string | null }> }
type StoreProduct = {
  id: number
  parent?: number
  attributes?: StoreAttribute[]
  variations?: StoreVariationSummary[]
}

type AddItemBody = {
  id?: number
  quantity?: number
}

function normalize(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

function describeUpstreamError(text: string) {
  try {
    const parsed = JSON.parse(text) as { code?: unknown; message?: unknown; data?: { status?: unknown } }
    return {
      code: typeof parsed.code === 'string' ? parsed.code : undefined,
      message: typeof parsed.message === 'string' ? parsed.message : undefined,
      status: parsed.data?.status,
    }
  } catch {
    return { message: text.replace(/\s+/g, ' ').slice(0, 300) }
  }
}

async function getStoreProduct(id: number): Promise<StoreProduct | null> {
  try {
    const response = await commerceFetch(`${STORE_API}/products/${id}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    })
    if (!response.ok) return null
    return response.json() as Promise<StoreProduct>
  } catch {
    return null
  }
}

async function resolveVariationPayload(variationId: number) {
  const variation = await getStoreProduct(variationId)
  const parentId = Number(variation?.parent || 0)
  if (!parentId) return null

  const parent = await getStoreProduct(parentId)
  const summary = parent?.variations?.find((candidate) => candidate.id === variationId)
  if (!parent || !summary?.attributes?.length) return null

  return summary.attributes.flatMap((selected) => {
    if (!selected.value) return []
    const attribute = parent.attributes?.find((candidate) => normalize(candidate.name) === normalize(selected.name))
    const term = attribute?.terms?.find((candidate) =>
      [candidate.name, candidate.slug].map(normalize).includes(normalize(selected.value)),
    )

    return [{
      attribute: attribute?.taxonomy || attribute?.name || selected.name,
      value: attribute?.taxonomy ? (term?.slug || selected.value) : (term?.name || selected.value),
    }]
  })
}

async function preparePostBody(action: string, rawBody: string) {
  if (action !== 'add-item') return rawBody

  try {
    const body = JSON.parse(rawBody) as AddItemBody
    const id = Number(body.id || 0)
    const quantity = Math.max(1, Math.min(99, Math.trunc(Number(body.quantity || 1))))
    if (!Number.isInteger(id) || id <= 0) return JSON.stringify({ id: 0, quantity })

    const resolvedVariation = await resolveVariationPayload(id)

    // The browser only supplies the product/variation ID and quantity. Rebuild
    // attributes here so operational options never cross the public boundary,
    // and drop every caller-supplied field that the cart does not need.
    return JSON.stringify({
      id,
      quantity,
      ...(resolvedVariation?.length ? { variation: resolvedVariation } : {}),
    })
  } catch {
    return JSON.stringify({ id: 0, quantity: 1 })
  }
}

function sanitizeCartResponse(text: string) {
  try {
    const cart = JSON.parse(text) as Record<string, unknown> & { items?: Array<Record<string, unknown>> }
    if (!Array.isArray(cart.items)) return text

    const items = cart.items.map((item) => {
      const variation = Array.isArray(item.variation)
        ? (item.variation as Array<{ attribute?: string; value?: string }>)
            .filter((entry) => !isOperationalAttributeName(String(entry.attribute || '')))
            .map((entry) => ({
              attribute: String(entry.attribute || ''),
              value: String(entry.value || ''),
            }))
        : []

      return {
        key: item.key,
        id: item.id,
        quantity: item.quantity,
        name: typeof item.name === 'string' ? displayProductName(item.name) : item.name,
        short_description: '',
        prices: item.prices,
        totals: item.totals,
        images: item.images,
        variation,
      }
    })

    const coupons = Array.isArray(cart.coupons)
      ? (cart.coupons as Array<Record<string, unknown>>).map((coupon) => ({
          code: coupon.code,
          discount_type: coupon.discount_type,
          totals: coupon.totals,
        }))
      : []

    const shippingRates = Array.isArray(cart.shipping_rates)
      ? (cart.shipping_rates as Array<Record<string, unknown>>).map((shippingPackage) => ({
          package_id: shippingPackage.package_id,
          name: shippingPackage.name,
          destination: shippingPackage.destination,
          shipping_rates: Array.isArray(shippingPackage.shipping_rates)
            ? (shippingPackage.shipping_rates as Array<Record<string, unknown>>).map((rate) => ({
                rate_id: rate.rate_id,
                name: rate.name,
                description: rate.description,
                delivery_time: rate.delivery_time,
                price: rate.price,
                selected: rate.selected,
              }))
            : [],
        }))
      : []

    const safeAddress = (value: unknown) => {
      if (!value || typeof value !== 'object') return undefined
      const address = value as Record<string, unknown>
      return {
        first_name: String(address.first_name || ''),
        last_name: String(address.last_name || ''),
        company: String(address.company || ''),
        address_1: String(address.address_1 || ''),
        address_2: String(address.address_2 || ''),
        city: String(address.city || ''),
        state: String(address.state || ''),
        postcode: String(address.postcode || ''),
        country: String(address.country || ''),
        email: String(address.email || ''),
        phone: String(address.phone || ''),
      }
    }

    return JSON.stringify({
      items,
      coupons,
      totals: cart.totals,
      billing_address: safeAddress(cart.billing_address),
      shipping_address: safeAddress(cart.shipping_address),
      needs_payment: cart.needs_payment,
      needs_shipping: cart.needs_shipping,
      has_calculated_shipping: cart.has_calculated_shipping,
      shipping_rates: shippingRates,
      items_count: cart.items_count,
    })
  } catch {
    return text
  }
}

function cartErrorPayload(action: string, upstreamStatus: number) {
  const message = action === 'add-item'
    ? 'We could not add that option to your cart. Check its availability and try again.'
    : action === 'remove-item'
      ? 'We could not remove that item from your cart. Refresh and try again.'
      : action === 'update-item'
        ? 'We could not update that cart item. Refresh and try again.'
        : action === 'update-customer'
          ? 'We could not confirm those delivery details. Check the address and postcode, then try again.'
          : action === 'select-shipping-rate'
            ? 'We could not confirm that delivery option. Refresh the checkout and try again.'
            : action === 'apply-coupon' || action === 'remove-coupon'
              ? 'We could not update that discount code. Check it and try again.'
              : 'We could not load your cart. Refresh the page and try again.'

  return {
    status: upstreamStatus >= 500 || upstreamStatus === 401 || upstreamStatus === 403 || upstreamStatus === 429 ? 502 : 422,
    body: JSON.stringify({ code: 'housefinds_cart_error', message }),
  }
}

async function createCartToken() {
  try {
    const initial = await commerceFetch(CART_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!initial.ok) {
      const body = await initial.text()
      console.error('[housefinds-cart] cart initialization failed', {
        status: initial.status,
        detail: describeUpstreamError(body),
      })
      return ''
    }

    return getCartToken(initial.headers)
  } catch {
    return ''
  }
}

async function refreshCart(token: string) {
  return commerceFetch(CART_URL, {
    method: 'GET',
    headers: { Accept: 'application/json', 'Cart-Token': token },
    cache: 'no-store',
  })
}

async function proxy(req: NextRequest, method: 'GET' | 'POST') {
  const cookieStore = await cookies()
  let token = cookieStore.get(CART_COOKIE)?.value || ''
  const action = req.nextUrl.searchParams.get('action') || ''

  if (action && !ALLOWED_CART_ACTIONS.has(action)) {
    return NextResponse.json(
      { code: 'housefinds_invalid_cart_action', message: 'That cart action is not available.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    )
  }
  if (method === 'GET' && action) {
    return NextResponse.json(
      { code: 'housefinds_invalid_cart_action', message: 'That cart action is not available.' },
      { status: 405, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const url = action ? `${CART_URL}/${action}` : CART_URL
  const rawBody = method === 'POST' ? await req.text() : undefined
  const body = method === 'POST' && rawBody !== undefined ? await preparePostBody(action, rawBody) : undefined

  if (method === 'POST' && !token) {
    token = await createCartToken()
    if (!token) {
      return NextResponse.json(
        { code: 'housefinds_cart_unavailable', message: 'We could not start a secure cart session. Refresh the page and try again.' },
        { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '2' } },
      )
    }
  }

  let upstream: Response
  try {
    upstream = await commerceFetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Cart-Token': token } : {}),
      },
      body,
      cache: 'no-store',
    })
  } catch (error) {
    const uncertain = error instanceof CommerceConnectionError && error.uncertain
    return NextResponse.json(
      {
        code: uncertain ? 'housefinds_cart_outcome_uncertain' : 'housefinds_cart_unavailable',
        message: uncertain
          ? 'We could not confirm that cart change. Refreshing the cart before trying again avoids duplicate changes.'
          : 'The shop is taking longer than usual to respond. Please refresh and try again.',
        refresh_cart: true,
      },
      { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '2' } },
    )
  }

  const upstreamText = await upstream.text()
  let text: string
  let status: number
  let tokenHeaders = upstream.headers

  if (upstream.ok) {
    text = sanitizeCartResponse(upstreamText)
    status = upstream.status
  } else if (upstream.status === 409 && token && (action === 'remove-item' || action === 'update-item')) {
    // A stale browser can ask to mutate an item that WooCommerce already
    // removed. Treat that as a sync event: fetch the authoritative cart and
    // return it instead of trapping the customer behind a recoverable error.
    console.warn('[housefinds-cart] stale cart item; refreshing cart', {
      action,
      detail: describeUpstreamError(upstreamText),
    })
    let refreshed: Response
    try {
      refreshed = await refreshCart(token)
    } catch {
      return NextResponse.json(
        { code: 'housefinds_cart_unavailable', message: 'Your cart changed in another session and could not be refreshed. Reload the page before trying again.' },
        { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '2' } },
      )
    }
    const refreshedText = await refreshed.text()
    if (refreshed.ok) {
      text = sanitizeCartResponse(refreshedText)
      status = 200
      tokenHeaders = refreshed.headers
    } else {
      console.error('[housefinds-cart] cart refresh failed', {
        status: refreshed.status,
        detail: describeUpstreamError(refreshedText),
      })
      const safeError = cartErrorPayload(action, refreshed.status)
      text = safeError.body
      status = safeError.status
      tokenHeaders = refreshed.headers
    }
  } else {
    const diagnostic = {
      action: action || 'get-cart',
      status: upstream.status,
      detail: describeUpstreamError(upstreamText),
      hadToken: Boolean(token),
    }
    if (upstream.status >= 500 || upstream.status === 401 || upstream.status === 403 || upstream.status === 429) {
      console.error('[housefinds-cart] upstream cart request failed', diagnostic)
    } else {
      console.warn('[housefinds-cart] cart request rejected', diagnostic)
    }
    const safeError = cartErrorPayload(action, upstream.status)
    text = safeError.body
    status = safeError.status
  }

  const response = new NextResponse(text, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })

  const fresh = getCartToken(tokenHeaders) || token
  if (fresh) {
    response.cookies.set(CART_COOKIE, fresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  return response
}

export async function GET(req: NextRequest) {
  return proxy(req, 'GET')
}

export async function POST(req: NextRequest) {
  return proxy(req, 'POST')
}
