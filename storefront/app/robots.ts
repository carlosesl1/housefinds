import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/storefront/site-url'

const shouldNoIndex = process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development'

export default function robots(): MetadataRoute.Robots {
  if (shouldNoIndex) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/checkout',
        '/checkout/',
        '/cart',
        '/cart/',
        '/search',
        '/search/',
        '/track-order',
        '/track-order/',
        '/order-confirmation',
        '/order-confirmation/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
