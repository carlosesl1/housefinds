'use client'

import { usePathname } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { editorialFont } from '@/lib/storefront/editorial-font'

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const enclosedCheckout = pathname === '/checkout' || pathname.startsWith('/checkout/')

  if (enclosedCheckout) {
    return <div id="main-content" tabIndex={-1}>{children}</div>
  }

  return (
    <div className={`${editorialFont.variable} hf-editorial-scope`}>
      <SiteHeader />
      <div id="main-content" tabIndex={-1}>{children}</div>
      <SiteFooter />
    </div>
  )
}
