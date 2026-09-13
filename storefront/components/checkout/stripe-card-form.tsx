'use client'

import { useEffect, useRef, useState } from 'react'
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import type { CheckoutAddress } from '@/store/cart'

type StripeError = { message?: string }
type StripeCardElement = {
  mount: (target: HTMLElement) => void
  unmount: () => void
  on: (event: 'change', callback: (event: { complete: boolean; error?: StripeError }) => void) => void
}
type StripeInstance = {
  elements: (options?: Record<string, unknown>) => { create: (type: 'card', options?: Record<string, unknown>) => StripeCardElement }
  createPaymentMethod: (data: Record<string, unknown>) => Promise<{ paymentMethod?: { id: string }; error?: StripeError }>
  confirmCardPayment: (clientSecret: string) => Promise<{ paymentIntent?: { status: string }; error?: StripeError }>
}

declare global {
  interface Window { Stripe?: (publishableKey: string) => StripeInstance }
}

type PaymentDetail = { key?: string; value?: string }
type PaymentDetails = PaymentDetail[] | Record<string, unknown> | undefined
type CheckoutResponse = {
  order_id?: number
  order_number?: string
  order_key?: string
  status?: string
  payment_result?: { payment_status?: string; payment_details?: PaymentDetails; redirect_url?: string }
}

const UK_LAUNCH_ORDER_LIMIT_MINOR = 13_500
let stripeScriptPromise: Promise<void> | null = null

function loadStripeScript() {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.Stripe) return Promise.resolve()
  if (stripeScriptPromise) return stripeScriptPromise
  stripeScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Stripe.js could not be loaded.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Stripe.js could not be loaded.'))
    document.head.appendChild(script)
  })
  return stripeScriptPromise
}

function paymentDetailsToRecord(details: PaymentDetails) {
  if (Array.isArray(details)) {
    return details.reduce<Record<string, string>>((record, entry) => {
      if (entry?.key) record[entry.key] = String(entry.value ?? '')
      return record
    }, {})
  }
  if (details && typeof details === 'object') {
    return Object.entries(details).reduce<Record<string, string>>((record, [key, value]) => {
      record[key] = typeof value === 'string' ? value : String(value ?? '')
      return record
    }, {})
  }
  return {}
}

function checkoutErrorMessage(text: string, fallback: string) {
  try {
    const parsed = JSON.parse(text) as { message?: string; data?: { message?: string } }
    return parsed.message || parsed.data?.message || fallback
  } catch {
    return text || fallback
  }
}

function paymentLabel(totalMinor: string) {
  const amount = Number(totalMinor || 0) / 100
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
}

