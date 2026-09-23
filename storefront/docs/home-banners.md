# Housefinds hybrid editorial campaigns

## Art versus live content

The three approved campaign themes are retained. Kitchen and organisation campaigns finish the existing product showcase; the under-20 campaign remains inside the category section. No extra standalone section is inserted between the hero and categories.

Each campaign uses a single photographic scene cropped from the artwork approved in this conversation, with the campaign heading, body copy, logo, CTA and feature labels removed by cropping. Decorative writing on objects in the photographed scene is nonessential. Headlines, descriptions, the under-20 price promise, CTA, feature icons, accessible link names, hover and keyboard focus are real HTML/SVG/CSS. There are no text-as-image buttons, nested links, Polaroid frames or catalogue photo collages. The whole banner remains a native link.

Lifestyle scenes are illustrative collection inspiration, not exact products or a claim that every object depicted is sold. A visible sentence below each campaign group explains this distinction. Exact-product photographs and product data remain unchanged on catalogue cards and PDPs. The fourth air-fryer concept is not used.

## Typography

`lib/storefront/fonts.ts` uses next/font/google for Inter (UI) and Cormorant Garamond (editorial). Next hosts the resulting font resources; shoppers do not request fonts from Google. Both use swap. The editorial face is not preloaded and is applied only to campaign headings and display/section headings under .hf-editorial-home. Navigation, descriptions, price, filters, product titles, quantity and checkout remain sans-serif. Brand SVG remains untouched. Explicit --hf-font-ui / --hf-font-editorial tokens live in campaign-typography.css; the existing global stylesheet is not replaced.

## Responsive art and delivery

Desktop places real text over the quiet left side, fading into a single scene at the right; the under-20 campaign has a wide 8:3 frame. Mobile places readable copy above a dedicated image area with a top fade, so neither headline nor CTA is cropped. Intermediate tablet widths use one column. Three local WebP masters are lazy-loaded through Next Image with responsive sizes: kitchen 16,114 bytes, storage 28,838 bytes, budget 17,734 bytes (62,686 bytes combined, before Next image derivatives). The existing small botanical texture is reused separately. No new browser JavaScript, external image host, runtime font service or image-generation dependency is added.

## Commerce integrity

Campaign availability and destinations remain based on the live catalogue. Under-20 uses only in-stock, purchasable GBP products whose full listed range is strictly below 20.00. Empty groups render nothing. /collections/under-20 is unchanged. No checkout/payment, WooCommerce records, product availability, reviews or prices are modified.

## Validation

`npm run test:home` runs 24 deterministic content, routing, price boundary, image size/format, accessible component structure, layering, typography scope and syntax checks. It is included in prebuild alongside the existing PDP and checkout suites. Local Chromium layout checks cover 320, 360, 390, 540, 768, 1024, 1100, 1440 and 1920px plus tab focus order, using the actual campaign component output and stylesheet. Local offline screenshots use an installed serif fallback; they are not a live Next hydration test, an assertion of the final downloaded font or a physical-device test. Vercel build and deployed DOM/CSS checks are separate release checks.
