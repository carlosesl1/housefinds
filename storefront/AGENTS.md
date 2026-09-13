# Housefinds Storefront — Agent Rules

## Architecture
- WordPress/WooCommerce/DSers are the commerce backend. Do not duplicate product, inventory, order, or supplier truth in Next.js.
- Next.js owns the customer-facing experience.
- Prefer WooCommerce Store API for public commerce flows. Keep server-only secrets and privileged WooCommerce REST credentials out of client bundles.
- Cart state uses the WooCommerce Cart-Token persisted as an HttpOnly cookie through Next.js route handlers.
- Supplier and fulfilment metadata may remain operationally private, but never replace it with false claims such as UK stock, guaranteed delivery times, Housefinds purchase history, or fabricated scarcity.

## Product experiences
- Every product must work with `DefaultProduct`.
- Winning products may be mapped in `experiences/registry.ts` to a bespoke React experience.
- Bespoke experiences must reuse commerce primitives rather than reimplementing cart, price, inventory, checkout, variants, or order logic.
- Product pages must make the decision easier before pushing the CTA: what it solves, price, options, availability, imagery, delivery/returns access, useful specifications and real product feedback when available.
- Variable products must show an exact selected-variation price and availability whenever Store API variation data is available.
- Operational attributes such as supplier warehouse / `Ships From` must remain available to WooCommerce cart logic but should not clutter customer-facing selectors or specifications.

## Evidence-led ecommerce UX
Use these rules as defaults unless a product-specific test or clear business constraint justifies a different choice.

### Product finding
- Always preserve three finding paths: browsing/categories, search and curated/problem-led discovery.
- Category tiles must open a real scoped list, never masquerade as a category while linking to one arbitrary product.
- Search must tolerate plain-language needs and adjacent terminology, not only exact product titles.
- Autocomplete should help users learn the catalog and terminology; show useful product suggestions rather than merely repeating the typed string.
- Zero-result states must offer broader terms, categories and a way back to the full catalog.

### Product lists
- Show useful title, short benefit-oriented description, current price/range and real rating only when available.
- Give shoppers evidence that more product imagery exists without loading a large gallery for every card. Prefer one main image plus a lightweight alternate image / image-count cue.
- Filters must be understandable, reversible and represented in the URL where practical.
- Do not expose duplicate DSers imports in customer-facing lists.
- Do not display inherited marketplace `Sale` labels or crossed-out reference prices unless Housefinds can substantiate the promotion from its own pricing history.

### Product pages
- Prioritise product imagery. Support thumbnails, next/previous navigation and large-image inspection.
- Keep product title, benefit, current price, required options, quantity and CTA in a clear purchase hierarchy.
- On mobile, keep a useful sticky purchase CTA after the primary purchase panel scrolls away.
- Never allow Add to Cart to silently fail because a required variant is missing. Make option requirements explicit.
- Shipping and return information must be reachable from the PDP without forcing checkout exploration.
- Related and recently viewed items should aid comparison/recovery, not overwhelm the primary decision.

### Reviews and social proof
- Never fabricate ratings, review counts, reviewers, verified-purchase status, photos or comments.
- Reviews for the same product may include feedback sourced from third-party marketplaces, but customer-facing copy must not imply all reviewers purchased from Housefinds.
- Imported external reviews should preserve their original ratings, including negative reviews, and should not be marked `verified` unless WooCommerce can genuinely verify a Housefinds purchase.
- Never selectively suppress negative feedback merely to improve the displayed average.

### Cart and checkout
- Cart updates must provide immediate visible state and actionable errors.
- Show subtotal clearly; explain that delivery/tax are calculated later rather than hiding that uncertainty.
- Do not force account creation before purchase.
- Avoid surprise fees and late disclosure of delivery cost.
- Checkout should be visually quieter than merchandising pages.

### Trust
- Prefer truthful operational clarity over decorative trust badges.
- No fake scarcity, fake live-viewer counts, fake purchase notifications, artificial countdowns or invented shipping promises.
- Housefinds is the customer-facing merchant. Support, returns and delivery information should be Housefinds language; shoppers do not need supplier marketplace branding.
- Remove dead links, nonfunctional forms and placeholder account/support features before launch.

### Performance
- Treat Core Web Vitals as conversion requirements, especially on mobile.
- Keep the LCP hero intentional and lightweight. Lazy-load noncritical imagery.
- Prefer WooCommerce thumbnails for small alternate images.
- Avoid heavy carousels, excessive animation libraries, unnecessary client components and decorative JS.
- Respect `prefers-reduced-motion`.

### Accessibility
- Maintain keyboard navigation, visible focus, meaningful labels, sufficient tap targets and useful alt text.
- Dialogs/drawers must support Escape and should prevent background scrolling while open.
- Do not encode essential state only through colour.

## Design
- Brand: Housefinds.
- Positioning: clever, useful, differentiated products for a better home.
- Visual language: clean, editorial, airy, premium, warm-neutral backgrounds, charcoal typography, muted sage green accents.
- Avoid generic dropshipping aesthetics, countdown spam, fake urgency, excessive badges, neon gradients, clutter, or fake reviews.
- Product imagery and real WooCommerce data should drive the experience.
- Custom product experiences may be visually expressive, but the commerce interaction model should remain familiar and predictable.

## Safety
- Never commit API secrets, WordPress passwords, application passwords, Stripe secrets, DSers credentials, or customer data.
- Never change the existing WordPress theme files from storefront tasks unless explicitly requested.
- Checkout/payment changes require explicit validation against the installed WooCommerce gateway before production use.
