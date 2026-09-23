import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/woocommerce/client'
import { dedupeStoreProducts } from '@/lib/storefront/catalog'
import { storefrontProductSlug } from '@/lib/woocommerce/presentation'
import { SITE_URL } from '@/lib/storefront/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/collections/under-20`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/shipping`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/returns`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  try {
    const products = dedupeStoreProducts(await getProducts({ per_page: 100, orderby: 'date', order: 'desc' }))
    return [
      ...staticPages,
      ...products.map((product) => ({
        url: `${SITE_URL}/product/${storefrontProductSlug(product)}`,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ]
  } catch {
    return staticPages
  }
}
