# Housefinds Product Review Importer

Admin-only helper that imports genuine feedback for the identical product into native WooCommerce product reviews.

## Principles

- Imported feedback remains a **product review**, not a Housefinds purchase claim.
- Original star ratings are preserved.
- Low ratings are not removed or rewritten.
- Imported reviews are not marked as WooCommerce verified purchases.
- External review IDs are stored to prevent duplicate imports.
- No fake customer email address is generated.

The storefront can then render WooCommerce's native review count, rating distribution, written feedback and review media when available.

## Install

1. Zip the `housefinds-review-importer` folder.
2. In WordPress Admin open **Plugins → Add New → Upload Plugin**.
3. Upload and activate **Housefinds Product Review Importer**.
4. Edit a WooCommerce product.
5. In the **Housefinds product reviews** box, paste the URL of the exact same AliExpress product.
6. Start with a small import (10–20 reviews) and inspect the results before importing more.

## Before every import

Verify that the source URL represents the **identical product**, not merely a similar-looking listing. Variants can share reviews on marketplaces, so confirm that the feedback still relates to the product sold by Housefinds.

Do not cherry-pick only favourable reviews. The customer-facing rating should remain representative of the source feedback imported.

## Customer-facing disclosure

Housefinds should label these as `Product reviews`. An accessible explanation should state that some reviews may have been collected from purchasers of the same product on third-party marketplaces. Do not label an imported review `Verified Housefinds buyer` unless that reviewer actually purchased from Housefinds.

## Operational note

AliExpress can change public/internal review endpoints. If an import stops working, do not weaken WordPress permissions or nonce checks to fix it. Update only the remote-fetch/parser portion after verifying the new source response.
