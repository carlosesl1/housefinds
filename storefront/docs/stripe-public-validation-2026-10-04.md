# Stripe deployment validation — 4 October 2026 (São Paulo)

## Configuration and installed gateway

- Owner authenticated WordPress and Vercel. Updated the existing Housefinds Order Bridge from 0.2.0 to 0.4.0 through WordPress Upload Plugin; active version verified. WooCommerce 11.1.0 / Stripe Gateway 11.0.0.
- Stripe `testmode=yes`. Saved production `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` on Vercel, verified against the WooCommerce test publishable key by SHA-256 equality. No secret key or live payment mode changed. Deployment must rebuild before the public UI uses it.
- Bridge runtime checks: wrong order key and wrong billing email each return generic 404. Two valid confirmations of refunded order 495 preserve `refunded`, `paid=false`.

## Local integration

| Order | Result | Cleanup |
| --- | --- | --- |
| 498 | Existing checkout tab completed 3DS but exhausted its confirmation wait. A subsequent direct bridge check returned paid. This attempt does not establish successful automatic UI completion. | Stripe sandbox refund 499, £11.90, restock; stock verified back at 76. |
| 500 | Fresh checkout session completed 3DS. Automatic status call read pending in 210 ms; gateway confirmation returned 200 in 3,581 ms; receipt followed and cart drawer showed empty / £0.00. No manual confirmation preceded the receipt. | Stripe sandbox refund 501, £11.90, stock restored to 76. |

Both orders used fictional details and one product 452 / variation 456, £11.90, free UK delivery. Private notes forbid purchase/payment/fulfilment through DSers. Repeat bridge confirmation of paid order 500 returned processing/paid without another payment. Temporary sanitized diagnostics were removed; payment code is unchanged from the previously tested commit 431beff.

Reused valid verification: 75 automated checks, production build/TypeScript, PR contrast check and Vercel preview passed. No payment source changes after those checks. Unrelated local catalog work is excluded from this PR.

Evidence (ignored local output): `output/stripe-test/vercel-stripe-sandbox-config.png`, `output/stripe-test/order-500-3ds-confirmed-desktop.png`.

## Public integration

- PR #3 merged into `headless-storefront`: `b643298986a42ec45fc81625b797c7dc00e779d0`. Vercel production deployment `dpl_3xFFxuxE4RgVFvvRUstQeJqSNhCi` is READY and aliased to `https://housefinds-storefront.vercel.app`.
- Tested the rebuilt public checkout at 390 × 844 using fictional `checkout-public@example.com` details, product 452 / variation 456, quantity 1, £11.90, free UK delivery.
- Order 502: Stripe test card ending 0002 declined; Woo recorded failed / no paid date. The UI retained details and enabled another attempt.
- In the same tab, changed to test card ending 3220. The 3DS challenge rendered within the mobile viewport. Chose Fail: Woo recorded SCA authentication failure; the UI displayed an error and re-enabled Pay. Stripe's error localized to the browser's Portuguese language, while storefront copy remained English.
- Retried in the same tab, completed the new 3DS challenge and reached `Order confirmed.` automatically. Woo status was processing, paid at 2026-10-05 01:02:32 UTC. The cart drawer showed empty / £0.00. No direct bridge request, manual status override or second tab was used to obtain this public result.
- Refunded order 502 through Stripe sandbox refund 503 (`refunded_payment=true`, £11.90) and restored its one unit. Reloaded the public receipt at desktop size and verified `Refunded.`. Viewport override reset.
- Final reconciliation: orders 498, 500 and 502 all refunded; variation 456 stock 76 / in stock, matching the initial baseline. Test-only private notes remain; no DSers purchase, supplier payment or fulfilment action.

Additional evidence in `output/stripe-test/`: `order-502-public-card-declined-mobile.png`, `order-502-public-3ds-mobile.png`, `order-502-public-3ds-failed-mobile.png`, `order-502-public-confirmed-mobile.png`, `order-502-public-empty-cart-mobile.png`, `order-502-public-refunded-desktop.png`.

## Boundaries

Stripe remains in sandbox. These checks do not validate live charges, actual bank payouts, real customer email delivery or supplier fulfilment. The existing-tab wait seen in order 498 remains an observed development-session limitation; the fresh local and deployed public flows passed without a payment-code change. All runtime payment code matches the source validated by the successful build and 75 automated checks; the post-deployment update changes documentation only.

References: [Stripe testing](https://docs.stripe.com/testing), [gateway return handler 11.0.0](https://github.com/woocommerce/woocommerce-gateway-stripe/blob/11.0.0/includes/payment-methods/class-wc-stripe-upe-payment-gateway.php).
