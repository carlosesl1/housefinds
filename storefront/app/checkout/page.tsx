'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, CreditCardIcon, EnvelopeIcon, LockClosedIcon, TruckIcon } from '@heroicons/react/24/outline'
import { StripeCardForm } from '@/components/checkout/stripe-card-form'
import { CheckoutAddressFields, CheckoutField, checkoutFieldId } from '@/components/checkout/checkout-fields'
import { CheckoutSummary } from '@/components/checkout/checkout-summary'
import { useCart, type CheckoutAddress } from '@/store/cart'
import { formatMoney } from '@/lib/woocommerce/money'
import { displayProductName } from '@/lib/woocommerce/presentation'
import { moneyValue, trackStorefrontEvent } from '@/lib/storefront/analytics'
import {
  CHECKOUT_DRAFT_KEY, CHECKOUT_LIMIT_MINOR, DELIVERY_ESTIMATE, EMPTY_ADDRESS,
  checkoutCartRevision, customerFingerprint, decodeCheckoutDraft, deliveryIsReady,
  draftBasketKey, encodeCheckoutDraft, normaliseAddress, restoreCartAddresses, validateAddress,
  type AddressErrors,
} from '@/lib/storefront/checkout'

const panelClass = 'rounded-[var(--hf-radius-md)] border border-[var(--hf-border-strong)] bg-white p-5 sm:p-7 lg:rounded-[var(--hf-radius-lg)]'

function focusSection(id: string) {
  window.requestAnimationFrame(() => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
    element?.focus({ preventScroll: true })
  })
}
function visibleErrors(errors: AddressErrors, touched: Set<string>, attempted: boolean): AddressErrors {
  return Object.fromEntries(Object.entries(errors).filter(([key]) => attempted || touched.has(key)))
}
function CheckoutHeader({ locked = false }: { locked?: boolean }) {
  return <header className="border-b border-[var(--hf-border)] bg-[var(--hf-background)]">
    <div className="mx-auto flex min-h-[76px] max-w-[1220px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <Link href="/" aria-label="Housefinds home" aria-disabled={locked} tabIndex={locked ? -1 : undefined} onClick={(event) => { if (locked) event.preventDefault() }}>
        <Image src="/housefinds-logo.svg" alt="Housefinds" width={720} height={210} priority className="h-8 w-auto sm:h-10" />
      </Link>
      <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--hf-brand)] sm:text-sm"><LockClosedIcon className="size-4" />Secure checkout</span>
    </div>
  </header>
}

