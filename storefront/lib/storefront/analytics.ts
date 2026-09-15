'use client'

export type AnalyticsEvent = {
  event: string
  ecommerce?: Record<string, unknown>
  [key: string]: unknown
}

declare global {
  interface Window {
    dataLayer?: AnalyticsEvent[]
  }
}

export function trackStorefrontEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)
  window.dispatchEvent(new CustomEvent('housefinds:analytics', { detail: event }))

  // Keep an anonymous first-party funnel trail in Vercel runtime logs. The
  // endpoint deliberately drops search terms, order numbers, emails, addresses
  // and item names before logging anything.
  try {
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
      cache: 'no-store',
    })
  } catch {}
}

export function moneyValue(minor: string | number | undefined, minorUnit = 2) {
  const amount = Number(minor || 0) / Math.pow(10, minorUnit)
  return Number.isFinite(amount) ? Number(amount.toFixed(minorUnit)) : 0
}
