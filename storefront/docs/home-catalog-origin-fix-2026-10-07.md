# Homepage catalogue origin correction — 7 October 2026

The public homepage was reproduced in the browser with only the hero, shopping benefits and footer. Category and product sections were absent, with no client console errors. `app/page.tsx` converts a failed catalogue request to an empty array, and the dependent home components return no content for that array.

The public catalogue request at `https://housefindsstore.com/wp-json/wc/store/v1/products?per_page=16` returned HTTP 403. The same request at `https://backend.housefindsstore.com` returned HTTP 200 and 11 published products, with image URLs hosted on the backend subdomain. The local default origin and `.env.local` still used the former domain. The deployed environment variable could not be inspected: Vercel's environment API denied access with HTTP 403. Its current value is unconfirmed.

## Prepared correction

- Updated the default WooCommerce origin in catalogue, cart, checkout, payment-status and order routes, as well as the environment example and local environment.
- Allowed HTTPS images from the backend's `/wp-content/uploads/` directory in Next.js, retaining existing image origins.
- Added `scripts/test-backend-origin.cjs` to exercise catalogue/review request destinations, explicit environment overrides and the actual Next.js image-host matcher. Run it with `node scripts/test-backend-origin.cjs`.

## Verification

- The new regression failed before the change because the product request used the former origin, and passed after the correction.
- TypeScript and `npm run build` passed, including all existing prebuild product, checkout, home and catalogue checks.
- The compiled local app was checked against the real backend in desktop and 390px mobile layouts. All six home section headings were present; visible product images loaded; there was no horizontal document overflow or console error.
- Category tabs switched product selections; keyboard End selected the final category tab.
- Local evidence: `output/backend-origin-fix/desktop.jpg` and `output/backend-origin-fix/mobile.jpg` (ignored).
- No live order, payment, deployment or production configuration mutation was performed.

## Production step still required

Set production `WOOCOMMERCE_URL=https://backend.housefindsstore.com` and deploy the code containing the image-host correction. An existing environment override takes precedence over the corrected code default. Verify the official-domain homepage, product images and catalogue after deployment. The new backend origin does not itself verify payment webhooks or DSers connectivity; those remain covered by the separate migration checklist.
