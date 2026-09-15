import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const shopLinks = [
  ['All products', '/shop'],
  ['New in', '/shop?sort=new'],
  ['Popular finds', '/shop?sort=popular'],
  ['Kitchen tools', '/shop?category=kitchen-tools'],
  ['Smart entry', '/shop?category=smart-entry'],
  ['Space saving', '/shop?category=space-saving'],
]

const customerLinks = [
  ['Track an order', '/track-order'],
  ['Shipping & delivery', '/shipping'],
  ['Returns', '/returns'],
  ['FAQ', '/faq'],
  ['Contact', '/contact'],
  ['About Housefinds', '/about'],
]

export function SiteFooter() {
  return (
    <footer className="border-t border-black/[.06] bg-[var(--hf-surface-soft)]">
      <div className="hf-container grid gap-12 py-16 lg:grid-cols-[1.05fr_1.45fr_.95fr] lg:py-20">
        <div>
          <Link href="/" className="inline-flex items-center" aria-label="Housefinds home">
            <Image src="/housefinds-logo.svg" alt="Housefinds" width={720} height={210} className="h-11 w-auto" />
          </Link>
          <p className="mt-4 max-w-sm text-lg leading-7 text-black/56">Clever, useful products for a happier home.</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-black/44">A UK-focused edit of practical home gadgets, organisation tools and small everyday upgrades.</p>

          <div className="mt-7 space-y-2 border-t border-black/[.08] pt-5 text-xs leading-5 text-black/48">
            <p><strong className="font-semibold text-black/65">Delivery</strong> · Free standard UK delivery</p>
            <p><strong className="font-semibold text-black/65">Returns</strong> · Free 14-day returns on eligible orders</p>
            <p><strong className="font-semibold text-black/65">Payment</strong> · Secure card checkout</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--hf-ink)]">Shop</h3>
            <ul className="mt-5 space-y-3 text-sm text-black/50">{shopLinks.slice(0, 3).map(([label, href]) => <li key={href}><Link className="transition hover:text-black" href={href}>{label}</Link></li>)}</ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--hf-ink)]">Categories</h3>
            <ul className="mt-5 space-y-3 text-sm text-black/50">{shopLinks.slice(3).map(([label, href]) => <li key={href}><Link className="transition hover:text-black" href={href}>{label}</Link></li>)}<li><Link className="transition hover:text-black" href="/shop?category=daily-helpers">Daily helpers</Link></li></ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-sm font-semibold text-[var(--hf-ink)]">Customer care</h3>
            <ul className="mt-5 space-y-3 text-sm text-black/50">{customerLinks.map(([label, href]) => <li key={href}><Link className="transition hover:text-black" href={href}>{label}</Link></li>)}</ul>
            <a href="mailto:contact@housefindsstore.com" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--hf-brand)] hover:underline"><EnvelopeIcon className="size-4" /> contact@housefindsstore.com</a>
            <p className="mt-3 max-w-xs text-xs leading-5 text-black/38">Current UK delivery estimate: around 14 days.</p>
          </div>
        </div>

        <div className="self-start pl-0 lg:border-l lg:border-black/[.08] lg:pl-8">
          <p className="hf-eyebrow">Not sure where to start?</p>
          <h3 className="mt-4 max-w-sm text-[2rem] font-semibold leading-[1.05] tracking-[-.04em] text-[var(--hf-ink)]">Search by the problem you want to solve.</h3>
          <p className="mt-4 max-w-sm text-sm leading-6 text-black/46">Find a product directly, or browse the full collection when you want inspiration.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/search" className="hf-button-primary min-h-12 text-sm"><MagnifyingGlassIcon className="size-4" /> Search finds</Link>
            <Link href="/shop" className="hf-button-secondary min-h-12 text-sm">Browse all <ArrowRightIcon className="size-4" /></Link>
          </div>
        </div>
      </div>

      <div className="border-t border-black/[.06]">
        <div className="hf-container flex flex-col gap-3 py-6 text-xs text-black/44 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Housefinds. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2"><Link href="/track-order" className="hover:text-black">Track order</Link><Link href="/shipping" className="hover:text-black">Shipping</Link><Link href="/returns" className="hover:text-black">Returns</Link><Link href="/faq" className="hover:text-black">FAQ</Link><Link href="/contact" className="hover:text-black">Contact</Link><span>Small changes. Bigger living.</span></div>
        </div>
      </div>
    </footer>
  )
}
