# Housefinds Storefront

Headless customer-facing storefront for Housefinds. WooCommerce remains the system of record and DSers remains connected to WooCommerce.

## Local setup

```bash
cd storefront
cp .env.example .env.local
npm install
npm run dev
```

Default backend: `https://housefindsstore.com`.

## Current milestone

- Next.js storefront foundation
- WooCommerce Store API product reads
- Cart proxy with Cart-Token stored as HttpOnly cookie
- Cart drawer and add/remove/update quantity
- Shop grid
- Default product page
- Bespoke experience registry
- First bespoke experience for the imported HOMEFISH/Aurora product
- Checkout UI scaffold

## Deployment transition

Keep the current WordPress storefront live while developing this app on a preview subdomain or Node hosting. Do not point the existing Hostinger Git deployment for the WordPress theme at this `storefront` directory.

Later target architecture:

- `housefindsstore.com` → Next.js storefront
- `backend.housefindsstore.com` → WordPress + WooCommerce + DSers
