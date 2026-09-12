import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CART_COOKIE, getCartToken } from '@/lib/woocommerce/cart-token'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const CART_URL = `${WC_URL}/wp-json/wc/store/v1/cart`

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
  const body = method === 'POST' ? await req.text() : undefined

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

  const text = await upstream.text()

  if (!upstream.ok) {
    console.error('[housefinds-cart] WooCommerce Store API error', {
      action: action || 'get-cart',
      status: upstream.status,
      body: text.slice(0, 1000),
      hadToken: Boolean(token),
    })
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

export async function GET(req: NextRequest) {
  return proxy(req, 'GET')
}

export async function POST(req: NextRequest) {
  return proxy(req, 'POST')
}
