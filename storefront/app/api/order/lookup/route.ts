import { NextRequest, NextResponse } from 'next/server'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const LOOKUP_URL = `${WC_URL}/wp-json/housefinds/v1/order-status`

export async function POST(req: NextRequest) {
  let body: { order_number?: string; email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Enter your order number and email address.' }, { status: 400 })
  }

  const orderNumber = String(body.order_number || '').trim()
  const email = String(body.email || '').trim().toLowerCase()

  if (!orderNumber || !email || !email.includes('@')) {
    return NextResponse.json({ message: 'Enter your order number and the email used at checkout.' }, { status: 400 })
  }

  const upstream = await fetch(LOOKUP_URL, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_number: orderNumber, email }),
    cache: 'no-store',
  })

  const text = await upstream.text()

  if (upstream.status === 404 && text.includes('rest_no_route')) {
    return NextResponse.json(
      { message: 'Order lookup is being connected. Please use the same browser used at checkout or contact Housefinds support.' },
      { status: 503 },
    )
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-store, private',
    },
  })
}
