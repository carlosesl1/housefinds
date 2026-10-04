type PaymentDetails = Array<{ key?: string; value?: string }> | Record<string, unknown> | undefined
export type CheckoutResponse = { order_id?: number; status?: string; payment_result?: { payment_status?: string; payment_details?: PaymentDetails; redirect_url?: string } }

export function paymentDetailsToRecord(details: PaymentDetails): Record<string, string> {
  if (Array.isArray(details)) return Object.fromEntries(details.filter((entry) => entry?.key).map((entry) => [entry.key!, String(entry.value || '')]))
  if (details && typeof details === 'object') return Object.fromEntries(Object.entries(details).map(([key, value]) => [key, String(value ?? '')]))
  return {}
}

export function stripeAuthenticationSecret(checkout: CheckoutResponse): string | null {
  const details = paymentDetailsToRecord(checkout.payment_result?.payment_details)
  let secret = details.payment_intent_secret || details.client_secret || ''
  const redirect = checkout.payment_result?.redirect_url || details.redirect || ''
  // Gateway 11 deferred intents encode the authentication step in this fragment.
  // It is an instruction for Stripe.js, not a navigation to a receipt.
  if (redirect.startsWith('#wc-stripe-confirm-')) {
    const match = /^#wc-stripe-confirm-pi:(\d+):(pi_[a-zA-Z0-9]+_secret_[a-zA-Z0-9]+):([a-zA-Z0-9]+)$/.exec(redirect)
    if (!match || Number(match[1]) !== checkout.order_id) throw new Error('The payment authentication response could not be verified. Check your order before trying again.')
    secret = match[2]
  } else if (redirect.startsWith('#confirm-pi-')) {
    secret = redirect.slice('#confirm-pi-'.length).split(':')[0]
  } else if (redirect.startsWith('https://hooks.stripe.com/')) {
    // The installed gateway also returns Stripe's hosted 3DS URL. Hand its
    // authenticated intent back to Stripe.js so checkout stays on this site.
    const url = new URL(redirect)
    if (url.origin === 'https://hooks.stripe.com' && url.pathname === '/3d_secure_2/hosted') {
      secret = url.searchParams.get('payment_intent_client_secret') || ''
      if (!secret || secret.split('_secret_')[0] !== url.searchParams.get('payment_intent')) throw new Error('The payment authentication response could not be verified. Check your order before trying again.')
    }
  }
  if (secret && !/^pi_[a-zA-Z0-9]+_secret_[a-zA-Z0-9]+$/.test(secret)) throw new Error('The payment authentication response could not be verified. Check your order before trying again.')
  return secret || null
}
