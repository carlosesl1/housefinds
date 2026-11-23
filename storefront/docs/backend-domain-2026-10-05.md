# Hostinger backend domain — 5 October 2026

## Applied

- Created `backend.housefindsstore.com` as a subdomain of the existing Hostinger website, using its existing `public_html` directory. No new WordPress installation or database was created.
- Hostinger automatically issued the subdomain's Lifetime SSL certificate; the panel reports Active. HTTP redirects to HTTPS with 301.
- Added explicit `WP_HOME` and `WP_SITEURL` definitions for `https://backend.housefindsstore.com` to the existing `wp-config.php`. The remaining original file contents were preserved exactly.
- A pre-change copy of `wp-config.php` is stored in ignored local output, outside the hosted public directory. It contains credentials and must never be committed or published.
- No DNS, nameserver, database, pricing, stock, order, payment-mode or supplier-fulfilment settings were changed in this operation.

## Verified

- WordPress REST index: HTTPS 200; both `home` and `url` now use the backend subdomain.
- WooCommerce Store API and `housefinds/v1` namespaces remain available.
- Public Store API product list: 200, 11 published products, all returned product permalinks use the backend subdomain.
- Product 452 image: HTTPS 200, `image/webp`, hosted under the backend subdomain.
- Store API cart: HTTPS 200, empty cart; no checkout or order was created.
- `/wp-admin/` redirects to the login page on the backend subdomain. The browser renders that login page normally over HTTPS. Authenticated admin access was not tested in this operation.
- The public WordPress HTML homepage still had a previously cached old-domain API link immediately after the change; uncached REST, product image URLs and admin redirects use the new domain. No cache policy was changed.

## Remaining integration work

- Configure the Vercel production `WOOCOMMERCE_URL` as `https://backend.housefindsstore.com` and redeploy. The Vercel connector previously returned 403 for environment-variable access; the current value has not been confirmed.
- Review the production image-host allowlist and other old WordPress-origin references before redeploying.
- Update and validate Stripe webhook destinations and DSers store connectivity for the new backend origin, retaining the existing store/product mappings. Stripe stays in test mode; the previously successful payment tests predate this domain change.
- Validate the storefront catalogue, product images, variations, cart and sandbox payment on the official storefront domain after these integration changes.

Evidence: ignored `output/domain-migration/hostinger-backend-ssl.jpg`.

References: [Hostinger subdomains](https://www.hostinger.com/support/1583405-how-to-create-and-delete-subdomains-in-hostinger/), [WordPress migration](https://developer.wordpress.org/advanced-administration/upgrade/migrating/).
