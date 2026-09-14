function normalizeSiteUrl(value: string) {
  return value.trim().replace(/\/$/, '')
}

/**
 * Use an explicitly configured public URL when one exists. Until the custom
 * domain is actually attached to Vercel, fall back to the real production
 * Vercel hostname instead of publishing canonicals that currently 404 on the
 * WordPress/WooCommerce origin.
 */
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured?.trim()) return normalizeSiteUrl(configured)

  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProductionHost?.trim()) {
    return normalizeSiteUrl(`https://${vercelProductionHost}`)
  }

  return 'https://housefinds-storefront.vercel.app'
}

export const SITE_URL = getSiteUrl()
