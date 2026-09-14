import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CART_COOKIE, getCartToken } from '@/lib/woocommerce/cart-token'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const CART_URL = `${WC_URL}/wp-json/wc/store/v1/cart`
const CHECKOUT_URL = `${WC_URL}/wp-json/wc/store/v1/checkout`
const UK_LAUNCH_ORDER_LIMIT_GBP = 135
export const LAST_ORDER_COOKIE = 'hf_last_order'

type CheckoutAddress = { email?: string; country?: string; [key: string]: unknown }
type CheckoutRequestBody = {
  billing_address?: CheckoutAddress
  shipping_address?: CheckoutAddress
  expected_total?: unknown
  [key: string]: unknown
}

type CheckoutResponseBody = {
  order_id?: number
  order_number?: string
  order_key?: string
  status?: string
  [key: string]: unknown
}

type CartSnapshot = {
  totals?: {
    total_price?: string
    currency_code?: string
    currency_minor_unit?: number
  }
}

type LastOrderSession = {
  order_id: number
  order_key: string
  billing_email: string
  order_number?: string
  created_at: number
}

function encodeOrderSession(session: LastOrderSession) {
  return Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
}

async function bootstrapCartToken() {
  const response = await fetch(CART_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!response.ok) return ''
  return getCartToken(response.headers)
}

async function getServerCart(token: string) {
  const response = await fetch(CART_URL, {
    method: 'GET',
    headers: { Accept: 'application/json', 'Cart-Token': token },
    cache: 'no-store',
  })
  if (!response.ok) return null
  return response.json() as Promise<CartSnapshot>
}

function exceedsLaunchLimit(cart: CartSnapshot | null) {
  const totals = cart?.totals
  if (!totals?.total_price) return false
  if (totals.currency_code && totals.currency_code !== 'GBP') return true
  const minorUnit = Number.isFinite(totals.currency_minor_unit) ? Number(totals.currency_minor_unit) : 2
  const total = Number(totals.total_price) / Math.pow(10, minorUnit)
  return Number.isFinite(total) && total >= UK_LAUNCH_ORDER_LIMIT_GBP
}

function describeUpstreamError(text: string) {
  try {
    const parsed = JSON.parse(text) as { code?: unknown; message?: unknown; data?: { status?: unknown } }
    const summary = {
      code: typeof parsed.code === 'string' ? parsed.code : undefined,
      message: typeof parsed.message === 'string' ? parsed.message : undefined,
      status: parsed.data?.status,
    }
    return JSON.stringify(summary).slice(0, 800)
  } catch {
    return text.replace(/\s+/g, ' ').slice(0, 800)
  }
}

function checkoutFailure(status: number, text: string) {
  // Keep provider/plugin diagnostics in server logs only. Checkout responses are
  // public browser traffic and must not expose WooCommerce, gateway internals,
  // WordPress routes, stack traces or other operational details.
  const diagnostic = {
    status,
    detail: describeUpstreamError(text),
  }
  if (status >= 500 || status === 401 || status === 403 || status === 429) {
    console.error('[housefinds-checkout] upstream checkout failed', diagnostic)
  } else {
    console.warn('[housefinds-checkout] checkout rejected', diagnostic)
  }

  const responseStatus = status >= 500 || status === 401 || status === 403 || status === 429 ? 502 : 422
  return NextResponse.json(
    {
      code: 'housefinds_checkout_failed',
      message: 'We could not complete checkout. Check your delivery and payment details, then try again. If the problem continues, contact Housefinds support before retrying payment.',
    },
    { status: responseStatus, headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  let token = cookieStore.get(CART_COOKIE)?.value || ''
  if (!token) token = await bootstrapCartToken()

  if (!token) {
    return NextResponse.json(
      { code: 'housefinds_missing_cart', message: 'Your cart session could not be restored. Please refresh and try again.' },
      { status: 400 },
    )
  }

  const liveCart = await getServerCart(token)
  if (!liveCart) {
    return NextResponse.json(
      { code: 'housefinds_cart_unavailable', message: 'We could not verify your basket total. Refresh the checkout and try again.' },
      { status: 409 },
    )
  }

  if (exceedsLaunchLimit(liveCart)) {
    return NextResponse.json(
      { code: 'housefinds_order_limit', message: 'Housefinds launch orders must remain below £135. Reduce quantity or remove an item before paying.' },
      { status: 422 },
    )
  }

  let requestBody: CheckoutRequestBody
  try {
    requestBody = await req.json() as CheckoutRequestBody
  } catch {
    return NextResponse.json({ code: 'housefinds_invalid_checkout', message: 'Checkout details could not be read. Refresh and try again.' }, { status: 400 })
  }

  const billingCountry = String(requestBody.billing_address?.country || 'GB').toUpperCase()
  const shippingCountry = String(requestBody.shipping_address?.country || 'GB').toUpperCase()
  if (billingCountry !== 'GB' || shippingCountry !== 'GB') {
    return NextResponse.json(
      { code: 'housefinds_uk_only', message: 'Housefinds currently delivers to United Kingdom addresses only.' },
      { status: 422 },
    )
  }

  // `expected_total` is a client-side consistency hint only. WooCommerce must
  // receive only fields that belong to its Checkout Store API schema.
  delete requestBody.expected_total
  const upstreamBody = JSON.stringify(requestBody)

  const upstream = await fetch(CHECKOUT_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cart-Token': token,
    },
    body: upstreamBody,
    cache: 'no-store',
    redirect: 'manual',
  })

  const text = await upstream.text()
  const response = upstream.ok
    ? new NextResponse(text, {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('content-type') || 'application/json',
          'Cache-Control': 'no-store',
        },
      })
    : checkoutFailure(upstream.status, text)

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

  if (upstream.ok) {
    try {
      const checkout = JSON.parse(text) as CheckoutResponseBody
      const billingEmail = String(requestBody.billing_address?.email || '').trim().toLowerCase()
      if (checkout.order_id && checkout.order_key && billingEmail) {
        response.cookies.set(
          LAST_ORDER_COOKIE,
          encodeOrderSession({
            order_id: checkout.order_id,
            order_key: checkout.order_key,
            billing_email: billingEmail,
            order_number: checkout.order_number,
            created_at: Date.now(),
          }),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
          },
        )
      }
    } catch {}
  }

  return response
}
