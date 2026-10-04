'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import type { CheckoutAddress } from '@/store/cart'
import { CHECKOUT_DRAFT_KEY, CHECKOUT_LIMIT_MINOR, PAYMENT_PENDING_KEY, isSafePaymentRedirect, paymentOutcomeIsUncertain } from '@/lib/storefront/checkout'
import { paymentDetailsToRecord, stripeAuthenticationSecret, type CheckoutResponse } from '@/lib/storefront/stripe-response'

type StripeError = { message?: string; type?: string; payment_intent?: { status?: string } }
type StripeCardElement = {
  mount: (target: HTMLElement) => void
  unmount: () => void
  focus: () => void
  update: (options: { disabled: boolean }) => void
  on: {
    (event: 'change', callback: (event: { complete: boolean; error?: StripeError }) => void): void
    (event: 'ready', callback: () => void): void
  }
}
type StripeInstance = {
  elements: (options?: Record<string, unknown>) => { create: (type: 'card', options?: Record<string, unknown>) => StripeCardElement }
  createPaymentMethod: (data: Record<string, unknown>) => Promise<{ paymentMethod?: { id: string }; error?: StripeError }>
  confirmCardPayment: (clientSecret: string) => Promise<{ paymentIntent?: { status: string }; error?: StripeError }>
}
declare global { interface Window { Stripe?: (publishableKey: string) => StripeInstance } }
let stripeScriptPromise: Promise<void> | null = null

function loadStripeScript() {
  if (window.Stripe) return Promise.resolve()
  if (stripeScriptPromise) return stripeScriptPromise
  stripeScriptPromise = new Promise<void>((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]')
    const isNew = !script
    if (!script) { script = document.createElement('script'); script.src = 'https://js.stripe.com/v3/'; script.async = true; script.dataset.housefindsStripe = 'true' }
    const target = script
    const cleanup = () => { clearTimeout(timeout); target.removeEventListener('load', loaded); target.removeEventListener('error', failed) }
    const loaded = () => { if (!window.Stripe) { failed(); return }; cleanup(); resolve() }
    const failed = () => { cleanup(); if (target.dataset.housefindsStripe) target.remove(); reject(new Error('The secure card fields could not load. Check your connection and try loading them again.')) }
    const timeout = window.setTimeout(failed, 15_000)
    target.addEventListener('load', loaded, { once: true }); target.addEventListener('error', failed, { once: true })
    if (isNew) document.head.appendChild(target)
  }).catch((error) => { stripeScriptPromise = null; throw error })
  return stripeScriptPromise
}
function errorDetails(text: string) {
  try { const data = JSON.parse(text); return { code: String(data.code || ''), message: typeof data.message === 'string' ? data.message : 'We could not complete checkout. Review your details and try again.' } }
  catch { return { code: '', message: 'We could not confirm the checkout response.' } }
}
function clearPending() { try { sessionStorage.removeItem(PAYMENT_PENDING_KEY) } catch {} }
function finishConfirmed() {
  clearPending()
  try { sessionStorage.removeItem(CHECKOUT_DRAFT_KEY) } catch {}
}

