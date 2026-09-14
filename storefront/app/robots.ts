import type { MetadataRoute } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
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
