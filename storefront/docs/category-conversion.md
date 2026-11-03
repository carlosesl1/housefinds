# Category discovery improvements

The supplied category-page reference informed the `/shop` layout: contextual category imagery, visible delivery/returns/payment information, a two-choice finder, scoped search, desktop sidebar/mobile collapsible filters, clear sorting, factual card labels and category discovery links.

The existing Housefinds palette, real WooCommerce catalogue, GBP pricing and UK operating conditions remain the source of truth. Search, category, budget, availability and ordering compose through URL parameters. Search terms with support intent use the existing customer-care search; internal search results are noindex. Empty selections offer recovery paths.

Shop links disable automatic prefetch. This avoids fetching every filter combination and prevents a reproduced stale category-title transition in the installed Next.js version. The final browser run verifies the destination title and search noindex metadata as well as the visible results.

Quick add is opt-in on shop cards and reuses the existing cart primitive. Only purchasable, in-stock simple products without options/variations and with quantity rules permitting one qualify. Variable products retain their product-page option selection. The current live catalogue consists of products requiring options, so this path is verified with isolated simple-product fixtures. Cards show real option metadata and valid review aggregates only. The reference's bestseller claims, discounts and instalments were not introduced without supporting store data.

## Verification

Banner refinement (4 October 2026): category art now lives in `components/shop/category-banner.tsx` and its own CSS module. The kitchen and organisation scenes use the larger existing masters, integrated into a continuous warm canvas; the heading pairs the existing Inter and Lora families. Mobile has its own image proportions and placement. Overlaid image labels and the old page-local banner rules were removed. Smart Entry selects an actual door product rather than the first item that happens to match an entry keyword; if no matching image is available, the copy fills the space. No new product photography or commercial claims were generated.

The five banners were rendered with the live catalogue at 320, 390, 768, 1440 and 1920px. All 25 combinations passed checks for decoded images, contained text, document overflow, visible keyboard focus and the catalogue CTA. Before/after captures are in ignored `output/playwright/banner-refinement/`. The production build and existing prebuild suites passed after the final banner changes.

- `npm run typecheck` and production build.
- Existing prebuild suites: 12 PDP, 25 checkout, 7 Stripe-response and 31 home checks.
- `npm run test:shop`: 8 catalogue tests for quantity/option safety, badge accuracy, ratings, URL composition, price boundaries and search ordering.
- `node scripts/test-catalog-browser.mjs`: compiled local app at 320, 390, 768 and 1440px; keyboard focus, image decoding, responsive filters, combined filters/sort/search, empty-state recovery, reload, finder navigation, availability, quick-add success/error, cart Escape/focus return and support intent.
- Live catalogue preview: all 21 images decoded at 390 and 1440px. Screenshots are in ignored `output/playwright/housefinds-shop-*.png`; fixture evidence is in `output/playwright/catalog-qa/`.

## Reproduce isolated browser QA (PowerShell)

Run the read-only catalogue fixture in one terminal:

```powershell
node scripts/catalog-fixtures.mjs
```

In another terminal, build/start with the local upstream:

```powershell
$env:WOOCOMMERCE_URL='http://127.0.0.1:4016'
npm run build
npm run start -- --hostname 127.0.0.1 --port 3015
```

Then run `node scripts/test-catalog-browser.mjs`. It uses installed Playwright and Chrome (`QA_BROWSER_CHANNEL` can override the channel). Cart responses are mocked in the browser and checkout requests are blocked. The fixture server rejects writes. No real order or payment is created. These environment overrides are for QA only and are not saved to deployment configuration.
