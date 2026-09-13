import type { MetadataRoute } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const shouldNoIndex = Boolean(process.env.VERCEL && !process.env.NEXT_PUBLIC_SITE_URL)

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
      disallow: ['/checkout', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
