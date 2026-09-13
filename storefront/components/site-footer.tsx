import Link from 'next/link'
import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const shopLinks = [
  ['All products', '/shop'],
  ['New in', '/shop?sort=new'],
  ['Best sellers', '/shop?sort=popular'],
  ['Kitchen tools', '/shop?category=kitchen-tools'],
  ['Smart entry', '/shop?category=smart-entry'],
  ['Space saving', '/shop?category=space-saving'],
]

const exploreLinks = [
  ['Search', '/search'],
  ['Daily helpers', '/shop?category=daily-helpers'],
  ['About Housefinds', '/about'],
]

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-[#f7f6f2]">
      <div className="mx-auto grid max-w-[1480px] gap-12 px-5 py-16 lg:grid-cols-[1.2fr_1.45fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="text-3xl font-bold tracking-[-.05em]">Housefinds</Link>
          <p className="mt-4 max-w-sm text-lg text-black/55">Clever, useful products for a happier home.</p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-black/45">
            A curated store for practical home gadgets, organisation tools and small everyday upgrades.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold">Shop</h3>
            <ul className="mt-5 space-y-3 text-sm text-black/50">
              {shopLinks.map(([label, href]) => <li key={href}><Link className="transition hover:text-black" href={href}>{label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm text-black/50">
              {exploreLinks.map(([label, href]) => <li key={href}><Link className="transition hover:text-black" href={href}>{label}</Link></li>)}
            </ul>
            <p className="mt-6 max-w-xs text-xs leading-5 text-black/38">Delivery options and totals are shown before payment during checkout.</p>
          </div>
        </div>

        <div className="rounded-[28px] bg-[#e4ebe5] p-6">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-black/42">Not sure where to start?</p>
          <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.045em]">Search by the problem you want to solve.</h3>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/search" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#355f4a] px-5 text-sm font-semibold text-white"><MagnifyingGlassIcon className="size-4" /> Search finds</Link>
            <Link href="/shop" className="inline-flex h-12 items-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold">Browse all <ArrowRightIcon className="size-4" /></Link>
          </div>
        </div>
      </div>

      <div className="border-t border-black/5">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-3 px-5 py-6 text-xs text-black/45 sm:flex-row sm:justify-between lg:px-8">
          <span>© 2026 Housefinds. All rights reserved.</span>
          <span>Small changes. Bigger living.</span>
        </div>
      </div>
    </footer>
  )
}
