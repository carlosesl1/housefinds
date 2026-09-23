'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { ChevronDownIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { WooCart } from '@/lib/woocommerce/types'
import { formatMoney } from '@/lib/woocommerce/money'
import { displayProductName } from '@/lib/woocommerce/presentation'

export function CheckoutSummary({ cart, deliveryConfirmed, loading, locked, applyCoupon, removeCoupon }: {
  cart: WooCart
  deliveryConfirmed: boolean
  loading: boolean
  locked: boolean
  applyCoupon: (code: string) => Promise<string | null>
  removeCoupon: (code: string) => Promise<string | null>
}) {
  const [expanded, setExpanded] = useState(false)
  const [desktop, setDesktop] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const id = useId()
  const money = (amount: string) => formatMoney(amount, cart.totals.currency_minor_unit, cart.totals.currency_symbol)
  const showBody = desktop || expanded
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const update = () => setDesktop(media.matches)
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  async function submitCoupon() {
    if (loading || locked || !coupon.trim()) return
    setMessage(null)
    const error = await applyCoupon(coupon.trim())
    setMessage({ error: Boolean(error), text: error || 'Discount applied. Your total has been updated.' })
    if (!error) setCoupon('')
  }
  async function remove(code: string) {
    setMessage(null)
    const error = await removeCoupon(code)
    setMessage({ error: Boolean(error), text: error || 'Discount removed. Your total has been updated.' })
  }
  return (
    <aside aria-label="Order summary" className="order-first min-w-0 lg:order-last lg:sticky lg:top-7 lg:self-start">
      <div className="overflow-hidden rounded-[var(--hf-radius-md)] border border-[var(--hf-border-strong)] bg-white shadow-[var(--hf-shadow-soft)] lg:rounded-[var(--hf-radius-lg)]">
        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6 lg:pt-6">
          <h2 className="min-w-0 flex-1 text-base font-semibold tracking-[-.02em] lg:text-xl">
            <button type="button" onClick={() => !desktop && setExpanded((value) => !value)} aria-expanded={showBody} aria-controls={`${id}-body`}
              className="flex min-h-11 items-center gap-2 text-left lg:cursor-default" aria-label="Order summary">
              <ShoppingBagIcon className="size-5 shrink-0 text-[var(--hf-brand)]" /><span>Order summary <span className="font-normal text-[var(--hf-ink-soft)]">({cart.items_count})</span></span>
              <ChevronDownIcon className={`size-4 shrink-0 lg:hidden ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </h2>
          <strong className="shrink-0 text-base lg:hidden">{money(cart.totals.total_price)}</strong>
        </div>
        <div id={`${id}-body`} hidden={!showBody} className="px-5 pb-6 sm:px-6">
          <Link href="/cart" aria-disabled={locked} tabIndex={locked ? -1 : undefined} onClick={(event) => { if (locked) event.preventDefault() }} className="mb-4 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--hf-brand)] underline underline-offset-4">Edit basket</Link>
          <ul className="space-y-4" aria-label="Items in your order">
            {cart.items.map((item) => <li key={item.key} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-start gap-3 sm:grid-cols-[64px_minmax(0,1fr)_auto]">
              <div className="relative aspect-square overflow-hidden rounded-[var(--hf-radius-sm)] border border-black/[.05] bg-[var(--hf-surface-soft)]">
                {item.images?.[0]?.src && <Image src={item.images[0].thumbnail || item.images[0].src} alt="" fill sizes="64px" className="object-contain" />}
              </div>
              <div className="min-w-0 text-sm"><p className="font-semibold leading-5">{displayProductName(item.name)}</p>
                {!!item.variation?.length && <p className="mt-1 text-xs leading-5 text-[var(--hf-ink-soft)]">{item.variation.map((entry) => `${entry.attribute}: ${entry.value}`).join(' · ')}</p>}
                <p className="mt-1 text-xs text-[var(--hf-ink-soft)]">Quantity: {item.quantity}</p>
              </div><strong className="text-sm whitespace-nowrap">{money(item.totals.line_total)}</strong>
            </li>)}
          </ul>
          <div className="mt-6 border-t border-[var(--hf-border)] pt-4">
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-[var(--hf-ink-soft)]">Have a discount code?<ChevronDownIcon className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
              <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); void submitCoupon() }}>
                <label htmlFor={`${id}-coupon`} className="sr-only">Discount code</label>
                <input id={`${id}-coupon`} value={coupon} onChange={(event) => { setCoupon(event.target.value); setMessage(null) }} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Discount code" maxLength={100} disabled={loading || locked} className="hf-field min-w-0 !text-base" />
                <button type="submit" disabled={loading || locked || !coupon.trim()} className="hf-button-secondary !min-h-12 !px-4 disabled:opacity-50">Apply</button>
              </form>
            </details>
            {message && <p role={message.error ? 'alert' : 'status'} className={`mt-2 text-sm leading-5 ${message.error ? 'text-rose-800' : 'text-[var(--hf-brand)]'}`}>{message.text}</p>}
            {!!cart.coupons.length && <div className="mt-2 flex flex-wrap gap-2">{cart.coupons.map((entry) => <button type="button" key={entry.code} disabled={loading || locked} aria-label={`Remove discount code ${entry.code}`} onClick={() => void remove(entry.code)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--hf-brand-soft)] px-3 text-xs font-semibold text-[var(--hf-brand)] disabled:opacity-50">{entry.code}<XMarkIcon className="size-4" /></button>)}</div>}
          </div>
          <dl className="mt-4 space-y-3 border-t border-[var(--hf-border)] pt-5 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-[var(--hf-ink-soft)]">Subtotal</dt><dd>{money(cart.totals.total_items)}</dd></div>
            {Number(cart.totals.total_discount) > 0 && <div className="flex justify-between gap-3 text-[var(--hf-brand)]"><dt>Discount</dt><dd>−{money(cart.totals.total_discount)}</dd></div>}
            <div className="flex justify-between gap-3"><dt className="text-[var(--hf-ink-soft)]">Delivery</dt><dd className="text-right font-medium">{!cart.needs_shipping ? 'Not required' : !deliveryConfirmed ? 'Confirm your address' : Number(cart.totals.total_shipping) === 0 ? <span className="text-[var(--hf-brand)]">Free</span> : money(cart.totals.total_shipping)}</dd></div>
            {Number(cart.totals.total_fees) !== 0 && <div className="flex justify-between gap-3"><dt>Fees</dt><dd>{money(cart.totals.total_fees)}</dd></div>}
            {Number(cart.totals.total_tax) > 0 && <div className="flex justify-between gap-3"><dt>Tax</dt><dd>{money(cart.totals.total_tax)}</dd></div>}
            <div className="flex items-center justify-between gap-3 border-t border-[var(--hf-border)] pt-4"><dt className="font-semibold">{deliveryConfirmed ? 'Total' : 'Current total'} <span className="ml-1 text-xs font-normal text-[var(--hf-ink-soft)]">GBP</span></dt><dd className="text-2xl font-semibold tracking-[-.035em]" aria-live="polite" aria-atomic="true">{money(cart.totals.total_price)}</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-[var(--hf-ink-soft)]">The final amount is shown again before you place your order.</p>
        </div>
      </div>
      <div className="mt-4 hidden px-2 text-xs leading-6 text-[var(--hf-ink-soft)] lg:block"><p><strong className="font-semibold text-[var(--hf-brand)]">Free standard UK delivery.</strong> Current estimate: around 14 days.</p><p><Link href="/returns" className="underline underline-offset-4">Free 14-day returns</Link> on eligible orders.</p></div>
    </aside>
  )
}
