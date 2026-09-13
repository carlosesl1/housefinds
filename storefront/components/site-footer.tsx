import Link from 'next/link'
import { ArrowRightIcon, MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const shopLinks = [
  ['All products', '/shop'],
  ['New in', '/shop?sort=new'],
  ['Best sellers', '/shop?sort=popular'],
  ['Kitchen tools', '/shop?category=kitchen-tools'],
  ['Smart entry', '/shop?category=smart-entry'],
  ['Space saving', '/shop?category=space-saving'],
]

const customerLinks = [
  ['Shipping & delivery', '/shipping'],
  ['Returns', '/returns'],
  ['FAQ', '/faq'],
  ['About Housefinds', '/about'],
]

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-[#f7f6f2]">
      <div className="mx-auto grid max-w-[1480px] gap-12 px-5 py-16 lg:grid-cols-[1.05fr_1.55fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="text-3xl font-bold tracking-[-.05em]">Housefinds</Link>
          <p className="mt-4 max-w-sm text-lg text-black/55">Clever, useful products for a happier home.</p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-black/45">
            A curated UK-focused store for practical home gadgets, organisation tools and small everyday upgrades.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-black/48">
            <span className="rounded-full border border-black/[.07] bg-white px-3 py-2">Free UK delivery</span>
            <span className="rounded-full border border-black/[.07] bg-white px-3 py-2">Free 14-day returns</span>
            <span className="rounded-full border border-black/[.07] bg-white px-3 py-2">Secure Stripe checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold">Shop</h3>
            <ul className="mt-5 space-y-3 text-sm text-black/50">
              {shopLinks.slice(0, 3).map(([label, href]) => <li key={href}><Link className="transition hover:text-black" href={href}>{label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Categories</h3>
            <ul className="mt-5 space-y-3 text-sm text-black/50">
              {shopLinks.slice(3).map(([label, href]) => <li key={href}><Link className="transition hover:text-black" href={href}>{label}</Link></li>)}
              <li><Link className="transition hover:text-black" href="/shop?category=daily-helpers">Daily helpers</Link></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-semibold">Customer care</h3>
            <ul className="mt-5 space-y-3 text-sm text-black/50">
              {customerLinks.map(([label, href]) => <li key={href}><Link className="transition hover:text-black" href={href}>{label}</Link></li>)}
            </ul>
            <a href="mailto:contact@housefindsstore.com" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#355f4a] hover:underline"><EnvelopeIcon className="size-4" /> contact@housefindsstore.com</a>
            <p className="mt-3 max-w-xs text-xs leading-5 text-black/38">Free standard UK delivery. Current delivery estimate: around 14 days.</p>
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
        <div className="mx-auto flex max-w-[1480px] flex-col gap-3 px-5 py-6 text-xs text-black/45 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 Housefinds. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2"><Link href="/shipping" className="hover:text-black">Shipping</Link><Link href="/returns" className="hover:text-black">Returns</Link><Link href="/faq" className="hover:text-black">FAQ</Link><a href="mailto:contact@housefindsstore.com" className="hover:text-black">Contact</a><span>Small changes. Bigger living.</span></div>
        </div>
      </div>
    </footer>
  )
}