export function StripeCardForm({ address, billingAddress, expectedTotal, expectedRevision, disabled, requiresPayment = true, onCartRefresh, onBusyChange }: {
  address: CheckoutAddress
  billingAddress?: CheckoutAddress
  expectedTotal: string
  expectedRevision?: string
  disabled: boolean
  requiresPayment?: boolean
  onCartRefresh?: () => Promise<void>
  onBusyChange?: (busy: boolean) => void
}) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  const mountRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<StripeCardElement | null>(null)
  const stripeRef = useRef<StripeInstance | null>(null)
  const busyRef = useRef(false)
  const [activated, setActivated] = useState(false)
  const [ready, setReady] = useState(false)
  const [complete, setComplete] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [uncertain, setUncertain] = useState(false)
  const [phase, setPhase] = useState('')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const amount = Number(expectedTotal)
  const invalidTotal = !/^\d+$/.test(expectedTotal) || !Number.isSafeInteger(amount) || amount < 0 || amount >= CHECKOUT_LIMIT_MINOR
  const priceLabel = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount / 100)

  useEffect(() => { if (!disabled) setActivated(true) }, [disabled])
  useEffect(() => { try { if (sessionStorage.getItem(PAYMENT_PENDING_KEY)) setUncertain(true) } catch {} }, [])
  useEffect(() => {
    if (!activated || !requiresPayment || !publishableKey) return
    let disposed = false
    let localCard: StripeCardElement | null = null
    let readyTimeout: number | undefined
    setReady(false); setComplete(false); setLoadError(null)
    void loadStripeScript().then(() => {
      if (disposed || !window.Stripe || !mountRef.current) return
      const stripe = window.Stripe(publishableKey)
      const card = stripe.elements({ locale: 'en-GB' }).create('card', { hidePostalCode: true, style: {
        base: { color: '#111720', fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', fontSize: '16px', lineHeight: '24px', '::placeholder': { color: '#666f69' }, iconColor: '#355f4a' },
        invalid: { color: '#9f1239', iconColor: '#9f1239' },
      } })
      localCard = card; cardRef.current = card; stripeRef.current = stripe
      readyTimeout = window.setTimeout(() => { if (!disposed) setLoadError('The secure card fields are taking longer than expected. Try loading them again.') }, 20_000)
      card.on('ready', () => { clearTimeout(readyTimeout); if (!disposed) { setReady(true); setLoadError(null) } })
      card.on('change', (event) => { if (!disposed) { setComplete(event.complete); setFieldError(event.error?.message || null) } })
      card.mount(mountRef.current)
    }).catch((error) => { if (!disposed) setLoadError(error instanceof Error ? error.message : 'The secure card fields could not load.') })
    return () => { disposed = true; clearTimeout(readyTimeout); localCard?.unmount(); if (cardRef.current === localCard) { cardRef.current = null; stripeRef.current = null } }
  }, [activated, requiresPayment, publishableKey, loadAttempt])
  useEffect(() => { cardRef.current?.update({ disabled: disabled || processing || uncertain }) }, [disabled, processing, uncertain, ready])

  async function readPaymentStatus(orderId: number, confirmPayment = false) {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 8_000)
    try {
      const response = await fetch('/api/checkout/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', signal: controller.signal, body: JSON.stringify({ order_id: orderId, ...(confirmPayment ? { confirm_payment: true } : {}) }) })
      if (!response.ok) throw new Error('The order status could not be confirmed. Check your order before trying again.')
      const result = await response.json() as { order_id?: number; status?: string; paid?: boolean }
      if (result.order_id !== orderId) throw new Error('The payment could not be linked to this order.')
      return result
    } finally { clearTimeout(timer) }
  }

  async function waitForPaidOrder(orderId: number) {
    setPhase('Waiting for payment confirmation…')
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const result = await readPaymentStatus(orderId, attempt === 0)
      if (result.paid === true) { finishConfirmed(); window.location.assign('/order-confirmation'); return }
      if (['failed', 'cancelled'].includes(result.status || '')) throw new Error('Your payment was not completed. Try again or use another card.')
      if (attempt < 7) await new Promise((resolve) => window.setTimeout(resolve, 1_500))
    }
    throw new Error('Payment confirmation is still pending. Check your order before trying again.')
  }

  async function submitPayment() {
    if (busyRef.current || disabled || uncertain || invalidTotal || (requiresPayment && (!ready || !complete || !stripeRef.current || !cardRef.current))) return
    busyRef.current = true; setProcessing(true); setPaymentError(null); setPhase('Checking your payment details…'); onBusyChange?.(true)
    let submitted = false
    let knownFailure = false
    let submittedOrderId: number | undefined
    try {
      const bill = billingAddress || address
      let paymentData: Array<{ key: string; value: string }> = []
      if (requiresPayment) {
        const result = await stripeRef.current!.createPaymentMethod({ type: 'card', card: cardRef.current!, billing_details: {
          name: `${bill.first_name} ${bill.last_name}`.trim(), email: address.email, phone: address.phone || undefined,
          address: { line1: bill.address_1, line2: bill.address_2 || undefined, city: bill.city, state: bill.state || undefined, postal_code: bill.postcode, country: bill.country || 'GB' },
        } })
        if (result.error || !result.paymentMethod) throw new Error(result.error?.message || 'Check your card details before continuing.')
        paymentData = [
          { key: 'payment_method', value: 'stripe' }, { key: 'wc-stripe-payment-method', value: result.paymentMethod.id },
          { key: 'wc-stripe-payment-type', value: 'card' }, { key: 'wc_stripe_selected_upe_payment_type', value: 'card' },
          { key: 'wc_payment_intent_id', value: '' }, { key: 'wc-stripe-new-payment-method', value: 'true' }, { key: 'save_payment_method', value: 'no' },
          { key: 'billing_email', value: address.email || '' }, { key: 'billing_first_name', value: bill.first_name }, { key: 'billing_last_name', value: bill.last_name },
          { key: 'billing_address_1', value: bill.address_1 }, { key: 'billing_address_2', value: bill.address_2 || '' }, { key: 'billing_city', value: bill.city },
          { key: 'billing_state', value: bill.state || '' }, { key: 'billing_postcode', value: bill.postcode }, { key: 'billing_country', value: bill.country || 'GB' },
        ]
      }
      setPhase(requiresPayment ? 'Confirming your payment…' : 'Placing your order…')
      // Persist only a pending marker. A lost response must not silently enable a second charge after reload.
      try { sessionStorage.setItem(PAYMENT_PENDING_KEY, JSON.stringify({ startedAt: Date.now() })) } catch {}
      submitted = true
      const controller = new AbortController()
      const timer = window.setTimeout(() => controller.abort(), 45_000)
      let text: string
      let response: Response
      try {
        response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', signal: controller.signal,
          body: JSON.stringify({
            billing_address: { ...bill, email: address.email || '', phone: address.phone || '' },
            shipping_address: { first_name: address.first_name, last_name: address.last_name, address_1: address.address_1, address_2: address.address_2 || '', city: address.city, state: address.state || '', postcode: address.postcode, country: address.country || 'GB', phone: address.phone || '' },
            ...(requiresPayment ? { payment_method: 'stripe', payment_data: paymentData } : {}), expected_total: expectedTotal, expected_revision: expectedRevision,
          }),
        })
        text = await response.text()
      } finally { clearTimeout(timer) }
      if (!response.ok) {
        const error = errorDetails(text)
        knownFailure = !paymentOutcomeIsUncertain(response.status, error.code)
        if (knownFailure) clearPending()
        if (['housefinds_total_changed', 'housefinds_cart_changed', 'housefinds_delivery_changed'].includes(error.code)) await onCartRefresh?.()
        throw new Error(error.message)
      }
      const checkout = JSON.parse(text) as CheckoutResponse
      submittedOrderId = checkout.order_id
      const result = checkout.payment_result || {}
      const details = paymentDetailsToRecord(result.payment_details)
      if (['failure', 'failed'].includes(result.payment_status || '')) { knownFailure = true; clearPending(); throw new Error('Your payment was not completed. Check your card details or try another card.') }
      const secret = stripeAuthenticationSecret(checkout)
      if (secret && requiresPayment) {
        setPhase('Complete your bank’s security check…')
        const confirmation = await stripeRef.current!.confirmCardPayment(secret)
        if (confirmation.error) {
          knownFailure = confirmation.error.type === 'card_error' || ['requires_payment_method', 'canceled'].includes(confirmation.error.payment_intent?.status || '')
          if (knownFailure) clearPending()
          throw new Error(confirmation.error.message || 'Your bank’s authentication could not be completed.')
        }
        const status = confirmation.paymentIntent?.status
        if (!['succeeded', 'requires_capture', 'processing'].includes(status || '')) throw new Error('Your bank’s payment status still needs to be checked.')
        if (checkout.order_id) { await waitForPaidOrder(checkout.order_id); return }
        throw new Error('The payment could not be linked to an order. Contact Housefinds before trying again.')
      }
      if (checkout.order_id && ['processing', 'completed'].includes(checkout.status || '')) {
        finishConfirmed(); window.location.assign('/order-confirmation'); return
      }
      if (checkout.order_id && result.payment_status === 'success') { await waitForPaidOrder(checkout.order_id); return }
      const redirect = result.redirect_url || details.redirect
      if (redirect && isSafePaymentRedirect(redirect, window.location.origin)) { window.location.assign(redirect); return }
      throw new Error('We could not confirm the final order status. Please check the order before trying again.')
    } catch (error) {
      // Some 3DS failures do not include an intent status in Stripe.js's error.
      // Verify the order before allowing another attempt; never infer a decline
      // from a network error or from payment_status="success" alone.
      if (submitted && !knownFailure && submittedOrderId) {
        try {
          const status = await readPaymentStatus(submittedOrderId)
          if (status.paid === true) { finishConfirmed(); window.location.assign('/order-confirmation'); return }
          knownFailure = ['failed', 'cancelled'].includes(status.status || '')
          if (knownFailure) clearPending()
        } catch { /* Keep the uncertain-payment guard when verification fails. */ }
      }
      if (submitted && !knownFailure) { setUncertain(true); setPaymentError(null) }
      else setPaymentError(error instanceof Error ? error.message : 'Payment could not be completed. Check your details and try again.')
      setProcessing(false); busyRef.current = false; onBusyChange?.(false)
    }
  }

  if (uncertain) return <div role="alert" className="rounded-[var(--hf-radius-md)] border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
    <h3 className="font-semibold">Please check your payment before trying again.</h3>
    <p className="mt-2">We did not receive a final result. Your payment may have gone through. A new attempt is paused in this tab to help avoid a duplicate payment.</p>
    <div className="mt-3 flex flex-wrap gap-x-5"><Link href="/order-confirmation" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Check order status</Link><a href="mailto:contact@housefindsstore.com" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Contact support</a></div>
    <p className="mt-2 text-xs">Check your confirmation email as well. If no order appears, contact us before paying again.</p>
  </div>
  if (!activated) return null
  if (requiresPayment && !publishableKey) return <div role="alert" className="rounded-[var(--hf-radius-sm)] border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Card payments are temporarily unavailable. Please try again later or <a href="mailto:contact@housefindsstore.com" className="font-semibold underline">contact Housefinds</a>.</div>
  return <div aria-busy={processing}>
    {requiresPayment ? <>
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[var(--hf-brand-soft)] text-[var(--hf-brand)]"><CreditCardIcon className="size-5" /></span><div><h3 className="text-base font-semibold">Credit or debit card</h3><p className="text-xs leading-5 text-[var(--hf-ink-soft)]">Secure payment through Stripe</p></div></div>
      <div className={`mt-4 min-h-[58px] rounded-[var(--hf-radius-sm)] border bg-white px-4 py-4 focus-within:ring-2 focus-within:ring-[var(--hf-brand)]/20 ${fieldError ? 'border-rose-600' : 'border-[var(--hf-border-strong)]'}`}><div ref={mountRef} className="min-h-6" /></div>
      {!ready && !loadError && <p role="status" className="mt-2 text-sm leading-5 text-[var(--hf-ink-soft)]">Loading secure card fields…</p>}
      {loadError && <div role="alert" className="mt-3 rounded-[var(--hf-radius-sm)] bg-amber-50 p-4 text-sm leading-6 text-amber-950"><p>{loadError}</p><button type="button" disabled={processing} onClick={() => { setLoadError(null); setLoadAttempt((value) => value + 1) }} className="mt-2 min-h-11 font-semibold underline underline-offset-4">Reload secure card fields</button></div>}
      {fieldError && <p role="alert" className="mt-2 text-sm leading-6 text-rose-800">{fieldError}</p>}
    </> : <p className="text-sm leading-6 text-[var(--hf-ink-soft)]">No payment is due. Review your order and confirm below. No card details are needed.</p>}
    {invalidTotal && <p role="alert" className="mt-3 text-sm leading-6 text-amber-950">Review your basket before paying. Orders must remain below £135.</p>}
    {paymentError && <p role="alert" className="mt-3 rounded-[var(--hf-radius-sm)] bg-rose-50 p-4 text-sm leading-6 text-rose-900">{paymentError}</p>}
    <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--hf-border)] pt-5"><div><p className="text-sm font-semibold">Total to {requiresPayment ? 'pay' : 'confirm'}</p><p className="mt-1 text-xs text-[var(--hf-ink-soft)]">GBP · your order total</p></div><strong className="text-2xl font-semibold tracking-[-.035em]" aria-live="polite" aria-atomic="true">{priceLabel}</strong></div>
    <button type="button" disabled={disabled || processing || uncertain || invalidTotal || (requiresPayment && (!ready || !complete || Boolean(loadError)))} onClick={() => void submitPayment()} className="hf-button-primary mt-4 !min-h-14 w-full !leading-6 disabled:cursor-not-allowed disabled:opacity-50 disabled:!transform-none"><LockClosedIcon className="size-4 shrink-0" />{processing ? 'Processing securely…' : requiresPayment ? `Pay ${priceLabel}` : `Place order · ${priceLabel}`}</button>
    {processing && <p role="status" aria-live="polite" className="mt-3 text-center text-sm leading-6 text-[var(--hf-brand)]">{phase} Please keep this page open.</p>}
    <p className="mt-3 text-xs leading-6 text-[var(--hf-ink-soft)]">{requiresPayment && 'Housefinds does not store your card number or security code. '}By placing an order, you agree to the <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--hf-brand)] underline underline-offset-4">Terms of sale</Link> and acknowledge the <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--hf-brand)] underline underline-offset-4">Privacy policy</Link>.</p>
  </div>
}
