'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon, LockClosedIcon, MinusIcon, PlusIcon, ShieldCheckIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'
import { formatMoney } from '@/lib/woocommerce/money'
import { displayProductName } from '@/lib/woocommerce/presentation'

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

  if (!cart?.items?.length) {
    return (
      <main className="min-h-[70vh] bg-[#fbfaf7] px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Your cart</p>
          <h1 className="mt-4 text-[clamp(3.8rem,7vw,6rem)] font-semibold leading-[.9] tracking-[-.065em] text-[#101622]">Nothing here yet.</h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-black/48">Browse the collection and add the useful finds you want to compare or order.</p>
          <Link href="/shop" className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-[#355f4a] px-7 font-semibold text-white">Browse products <ArrowRightIcon className="size-4" /></Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#fbfaf7] px-5 py-10 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-[1380px]">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black"><ArrowLeftIcon className="size-4" /> Continue shopping</Link>

        <div className="mt-8 flex flex-col justify-between gap-5 border-b border-black/[.07] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Review your basket</p>
            <h1 className="mt-3 text-[clamp(3.8rem,6vw,6.4rem)] font-semibold leading-[.9] tracking-[-.065em] text-[#101622]">Your cart.</h1>
          </div>
          <p className="text-sm text-black/42">{cart.items_count} item{cart.items_count === 1 ? '' : 's'} · Free UK delivery</p>
        </div>

        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <span>{error}</span><button type="button" onClick={clearError} className="shrink-0 font-semibold underline underline-offset-4">Dismiss</button>
          </div>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-16">
          <section aria-label="Cart items">
            <div className="divide-y divide-black/[.07] border-y border-black/[.07]">
              {cart.items.map((item) => (
                <article key={item.key} className="grid gap-5 py-6 sm:grid-cols-[130px_minmax(0,1fr)_auto] sm:items-start">
                  <div className="relative aspect-square overflow-hidden rounded-[24px] bg-[#efeee8]">
                    {item.images?.[0]?.src && <Image src={item.images[0].src} alt={displayProductName(item.name)} fill sizes="130px" className="object-cover" />}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold leading-6 tracking-[-.03em] text-[#172018]">{displayProductName(item.name)}</h2>
                    {item.variation?.length > 0 && <p className="mt-2 text-sm leading-6 text-black/46">{item.variation.map((variation) => variation.value).join(' · ')}</p>}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <div className="flex h-11 items-center rounded-full border border-black/10 bg-white">
                        <button type="button" disabled={loading || item.quantity <= 1} onClick={() => void update(item.key, item.quantity - 1)} className="grid size-10 place-items-center disabled:opacity-30" aria-label={`Decrease quantity of ${displayProductName(item.name)}`}><MinusIcon className="size-4" /></button>
                        <span className="min-w-8 text-center text-sm font-semibold" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                        <button type="button" disabled={loading} onClick={() => void update(item.key, item.quantity + 1)} className="grid size-10 place-items-center disabled:opacity-30" aria-label={`Increase quantity of ${displayProductName(item.name)}`}><PlusIcon className="size-4" /></button>
                      </div>
                      <button type="button" disabled={loading} onClick={() => void remove(item.key)} className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-xs font-semibold text-black/42 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"><TrashIcon className="size-4" /> Remove</button>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-lg font-semibold">{money(item.totals.line_total)}</p>
                    {item.quantity > 1 && item.prices?.price && <p className="mt-1 text-xs text-black/36">{money(item.prices.price)} each</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-[30px] border border-black/[.07] bg-white p-6 shadow-[0_20px_70px_rgba(34,45,37,.045)]">
              <h2 className="text-xl font-semibold tracking-[-.03em]">Order summary</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><span className="text-black/48">Subtotal</span><span>{money(cart.totals.total_items)}</span></div>
                {Number(cart.totals.total_discount) > 0 && <div className="flex justify-between gap-4 text-[#456b55]"><span>Discount</span><span>−{money(cart.totals.total_discount)}</span></div>}
                <div className="flex justify-between gap-4"><span className="text-black/48">Standard UK delivery</span><strong className="text-[#355f4a]">FREE</strong></div>
                {Number(cart.totals.total_tax) > 0 && <div className="flex justify-between gap-4"><span className="text-black/48">Tax</span><span>{money(cart.totals.total_tax)}</span></div>}
                <div className="flex items-end justify-between gap-4 border-t border-black/[.07] pt-4"><div><span className="text-black/48">Total</span><p className="mt-1 text-xs text-black/32">GBP</p></div><strong className="text-3xl tracking-[-.05em]">{money(cart.totals.total_price)}</strong></div>
              </div>

              {exceedsLimit ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Keep this basket below £135.</strong><p className="mt-1">Reduce quantity or remove an item before continuing to checkout.</p></div>
              ) : (
                <Link href="/checkout" className="mt-6 flex h-14 items-center justify-center gap-2 rounded-full bg-[#355f4a] px-6 font-semibold text-white transition hover:bg-[#294b3a]"><LockClosedIcon className="size-4" /> Secure checkout</Link>
              )}

              <div className="mt-6 grid gap-3 border-t border-black/[.07] pt-5 text-xs leading-5 text-black/45">
                <div className="flex gap-3"><TruckIcon className="mt-0.5 size-4 shrink-0 text-[#557562]" /><div><strong className="block text-[#172018]">Free UK delivery</strong>Current estimate: around 14 days.</div></div>
                <div className="flex gap-3"><ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-[#557562]" /><div><strong className="block text-[#172018]">Card payment via Stripe</strong>Card details are handled by Stripe, not stored by Housefinds.</div></div>
              </div>

              <Link href="/returns" className="mt-5 block text-center text-xs font-semibold text-[#355f4a] underline underline-offset-4">Free 14-day returns on eligible online orders</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
