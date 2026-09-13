'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { CartButton } from '@/components/cart/cart-button'

const navItems = [
  { href: '/', label: 'Home', exact: true },
  { href: '/shop', label: 'Shop' },
  { href: '/shop?sort=new', label: 'New In' },
  { href: '/shop?sort=popular', label: 'Best Sellers' },
  { href: '/about', label: 'About' },
]

const popularSearches = ['door closer', 'storage', 'kitchen', 'motion light', 'bathroom', 'mosquito']

type Suggestion = {
  id: number
  name: string
  slug: string
  tagline: string
  price: string
  image: string
}

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionLoading, setSuggestionLoading] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setSuggestions([])
      setSuggestionLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setSuggestionLoading(true)
      fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error('Search unavailable')))
        .then((data: { results?: Suggestion[] }) => setSuggestions(data.results || []))
        .catch((error) => {
          if (error instanceof DOMException && error.name === 'AbortError') return
          setSuggestions([])
        })
        .finally(() => setSuggestionLoading(false))
    }, 180)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const q = query.trim()
    if (!q) return
    setMenuOpen(false)
    setSearchOpen(false)
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const choosePopularSearch = (value: string) => {
    setQuery(value)
    setSearchOpen(false)
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }

  const isActive = (href: string, exact?: boolean) => {
    const base = href.split('?')[0]
    if (href.includes('?')) return false
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
          <form onSubmit={submitSearch} className="relative hidden xl:block" role="search">
            <label className="flex h-11 min-w-[350px] items-center gap-3 rounded-full border border-black/[.05] bg-black/[.035] px-4 transition focus-within:border-[#557562]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#557562]/10">
              <MagnifyingGlassIcon className="size-[18px] shrink-0 text-black/45" />
              <span className="sr-only">Search Housefinds</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
                autoComplete="off"
                placeholder="Search products, uses or problems…"
                className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/38"
              />
            </label>

            {searchOpen && (
              <div
                className="absolute right-0 top-[52px] w-[430px] overflow-hidden rounded-[26px] border border-black/[.07] bg-white shadow-[0_24px_80px_rgba(26,36,30,.14)]"
                onMouseDown={(event) => event.preventDefault()}
              >
                {query.trim().length < 2 ? (
                  <div className="p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-black/35">Popular searches</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {popularSearches.map((value) => (
                        <button key={value} type="button" onClick={() => choosePopularSearch(value)} className="rounded-full border border-black/[.08] bg-[#f7f7f3] px-3 py-2 text-xs font-semibold text-black/58 transition hover:border-[#557562]/35 hover:bg-[#edf3ee]">{value}</button>
                      ))}
                    </div>
                    <Link href="/shop" onClick={() => setSearchOpen(false)} className="mt-5 flex items-center justify-between rounded-2xl bg-[#e7eee9] px-4 py-3 text-sm font-semibold text-[#355f4a]">Browse the full collection <ArrowRightIcon className="size-4" /></Link>
                  </div>
                ) : suggestionLoading ? (
                  <div className="p-6 text-sm text-black/42">Searching useful finds…</div>
                ) : suggestions.length > 0 ? (
                  <div>
                    <div className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[.22em] text-black/35">Suggested products</div>
                    <div className="divide-y divide-black/[.05]">
                      {suggestions.map((suggestion) => (
                        <Link key={suggestion.id} href={`/produto/${suggestion.slug}`} onClick={() => { setSearchOpen(false); setQuery('') }} className="grid grid-cols-[58px_1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-[#f5f6f2]">
                          <div className="relative aspect-square overflow-hidden rounded-xl bg-[#efeee8]">
                            {suggestion.image && <Image src={suggestion.image} alt="" fill sizes="58px" className="object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#172018]">{suggestion.name}</p>
                            <p className="mt-0.5 truncate text-xs text-black/40">{suggestion.tagline}</p>
                          </div>
                          <span className="text-sm font-semibold text-[#172018]">{suggestion.price}</span>
                        </Link>
                      ))}
                    </div>
                    <button type="submit" className="flex w-full items-center justify-between border-t border-black/[.06] bg-[#f7f7f3] px-5 py-3 text-sm font-semibold text-[#355f4a]">See all results for “{query.trim()}” <ArrowRightIcon className="size-4" /></button>
                  </div>
                ) : (
                  <div className="p-5">
                    <p className="text-sm font-semibold text-[#172018]">No quick match yet.</p>
                    <p className="mt-1 text-xs leading-5 text-black/42">Try a broader term or search all product details.</p>
                    <button type="submit" className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#e7eee9] px-4 py-3 text-sm font-semibold text-[#355f4a]">Search for “{query.trim()}” <ArrowRightIcon className="size-4" /></button>
                  </div>
                )}
              </div>
            )}
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
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {popularSearches.slice(0, 4).map((value) => <button key={value} type="button" onClick={() => { setMenuOpen(false); choosePopularSearch(value) }} className="shrink-0 rounded-full border border-black/[.08] bg-white px-3 py-2 text-xs font-semibold text-black/52">{value}</button>)}
          </div>
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
            <Link href="/shipping" onClick={() => setMenuOpen(false)} className="border-b border-black/[.05] py-4 text-base font-semibold text-[#172018]">Shipping & delivery</Link>
            <Link href="/returns" onClick={() => setMenuOpen(false)} className="border-b border-black/[.05] py-4 text-base font-semibold text-[#172018]">Returns</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
