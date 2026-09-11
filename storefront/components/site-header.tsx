import Link from 'next/link'
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline'
import { CartButton } from '@/components/cart/cart-button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[.06] bg-[#fbfaf7]/92 backdrop-blur-2xl">
      <div className="mx-auto flex h-[78px] max-w-[1600px] items-center gap-8 px-6 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-[1.65rem] font-bold tracking-[-.055em] text-[#101622]">
          <span className="relative grid size-9 place-items-center overflow-hidden rounded-[13px] bg-[#dfe9e2] text-[#355f4a]">
            <span className="absolute bottom-1.5 h-4 w-4 rounded-t-[5px] border-[2.5px] border-[#557562] border-b-0" />
            <span className="absolute bottom-1.5 h-2.5 w-1.5 bg-[#dfe9e2]" />
          </span>
          Housefinds
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-semibold text-black/58 lg:flex">
          <Link href="/" className="transition hover:text-black">Home</Link>
          <Link href="/shop" className="transition hover:text-black">Shop</Link>
          <Link href="/shop?sort=new" className="transition hover:text-black">New In</Link>
          <Link href="/shop?sort=popular" className="transition hover:text-black">Best Sellers</Link>
          <Link href="/about" className="transition hover:text-black">About</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="hidden h-11 min-w-[300px] items-center gap-3 rounded-full border border-black/[.04] bg-black/[.035] px-4 text-sm text-black/42 transition hover:bg-black/[.055] xl:flex"
          >
            <MagnifyingGlassIcon className="size-[18px]" />
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
