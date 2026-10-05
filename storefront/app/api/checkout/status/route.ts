import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CART_COOKIE } from '@/lib/woocommerce/cart-token'
import { getLastStoreOrder } from '@/lib/woocommerce/order-session'
import { commerceFetch } from '@/lib/woocommerce/transport'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')

export async function POST(req: NextRequest) {
  const headers = { 'Cache-Control': 'no-store, private' }
  let body: { order_id?: unknown; confirm_payment?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ message: 'Invalid order reference.' }, { status: 400, headers }) }
  try {
    let { session, order } = await getLastStoreOrder()
    if (!session || !order || body?.order_id !== session.order_id || order.id !== session.order_id) {
      return NextResponse.json({ message: 'This order could not be verified in your checkout session.' }, { status: 404, headers })
    }
    if (body.confirm_payment === true && ['pending', 'failed'].includes(order.status)) {
      const confirmation = await commerceFetch(`${WC_URL}/wp-json/housefinds/v1/confirm-stripe-order`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ order_id: session.order_id, order_key: session.order_key, email: session.billing_email }),
        cache: 'no-store', redirect: 'manual',
      })
      if (!confirmation.ok) throw new Error('Gateway confirmation unavailable')
      const refreshed = await getLastStoreOrder()
      if (!refreshed.order || refreshed.order.id !== session.order_id) throw new Error('Order confirmation unavailable')
      order = refreshed.order
    }
    const paid = ['processing', 'completed'].includes(order.status)
    const response = NextResponse.json({ order_id: order.id, status: order.status, paid }, { headers })
    const token = (await cookies()).get(CART_COOKIE)?.value
    // Retire only the cart that created this order. A later shopping session is untouched.
    if (paid && token && session.cart_token_hash === createHash('sha256').update(token).digest('hex')) {
      response.cookies.set(CART_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
    }
    return response
  } catch {
    return NextResponse.json({ message: 'Order confirmation is temporarily unavailable.' }, { status: 503, headers })
  }
}
