# Hybrid editorial campaigns — finishing pass

## Layout and typography

Home placements, native whole-banner links, the three campaign destinations and the strict under-20 predicate remain unchanged. Cormorant Garamond is page-scoped to Home and the Under £20 collection with preload enabled; only Inter remains in the root layout. The --hf-font-editorial alias is rebound on .hf-editorial-scope so it resolves the page's Next font rather than inheriting a root-level Georgia fallback. Hero, section headings, the dark Featured Find heading and the destination collection heading share the editorial family. Product names, prices, navigation, fields and checkout stay in Inter.

Featured Find now uses explicit dark-surface CSS variables and component-scoped foregrounds rather than conflicting colour utilities on .hf-eyebrow. Its body, metadata, action, price and keyboard focus have explicit contrasting colours. Mobile media uses a bounded aspect ratio instead of a fixed 480px minimum.

## Image versus code

The three existing illustrative scene masters are retained. Native picture/source art direction selects a dedicated 720x600 mobile WebP rather than cropping the desktop bitmap blindly in CSS. scripts/prepare-campaign-art.cjs deterministically creates the three mobile files before development and test/build, with per-scene focal regions and an integrity/size manifest. It uses only versioned local assets and does not contact an image provider. Source and mobile image candidates remain lazy; the browser selects one picture source.

Titles, copy, actions, accessible names, prices/promises and icons remain live HTML/CSS/SVG. Desktop feature labels are campaign-specific; the secondary feature row is hidden on mobile to avoid repeating filler and increasing scrolling.

## Art limitation, not silently marked complete

The approved generated scenes are collection inspiration, not photographs of the exact models sold. This pass does not claim to have re-photographed or composited the actual catalogue products. The visible illustration disclosure remains. The live Woo catalogue was read to review the available media; the displayed concept objects differ from actual models, so final product-faithful lifestyle art remains a separate asset-production task. Exact product photographs on cards and PDPs are not replaced. No new reviews, sales claims, operational promises, stock or pricing changes are made.

## Verification

npm run test:home prepares mobile WebPs and runs deterministic price, availability, source selection, accessible structure, text/image separation, font scope and TSX checks. Existing PDP and checkout suites remain in prebuild.

The editorial-qa workflow builds the actual Next app with read-only local commerce fixtures and runs Chromium at 320, 360, 390, 540, 768, 1024, 1100, 1440 and 1920px. Tests require loaded Cormorant/Inter FontFace records, not just a fallback CSS declaration, verify picture currentSrc, text bounds, focus and dark-label contrast, and compare Home/checkout font preloads. Results and screenshots are CI artifacts. These are not physical-device tests, production checkout tests, or evidence that the illustrative scene objects are the sold products.
