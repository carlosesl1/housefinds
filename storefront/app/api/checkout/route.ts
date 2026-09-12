import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CART_COOKIE, getCartToken } from '@/lib/woocommerce/cart-token'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const CART_URL = `${WC_URL}/wp-json/wc/store/v1/cart`
const CHECKOUT_URL = `${WC_URL}/wp-json/wc/store/v1/checkout`

async function bootstrapCartToken() {
  const response = await fetch(CART_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) return ''
  return getCartToken(response.headers)
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

  const body = await req.text()
  const upstream = await fetch(CHECKOUT_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cart-Token': token,
    },
    body,
    cache: 'no-store',
    redirect: 'manual',
  })

  const text = await upstream.text()

  if (!upstream.ok) {
    // Never log payment_data / Stripe PaymentMethod IDs. Status and a short
    // WooCommerce response are enough for operational debugging.
    let safeMessage = `WooCommerce checkout failed (${upstream.status})`
    try {
      const parsed = JSON.parse(text) as { code?: string; message?: string }
      safeMessage = `${parsed.code || 'checkout_error'}: ${parsed.message || safeMessage}`
    } catch {}
    console.error('[housefinds-checkout]', safeMessage.slice(0, 500))
  }

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
