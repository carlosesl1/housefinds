# Stripe authentication validation — 3 October 2026

## Current result

Stripe remains in test mode. Card decline, the hosted 3DS challenge, deliberate authentication failure and an immediate retry were exercised through localhost against WooCommerce 11.1.0 and Stripe Gateway 11.0.0. Order 495 was ultimately paid through a deferred webhook at 02:25:10 UTC, approximately three minutes after the retry. The checkout's bounded wait had already expired. The payment succeeded, but immediate confirmation/receipt/cart recovery after 3DS still needs the prepared gateway-return bridge and another integration test. Public Vercel checkout remains unverified.

| Order | Observed result | Cleanup |
| --- | --- | --- |
| 492 | Card ending 0002 declined; retry with 3220 exposed unhandled hosted authentication URL | Cancelled, no paid date or transaction ID |
| 493 | Sanitized server diagnostics confirmed the gateway's hosted Stripe URL format | Cancelled without completing authentication |
| 494 | 3DS displayed; deliberate Fail produced a failed Woo order, but the UI incorrectly stayed blocked | Cancelled, no paid date |
| 495 | Failed 3DS; corrected UI permitted retry in the same tab; Complete accepted; deferred webhook marked processing | Fully refunded through Stripe test refund 496, with restock requested |

All orders use a fictional customer, one product 452 / variation 456 (20 × 30cm), GBP 11.90 and free UK shipping. Each has a private test-only note forbidding DSers purchase or fulfilment. DSers payments remain manual. Refund 496 reported `refunded_payment: true`. No real card, live charge or supplier purchase was used. Do not resubmit or refund order 495 again.

## Changes prepared

- Accept direct intent secrets, gateway confirmation fragments and the observed `https://hooks.stripe.com/3d_secure_2/hosted` response. Validate intent formats and matching IDs; invoke Stripe.js authentication before receipt navigation.
- A successful gateway response alone no longer means a paid order. A session-authenticated status endpoint checks WooCommerce; a pending or unavailable result keeps the duplicate-payment guard.
- On authentication errors without a useful Stripe intent status, consult the authenticated Woo order before enabling retry. The actual failure/retry was verified on order 495.
- Retire only the cart token whose SHA-256 hash was recorded with this order. A later shopping cart is preserved.
- Housefinds Order Bridge 0.4.0 adds a confirmation endpoint requiring the order key and matching email. It reads Stripe through the installed gateway, accepts only an already-succeeded PaymentIntent, validates it against the order and invokes the gateway's normal return handler. No direct paid-status override, new charge, price rule or capture-rule change.
- Next.js calls this bridge only for the explicit authentication-completion step. Subsequent checks are read-only. Order keys remain in the HttpOnly session and server-to-server request.

## Verification

- RED/GREEN: reproduced missed fragment and hosted authentication formats in the actual React submission handler harness. Reproduced the incorrect blocked state after the gateway confirmed authentication failure, then verified recovery both in the harness and actual mobile UI.
- Actual gateway: card decline; 3DS modal displayed at desktop default 1280 × 720 and mobile 390 × 844; Fail; retry; Complete. The mobile challenge fit the viewport and retained accessible controls. Full paid receipt/cart retirement after 3DS is not yet verified.
- Mocked handler checks: known declines; successful retry; response lost after submission; reload retains pending protection; hosted/fragment 3DS; failed authentication; one explicit completion call followed by bounded reads; pending results never repeat checkout or claim payment completion.
- Route checks: wrong/missing order session, mismatched order ID, unavailable Woo, current versus later cart tokens, paid/pending/failed/cancelled/refunded states, server-only confirmation credentials, no repeated settlement.
- `npm run build` passed: 12 PDP + 25 checkout + 7 payment-handler + 31 home checks (75 total), TypeScript and production compilation.
- PHP syntax parsed successfully with `php-parser` in the ignored test directory. The new PHP endpoint has **not** executed on the live backend yet; this is not a PHP runtime or installed-gateway integration pass.

## Access and publication

- Vercel environment listing returned HTTP 403 (`list` / `projectEnvVars`). No variables were changed. The dashboard requires the owner's login.
- The WPVibe CLI emulator supports plugin catalog slugs, not installation from this custom ZIP URL; the attempted URL install returned `Plugin not found`. The WordPress admin upload page also requires login. Installed bridge remains 0.2.0.
- The plugin package is available as a prerelease asset: [Housefinds Order Bridge 0.4.0](https://github.com/carlosesl1/housefinds/releases/tag/housefinds-order-bridge-v0.4.0). It is prepared for sandbox integration validation, not evidence of deployment.
- Branch: `codex/stripe-authentication`. Keep the PR as a draft until the installed gateway completes 3DS and the test order is cleaned up. The production storefront has not received this branch.

## Continue after owner login

1. Upload/replace the existing Housefinds Order Bridge with 0.4.0 in WordPress and confirm it remains active. Check wrong key/email rejection without changing an order.
2. Verify that repeated authenticated confirmation of already-refunded order 495 leaves it refunded and performs no settlement. Never purchase or pay it in DSers.
3. Run a fresh local challenge through automatic confirmation, inspect receipt and empty cart, verify idempotency, then refund/restock and reconcile variation 456 stock (baseline 76).
4. Set Vercel production `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to the same Woo test account's `pk_test_` key; keep secret keys on WooCommerce. Rebuild after the environment change.
5. Publish only after installed-gateway validation; then repeat decline, 3DS and recovery at the public storefront and clean up those test orders.

## Evidence

Ignored local files under `output/stripe-test/`:

- `order-492-declined-desktop.png`
- `3ds-challenge-desktop.png`
- `3ds-challenge-mobile.png`
- `order-495-3ds-failed-mobile.png`
- `housefinds-order-bridge-0.4.0.zip`

References: [Stripe test cards](https://docs.stripe.com/testing), [Stripe gateway return handler](https://github.com/woocommerce/woocommerce-gateway-stripe/blob/11.0.0/includes/payment-methods/class-wc-stripe-upe-payment-gateway.php), [gateway order confirmation controller](https://github.com/woocommerce/woocommerce-gateway-stripe/blob/11.0.0/includes/class-wc-stripe-intent-controller.php).
