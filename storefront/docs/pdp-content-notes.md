# PDP decision-support content

## Scope

Exact-product editorial records for 10 currently published WooCommerce IDs, a mobile thumbnail gallery and native dialog viewer, option guidance, listed product facts, packaging and care where known, two conditional use guides, accurate fractional rating summary and a conditional first-party video player. Existing checkout endpoints and WooCommerce records are not modified. Reviews remain paused; no reviews, ratings, scarcity or certification badges are invented.

## Sources reviewed

Read-only WooCommerce REST `GET /wc/v3/products` with `id,name,description,attributes`. The data is supplier-provided listing content, not independent laboratory verification. IDs and their current model names must both match before a record is used. A new imported product must not inherit numerical specifications from a similar name.

- 452 cutting board: stainless steel and one board per package are explicit. Use live dimension options (15x24, 20x30, 23x34, 28x39 cm), not the conflicting size enumeration in supplier prose. Do not repeat knife-friendly, lifetime durability, certification, steel grade or universal dishwasher claims. Thickness is withheld pending model confirmation.
- 430 oil bottle: plastic, transparent/refillable body, explicit hand-wash-only instruction and no prolonged hot-water immersion. Set and capacity depend on live options. The description mentions brush-only listings and a generic one-bottle package; do not promise a brush accessory or overwrite multi-pack quantity with that generic package description.
- 399 door closer: pull-cord mechanism and colour/force labels. No conversion from pull force to supported door weight. Do not promise quiet/damped closing, fire-door suitability, certified safety, package contents or a mounting procedure not present in the supplied instructions.
- 382 holder: plastic; listed 23.5x30.5x46 mm dimensions, 1PC/2PCS quantity. Do not reuse the conflicting white/light-grey prose over the live grey/transparent options. No sterilisation or health claims.
- 357 shoe bag: polyester, zipper, Yellow 1pc; zip/handle colour varies by batch. Listing recommends washing empty bag inside out before use. Shoe care label controls machine-wash eligibility, cycle and drying. No universal fit or shoe-material compatibility claim.
- 333 spoon scale: CR2032 not included, g/oz units, plastic, single and 2PCS options. The source says 500g while the fixed Load Bearing option says 1Kg; neither is presented as a confirmed maximum. The fixed conflicting label is removed only from public selectors and matching summaries, not Woo/DSers. Exact variation IDs remain unchanged and server-side cart code still reconstructs original attributes.
- 289 light: USB-C in model title; ABS, rechargeable battery and listed 5V input. Use live colour/length/set choices. No runtime, sensing distance, included charger, mounting cure time or certification claim.
- 275 rack: four tiers, metal frame and listed PP components. Reference dimensions/8-10 pairs are withheld until mapped to each A/B/C version. No load or assembly-time guarantee.
- 260 mat: live 40cm X 60cm option and grey finish. Conflicting EVA/coral-velvet material wording is not promoted as a verified construction specification. No slip-proof guarantee.
- 264 racket: retractable handle/rotating head from listing title. No certification, electrical-output, charging specification or child-safety promise.

## Media

The descriptions of 399 and 289 contain opaque supplier video IDs and preview-image URLs, not a confirmed playable asset. No URL is constructed from those IDs and no fake play button is displayed. Add a reviewed MP4/WebM plus first-party poster and written demonstration to the exact product record after checking model, permission and playback; include captions for speech. Player uses native controls, playsInline and preload=none. No autoplay or third-party embeds.

The imported Door Closer variants currently share a generic image. A shared photo is not labelled colour-specific. Differentiated variant images still drive the gallery. Correct source media mapping remains an operational task; do not generate a different product to fill it.

## Regression checks

`npm run test:pdp` runs deterministic content, dimensions, fractional-rating, video allowlist, public-data minimisation and variant-image checks, plus TSX syntax and gallery source invariants. It runs before `npm run build`. Next's TypeScript build remains the full type check. These checks are not a substitute for real-device gallery, swipe, modal focus, selection/cart and payment tests.
