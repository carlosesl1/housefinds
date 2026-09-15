import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_EVENTS = new Set(['view_item', 'add_to_cart', 'view_cart', 'begin_checkout', 'purchase', 'search'])

type IncomingAnalytics = {
  event?: unknown
  ecommerce?: { currency?: unknown; value?: unknown; items?: unknown[] }
  result_count?: unknown
}

export async function POST(request: NextRequest) {
  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite && !['same-origin', 'same-site', 'none'].includes(fetchSite)) {
    return new NextResponse(null, { status: 204 })
  }

  let body: IncomingAnalytics
  try {
    body = await request.json() as IncomingAnalytics
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const event = typeof body.event === 'string' ? body.event : ''
  if (!ALLOWED_EVENTS.has(event)) return new NextResponse(null, { status: 204 })

  const value = Number(body.ecommerce?.value)
  const currency = typeof body.ecommerce?.currency === 'string' ? body.ecommerce.currency.slice(0, 8) : undefined
  const itemCount = Array.isArray(body.ecommerce?.items) ? body.ecommerce?.items.length : undefined
  const resultCount = Number(body.result_count)

  console.info('[housefinds-analytics]', {
    event,
    ...(currency ? { currency } : {}),
    ...(Number.isFinite(value) ? { value } : {}),
    ...(typeof itemCount === 'number' ? { item_count: itemCount } : {}),
    ...(event === 'search' && Number.isFinite(resultCount) ? { result_count: resultCount } : {}),
  })

  return new NextResponse(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  })
}
