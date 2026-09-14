import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CART_COOKIE, getCartToken } from '@/lib/woocommerce/cart-token'
import { displayProductName } from '@/lib/woocommerce/presentation'
import { isOperationalAttributeName } from '@/lib/storefront/catalog'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const STORE_API = `${WC_URL}/wp-json/wc/store/v1`
const CART_URL = `${STORE_API}/cart`

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
  variation?: Array<{ attribute: string; value: string }>
  [key: string]: unknown
}

function normalize(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

async function getStoreProduct(id: number): Promise<StoreProduct | null> {
  const response = await fetch(`${STORE_API}/products/${id}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  })
  if (!response.ok) return null
  return response.json() as Promise<StoreProduct>
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
    if (!id) return rawBody

    const resolvedVariation = await resolveVariationPayload(id)
    if (!resolvedVariation?.length) return rawBody

    // The browser only needs the variation ID. Complete every WooCommerce
    // attribute here so operational options (warehouse / Ships From) never need
    // to be serialized into the customer-facing React tree.
    return JSON.stringify({ ...body, variation: resolvedVariation })
  } catch {
    return rawBody
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

      // Keep the browser payload intentionally small. In particular, do not
      // pass Woo/DSers SKUs, raw descriptions, item_data, extensions, product
      // permalinks or any other fulfilment/integration metadata to the client.
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

    return JSON.stringify({
      items,
      coupons,
      totals: cart.totals,
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

async function createCartToken() {
  const initial = await fetch(CART_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!initial.ok) {
    const body = await initial.text()
    console.error('[housefinds-cart] failed to initialize WooCommerce cart', initial.status, body.slice(0, 600))
    return ''
  }

  return getCartToken(initial.headers)
}

async function proxy(req: NextRequest, method: 'GET' | 'POST') {
  const cookieStore = await cookies()
  let token = cookieStore.get(CART_COOKIE)?.value || ''
  const action = req.nextUrl.searchParams.get('action') || ''
  const url = action ? `${CART_URL}/${action}` : CART_URL
  const rawBody = method === 'POST' ? await req.text() : undefined
  const body = method === 'POST' && rawBody !== undefined ? await preparePostBody(action, rawBody) : undefined

  // Store API write routes need a Cart-Token (or nonce). When a shopper clicks
  // Add to cart before the initial cart GET has finished, bootstrap a token here
  // so the first write is still reliable.
  if (method === 'POST' && !token) {
    token = await createCartToken()
  }

  const upstream = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Cart-Token': token } : {}),
    },
    body,
    cache: 'no-store',
  })

  const upstreamText = await upstream.text()

  if (!upstream.ok) {
    console.error('[housefinds-cart] WooCommerce Store API error', {
      action: action || 'get-cart',
      status: upstream.status,
      body: upstreamText.slice(0, 1000),
      hadToken: Boolean(token),
    })
  }

  const text = upstream.ok ? sanitizeCartResponse(upstreamText) : upstreamText
  const response = new NextResponse(text, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-store',
    },
  })

  const fresh = getCartToken(upstream.headers) || token
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
