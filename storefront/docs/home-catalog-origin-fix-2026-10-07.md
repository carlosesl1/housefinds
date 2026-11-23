# Homepage catalogue origin correction — 7 October 2026

The public homepage was reproduced in the browser with only the hero, shopping benefits and footer. Category and product sections were absent, with no client console errors. `app/page.tsx` converts a failed catalogue request to an empty array, and the dependent home components return no content for that array.

The public catalogue request at `https://housefindsstore.com/wp-json/wc/store/v1/products?per_page=16` returned HTTP 403. The same request at `https://backend.housefindsstore.com` returned HTTP 200 and 11 published products, with image URLs hosted on the backend subdomain. The local default origin and `.env.local` still used the former domain. The deployed environment variable could not be inspected: Vercel's environment API denied access with HTTP 403. Its current value is unconfirmed.

## Prepared correction

- Updated the default WooCommerce origin in catalogue, cart, checkout, payment-status and order routes, as well as the environment example and local environment.
- Allowed HTTPS images from the backend's `/wp-content/uploads/` directory in Next.js, retaining existing image origins.
- Added `scripts/test-backend-origin.cjs` to exercise catalogue/review request destinations, explicit environment overrides and the actual Next.js image-host matcher. Run it with `node scripts/test-backend-origin.cjs`.

## Initial verification — 7 October 2026

- The new regression failed before the change because the product request used the former origin, and passed after the correction.
- TypeScript and `npm run build` passed, including all existing prebuild product, checkout, home and catalogue checks.
- The compiled local app was checked against the real backend in desktop and 390px mobile layouts. All six home section headings were present; visible product images loaded; there was no horizontal document overflow or console error.
- Category tabs switched product selections; keyboard End selected the final category tab.
- Local evidence: `output/backend-origin-fix/desktop.jpg` and `output/backend-origin-fix/mobile.jpg` (ignored).
- No live order, payment, deployment or production configuration mutation was performed.

## Production resolution — 12 October 2026

- The public fault was still present at the start of this run; production was still on `b643298`.
- The Vercel connector again denied environment-variable access with HTTP 403. The existing authenticated dashboard session worked and showed that `WOOCOMMERCE_URL` was absent. Added it as a Config variable scoped to Production with value `https://backend.housefindsstore.com`; verified the persisted value in the UI.
- Created an isolated worktree from the current production branch and published only the 11 origin/image correction files. Existing local shop, product-card and other redesign work was preserved and excluded.
- The exact release passed `node scripts/test-backend-origin.cjs` and `npm run build`, including all product, checkout, Stripe-card and homepage prebuild checks.
- [PR #4](https://github.com/carlosesl1/housefinds/pull/4) was merged after its Vercel and visual/contrast checks passed. Production commit: `6d9c23cacf274d5dbe138e5b838d9760848de05f`.
- [Production deployment](https://vercel.com/carlosedusl10-7239s-projects/housefinds-storefront/7d7MAXiNWAhrw7pvenQRaZSUNQhW): `dpl_7d7MAXiNWAhrw7pvenQRaZSUNQhW`, READY, assigned to both public domains. [Production CI](https://github.com/carlosesl1/housefinds/actions/runs/38336633857) also passed.

### Public verification

- `https://housefindsstore.com/` redirects to `https://www.housefindsstore.com/`, which returns HTTP 200 with catalogue content and backend image URLs. The public `/api/cart` returns HTTP 200.
- Homepage checked at 1280px desktop and 390px mobile widths: all six home section headings restored, visible product images loaded, no horizontal document overflow, and no browser console errors or warnings.
- Category tabs work; keyboard End selects Daily Helpers. Kitchen Tools opens its actual scoped listing with 4 products. The shop exposes 10 unique products after deduplication of the backend's 11 published records.
- A single White Digital Spoon Scale was selected at £8.67, added to the initially empty cart, shown in the full cart and carried into the checkout summary at the same total. No contact/address data was entered, no order was submitted, and no payment was attempted. The test item was removed and the cart confirmed empty. The empty-checkout guard was verified on mobile.
- Evidence is saved under ignored `output/backend-origin-release-20261012/`: `verification.json`, `vercel-backend-config.jpg`, `public-desktop.jpg`, `public-mobile.jpg`, `public-cart.jpg`, `public-checkout-desktop.jpg`, `public-cart-mobile-empty.jpg`, and `public-checkout-mobile.jpg`.

Catalogue configuration and publication are complete. Payment webhooks and DSers connectivity were not changed or certified by this catalogue correction.
