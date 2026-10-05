# Stripe deployment validation — 4 October 2026 (São Paulo)

## Configuration and installed gateway

- Owner authenticated WordPress and Vercel. Updated the existing Housefinds Order Bridge from 0.2.0 to 0.4.0 through WordPress Upload Plugin; active version verified. WooCommerce 11.1.0 / Stripe Gateway 11.0.0.
- Stripe `testmode=yes`. Saved production `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` on Vercel, verified against the WooCommerce test publishable key by SHA-256 equality. No secret key or live payment mode changed. Deployment must rebuild before the public UI uses it.
- Bridge runtime checks: wrong order key and wrong billing email each return generic 404. Two valid confirmations of refunded order 495 preserve `refunded`, `paid=false`.

## Local integration

| Order | Result | Cleanup |
| --- | --- | --- |
| 498 | Existing checkout tab completed 3DS but exhausted its confirmation wait. A subsequent direct bridge check returned paid. This attempt does not establish successful automatic UI completion. | Stripe sandbox refund 499, £11.90, restock; stock verified back at 76. |
| 500 | Fresh checkout session completed 3DS. Automatic status call read pending in 210 ms; gateway confirmation returned 200 in 3,581 ms; receipt followed and cart drawer showed empty / £0.00. No manual confirmation preceded the receipt. | Stripe sandbox refund 501, £11.90, restock requested. |

Both orders used fictional details and one product 452 / variation 456, £11.90, free UK delivery. Private notes forbid purchase/payment/fulfilment through DSers. Repeat bridge confirmation of paid order 500 returned processing/paid without another payment. Temporary sanitized diagnostics were removed; payment code is unchanged from the previously tested commit 431beff.

Reused valid verification: 75 automated checks, production build/TypeScript, PR contrast check and Vercel preview passed. No payment source changes after those checks. Unrelated local catalog work is excluded from this PR.

Evidence (ignored local output): `output/stripe-test/vercel-stripe-sandbox-config.png`, `output/stripe-test/order-500-3ds-confirmed-desktop.png`.

## Public integration

Pending deployment and public browser tests: decline, 3DS failure, recovery, 3DS success, receipt and cart retirement. No public pass is claimed yet.

References: [Stripe testing](https://docs.stripe.com/testing), [gateway return handler 11.0.0](https://github.com/woocommerce/woocommerce-gateway-stripe/blob/11.0.0/includes/payment-methods/class-wc-stripe-upe-payment-gateway.php).
