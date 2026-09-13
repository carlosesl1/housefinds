'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { CartButton } from '@/components/cart/cart-button'

const navItems = [
  { href: '/', label: 'Home', exact: true },
  { href: '/shop', label: 'Shop' },
  { href: '/shop?sort=new', label: 'New In' },
  { href: '/shop?sort=popular', label: 'Best Sellers' },
  { href: '/about', label: 'About' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const q = query.trim()
    if (!q) return
    setMenuOpen(false)
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const isActive = (href: string, exact?: boolean) => {
    const base = href.split('?')[0]
    return exact ? pathname === base : pathname === base || pathname.startsWith(`${base}/`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/[.06] bg-[#fbfaf7]/94 backdrop-blur-2xl">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center gap-7 px-5 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-[1.55rem] font-bold tracking-[-.055em] text-[#101622]" aria-label="Housefinds home">
          <span className="relative grid size-9 place-items-center overflow-hidden rounded-[13px] bg-[#dfe9e2] text-[#355f4a]">
            <span className="absolute bottom-1.5 h-4 w-4 rounded-t-[5px] border-[2.5px] border-[#557562] border-b-0" />
            <span className="absolute bottom-1.5 h-2.5 w-1.5 bg-[#dfe9e2]" />
          </span>
          Housefinds
        </Link>

        <nav className="hidden items-center gap-6 text-[13px] font-semibold lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-2 transition ${active ? 'text-[#294b3a]' : 'text-black/55 hover:text-black'}`}
              >
                {item.label}
                {active && <span className="absolute inset-x-0 -bottom-1 mx-auto h-0.5 w-5 rounded-full bg-[#557562]" />}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={submitSearch} className="hidden xl:block" role="search">
            <label className="flex h-11 min-w-[330px] items-center gap-3 rounded-full border border-black/[.05] bg-black/[.035] px-4 transition focus-within:border-[#557562]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#557562]/10">
              <MagnifyingGlassIcon className="size-[18px] shrink-0 text-black/45" />
              <span className="sr-only">Search Housefinds</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, uses or problems…"
                className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/38"
              />
            </label>
          </form>

          <Link href="/search" className="grid size-10 place-items-center rounded-full transition hover:bg-black/5 xl:hidden" aria-label="Search">
            <MagnifyingGlassIcon className="size-5" />
          </Link>
          <CartButton />
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="grid size-10 place-items-center rounded-full border border-black/10 bg-white transition hover:bg-stone-50 lg:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <XMarkIcon className="size-5" /> : <Bars3Icon className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-black/[.06] bg-[#fbfaf7] px-5 pb-6 pt-4 lg:hidden">
          <form onSubmit={submitSearch} role="search">
            <label className="flex h-12 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 focus-within:border-[#557562]/45 focus-within:ring-4 focus-within:ring-[#557562]/10">
              <MagnifyingGlassIcon className="size-[18px] text-black/45" />
              <span className="sr-only">Search Housefinds</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What are you trying to solve?"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/35"
              />
            </label>
          </form>
          <nav className="mt-4 grid" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`border-b border-black/[.05] py-4 text-base font-semibold ${isActive(item.href, item.exact) ? 'text-[#355f4a]' : 'text-[#172018]'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
