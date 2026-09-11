import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CART_COOKIE, getCartToken } from '@/lib/woocommerce/cart-token'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const CART_URL = `${WC_URL}/wp-json/wc/store/v1/cart`

async function proxy(req: NextRequest, method: 'GET' | 'POST') {
  const cookieStore = await cookies()
  const token = cookieStore.get(CART_COOKIE)?.value
  const path = req.nextUrl.searchParams.get('action') || ''
  const url = path ? `${CART_URL}/${path}` : CART_URL
  const body = method === 'POST' ? await req.text() : undefined

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
  const response = new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' },
  })

  const fresh = getCartToken(upstream.headers)
  if (fresh) {
    response.cookies.set(CART_COOKIE, fresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  }

  return response
}

export async function GET(req: NextRequest) { return proxy(req, 'GET') }
export async function POST(req: NextRequest) { return proxy(req, 'POST') }
