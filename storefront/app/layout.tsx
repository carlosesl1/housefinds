import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/cart/cart-provider'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SiteShell } from '@/components/site-shell'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const shouldNoIndex = Boolean(process.env.VERCEL && !process.env.NEXT_PUBLIC_SITE_URL)

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Housefinds — Smart finds for a better home', template: '%s | Housefinds' },
  description: 'Clever, useful and modern home gadgets and organizing solutions for everyday life.',
  applicationName: 'Housefinds',
  category: 'shopping',
  robots: shouldNoIndex ? { index: false, follow: false } : { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Housefinds',
    title: 'Housefinds — Smart finds for a better home',
    description: 'Clever, useful and modern home gadgets and organizing solutions for everyday life.',
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
    <html lang="en-GB">
      <body>
        <a href="#main-content" className="fixed left-4 top-3 z-[200] -translate-y-20 rounded-full bg-[#172018] px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <CartProvider>
          <SiteShell>{children}</SiteShell>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
