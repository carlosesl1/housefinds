# Housefinds Storefront — Agent Rules

## Architecture
- WordPress/WooCommerce/DSers are the commerce backend. Do not duplicate product, inventory, order, or supplier truth in Next.js.
- Next.js owns the customer-facing experience.
- Prefer WooCommerce Store API for public commerce flows. Keep server-only secrets and privileged WooCommerce REST credentials out of client bundles.
- Cart state uses the WooCommerce Cart-Token persisted as an HttpOnly cookie through Next.js route handlers.

## Product experiences
- Every product must work with `DefaultProduct`.
- Winning products may be mapped in `experiences/registry.ts` to a bespoke React experience.
- Bespoke experiences must reuse commerce primitives rather than reimplementing cart, price, inventory, checkout, variants, or order logic.

## Design
- Brand: Housefinds.
- Positioning: clever, useful, differentiated products for a better home.
- Visual language: clean, editorial, airy, premium, warm-neutral backgrounds, charcoal typography, muted sage green accents.
- Avoid generic dropshipping aesthetics, countdown spam, fake urgency, excessive badges, neon gradients, clutter, or fake reviews.
- Product imagery and real WooCommerce data should drive the experience.

## Safety
- Never commit API secrets, WordPress passwords, application passwords, Stripe secrets, DSers credentials, or customer data.
- Never change the existing WordPress theme files from storefront tasks unless explicitly requested.
- Checkout/payment changes require explicit validation against the installed WooCommerce gateway before production use.
