import { NextRequest, NextResponse } from 'next/server'
import { displayProductName } from '@/lib/woocommerce/presentation'
import { isOperationalAttributeName } from '@/lib/storefront/catalog'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const LOOKUP_URL = `${WC_URL}/wp-json/housefinds/v1/order-status`

type RawLookupResult = {
  order_number?: unknown
  status?: unknown
  status_label?: unknown
  created_at?: unknown
  currency?: unknown
  total?: unknown
  items?: unknown
  shipping?: unknown
  tracking?: unknown
  support_email?: unknown
}

function clean(value: unknown, max = 160) {
  return String(value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function safeTrackingUrl(value: unknown) {
  const raw = clean(value, 500)
  if (!raw) return ''
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : ''
  } catch {
    return ''
  }
}

function sanitizeLookupResult(raw: RawLookupResult) {
  const rawItems = Array.isArray(raw.items) ? raw.items : []
  const items = rawItems.slice(0, 50).map((candidate) => {
    const item = candidate && typeof candidate === 'object' ? candidate as Record<string, unknown> : {}
    const variations = Array.isArray(item.variation) ? item.variation : []
    const variation = variations.slice(0, 12).flatMap((candidateVariation) => {
      const entry = candidateVariation && typeof candidateVariation === 'object'
        ? candidateVariation as Record<string, unknown>
        : {}
      const label = clean(entry.label || entry.attribute, 80)
      const value = clean(entry.value, 120)
      if (!value || isOperationalAttributeName(label)) return []
      return [{ label, value }]
    })

    const rawName = clean(item.name, 240)
    return {
      name: displayProductName(rawName || 'Housefinds product'),
      quantity: Math.max(1, Math.trunc(Number(item.quantity || 1))),
      total: clean(item.total, 40),
      variation,
    }
  })

  const rawShipping = raw.shipping && typeof raw.shipping === 'object'
    ? raw.shipping as Record<string, unknown>
    : {}
  const shipping = {
    name: clean(rawShipping.name, 120),
    city: clean(rawShipping.city, 100),
    postcode: clean(rawShipping.postcode, 20),
    country: clean(rawShipping.country, 4),
  }

  const rawTracking = Array.isArray(raw.tracking) ? raw.tracking : []
  const tracking = rawTracking.slice(0, 12).flatMap((candidate) => {
    const item = candidate && typeof candidate === 'object' ? candidate as Record<string, unknown> : {}
    const number = clean(item.number, 120)
    if (!number) return []
    return [{
      provider: clean(item.provider, 100),
      number,
      url: safeTrackingUrl(item.url),
      date_shipped: Number.isFinite(Number(item.date_shipped)) ? Number(item.date_shipped) : null,
    }]
  })

  return {
    order_number: clean(raw.order_number, 80),
    status: clean(raw.status, 40),
    status_label: clean(raw.status_label, 80),
    created_at: clean(raw.created_at, 80) || null,
    delivery_estimate: 'around 14 days',
    currency: clean(raw.currency, 6) || 'GBP',
    total: clean(raw.total, 40),
    items,
    shipping,
    tracking,
    support_email: 'contact@housefindsstore.com',
  }
}

function publicLookupError(status: number, text: string) {
  console.error('[housefinds-order-lookup] upstream lookup failed', {
    status,
    detail: text.replace(/\s+/g, ' ').slice(0, 800),
  })

  if (status === 404) {
    return NextResponse.json(
      { message: 'We could not match that order number and email address.' },
      { status: 404, headers: { 'Cache-Control': 'no-store, private' } },
    )
  }
  if (status === 429) {
    return NextResponse.json(
      { message: 'Too many lookup attempts. Please wait a few minutes and try again.' },
      { status: 429, headers: { 'Cache-Control': 'no-store, private' } },
    )
  }
  return NextResponse.json(
    { message: 'Order tracking is temporarily unavailable. Please try again shortly or contact Housefinds support.' },
    { status: 503, headers: { 'Cache-Control': 'no-store, private' } },
  )
}

export async function POST(req: NextRequest) {
  let body: { order_number?: string; email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Enter your order number and email address.' }, { status: 400 })
  }

  const orderNumber = String(body.order_number || '').trim().slice(0, 80)
  const email = String(body.email || '').trim().toLowerCase().slice(0, 254)

  if (!orderNumber || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'Enter your order number and the email used at checkout.' }, { status: 400 })
  }

  const forwarded = req.headers.get('x-forwarded-for') || ''
  const clientIp = forwarded.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  const upstream = await fetch(LOOKUP_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Housefinds-Client-IP': clientIp.slice(0, 80),
    },
    body: JSON.stringify({ order_number: orderNumber, email }),
    cache: 'no-store',
  })

  const text = await upstream.text()
  if (!upstream.ok) return publicLookupError(upstream.status, text)

  try {
    const raw = JSON.parse(text) as RawLookupResult
    return NextResponse.json(sanitizeLookupResult(raw), {
      status: 200,
      headers: { 'Cache-Control': 'no-store, private' },
    })
  } catch {
    console.error('[housefinds-order-lookup] invalid upstream response')
    return NextResponse.json(
      { message: 'Order tracking is temporarily unavailable. Please try again shortly.' },
      { status: 503, headers: { 'Cache-Control': 'no-store, private' } },
    )
  }
}
