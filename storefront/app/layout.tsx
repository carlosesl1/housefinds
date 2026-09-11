import type { Metadata } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CartProvider } from '@/components/cart/cart-provider'
import { CartDrawer } from '@/components/cart/cart-drawer'

export const metadata: Metadata = {
  title: { default: 'Housefinds — Smart finds for a better home', template: '%s | Housefinds' },
  description: 'Clever, useful and modern home gadgets and organizing solutions for everyday life.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-GB"><body><CartProvider><SiteHeader />{children}<SiteFooter /><CartDrawer /></CartProvider></body></html>
}
