# Housefinds Theme Agent Guide

## Product principle

WooCommerce owns commerce. This theme owns experience.

Never couple visual design to DSers. DSers should continue to operate through WooCommerce regardless of the product-page design.

## Product page modes

Every product must support one of these paths:

1. Default WooCommerce product template.
2. Bespoke product page selected by product slug in `product-pages/{slug}.php`.
3. Reusable visual sections in `template-parts/sections/` for faster composition.

## Commerce requirements

Do not reimplement cart, pricing, variation selection, stock, checkout or order logic in custom JavaScript when WooCommerce already provides the behavior.

Prefer WooCommerce template functions and hooks for:

- price
- rating
- variations
- stock
- quantity
- add to cart
- cart
- checkout
- reviews

Custom pages may position those commerce controls anywhere in the layout, but their underlying behavior must remain WooCommerce-native.

## Safety

Never edit WordPress core or WooCommerce plugin files.
Never commit secrets, API credentials, application passwords, payment keys, database dumps or production config.
Never deploy outside `public_html/wp-content/themes/housefinds`.
Do not remove DSers/WooCommerce compatibility for visual reasons.

## Design direction

Avoid generic dropshipping storefront aesthetics. Product pages should feel brand-led, editorial and product-specific. Use strong hierarchy, restrained motion, real product assets and conversion-focused storytelling.

When a bespoke page is created, preserve mobile performance and Core Web Vitals. Prefer progressive enhancement over dependency-heavy animation stacks.
