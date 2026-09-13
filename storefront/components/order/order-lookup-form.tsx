'use client'

import { FormEvent, useState } from 'react'
import { CheckCircleIcon, ClockIcon, MagnifyingGlassIcon, TruckIcon } from '@heroicons/react/24/outline'

type TrackingItem = { provider?: string; number?: string; url?: string; date_shipped?: number | null }
type LookupResult = {
  order_number: string
  status: string
  status_label?: string
  created_at?: string | null
  estimated_delivery?: string | null
  currency?: string
  total?: string
  items?: Array<{ name: string; quantity: number; total?: string; variation?: Array<{ label?: string; value?: string }> }>
  shipping?: { name?: string; city?: string; postcode?: string; country?: string }
  tracking?: TrackingItem[]
  support_email?: string
}

function cleanText(value?: string) {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function money(value?: string, currency = 'GBP') {
  const cleaned = cleanText(value)
  const numeric = Number(cleaned)
  if (!cleaned || Number.isNaN(numeric)) return cleaned
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(numeric)
  } catch {
    return `£${numeric.toFixed(2)}`
  }
}

function dateLabel(value?: string | null) {
  if (!value) return ''
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function stageFor(result: LookupResult) {
  if (result.status === 'failed' || result.status === 'cancelled' || result.status === 'refunded') return 0
  if (result.tracking?.length) return 2
  if (['processing', 'on-hold', 'completed'].includes(result.status)) return 1
  return 0
}

function TrackingResult({ result }: { result: LookupResult }) {
  const stage = stageFor(result)
  const steps = [
    ['Order confirmed', 'We received your order.'],
    ['Preparing your order', 'Your order is being prepared for dispatch.'],
    ['Shipment information available', 'Carrier details appear here once they are linked to the order.'],
  ]

  return (
    <div className="mt-7 overflow-hidden rounded-[28px] border border-black/[.07] bg-white">
      <div className="border-b border-black/[.06] bg-[#172018] p-6 text-white sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-white/40">Order #{result.order_number}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h3 className="text-3xl font-semibold tracking-[-.045em]">{result.status_label || 'Order status'}</h3>
          {result.total && <strong className="text-lg">{money(result.total, result.currency)}</strong>}
        </div>
        {result.estimated_delivery && <p className="mt-3 text-sm text-white/58">Current delivery estimate: around {dateLabel(result.estimated_delivery)}</p>}
      </div>

      <div className="p-6 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map(([title, copy], index) => {
            const active = index <= stage
            return (
              <div key={title} className={`rounded-2xl border p-4 ${active ? 'border-[#b8cdbf] bg-[#edf3ee]' : 'border-black/[.07] bg-[#faf9f6]'}`}>
                <div className={`grid size-8 place-items-center rounded-full ${active ? 'bg-[#355f4a] text-white' : 'bg-black/[.05] text-black/28'}`}>{active ? <CheckCircleIcon className="size-5" /> : index + 1}</div>
                <p className="mt-4 text-sm font-semibold text-[#172018]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-black/42">{copy}</p>
              </div>
            )
          })}
        </div>

        {result.tracking?.length ? (
          <div className="mt-6 rounded-2xl bg-[#f3f1eb] p-5">
            <div className="flex items-center gap-2"><TruckIcon className="size-5 text-[#557562]" /><h4 className="font-semibold">Shipment tracking</h4></div>
            <div className="mt-4 space-y-3">
              {result.tracking.map((item, index) => (
                <div key={`${item.number}-${index}`} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div><p className="font-semibold">{item.provider || 'Carrier tracking'}</p><p className="mt-1 font-mono text-xs text-black/48">{item.number}</p></div>
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="rounded-full bg-[#355f4a] px-4 py-2 text-xs font-semibold text-white">Open carrier tracking</a>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 flex gap-3 rounded-2xl bg-[#f3f1eb] p-5 text-sm leading-6 text-black/50"><ClockIcon className="mt-0.5 size-5 shrink-0 text-[#557562]" /><p>Carrier tracking is not linked yet. This page will show it when shipment information becomes available to Housefinds.</p></div>
        )}

        {result.items?.length ? (
          <div className="mt-7 border-t border-black/[.07] pt-6">
            <h4 className="font-semibold">Items</h4>
            <div className="mt-3 divide-y divide-black/[.06]">
              {result.items.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <div><p className="font-medium text-[#172018]">{item.name}</p>{item.variation?.length ? <p className="mt-1 text-xs text-black/40">{item.variation.map((value) => value.value).filter(Boolean).join(' · ')}</p> : null}<p className="mt-1 text-xs text-black/38">Qty {item.quantity}</p></div>
                  {item.total && <span className="shrink-0 font-semibold">{money(item.total, result.currency)}</span>}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function OrderLookupForm() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LookupResult | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!orderNumber.trim() || !email.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch('/api/order/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber.trim(), email: email.trim() }),
      })
      const text = await response.text()
      let data: LookupResult | { message?: string } = {}
      try { data = JSON.parse(text) } catch {}
      if (!response.ok) throw new Error('message' in data && data.message ? data.message : 'We could not find that order.')
      setResult(data as LookupResult)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not find that order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="rounded-[30px] border border-black/[.07] bg-white p-6 shadow-[0_18px_60px_rgba(34,45,37,.035)] sm:p-7">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#e7eee9] text-[#456b55]"><MagnifyingGlassIcon className="size-5" /></span><div><h2 className="text-xl font-semibold tracking-[-.03em]">Find another order</h2><p className="mt-1 text-xs text-black/42">Use the order number and checkout email.</p></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label><span className="mb-2 block text-sm font-semibold">Order number</span><input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="e.g. 1048" autoComplete="off" className="h-13 w-full rounded-2xl border border-black/10 px-4 outline-none focus:border-[#557562] focus:ring-4 focus:ring-[#557562]/10" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" className="h-13 w-full rounded-2xl border border-black/10 px-4 outline-none focus:border-[#557562] focus:ring-4 focus:ring-[#557562]/10" /></label>
        </div>
        <button disabled={loading || !orderNumber.trim() || !email.trim()} className="mt-5 h-13 rounded-full bg-[#355f4a] px-6 text-sm font-semibold text-white disabled:opacity-45">{loading ? 'Looking up order…' : 'Track order'}</button>
        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">{error}</p>}
      </form>
      {result && <TrackingResult result={result} />}
    </div>
  )
}