export function StripeCardForm({ address, expectedTotal, disabled }: { address: CheckoutAddress; expectedTotal: string; disabled: boolean }) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  const mountRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<StripeCardElement | null>(null)
  const stripeRef = useRef<StripeInstance | null>(null)
  const [ready, setReady] = useState(false)
  const [complete, setComplete] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const exceedsLaunchLimit = Number(expectedTotal || 0) >= UK_LAUNCH_ORDER_LIMIT_MINOR

  useEffect(() => {
    if (!publishableKey || !mountRef.current) return
    let disposed = false
    void loadStripeScript().then(() => {
      if (disposed || !window.Stripe || !mountRef.current) return
      const stripe = window.Stripe(publishableKey)
      const elements = stripe.elements({ locale: 'en-GB' })
      const card = elements.create('card', {
        hidePostalCode: true,
        style: {
          base: { color: '#172018', fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', fontSize: '16px', lineHeight: '24px', '::placeholder': { color: '#9a9d99' }, iconColor: '#557562' },
          invalid: { color: '#9f3f3f', iconColor: '#9f3f3f' },
        },
      })
      card.mount(mountRef.current)
      card.on('change', (event) => { setComplete(event.complete); setError(event.error?.message || null) })
      stripeRef.current = stripe
      cardRef.current = card
      setReady(true)
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Stripe.js could not be loaded.'))
    return () => {
      disposed = true
      cardRef.current?.unmount()
      cardRef.current = null
      stripeRef.current = null
    }
  }, [publishableKey])

  const submitPayment = async () => {
    const stripe = stripeRef.current
    const card = cardRef.current
    if (!stripe || !card || processing || disabled || exceedsLaunchLimit) return
    setProcessing(true)
    setError(null)

    try {
      const paymentMethodResult = await stripe.createPaymentMethod({
        type: 'card',
        card,
        billing_details: {
          name: `${address.first_name} ${address.last_name}`.trim(),
          email: address.email,
          phone: address.phone || undefined,
          address: { line1: address.address_1, line2: address.address_2 || undefined, city: address.city, state: address.state || undefined, postal_code: address.postcode, country: address.country || 'GB' },
        },
      })
      if (paymentMethodResult.error || !paymentMethodResult.paymentMethod) throw new Error(paymentMethodResult.error?.message || 'Your card details could not be validated.')

      const paymentMethodId = paymentMethodResult.paymentMethod.id
      const paymentData = [
        { key: 'payment_method', value: 'stripe' },
        { key: 'wc-stripe-payment-method', value: paymentMethodId },
        { key: 'wc-stripe-payment-type', value: 'card' },
        { key: 'wc_stripe_selected_upe_payment_type', value: 'card' },
        { key: 'wc_payment_intent_id', value: '' },
        { key: 'wc-stripe-new-payment-method', value: 'true' },
        { key: 'save_payment_method', value: 'no' },
        { key: 'billing_email', value: address.email || '' },
        { key: 'billing_first_name', value: address.first_name },
        { key: 'billing_last_name', value: address.last_name },
        { key: 'billing_address_1', value: address.address_1 },
        { key: 'billing_address_2', value: address.address_2 || '' },
        { key: 'billing_city', value: address.city },
        { key: 'billing_state', value: address.state || '' },
        { key: 'billing_postcode', value: address.postcode },
        { key: 'billing_country', value: address.country || 'GB' },
      ]
      const shippingAddress = { first_name: address.first_name, last_name: address.last_name, address_1: address.address_1, address_2: address.address_2 || '', city: address.city, state: address.state || '', postcode: address.postcode, country: address.country || 'GB', phone: address.phone || '' }

      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ billing_address: address, shipping_address: shippingAddress, payment_method: 'stripe', payment_data: paymentData, expected_total: expectedTotal }),
      })
      const text = await checkoutResponse.text()
      if (!checkoutResponse.ok) throw new Error(checkoutErrorMessage(text, `Payment could not be processed (${checkoutResponse.status}).`))

      const checkout = JSON.parse(text) as CheckoutResponse
      const paymentResult = checkout.payment_result || {}
      const details = paymentDetailsToRecord(paymentResult.payment_details)
      if (paymentResult.payment_status === 'failure' || paymentResult.payment_status === 'failed') throw new Error(details.errorMessage || 'Stripe could not process this payment.')

      const intentSecret = details.payment_intent_secret || details.client_secret
      if (intentSecret) {
        const confirmation = await stripe.confirmCardPayment(intentSecret)
        if (confirmation.error) throw new Error(confirmation.error.message || 'Card authentication failed.')
        if (details.verification_endpoint) {
          window.location.assign(details.verification_endpoint)
          return
        }
      }

      if (paymentResult.payment_status === 'success' && checkout.order_id) {
        window.location.assign('/order-confirmation')
        return
      }

      const redirect = paymentResult.redirect_url || details.redirect
      if (redirect) {
        window.location.assign(redirect)
        return
      }

      if (checkout.order_id) {
        window.location.assign('/order-confirmation')
        return
      }

      throw new Error('The payment was accepted but no order confirmation was returned. Please contact support before trying again.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Payment could not be completed.')
      setProcessing(false)
    }
  }

  if (!publishableKey) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Stripe is connected in WooCommerce.</strong><p className="mt-1">The storefront still needs the Stripe publishable key in Vercel before card fields can be displayed. No secret key is required here.</p></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#e7eee9] text-[#456b55]"><CreditCardIcon className="size-5" /></span><div><p className="font-semibold">Credit or debit card</p><p className="text-xs text-black/42">Securely processed by Stripe</p></div></div>
        <div className="flex gap-1 text-[9px] font-bold tracking-wide text-black/40"><span className="rounded bg-[#f1f1ed] px-2 py-1">VISA</span><span className="rounded bg-[#f1f1ed] px-2 py-1">MC</span><span className="rounded bg-[#f1f1ed] px-2 py-1">AMEX</span></div>
      </div>

      {exceedsLaunchLimit && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>This order is above the Housefinds launch limit.</strong><p className="mt-1">Please keep the basket below £135 by removing an item or reducing quantity before paying.</p></div>}

      <div className="mt-5 rounded-2xl border border-black/10 bg-white px-4 py-[15px] shadow-inner"><div ref={mountRef} className="min-h-6" /></div>
      {!ready && !error && <p className="mt-3 text-xs text-black/42">Loading secure card fields…</p>}
      {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-800">{error}</p>}

      <button type="button" disabled={disabled || processing || !ready || !complete || exceedsLaunchLimit} onClick={() => void submitPayment()} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#355f4a] px-7 font-semibold text-white transition hover:bg-[#294b3a] disabled:cursor-not-allowed disabled:opacity-45"><LockClosedIcon className="size-4" />{processing ? 'Processing securely…' : `Pay ${paymentLabel(expectedTotal)}`}</button>
      <p className="mt-3 text-center text-xs leading-5 text-black/38">Card details are sent directly to Stripe and never pass through Housefinds servers.</p>
    </div>
  )
}
