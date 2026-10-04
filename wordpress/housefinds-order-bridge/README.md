# Housefinds Order Bridge

Minimal WordPress/WooCommerce bridge used by the Housefinds headless storefront for customer order tracking.

## What it does

- Adds `POST /wp-json/housefinds/v1/order-status`.
- Version 0.4.0 also adds `POST /wp-json/housefinds/v1/confirm-stripe-order` for the headless 3DS return step.
- Requires the order number and the billing email to match.
- Returns only customer-facing order status, item, limited delivery and tracking data.
- Reads common WooCommerce shipment-tracking metadata when it is available.
- Does **not** expose WooCommerce REST API credentials, supplier information or payment data.
- Returns the same generic error when the order/email pair does not match.
- Applies a lightweight lookup rate limit.

## Install

1. Zip the `housefinds-order-bridge` folder.
2. In WordPress Admin open **Plugins → Add New → Upload Plugin**.
3. Upload the zip and activate **Housefinds Order Bridge**.
4. Confirm WooCommerce is active.
5. Open the Housefinds frontend `/track-order` page and test a real order number + checkout email.

No API key or configuration screen is required.

## Stripe authentication return

The Next.js server sends the last-order session's order ID, order key and matching billing email. The bridge rejects mismatched credentials and non-Stripe orders, reads the PaymentIntent through the installed Stripe gateway, and proceeds only when Stripe reports `succeeded`. It validates the intent against the order, then invokes the gateway's normal return handler, retaining its settlement lock, stock/email hooks and duplicate guards. It does not create or confirm PaymentIntents, charge cards, change prices or force order statuses. Cancelled/refunded orders are never revived. Paid orders are returned without repeating settlement.

The endpoint returns only the order ID, status and paid flag, with private/no-store caching. Keys stay between Next.js and WooCommerce. Both this plugin and the corresponding storefront update are required for headless 3DS completion.

## Tracking metadata

The bridge currently looks for:

- `_wc_shipment_tracking_items` (WooCommerce Shipment Tracking style data)
- `_tracking_number` / `tracking_number`
- `_tracking_provider` / `tracking_provider`
- `_tracking_link`

If DSers or the installed tracking plugin stores tracking under a different meta key, inspect one fulfilled order and extend `tracking_items()` rather than exposing arbitrary order meta to the frontend.

## Security notes

The endpoint intentionally returns a small response. Do not add billing address, full customer profile, internal notes, supplier IDs or arbitrary order meta to it.

The order number alone is not authentication. The billing email must continue to match before order data is returned.
