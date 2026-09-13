# Housefinds Order Bridge

Minimal WordPress/WooCommerce bridge used by the Housefinds headless storefront for customer order tracking.

## What it does

- Adds `POST /wp-json/housefinds/v1/order-status`.
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
