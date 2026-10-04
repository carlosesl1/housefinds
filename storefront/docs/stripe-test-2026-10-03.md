# Stripe sandbox verification — 3 October 2026

## Result

Two guest card checkouts completed through the local Next.js storefront and the installed WooCommerce Stripe Gateway 11.0.0. The owner confirmed that DSers supplier payments are manual. No supplier purchase was made and Stripe remains in test mode.

| Test | Woo order | Amount | Payment | Cleanup |
| --- | --- | --- | --- | --- |
| Initial desktop checkout | 488 | GBP 11.90 | Captured; processing | Full Stripe test refund 489; restocked |
| Mobile regression checkout | 490 | GBP 11.90 | Captured; processing | Full Stripe test refund 491; restocked |

The official Stripe test Visa ending 4242 and a fictional UK address were used. Both refund responses reported `refunded_payment: true`; both orders subsequently reported `refunded`. The selected variation (456, product 452, 20 × 30cm) returned to its initial stock of 76. Test-only notes instruct operators not to purchase or fulfil these orders through DSers. Test records remain in WooCommerce for traceability.

Dates above use America/Sao_Paulo. The corresponding backend timestamps fall on 4 October UTC.

## Defects reproduced and corrected

- The first successful payment reached a receipt that crashed because WooCommerce returned `item_data` keyed by metadata ID. The receipt now accepts both arrays and keyed objects, renders the selected option, and strips metadata markup. The second payment reached the receipt automatically without an error.
- A paid cart still contained its purchased item. After a confirmed `processing` or `completed` response, the browser cart token is retired; pending, on-hold and failed payments keep their cart. The second checkout opened an empty cart after success.
- Refunded orders still showed future dispatch stages. Receipt and tracking views now respect stopped order statuses. On-hold orders are not marked as preparing; unconfirmed payments do not emit purchase analytics.
- The installed order lookup bridge returned internal stock metadata as variations (`_reduced_stock`, `_restock_refunded_items`). The storefront filters underscore-prefixed metadata. The current bridge also omits the purchased size from its lookup response; the receipt displays the size correctly. Updating the backend bridge remains a separate follow-up.
- The receipt no longer asserts that a confirmation email was delivered without delivery evidence.

## Verified

- Test OAuth connection and test publishable key; live connection remains disconnected.
- Real installed gateway accepted both UI checkouts. Customer currency and total stayed GBP 11.90, with free shipping.
- WooCommerce reported successful processing of the latest test webhook after each charge. Its status message also showed approximately three pending webhooks at the observation time; the entire event queue was not audited.
- Order notes recorded charge completion and WooCommerce email dispatch. Receipt of those emails in an inbox was not tested.
- Guest lookup accepted the matching order/email and rejected a wrong email.
- Mobile checkout at a 390px viewport, receipt and cart interactions; desktop tracking at 1440px. The mobile receipt had no horizontal document overflow. Captures inspected for the affected views, not a new site-wide visual audit.
- Refunded lookup no longer displays delivery estimates, future dispatch stages or internal stock values.
- `npm run build` passed, including TypeScript, 12 PDP checks, 21 checkout checks and 31 home checks. Regression assertions were observed failing before the corresponding corrections and passing afterward.

## Boundaries and remaining work

- The payment flow above ran at `http://127.0.0.1:3001`, against the WooCommerce backend in test mode. It is not evidence of a successful public Vercel checkout.
- Vercel's environment listing returned HTTP 403 (`list`, `projectEnvVars`). No Vercel environment variables were changed. The public test key and deployment configuration still require authorized project access and a public checkout verification.
- Challenge-based 3DS and card declines were not exercised against the gateway. Unit checks cover preserving pending carts, not completion of a 3DS challenge.
- Live Stripe activation, actual inbox delivery, DSers supplier payment/fulfilment and real carrier tracking remain unverified.
- No pricing, tax, shipping, payment capture or supplier rules were changed.

## Local evidence (ignored by Git)

- `output/stripe-test/order-488-confirmed-desktop.png`
- `output/stripe-test/checkout-mobile-2026-10-03.png`
- `output/stripe-test/order-490-confirmed-mobile.png`
- `output/stripe-test/order-490-refunded-tracking-desktop.png`

## Official references

- [Stripe testing](https://docs.stripe.com/testing)
- [WooCommerce order refunds API](https://developer.woocommerce.com/docs/apis/rest-api/v3/order-refunds)
- [Installed gateway version source](https://github.com/woocommerce/woocommerce-gateway-stripe/blob/11.0.0/includes/payment-methods/class-wc-stripe-upe-payment-gateway.php)
