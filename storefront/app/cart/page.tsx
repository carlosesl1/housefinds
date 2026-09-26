'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon, LockClosedIcon, MinusIcon, PlusIcon, ShieldCheckIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'
import { useEffect } from 'react'
import { formatMoney } from '@/lib/woocommerce/money'
import { displayProductName } from '@/lib/woocommerce/presentation'
import { moneyValue, trackStorefrontEvent } from '@/lib/storefront/analytics'

const UK_LAUNCH_ORDER_LIMIT = 135

export default function CartPage() {
  const cart = useCart((state) => state.cart)
  const loading = useCart((state) => state.loading)
  const error = useCart((state) => state.error)
  const update = useCart((state) => state.update)
  const remove = useCart((state) => state.remove)
  const clearError = useCart((state) => state.clearError)

  const money = (amount?: string) => formatMoney(amount || '0', cart?.totals.currency_minor_unit ?? 2, cart?.totals.currency_symbol || '£')
  const totalValue = cart ? Number(cart.totals.total_price || 0) / Math.pow(10, cart.totals.currency_minor_unit || 2) : 0
  const exceedsLimit = totalValue >= UK_LAUNCH_ORDER_LIMIT

  useEffect(() => {
    if (!cart?.items?.length) return
    trackStorefrontEvent({
      event: 'view_cart',
      ecommerce: {
        currency: cart.totals.currency_code || 'GBP',
        value: moneyValue(cart.totals.total_price, cart.totals.currency_minor_unit),
        items: cart.items.map((item) => ({ item_id: String(item.id), item_name: displayProductName(item.name), quantity: item.quantity })),
      },
    })
  }, [cart])

  if (!cart?.items?.length) {
    return (
      <main className="hf-cart-page hf-container">
        <div className="hf-cart-empty">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[var(--hf-brand-muted)]">Your cart</p>
          <h1 className="mt-4 text-[clamp(3.8rem,7vw,6rem)] font-semibold leading-[.9] tracking-[-.065em] text-[var(--hf-ink)]">Nothing here yet.</h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-[var(--hf-ink-soft)]">Browse the collection and add the useful finds you want to compare or order.</p>
          <Link href="/shop" className="hf-button-primary mt-8">Browse products <ArrowRightIcon className="size-4" /></Link>
        </div>
      </main>
    )
  }

  return (
    <main className="hf-cart-page hf-container py-8 lg:py-10">
      <div className="min-w-0">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black"><ArrowLeftIcon className="size-4" /> Continue shopping</Link>

        <div className="mt-8 flex flex-col justify-between gap-5 border-b border-black/[.07] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[var(--hf-brand-muted)]">Review your basket</p>
            <h1 className="mt-3 text-[clamp(3.8rem,6vw,6.4rem)] font-semibold leading-[.9] tracking-[-.065em] text-[var(--hf-ink)]">Your cart.</h1>
          </div>
          <p className="text-sm text-[var(--hf-ink-soft)]">{cart.items_count} item{cart.items_count === 1 ? '' : 's'} · Free UK delivery</p>
        </div>

        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-[var(--hf-radius-sm)] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <span>{error}</span><button type="button" onClick={clearError} className="shrink-0 font-semibold underline underline-offset-4">Dismiss</button>
          </div>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-16">
          <section aria-label="Cart items">
            <div className="divide-y divide-black/[.07] border-y border-black/[.07]">
              {cart.items.map((item) => (
                <article key={item.key} className="hf-cart-item">
                  <div className="relative aspect-square overflow-hidden rounded-[var(--hf-radius-md)] bg-[#efeee8]">
                    {item.images?.[0]?.src && <Image src={item.images[0].src} alt={displayProductName(item.name)} fill sizes="130px" className="object-cover" />}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold leading-6 tracking-[-.03em] text-[var(--hf-ink)]">{displayProductName(item.name)}</h2>
                    {item.variation?.length > 0 && <p className="mt-2 text-sm leading-6 text-[var(--hf-ink-soft)]">{item.variation.map((variation) => variation.value).join(' · ')}</p>}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <div className="hf-cart-quantity">
                        <button type="button" disabled={loading || item.quantity <= 1} onClick={() => void update(item.key, item.quantity - 1)} className="grid size-10 place-items-center disabled:opacity-30" aria-label={`Decrease quantity of ${displayProductName(item.name)}`}><MinusIcon className="size-4" /></button>
                        <span className="min-w-8 text-center text-sm font-semibold" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                        <button type="button" disabled={loading} onClick={() => void update(item.key, item.quantity + 1)} className="grid size-10 place-items-center disabled:opacity-30" aria-label={`Increase quantity of ${displayProductName(item.name)}`}><PlusIcon className="size-4" /></button>
                      </div>
                      <button type="button" disabled={loading} onClick={() => void remove(item.key)} className="inline-flex h-11 items-center gap-2 rounded-[var(--hf-radius-sm)] px-3 text-xs font-semibold text-[var(--hf-ink-soft)] transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"><TrashIcon className="size-4" /> Remove</button>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-lg font-semibold">{money(item.totals.line_total)}</p>
                    {item.quantity > 1 && item.prices?.price && <p className="mt-1 text-xs text-[var(--hf-ink-soft)]">{money(item.prices.price)} each</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="hf-cart-summary">
              <h2 className="text-xl font-semibold tracking-[-.03em]">Order summary</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><span className="text-[var(--hf-ink-soft)]">Subtotal</span><span>{money(cart.totals.total_items)}</span></div>
                {Number(cart.totals.total_discount) > 0 && <div className="flex justify-between gap-4 text-[#456b55]"><span>Discount</span><span>−{money(cart.totals.total_discount)}</span></div>}
                <div className="flex justify-between gap-4"><span className="text-[var(--hf-ink-soft)]">Standard UK delivery</span><strong className="text-[var(--hf-brand)]">FREE</strong></div>
                {Number(cart.totals.total_tax) > 0 && <div className="flex justify-between gap-4"><span className="text-[var(--hf-ink-soft)]">Tax</span><span>{money(cart.totals.total_tax)}</span></div>}
                <div className="flex items-end justify-between gap-4 border-t border-black/[.07] pt-4"><div><span className="text-[var(--hf-ink-soft)]">Total</span><p className="mt-1 text-xs text-[var(--hf-ink-soft)]">GBP</p></div><strong className="text-3xl tracking-[-.05em]">{money(cart.totals.total_price)}</strong></div>
              </div>

              {exceedsLimit ? (
                <div className="mt-5 rounded-[var(--hf-radius-sm)] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Keep this basket below £135.</strong><p className="mt-1">Reduce quantity or remove an item before continuing to checkout.</p></div>
              ) : (
                <Link href="/checkout" className="hf-button-primary mt-6 w-full"><LockClosedIcon className="size-4" /> Secure checkout</Link>
              )}

              <div className="mt-6 grid gap-3 border-t border-black/[.07] pt-5 text-xs leading-5 text-black/45">
                <div className="flex gap-3"><TruckIcon className="mt-0.5 size-4 shrink-0 text-[var(--hf-brand-muted)]" /><div><strong className="block text-[var(--hf-ink)]">Free UK delivery</strong>Current estimate: around 14 days.</div></div>
                <div className="flex gap-3"><ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-[var(--hf-brand-muted)]" /><div><strong className="block text-[var(--hf-ink)]">Card payment via Stripe</strong>Card details are handled by Stripe, not stored by Housefinds.</div></div>
              </div>

              <Link href="/returns" className="mt-5 block text-center text-xs font-semibold text-[var(--hf-brand)] underline underline-offset-4">Free 14-day returns on eligible online orders</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
