# Home editorial banners

Four approved themes are distributed in two pairs: kitchen/storage after the hero, under-20/Housefinds edit after the product showcase. Copy and CTA are real HTML, not text baked into an image. The concepts' cream/sage backdrop, serif campaign headings, pill actions and soft layering are retained; product photography is supplied by the live catalogue rather than generated appliances which the shop does not sell. Existing checkout, PDP and WordPress configuration are unchanged.

The reusable decorative WebP is 960x320, 2340 bytes, derived from the Housefinds botanical background already generated in the conversation. It is not an image of products. Live product images use Next Image with lazy loading and responsive sizes; their transfer sizes are separate from the 2340-byte background. No campaign-specific browser JavaScript or external image host is added.

`/collections/under-20` uses live GBP prices and includes only purchasable, in-stock products whose entire listed price range is below 20.00. It does not use the unrelated 10-20 filter, include exactly 20, or use a low starting price to promote higher-priced variants. Empty and backend-error states are distinct. Category banners disappear when there are no corresponding available products with imagery.

Run `node scripts/test-home-promotions.cjs` from storefront for 16 deterministic content, price-boundary, availability, routing and TSX-syntax checks. Preview and production builds still run the project's existing checks. These checks do not assert a full payment test or independent visual inspection of physical devices.
