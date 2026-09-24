import type { Metadata } from 'next'
import './globals.css'
import './campaign-typography.css'
import { uiFont } from '@/lib/storefront/fonts'
import skipStyles from './skip-link.module.css'
import { CartProvider } from '@/components/cart/cart-provider'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SiteShell } from '@/components/site-shell'
import { SITE_URL } from '@/lib/storefront/site-url'

const shouldNoIndex = process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Housefinds — Smart finds for a better home', template: '%s | Housefinds' },
  description: 'Clever, useful and modern home gadgets and organising solutions for everyday life.',
  applicationName: 'Housefinds',
  category: 'shopping',
  robots: shouldNoIndex ? { index: false, follow: false } : { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Housefinds',
    title: 'Housefinds — Smart finds for a better home',
    description: 'Clever, useful and modern home gadgets and organising solutions for everyday life.',
    url: SITE_URL,
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Housefinds',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={uiFont.variable}>
      <body>
        <a href="#main-content" className={skipStyles.skipLink}>Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <CartProvider>
          <SiteShell>{children}</SiteShell>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
