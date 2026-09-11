import Link from 'next/link'
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline'
import { CartButton } from '@/components/cart/cart-button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fbfaf7]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1480px] items-center gap-8 px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-[-.04em]">
          <span className="grid size-8 place-items-center rounded-xl bg-[#e3ece6] text-[#355f4a]">⌂</span>
          Housefinds
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/shop?sort=new">New In</Link>
          <Link href="/shop?sort=popular">Best Sellers</Link>
          <Link href="/about">About</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/search" className="hidden h-11 min-w-72 items-center gap-3 rounded-full bg-black/[.035] px-4 text-sm text-black/45 xl:flex">
            <MagnifyingGlassIcon className="size-5" />
            Search for clever home finds…
          </Link>
          <Link href="/account" className="grid size-10 place-items-center rounded-full transition hover:bg-black/5" aria-label="Account">
            <UserIcon className="size-5" />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  )
}
