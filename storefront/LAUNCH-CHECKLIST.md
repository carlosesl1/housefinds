# Housefinds — UK Launch Checklist

This file tracks facts that must be true before the public storefront is indexed or paid traffic is sent to it.

## Confirmed operating promises
- Market at launch: United Kingdom only.
- Standard UK delivery: free to the customer; Housefinds absorbs the supplier shipping cost.
- Current delivery estimate: around 14 days.
- Returns: customer may start an eligible change-of-mind return within 14 days of delivery; Housefinds intends to provide a free return method.
- Support email: contact@housefindsstore.com.
- Payments intended through Stripe: Visa, Mastercard, American Express, Apple Pay, Google Pay and Link.
- PayPal: not planned for initial launch.
- Product reviews may include genuine feedback for the identical product collected on third-party marketplaces. Do not label imported reviews as Housefinds purchases or verified Housefinds purchases unless they actually are.

## P0 blockers before public launch

### Seller legal identity
UK distance-selling information must identify the trader, not only the Housefinds brand. Confirm:
- legal seller / trader name;
- geographical business address;
- complaints / correspondence address if different;
- any company registration details that apply to the chosen legal entity.

Do not invent these fields in the storefront.

### UK VAT
Housefinds is selling directly to UK consumers from an overseas seller setup. For consignments valued at £135 or less and outside the UK at sale, HMRC guidance requires the overseas seller to register for UK VAT and charge/account for VAT at the point of sale unless an exception applies.

Before launch:
- confirm the legal seller and UK VAT registration position;
- configure WooCommerce tax accordingly;
- confirm whether displayed GBP prices are VAT-inclusive;
- test a real checkout total and invoice;
- decide how carts/consignments above £135 are handled so customers are not surprised by import VAT or customs charges.

Northern Ireland can involve different VAT/import rules. Confirm whether launch scope is all UK or Great Britain only before enabling NI delivery.

### Returns operations
The customer-facing return promise belongs to Housefinds. Supplier/platform protection can support it operationally but must not be the only mechanism.

Before launch:
- define the exact workflow that creates a prepaid return label or other free return method;
- define where returned goods are sent for each supplier route;
- decide who pays when supplier/platform return coverage is unavailable or limited;
- test one return end to end;
- keep faulty/misdescribed goods handling separate from simple change-of-mind returns.

### Reviews policy
Before importing reviews at scale:
- import only reviews of the identical product;
- preserve original star ratings and sentiment;
- do not cherry-pick only positive reviews;
- do not create fake reviewer identities, emails or verified-purchase claims;
- provide an accessible explanation that some reviews come from third-party marketplaces;
- maintain a process to remove fraudulent or mismatched reviews.

## P1 before growth campaigns
- Internal order tracking page using Housefinds order number/email and server-side WooCommerce order access.
- Carrier tracking surfaced when DSers/WooCommerce receives it.
- Product-specific FAQ for each winner.
- Product-specific dimensions, material, installation, package contents and compatibility where available.
- New Housefinds imagery: hero/lifestyle, in-scale, dimensions, installation/how-it-works and objection-handling frames.
- Test mobile checkout with Apple Pay and Google Pay on real compatible devices.
- Verify Core Web Vitals on UK mobile traffic.

## Customer-facing wording rules
Use:
- “Free UK delivery”
- “Current delivery estimate: around 14 days”
- “Free 14-day returns on eligible online orders”
- “Secure Stripe checkout”
- “Product reviews”
- “Some reviews were collected for the same product on third-party marketplaces”

Avoid until independently substantiated:
- “UK stock”
- “Next-day / fast dispatch”
- “Guaranteed 14-day delivery”
- “Tracked delivery” when only internal order status exists
- “Verified Housefinds buyer” for imported reviews
- “100% satisfaction guarantee”
- fake scarcity, fake countdowns, inherited marketplace sale claims or arbitrary crossed-out prices
