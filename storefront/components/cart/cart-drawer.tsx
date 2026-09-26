'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { XMarkIcon, MinusIcon, PlusIcon, ExclamationTriangleIcon, LockClosedIcon, ArrowPathIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'
import { editorialFont } from '@/lib/storefront/editorial-font'
import { formatMoney } from '@/lib/woocommerce/money'
import { displayProductName } from '@/lib/woocommerce/presentation'

const UK_LAUNCH_ORDER_LIMIT = 135

export function CartDrawer() {
  const { cart, open, loading, error, clearError, setOpen, update, remove } = useCart()
  const dialogRef = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeRef.current?.focus(), 0)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter((element) => element.tabIndex >= 0 && element.getAttribute('aria-disabled') !== 'true')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.setTimeout(() => returnFocusRef.current?.focus(), 0)
    }
  }, [open, setOpen])

  if (!open) return null

  const subtotal = cart ? formatMoney(cart.totals.total_items, cart.totals.currency_minor_unit, cart.totals.currency_symbol) : '£0.00'
  const totalValue = cart
    ? Number(cart.totals.total_price || 0) / Math.pow(10, cart.totals.currency_minor_unit || 2)
    : 0
  const exceedsLaunchLimit = totalValue >= UK_LAUNCH_ORDER_LIMIT
  const checkoutDisabled = !cart?.items?.length || loading || exceedsLaunchLimit
  const discount = cart && Number(cart.totals.total_discount) > 0
    ? formatMoney(cart.totals.total_discount, cart.totals.currency_minor_unit, cart.totals.currency_symbol)
    : null

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <button type="button" className="absolute inset-0 bg-black/35" tabIndex={-1} aria-label="Close cart" onClick={() => setOpen(false)} />

      <aside ref={dialogRef} className={`${editorialFont.variable} hf-editorial-scope hf-cart-drawer absolute right-0 top-0 flex h-full w-full max-w-[470px] flex-col shadow-[-12px_0_40px_rgba(20,28,23,.12)]`}>
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.26em] text-[#557562]">Housefinds</p>
            <h2 id="cart-title" className="mt-1 text-2xl font-semibold tracking-[-.04em]">Your cart {cart?.items_count ? <span className="text-base font-medium text-black/35">({cart.items_count})</span> : null}</h2>
          </div>
          <button ref={closeRef} type="button" className="hf-icon-button" onClick={() => setOpen(false)} aria-label="Close cart"><XMarkIcon className="size-5" /></button>
        </div>

        {error && (
          <div className="mx-6 mt-5 rounded-[var(--hf-radius-sm)] border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-950">
            <div className="flex gap-3"><ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0" /><div className="min-w-0"><p className="font-semibold">We could not update your cart.</p><p className="mt-1 break-words text-amber-900/75">{error}</p><button type="button" className="mt-2 text-xs font-semibold underline underline-offset-4" onClick={clearError}>Dismiss</button></div></div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && !cart?.items?.length ? (
            <div className="grid h-full place-items-center text-sm text-[var(--hf-ink-soft)]">Loading cart…</div>
          ) : !cart?.items?.length ? (
            <div className="grid h-full place-items-center text-center text-black/55"><div className="max-w-xs"><p className="text-2xl font-semibold tracking-[-.04em] text-black">Your cart is empty.</p><p className="mt-2 text-sm leading-6">A clever little upgrade is probably waiting somewhere in the shop.</p><Link href="/shop" onClick={() => setOpen(false)} className="mt-6 inline-flex rounded-[var(--hf-radius-sm)] bg-[#355f4a] px-6 py-3.5 text-sm font-semibold text-white">Browse products</Link></div></div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.key} className="hf-cart-line grid gap-4 border-b border-black/[.1] pb-6 last:border-0">
                  <div className="relative aspect-square overflow-hidden bg-white">{item.images?.[0]?.src && <Image src={item.images[0].src} alt={displayProductName(item.name)} fill sizes="92px" className="object-cover" />}</div>
                  <div className="min-w-0">
                    <div className="hf-cart-line-head"><div><h3 className="line-clamp-2 font-semibold leading-tight tracking-[-.02em]">{displayProductName(item.name)}</h3>{item.variation?.length > 0 && <p className="mt-1.5 text-xs leading-5 text-[var(--hf-ink-soft)]">{item.variation.map((variation) => variation.value).join(' · ')}</p>}</div><p className="shrink-0 font-semibold">{formatMoney(item.totals.line_total, item.totals.currency_minor_unit, item.totals.currency_symbol)}</p></div>
                    <div className="hf-cart-line-controls"><div className="hf-cart-quantity"><button type="button" className="grid size-9 place-items-center" onClick={() => void update(item.key, item.quantity - 1)} aria-label="Decrease quantity"><MinusIcon className="size-4" /></button><span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span><button type="button" className="grid size-9 place-items-center" onClick={() => void update(item.key, item.quantity + 1)} aria-label="Increase quantity"><PlusIcon className="size-4" /></button></div><button type="button" className="text-xs text-[var(--hf-ink-soft)] underline underline-offset-4" onClick={() => void remove(item.key)}>Remove</button></div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setOpen(false)} className="w-full rounded-[var(--hf-radius-sm)] border border-black/[.07] bg-white py-3 text-sm font-semibold text-black/55 transition hover:text-black">Continue shopping</button>
            </div>
          )}
        </div>

        <div className="border-t border-black/10 bg-white p-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-black/55">Subtotal</span><strong className="text-xl tracking-[-.03em]">{subtotal}</strong></div>
            {discount && <div className="flex items-center justify-between text-[#456b55]"><span>Discount</span><span>−{discount}</span></div>}
            <div className="flex items-center justify-between"><span className="text-black/55">Standard UK delivery</span><strong className="text-[#355f4a]">FREE</strong></div>
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--hf-ink-soft)]">Prices are shown in GBP. Review the final order total before payment.</p>

          {exceedsLaunchLimit && (
            <div className="mt-4 rounded-[var(--hf-radius-sm)] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
              <strong>This basket needs to stay below £135.</strong> Reduce quantity or remove an item before checkout.
            </div>
          )}

          <Link href="/checkout" onClick={(event) => { if (checkoutDisabled) { event.preventDefault(); return }; setOpen(false) }} aria-disabled={checkoutDisabled} tabIndex={checkoutDisabled ? -1 : undefined} className={`mt-5 flex h-14 items-center justify-center gap-2 rounded-[var(--hf-radius-sm)] bg-[#355f4a] font-semibold text-white transition hover:bg-[#294b3a] ${checkoutDisabled ? 'pointer-events-none opacity-50' : ''}`}><LockClosedIcon className="size-4" /> Continue to checkout</Link>
          {cart?.items?.length ? <Link href="/cart" onClick={() => setOpen(false)} className="mt-2 flex h-11 items-center justify-center rounded-[var(--hf-radius-sm)] text-sm font-semibold text-[var(--hf-ink-soft)] transition hover:bg-black/[.035] hover:text-black">View full cart</Link> : null}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-[var(--hf-ink-soft)]">
            <span className="inline-flex items-center gap-1.5"><TruckIcon className="size-3.5" /> Free UK delivery</span>
            <span className="inline-flex items-center gap-1.5"><LockClosedIcon className="size-3.5" /> Secure payment</span>
            <Link href="/returns" onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 hover:text-black"><ArrowPathIcon className="size-3.5" /> Free 14-day returns</Link>
          </div>
        </div>
      </aside>
    </div>
  )
}
