# Housefinds — redesign local

> A prévia atual está descrita em [redesign-refined.md](redesign-refined.md). Este documento preserva a evidência da rodada anterior.

> Registro da primeira rodada. A evolução contemporânea, referências Shopify, evidências e verificações atuais estão em [redesign-modern.md](redesign-modern.md).

## Scope and baseline
- Source: `headless-storefront`, commit `604e77696af838cf8e688298019e3e5f702c637c`.
- Local work: `codex/housefinds-composition`; no publication.
- The existing review at `.review/LEITURA-DESIGN.md` matches this exact source revision and was reused.
- Before/after evidence lives in `output/playwright/`.
- Same live WooCommerce catalogue, UK copy, palette, Lora, Inter and existing photography. No fabricated commercial content.
- No changes to WooCommerce, DSers, prices, inventory, shipping, payments or orders.

## Direction
A considered home utility shop: large enough photographs to understand the object, direct captions, useful category indexing and quiet horizontal rules. Retain familiar shopping controls.

Confirmed issues: overflowing hero overlay at narrower desktops; competing mosaic cards; repeated headline/description/grid sections; pills used for unrelated roles; mobile opening without visible merchandise. Product grids themselves remain useful.

## Visual references inspected
- [Labour and Wait](https://labourandwait.co.uk/) and its [kitchen catalogue](https://labourandwait.co.uk/collections/kitchen): clear category index, products and prices on an open surface, an identifiable typographic rhythm. Do not borrow its sidebar or deliberately spaced lettering.
- [Objects of Use](https://www.objectsofuse.com/): product-led opening, simple photo captions and an ordered collection index. Borrow the relationship between image and caption, not the whole composition.

## Implementation
1. Hero: one real product; caption and price below its photograph; one primary store action and a quieter popular-products link.
2. Categories: compact illustrated index linked to genuine scoped catalogues.
3. Collection first; budget, featured product and discovery content get distinct, shorter formats.
4. The same rules, image treatment, serif hierarchy and rectangular controls continue through catalogue, PDP and cart.
5. Preserve all existing commerce primitives and test guards; replace only assertions tied to the superseded layout.

## Verification ledger
- `npm run typecheck`: passed. Final `npm run build`: passed, including TypeScript, 22 static pages and all 59 required prebuild checks (12 PDP, 18 checkout, 29 home). Evidence: `output/playwright/build-final.log`.
- `QA_BASE_URL=http://127.0.0.1:3001 node scripts/test-editorial-browser.mjs`: passed at 320, 360, 390, 540, 640, 767, 768, 1024, 1099, 1100, 1440 and 1920px. No horizontal overflow; fonts, heading scale, campaign image/text separation, focus and featured-label contrast verified. Collection checked; checkout remains enclosed and uses Inter. This suite uses a simulated empty cart and blocks checkout submissions.
- Manual Chromium inspection: home and section transitions, catalogue, PDP, menu, gallery, option groups, drawer and full cart at desktop/mobile sizes (1440×1000 and 390×844). Screenshots may omit the browser scrollbar edge.
- Mobile navigation: category link opens the scoped catalogue; Escape closes; Shift+Tab/Tab wrap within the dialog; focus returns to the menu button. The old menu failed the Escape check before editing.
- Desktop search: autocomplete appeared for `door closer`; Enter opened `/search?q=door%20closer` with three results.
- Catalogue: Kitchen Tools scoped to four products; Under £10 applied; price sorting applied; Clear all removed category/price while retaining the chosen sort, matching the existing behaviour.
- Gallery: next button changed photo 1 to 2; enlarged viewer opened; Right changed to photo 3; Escape closed and returned focus to the gallery opener. No horizontal page overflow in the inspected catalogue/PDP.
- Real WooCommerce cart, without any order or payment: Oil Spray Bottle → Standard / 500ml / White → £9.15; add succeeded; quantity 2 produced £18.30; full cart opened; removal returned the session to empty. Screenshots preserve those real amounts.
- Empty-cart keyboard defect reproduced before its fix: Tab could focus the disabled checkout link, and Enter opened checkout. After the fix, `aria-disabled=true`, `tabIndex=-1`, click guard and focus-trap exclusion prevent activation; the final compiled version skips it. Existing £135 restriction remains intact.
- `git diff --check`: passed. Separate Stripe-fixture button-contrast script was aligned with the new catalogue (which has no unrelated filled CTA) and syntax-checked, but not executed in this round.

## Remaining validation and existing issue
- No live checkout submission, payment, order, physical-device touch/swipe test, Safari test, screen-reader audit or full accessibility certification. These are not implied by the build or Chromium checks.
- Existing catalogue inconsistency: the public WooCommerce API returns Motion Sensor LED Bar Light twice, ID 289 at £4.60–£15.93 and ID 122 at £1.84–£6.37. Both have 9 images and 24 variations. The unchanged `dedupeStoreProducts` keeps the first product when richness scores tie, so changing the API sort changes which duplicate is shown. Confirmed with `orderby=menu_order` and `orderby=price`; no price, product or deduplication rule was modified for this visual task.
- Full-page screenshots are unavailable through the active in-app browser capture; the gallery uses matched viewport captures and additional section/interaction images.

## Local delivery
- Store: <http://127.0.0.1:3001/>.
- Before/after gallery: <http://127.0.0.1:3002/>; also saved as `output/playwright/index.html` with adjacent PNGs. Home, catalogue, PDP, menu and empty-cart comparisons use equivalent content and viewport settings.
- Restart store from `storefront`: `npm run start -- --hostname 127.0.0.1 --port 3001` (after `npm run build` if source changes).
- Restart evidence gallery: `node output/playwright/serve-review.mjs`. It only serves the local review HTML/PNGs on loopback.
- `output/` is ignored by Git so evidence cannot accidentally enter a storefront deployment. The new lockfile records dependency versions resolved from the existing manifest. Next.js generated its AGENTS block, TypeScript JSX/include adjustments and next-env declarations.
- No commit, push or deployment performed; WordPress theme and commerce backend left unchanged.

