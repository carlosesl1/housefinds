# Checkout refinement

The reference is adapted to the UK storefront, not copied as a Brazil-specific checkout. Guest purchase stays the default. No PIX, instalments, express delivery, preselected upsells, marketing recovery emails, wallet methods or unsupported security badges were introduced.

## UX
- Compact enclosed header, three meaningful stages, editable saved-address summary, one responsive order-summary instance and distinct loading/connection/empty states.
- Six default contact/address fields, browser autocomplete, 16px text inputs, optional apartment/county/phone controls, postcode formatting (not an address-finder service).
- Separate UK billing address when needed. Every shipping package needs a selected available rate. Delivery timing remains an estimate.
- Coupon errors stay beside the coupon form. Totals include actual fees/tax/discount from Woo. Basket changes require reconfirming the total.
- Draft contact/address details use a field allowlist and sessionStorage with a 30-minute restore window, scoped to the basket. No card data or payment secret is persisted. Successful confirmation clears the draft. No promise of a seven-day basket reservation.

## Payment
- Existing installed gateway: Stripe card, confirmed read-only through WooCommerce. Gateway payment_data keys are retained. No live configuration changes.
- A synchronous submit latch and disabled editing during submission limit accidental duplicate requests in the current page. A pending marker blocks a blind repeat in the same tab after an uncertain result or reload; it does not claim global/distributed idempotency.
- Stripe fields initialise on entering payment, use the actual ready event, and offer a loader retry. Known declines remain distinct from uncertain transport outcomes. No automatic retry of checkout POST.
- Server checks authoritative total, currency, basket revision, saved billing/delivery and all shipping rates before submitting to Woo. Response body omits order_key; order-session data stays in the existing HttpOnly cookie.
- Zero-due orders rely on Woo's needs_payment flag and skip payment data.

## Validation
`npm run test:checkout` runs helper, mocked server-route and TSX syntax checks. The isolated Chromium suite is configured in GitHub Actions at 390px and 1440px. Browser tests intercept ALL commerce and Stripe calls, run only against localhost, and create no real orders or payments. Screenshots/reports are test fixtures, not production checkout captures. Compilation and these checks do not replace test-mode gateway authorisation, 3DS, webhook, email and refund validation with the installed payment account. That remains pending; no real card was charged.

## Remaining external work
Paid/authorised address lookup service, actual wallet/payment enablement, operational delivery/returns setup, seller details, VAT decisions and consented marketing recovery are separate tasks. Keep them out of UI promises until implemented and verified.
