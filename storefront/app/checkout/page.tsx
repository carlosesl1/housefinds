'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeftIcon, CheckCircleIcon, LockClosedIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useCart, type CheckoutAddress } from '@/store/cart'
import { formatMoney } from '@/lib/woocommerce/money'
import { displayProductName } from '@/lib/woocommerce/presentation'

const emptyAddress: CheckoutAddress = {
  first_name: '',
  last_name: '',
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  postcode: '',
  country: 'GB',
  email: '',
  phone: '',
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  autoComplete?: string
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-[#172018]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        className="h-13 w-full rounded-2xl border border-black/10 bg-white px-4 text-[15px] outline-none transition placeholder:text-black/28 focus:border-[#557562] focus:ring-4 focus:ring-[#557562]/10"
      />
    </label>
  )
}

export default function CheckoutPage() {
  const cart = useCart((state) => state.cart)
  const loading = useCart((state) => state.loading)
  const error = useCart((state) => state.error)
  const clearError = useCart((state) => state.clearError)
  const updateCustomer = useCart((state) => state.updateCustomer)
  const selectShipping = useCart((state) => state.selectShipping)
  const applyCoupon = useCart((state) => state.applyCoupon)
  const removeCoupon = useCart((state) => state.removeCoupon)

  const [address, setAddress] = useState<CheckoutAddress>(emptyAddress)
  const [coupon, setCoupon] = useState('')
  const [deliveryAttempted, setDeliveryAttempted] = useState(false)

  const shippingRates = useMemo(
    () => cart?.shipping_rates.flatMap((pkg) => pkg.shipping_rates.map((rate) => ({ ...rate, packageId: pkg.package_id }))) || [],
    [cart],
  )

  const addressReady = Boolean(
    address.email?.trim() &&
      address.first_name.trim() &&
      address.last_name.trim() &&
      address.address_1.trim() &&
      address.city.trim() &&
      address.postcode.trim(),
  )

  const money = (amount?: string) =>
    formatMoney(amount || '0', cart?.totals.currency_minor_unit ?? 2, cart?.totals.currency_symbol || '£')

  const setField = (field: keyof CheckoutAddress, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }))
  }

  const calculateDelivery = async () => {
    setDeliveryAttempted(true)
    if (!addressReady) return
    await updateCustomer(address)
  }

  if (!cart?.items?.length) {
    return (
      <main className="min-h-[70vh] bg-[#fbfaf7] px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[34px] border border-black/[.06] bg-white p-8 text-center shadow-[0_22px_80px_rgba(34,45,37,.05)] sm:p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Checkout</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-.06em]">Your cart is empty.</h1>
          <p className="mx-auto mt-5 max-w-md text-black/50">Add a clever find first, then come back here to arrange delivery and payment.</p>
          <Link href="/shop" className="mt-8 inline-flex h-13 items-center gap-2 rounded-full bg-[#355f4a] px-6 font-semibold text-white">
            <ArrowLeftIcon className="size-4" /> Browse products
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#f5f4ef] px-5 py-10 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-black/48 transition hover:text-black">
            <ArrowLeftIcon className="size-4" /> Continue shopping
          </Link>
          <div className="inline-flex items-center gap-2 text-sm text-black/45"><LockClosedIcon className="size-4" /> Secure checkout</div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px] xl:gap-12">
          <section className="space-y-5">
            <div className="rounded-[32px] border border-black/[.06] bg-white p-6 shadow-[0_20px_70px_rgba(34,45,37,.04)] sm:p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Step 1</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Contact & delivery</h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-black/48">Enter the address where you want the order delivered. We will ask WooCommerce for the available UK shipping methods.</p>
                </div>
                <span className="hidden size-12 place-items-center rounded-2xl bg-[#e7eee9] text-[#456b55] sm:grid"><TruckIcon className="size-6" /></span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Field label="Email" type="email" autoComplete="email" value={address.email || ''} onChange={(value) => setField('email', value)} placeholder="you@example.com" className="sm:col-span-2" />
                <Field label="First name" autoComplete="given-name" value={address.first_name} onChange={(value) => setField('first_name', value)} />
                <Field label="Last name" autoComplete="family-name" value={address.last_name} onChange={(value) => setField('last_name', value)} />
                <Field label="Address" autoComplete="address-line1" value={address.address_1} onChange={(value) => setField('address_1', value)} placeholder="House number and street" className="sm:col-span-2" />
                <Field label="Apartment, suite, etc. (optional)" autoComplete="address-line2" value={address.address_2 || ''} onChange={(value) => setField('address_2', value)} className="sm:col-span-2" />
                <Field label="Town / City" autoComplete="address-level2" value={address.city} onChange={(value) => setField('city', value)} />
                <Field label="Postcode" autoComplete="postal-code" value={address.postcode} onChange={(value) => setField('postcode', value.toUpperCase())} placeholder="SW1A 1AA" />
                <Field label="County (optional)" autoComplete="address-level1" value={address.state || ''} onChange={(value) => setField('state', value)} />
                <div>
                  <span className="mb-2 block text-sm font-semibold text-[#172018]">Country</span>
                  <div className="flex h-13 items-center rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 text-[15px] text-black/65">United Kingdom</div>
                </div>
                <Field label="Phone (optional)" type="tel" autoComplete="tel" value={address.phone || ''} onChange={(value) => setField('phone', value)} />
              </div>

              {deliveryAttempted && !addressReady && (
                <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Please complete email, name, address, city and postcode before calculating delivery.</p>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={() => void calculateDelivery()}
                className="mt-7 inline-flex h-13 items-center justify-center rounded-full bg-[#355f4a] px-7 font-semibold text-white transition hover:bg-[#294b3a] disabled:opacity-50"
              >
                {loading ? 'Calculating…' : cart.has_calculated_shipping ? 'Recalculate delivery' : 'Calculate delivery'}
              </button>
            </div>

            <div className="rounded-[32px] border border-black/[.06] bg-white p-6 shadow-[0_20px_70px_rgba(34,45,37,.04)] sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Step 2</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Delivery method</h2>

              {!cart.has_calculated_shipping ? (
                <p className="mt-4 rounded-2xl bg-[#f5f5f1] p-4 text-sm leading-6 text-black/48">Enter your delivery address above to see shipping options.</p>
              ) : shippingRates.length ? (
                <div className="mt-5 space-y-3">
                  {shippingRates.map((rate) => (
                    <button
                      type="button"
                      key={`${rate.packageId}-${rate.rate_id}`}
                      onClick={() => void selectShipping(rate.packageId, rate.rate_id)}
                      disabled={loading}
                      className={`flex w-full items-center justify-between gap-5 rounded-2xl border p-4 text-left transition ${rate.selected ? 'border-[#557562] bg-[#edf3ee]' : 'border-black/10 bg-white hover:border-black/20'}`}
                    >
                      <div>
                        <p className="font-semibold text-[#172018]">{rate.name}</p>
                        {rate.delivery_time && <p className="mt-1 text-sm text-black/45">{rate.delivery_time}</p>}
                        {rate.description && <p className="mt-1 text-xs text-black/38">{rate.description}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <strong>{money(rate.price)}</strong>
                        {rate.selected && <CheckCircleIcon className="size-5 text-[#456b55]" />}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                  WooCommerce did not return a shipping method for this address. Check the UK shipping zone and rates in WooCommerce.
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-black/[.06] bg-white p-6 shadow-[0_20px_70px_rgba(34,45,37,.04)] sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Step 3</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Payment</h2>
              <div className="mt-5 rounded-2xl border border-dashed border-black/15 bg-[#fafaf7] p-5">
                <div className="flex items-start gap-3">
                  <LockClosedIcon className="mt-0.5 size-5 text-[#456b55]" />
                  <div>
                    <p className="font-semibold">Payment gateway is the next integration.</p>
                    <p className="mt-1 text-sm leading-6 text-black/48">Address, shipping, coupons and cart totals are now handled by WooCommerce. The last piece is connecting the UK payment gateway so this section can create and pay the order.</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
                <div className="flex items-start justify-between gap-4"><span>{error}</span><button type="button" className="font-semibold underline" onClick={clearError}>Dismiss</button></div>
              </div>
            )}
          </section>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-[32px] border border-black/[.06] bg-white p-6 shadow-[0_22px_80px_rgba(34,45,37,.055)]">
              <div className="flex items-center justify-between"><h2 className="text-xl font-semibold tracking-[-.03em]">Order summary</h2><span className="text-sm text-black/42">{cart.items_count} item{cart.items_count === 1 ? '' : 's'}</span></div>

              <div className="mt-6 space-y-5">
                {cart.items.map((item) => (
                  <div key={item.key} className="grid grid-cols-[72px_1fr_auto] gap-3">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f0efe9]">
                      {item.images?.[0]?.src && <Image src={item.images[0].src} alt={item.name} fill sizes="72px" className="object-cover" />}
                      <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-[#172018] text-[10px] font-bold text-white">{item.quantity}</span>
                    </div>
                    <div className="min-w-0 self-center">
                      <p className="line-clamp-2 text-sm font-semibold leading-5">{displayProductName(item.name)}</p>
                      {item.variation?.length > 0 && <p className="mt-1 line-clamp-2 text-xs text-black/42">{item.variation.map((value) => value.value).join(' · ')}</p>}
                    </div>
                    <p className="self-center text-sm font-semibold">{money(item.totals.line_total)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-black/[.07] pt-5">
                <div className="flex gap-2">
                  <input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Discount code" className="h-12 min-w-0 flex-1 rounded-full border border-black/10 px-4 text-sm outline-none focus:border-[#557562]" />
                  <button type="button" disabled={loading || !coupon.trim()} onClick={() => void applyCoupon(coupon).then((ok) => ok && setCoupon(''))} className="h-12 rounded-full bg-[#172018] px-5 text-sm font-semibold text-white disabled:opacity-40">Apply</button>
                </div>
                {cart.coupons.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{cart.coupons.map((entry) => <button type="button" key={entry.code} onClick={() => void removeCoupon(entry.code)} className="rounded-full bg-[#edf3ee] px-3 py-1.5 text-xs font-semibold text-[#355f4a]">{entry.code} ×</button>)}</div>}
              </div>

              <div className="mt-6 space-y-3 border-t border-black/[.07] pt-5 text-sm">
                <div className="flex justify-between gap-4"><span className="text-black/48">Subtotal</span><span>{money(cart.totals.total_items)}</span></div>
                {Number(cart.totals.total_discount) > 0 && <div className="flex justify-between gap-4 text-[#456b55]"><span>Discount</span><span>−{money(cart.totals.total_discount)}</span></div>}
                <div className="flex justify-between gap-4"><span className="text-black/48">Delivery</span><span>{cart.has_calculated_shipping ? (Number(cart.totals.total_shipping) === 0 ? 'Free' : money(cart.totals.total_shipping)) : 'Calculated next'}</span></div>
                {Number(cart.totals.total_tax) > 0 && <div className="flex justify-between gap-4"><span className="text-black/48">Tax</span><span>{money(cart.totals.total_tax)}</span></div>}
                <div className="flex items-end justify-between gap-4 border-t border-black/[.07] pt-4"><div><span className="text-sm text-black/48">Total</span><p className="mt-1 text-xs text-black/35">GBP</p></div><strong className="text-2xl tracking-[-.04em]">{money(cart.totals.total_price)}</strong></div>
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-2xl bg-[#f0f2ed] p-4 text-xs leading-5 text-black/48"><LockClosedIcon className="size-4 shrink-0 text-[#456b55]" /> Cart and delivery totals are calculated by WooCommerce.</div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