export default function CheckoutPage() {
  const cart = useCart((state) => state.cart)
  const loading = useCart((state) => state.loading)
  const storeError = useCart((state) => state.error)
  const updateCustomer = useCart((state) => state.updateCustomer)
  const selectShipping = useCart((state) => state.selectShipping)
  const refresh = useCart((state) => state.refresh)
  const [address, setAddress] = useState<CheckoutAddress>({ ...EMPTY_ADDRESS })
  const [billing, setBilling] = useState<CheckoutAddress>({ ...EMPTY_ADDRESS })
  const [sameBilling, setSameBilling] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [confirmedCustomer, setConfirmedCustomer] = useState('')
  const [deliveryAttempted, setDeliveryAttempted] = useState(false)
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [billingTouched, setBillingTouched] = useState<Set<string>>(new Set())
  const [operationError, setOperationError] = useState<string | null>(null)
  const [paymentStage, setPaymentStage] = useState(false)
  const [reviewedRevision, setReviewedRevision] = useState('')
  const [paymentBusy, setPaymentBusy] = useState(false)
  const [restoredDraft, setRestoredDraft] = useState(false)
  const requestInFlight = useRef(false)
  const currentCustomerRef = useRef('')
  const effectiveBilling = useMemo(() => sameBilling ? address : { ...billing, email: address.email, phone: address.phone }, [address, billing, sameBilling])
  const fingerprint = customerFingerprint(address, effectiveBilling)
  currentCustomerRef.current = fingerprint
  const addressErrors = useMemo(() => validateAddress(address), [address])
  const billingErrors = useMemo(() => sameBilling ? {} : validateAddress(effectiveBilling, false), [effectiveBilling, sameBilling])
  const fieldErrors = [...Object.entries(addressErrors).map(([key, text]) => ({ prefix: 'delivery', key, text })), ...Object.entries(billingErrors).map(([key, text]) => ({ prefix: 'billing', key, text }))]
  const validDetails = fieldErrors.length === 0
  const savedCustomer = cart ? restoreCartAddresses(cart) : null
  const customerConfirmed = Boolean(confirmedCustomer && confirmedCustomer === fingerprint && savedCustomer && customerFingerprint(savedCustomer.address, savedCustomer.sameBilling ? savedCustomer.address : savedCustomer.billing) === fingerprint)
  const deliveryReady = customerConfirmed && deliveryIsReady(cart)
  const revision = cart ? checkoutCartRevision(cart) : ''
  const atLimit = Number(cart?.totals.total_price || 0) >= CHECKOUT_LIMIT_MINOR
  const currencySupported = !cart || (cart.totals.currency_code === 'GBP' && cart.totals.currency_minor_unit === 2)
  const locked = paymentBusy || loading
  const paymentReady = validDetails && deliveryReady && paymentStage && reviewedRevision === revision && !atLimit && currencySupported && !locked
  const money = (amount: string) => formatMoney(amount, cart?.totals.currency_minor_unit ?? 2, cart?.totals.currency_symbol || '£')

  useEffect(() => {
    if (!cart || hydrated) return
    const server = restoreCartAddresses(cart)
    let draft = null
    try { draft = decodeCheckoutDraft(sessionStorage.getItem(CHECKOUT_DRAFT_KEY), draftBasketKey(cart)) } catch {}
    const restored = draft || server
    setAddress(restored.address); setBilling(restored.billing); setSameBilling(restored.sameBilling)
    setRestoredDraft(Boolean(draft))
    const serverFingerprint = customerFingerprint(server.address, server.sameBilling ? server.address : server.billing)
    const restoredFingerprint = customerFingerprint(restored.address, restored.sameBilling ? restored.address : { ...restored.billing, email: restored.address.email, phone: restored.address.phone })
    if (deliveryIsReady(cart) && restoredFingerprint === serverFingerprint && !Object.keys(validateAddress(restored.address)).length && (restored.sameBilling || !Object.keys(validateAddress(restored.billing, false)).length)) {
      setConfirmedCustomer(serverFingerprint); setDetailsOpen(false)
    }
    setHydrated(true)
  }, [cart, hydrated])

  const basketKey = cart ? draftBasketKey(cart) : ''
  useEffect(() => {
    if (!hydrated || !basketKey || paymentBusy) return
    const timer = window.setTimeout(() => {
      try { sessionStorage.setItem(CHECKOUT_DRAFT_KEY, encodeCheckoutDraft({ address, billing, sameBilling }, basketKey)) } catch {}
    }, 350)
    return () => window.clearTimeout(timer)
  }, [address, billing, sameBilling, hydrated, basketKey, paymentBusy])

  useEffect(() => {
    if (!cart?.items.length) return
    const key = `hf_begin_checkout_${cart.items.map((item) => `${item.id}:${item.quantity}`).join('|')}_${cart.totals.total_price}`
    try {
      if (sessionStorage.getItem(key)) return
      trackStorefrontEvent({ event: 'begin_checkout', ecommerce: {
        currency: cart.totals.currency_code, value: moneyValue(cart.totals.total_price, cart.totals.currency_minor_unit),
        items: cart.items.map((item) => ({ item_id: String(item.id), item_name: displayProductName(item.name), quantity: item.quantity, price: moneyValue(item.totals.line_total, item.totals.currency_minor_unit) / Math.max(1, item.quantity) })),
      } })
      sessionStorage.setItem(key, '1')
    } catch {}
  }, [cart])

  const setField = (key: keyof CheckoutAddress, value: string) => setAddress((current) => ({ ...current, [key]: value }))
  const setBillingField = (key: keyof CheckoutAddress, value: string) => setBilling((current) => ({ ...current, [key]: value }))
  const touch = (key: keyof CheckoutAddress) => setTouched((current) => new Set([...current, key]))
  const touchBilling = (key: keyof CheckoutAddress) => setBillingTouched((current) => new Set([...current, key]))

  function editDetails() {
    if (locked) return
    setDetailsOpen(true); setPaymentStage(false); setConfirmedCustomer(''); setOperationError(null)
    focusSection('checkout-details')
  }
  async function confirmDetails() {
    if (locked || requestInFlight.current || atLimit || !currencySupported) return
    setDeliveryAttempted(true); setOperationError(null)
    if (!validDetails) {
      const first = fieldErrors[0]
      if (first) focusSection(checkoutFieldId(first.prefix, first.key as keyof CheckoutAddress))
      return
    }
    requestInFlight.current = true
    const submittedFingerprint = fingerprint
    const delivery = normaliseAddress(address)
    const bill = normaliseAddress(effectiveBilling)
    try {
      const ok = await updateCustomer(delivery, bill)
      if (!ok) { setOperationError(useCart.getState().error || 'We could not confirm delivery. Please try again.'); return }
      if (currentCustomerRef.current !== submittedFingerprint) return
      setAddress(delivery); setBilling(bill)
      setConfirmedCustomer(customerFingerprint(delivery, bill)); setDetailsOpen(false); setPaymentStage(false)
      focusSection('checkout-delivery')
    } finally { requestInFlight.current = false }
  }
  async function chooseShipping(packageId: number, rateId: string) {
    if (locked || requestInFlight.current) return
    requestInFlight.current = true; setOperationError(null)
    try {
      const ok = await selectShipping(packageId, rateId)
      if (!ok) setOperationError(useCart.getState().error || 'We could not update delivery. Try selecting it again.')
    } finally { requestInFlight.current = false }
  }
  function continueToPayment() {
    if (!deliveryReady || locked || atLimit || !currencySupported) return
    setReviewedRevision(revision); setPaymentStage(true); focusSection('checkout-payment')
  }
  async function couponAction(code: string, remove = false): Promise<string | null> {
    if (locked) return 'Please wait for the current update to finish.'
    const ok = await (remove ? useCart.getState().removeCoupon(code) : useCart.getState().applyCoupon(code))
    const message = ok ? null : useCart.getState().error || 'That code could not be applied. Check the code and try again.'
    useCart.getState().clearError()
    return message
  }

  if (!cart || !cart.items.length) return <main className="min-h-screen bg-[var(--hf-background)]"><CheckoutHeader />
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      {!cart ? storeError ? <><h1 className="text-3xl font-semibold tracking-[-.035em]">Let’s reconnect your basket.</h1><p className="mt-4 text-sm leading-6 text-[var(--hf-ink-soft)]">Your basket could not be loaded. This is not a payment failure.</p><button type="button" onClick={() => void refresh()} disabled={loading} className="hf-button-primary mt-6 disabled:opacity-50">{loading ? 'Reconnecting…' : 'Try again'}</button></> : <div role="status" aria-live="polite"><div className="mx-auto mb-6 h-10 w-40 animate-pulse rounded-full bg-[var(--hf-brand-soft)] motion-reduce:animate-none" /><h1 className="text-2xl font-semibold">Loading your basket…</h1></div> : <><h1 className="text-3xl font-semibold tracking-[-.035em]">Your basket is empty.</h1><p className="mt-4 text-sm leading-6 text-[var(--hf-ink-soft)]">Add a useful find before checking out.</p><Link href="/shop" className="hf-button-primary mt-6">Explore the shop<ArrowRightIcon className="size-4" /></Link></>}
      <p className="mt-7 text-sm text-[var(--hf-ink-soft)]">Need help? <a href="mailto:contact@housefindsstore.com" className="font-semibold text-[var(--hf-brand)] underline underline-offset-4">Contact Housefinds</a></p>
    </div>
  </main>

  const currentStep = !customerConfirmed ? 1 : !paymentStage ? 2 : 3
  return <main className="min-h-screen bg-[var(--hf-background)] text-[var(--hf-ink)]">
    <CheckoutHeader locked={paymentBusy} />
    <div className="mx-auto max-w-[1220px] px-4 pb-10 pt-5 sm:px-6 lg:pt-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/cart" aria-disabled={paymentBusy} tabIndex={paymentBusy ? -1 : undefined} onClick={(event) => { if (paymentBusy) event.preventDefault() }} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--hf-ink-soft)] hover:text-[var(--hf-brand)]"><ArrowLeftIcon className="size-4" />Back to basket</Link>
        <a href="mailto:contact@housefindsstore.com" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--hf-brand)]"><EnvelopeIcon className="size-4" />Need help?</a>
      </div>
      <div className="mb-6"><h1 className="text-[clamp(1.8rem,3vw,2.5rem)] font-semibold tracking-[-.04em]">Checkout</h1><p className="mt-2 text-sm text-[var(--hf-ink-soft)]">You’re checking out as a guest. No account needed.</p></div>
      <nav aria-label="Checkout progress" className="mb-6 max-w-[690px]">
        <ol className="grid grid-cols-3 gap-2">
          {[['Details', 'checkout-details'], ['Delivery', 'checkout-delivery'], ['Payment', 'checkout-payment']].map(([label, target], index) => <li key={label}>
            <button type="button" disabled={paymentBusy || index + 1 > currentStep} aria-current={currentStep === index + 1 ? 'step' : undefined} onClick={() => { if (index === 0) editDetails(); else focusSection(target) }} className={`flex min-h-12 w-full items-center gap-2 rounded-full px-3 text-sm disabled:cursor-default sm:px-4 ${index + 1 === currentStep ? 'bg-[var(--hf-brand-soft)] font-semibold text-[var(--hf-brand)]' : 'text-[var(--hf-ink-soft)]'}`}>
              <span className={`grid size-6 shrink-0 place-items-center rounded-full text-xs ${index + 1 <= currentStep ? 'bg-[var(--hf-brand)] text-white' : 'border border-[var(--hf-border-strong)]'}`}>{index + 1 < currentStep ? <CheckIcon className="size-3.5" /> : index + 1}</span>{label}
            </button>
          </li>)}
        </ol>
      </nav>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-12">
        <div className="min-w-0 space-y-5">
          {(atLimit || !currencySupported) && <div role="alert" className="rounded-[var(--hf-radius-sm)] border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>{atLimit ? 'Keep this order below £135 to continue.' : 'We could not confirm the currency for this order.'}</strong><p>{atLimit ? 'Edit your basket to reduce the quantity or remove an item.' : 'Refresh your basket or contact Housefinds before paying.'}</p></div>}
          {operationError && <div role="alert" className="rounded-[var(--hf-radius-sm)] border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950">{operationError}</div>}
          <section id="checkout-details" tabIndex={-1} className={`${panelClass} scroll-mt-5`} aria-labelledby="details-heading">
            <div className="flex items-center justify-between gap-4"><h2 id="details-heading" className="text-xl font-semibold tracking-[-.025em]">1. Contact & address</h2>{!detailsOpen && <button type="button" onClick={editDetails} disabled={locked} className="min-h-11 text-sm font-semibold text-[var(--hf-brand)] underline underline-offset-4 disabled:opacity-50">Edit details</button>}</div>
            {!detailsOpen ? <div className="mt-3 space-y-2 break-words text-sm leading-6 text-[var(--hf-ink-soft)]"><p className="font-medium text-[var(--hf-ink)]">{address.email}</p><p>{address.first_name} {address.last_name}<br />{[address.address_1, address.address_2, address.city, address.state, address.postcode].filter(Boolean).join(', ')}<br />United Kingdom</p><p className="text-xs">{sameBilling ? 'Billing address is the same as delivery.' : `Billing: ${[billing.first_name, billing.last_name, billing.address_1, billing.address_2, billing.city, billing.state, billing.postcode].filter(Boolean).join(' ')}`}</p></div> : <form noValidate onSubmit={(event) => { event.preventDefault(); void confirmDetails() }}>
              <p className="mt-2 text-sm leading-6 text-[var(--hf-ink-soft)]">Fields are required unless marked optional.</p>
              {restoredDraft && <p role="status" className="mt-3 text-xs leading-5 text-[var(--hf-brand)]">Your details were restored in this tab. Please review them before continuing.</p>}
              {deliveryAttempted && !validDetails && <div role="alert" className="mt-4 rounded-[var(--hf-radius-sm)] bg-rose-50 p-4 text-sm text-rose-900"><p className="font-semibold">Check the highlighted details.</p><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">{fieldErrors.map(({ prefix, key, text }) => <button key={`${prefix}-${key}`} type="button" className="min-h-8 text-left text-xs underline underline-offset-2" onClick={() => focusSection(checkoutFieldId(prefix, key as keyof CheckoutAddress))}>{prefix === 'billing' ? 'Billing: ' : ''}{text}</button>)}</div></div>}
              <fieldset disabled={locked} className="mt-5 min-w-0 space-y-5"><legend className="sr-only">Contact and delivery address</legend>
                <CheckoutField prefix="delivery" field="email" label="Email address" type="email" autoComplete="shipping email" value={address.email || ''} onChange={(value) => setField('email', value)} onBlur={() => touch('email')} error={visibleErrors(addressErrors, touched, deliveryAttempted).email} hint="For your receipt and order updates." />
                <CheckoutAddressFields prefix="delivery" address={address} setField={setField} onBlur={touch} errors={visibleErrors(addressErrors, touched, deliveryAttempted)} phone />
                <div className="border-t border-[var(--hf-border)] pt-4">
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={sameBilling} onChange={(event) => { setSameBilling(event.target.checked); if (!event.target.checked && !billing.address_1) setBilling({ ...address }) }} className="size-5 shrink-0 accent-[var(--hf-brand)]" />Billing address is the same as delivery</label>
                  {!sameBilling && <fieldset className="mt-4"><legend className="mb-4 text-base font-semibold">Billing address</legend><CheckoutAddressFields prefix="billing" address={billing} setField={setBillingField} onBlur={touchBilling} errors={visibleErrors(billingErrors, billingTouched, deliveryAttempted)} /></fieldset>}
                </div>
                <button type="submit" disabled={locked || atLimit || !currencySupported} className="hf-button-primary !min-h-14 w-full disabled:opacity-50">{loading ? 'Confirming delivery…' : 'Continue to delivery'}{!loading && <ArrowRightIcon className="size-4" />}</button>
              </fieldset>
            </form>}
          </section>
          <section id="checkout-delivery" tabIndex={-1} className={`${panelClass} scroll-mt-5`} aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className="flex items-center gap-3 text-xl font-semibold tracking-[-.025em]">2. Delivery<TruckIcon className="size-5 text-[var(--hf-brand)]" /></h2>
            {!customerConfirmed ? <div className="mt-3 text-sm leading-6 text-[var(--hf-ink-soft)]"><p><strong className="font-semibold text-[var(--hf-brand)]">Free standard UK delivery.</strong> {DELIVERY_ESTIMATE}.</p><p className="mt-1">Confirm your address to check delivery availability.</p></div> : !cart.needs_shipping ? <p className="mt-4 text-sm">No delivery is required for this order.</p> : !cart.shipping_rates.length || cart.shipping_rates.some((pkg) => !pkg.shipping_rates.length) ? <div className="mt-4 rounded-[var(--hf-radius-sm)] bg-amber-50 p-4 text-sm leading-6 text-amber-950">We could not confirm delivery to this address. <button type="button" onClick={editDetails} disabled={locked} className="font-semibold underline underline-offset-4">Check your postcode and address</button> or contact us before paying.</div> : <div className="mt-4 space-y-4">
              {cart.shipping_rates.map((pkg) => <fieldset key={pkg.package_id} disabled={locked} className="space-y-2"><legend className={cart.shipping_rates.length === 1 ? 'sr-only' : 'mb-2 text-sm font-semibold'}>{cart.shipping_rates.length === 1 ? 'Choose a delivery method' : pkg.name || `Delivery package ${pkg.package_id + 1}`}</legend>
                {pkg.shipping_rates.map((rate) => <label key={rate.rate_id} className={`flex min-h-20 cursor-pointer items-start gap-3 rounded-[var(--hf-radius-sm)] border p-4 ${rate.selected ? 'border-[var(--hf-brand)] bg-[var(--hf-brand-soft)]/50' : 'border-[var(--hf-border-strong)]'}`}>
                  <input type="radio" name={`shipping-${pkg.package_id}`} value={rate.rate_id} checked={rate.selected} onChange={() => void chooseShipping(pkg.package_id, rate.rate_id)} className="mt-1 size-4 shrink-0 accent-[var(--hf-brand)]" />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{rate.name || 'Standard UK delivery'}</span><span className="mt-1 block text-xs leading-5 text-[var(--hf-ink-soft)]">{rate.delivery_time || DELIVERY_ESTIMATE}</span></span>
                  <strong className="shrink-0 text-sm text-[var(--hf-brand)]">{Number(rate.price) === 0 ? 'Free' : money(rate.price)}</strong>
                </label>)}
              </fieldset>)}
              <p className="text-xs leading-5 text-[var(--hf-ink-soft)]">Delivery times are estimates, not guaranteed arrival dates. <Link href="/shipping" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Delivery details</Link>.</p>
            </div>}
            {customerConfirmed && !paymentStage && <button type="button" onClick={continueToPayment} disabled={!deliveryReady || locked || atLimit || !currencySupported} className="hf-button-primary mt-5 !min-h-14 w-full disabled:opacity-50">Continue to payment<ArrowRightIcon className="size-4" /></button>}
          </section>
          <section id="checkout-payment" tabIndex={-1} className={`${panelClass} scroll-mt-5`} aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="flex items-center gap-3 text-xl font-semibold tracking-[-.025em]">3. Payment<CreditCardIcon className="size-5 text-[var(--hf-brand)]" /></h2>
            {!paymentStage && <p className="mt-3 text-sm leading-6 text-[var(--hf-ink-soft)]">Confirm your details and delivery, then pay securely by card. You’ll review the final total before paying.</p>}
            {paymentStage && deliveryReady && reviewedRevision !== revision && <div role="status" className="mt-4 rounded-[var(--hf-radius-sm)] bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Your basket has been updated.</strong><p>Review the new total of {money(cart.totals.total_price)} before continuing.</p><button type="button" onClick={continueToPayment} disabled={locked || atLimit} className="mt-2 min-h-11 font-semibold underline underline-offset-4">Confirm updated total</button></div>}
            <div className="mt-4"><StripeCardForm address={address} billingAddress={normaliseAddress(effectiveBilling)} expectedTotal={cart.totals.total_price} expectedRevision={revision} requiresPayment={cart.needs_payment} disabled={!paymentReady} onCartRefresh={refresh} onBusyChange={setPaymentBusy} /></div>
          </section>
        </div>
        <CheckoutSummary cart={cart} deliveryConfirmed={deliveryReady} loading={loading} locked={paymentBusy} applyCoupon={(code) => couponAction(code)} removeCoupon={(code) => couponAction(code, true)} />
      </div>
      <footer className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-[var(--hf-border)] pt-5 text-xs text-[var(--hf-ink-soft)]"><Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">Privacy</Link><Link href="/terms" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">Terms of sale</Link><Link href="/returns" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">Returns</Link><span className="ml-auto">Housefinds · United Kingdom · GBP</span></footer>
    </div>
  </main>
}
