# Housefinds Store Theme

Custom WooCommerce theme for housefindsstore.com.

## Architecture

- WooCommerce owns commerce data, cart, checkout, orders, customers and integrations such as DSers.
- This repository owns the frontend experience only.
- Default products use the normal WooCommerce product template.
- Winning products can receive a bespoke PHP template in `product-pages/{product-slug}.php`.
- Reusable visual sections live under `template-parts/sections/`.

## Deployment

Deploy this repository only to:

`public_html/wp-content/themes/housefinds`

Do not deploy this repository to `public_html`.

## Custom product pages

Create a file matching the product slug:

`product-pages/neck-massager.php`

The router in `inc/product-page-router.php` will use that file only for `/product/neck-massager/`. All other products continue using WooCommerce's default template.

## Safety

Never commit WordPress core, plugins, uploads, database exports, credentials, `.env` files, API keys, application passwords or payment secrets.
