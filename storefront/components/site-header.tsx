'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { CartButton } from '@/components/cart/cart-button'
import { isSupportIntent, searchHelp } from '@/lib/storefront/help'
import { STORE_CATEGORIES } from '@/lib/storefront/categories'

const navItems = [
  { href: '/shop', label: 'Shop all' },
  ...STORE_CATEGORIES.map((category) => ({
    href: `/shop?category=${category.slug}`,
    label: category.title,
  })),
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
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 48)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMenuOpen(false); return }
      if (event.key !== 'Tab' || !menuRef.current) return
      const items = [...menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])')]
      const first = items[0], last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', closeOnDesktop)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', closeOnDesktop)
      menuToggleRef.current?.focus()
    }
  }, [menuOpen])
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const supportIntent = useMemo(() => isSupportIntent(query), [query])
  const helpSuggestions = useMemo(() => query.trim().length >= 2 ? searchHelp(query).slice(0, 3) : [], [query])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2 || supportIntent) {
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
  }, [query, supportIntent])

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

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
  }

  const isActive = (href: string) => {
    if (href.includes('?')) return false
    if (href === '/shop') return pathname === '/shop' || pathname.startsWith('/product/')
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className={`hf-site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="hf-service-line"><div className="hf-container"><p>Free UK delivery · current estimate around 14 days</p><Link href="/returns">Free 14-day returns on eligible orders</Link></div></div>
      <div className="hf-header-frame">
      <div className="hf-container hf-header-main">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Housefinds home">
          <Image
            src="/housefinds-logo.svg"
            alt="Housefinds"
            width={720}
            height={210}
            priority
            className="h-[38px] w-auto sm:h-[42px]"
          />
        </Link>



          <form onSubmit={submitSearch} className="hf-header-search relative" role="search">
            <label className="flex h-11 items-center gap-3 px-4 transition">
              <span className="sr-only">Search products</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchOpen(true)} onBlur={(event) => { const form = event.currentTarget.form; window.setTimeout(() => { if (!form?.contains(document.activeElement)) setSearchOpen(false) }, 0) }} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }} autoComplete="off" placeholder="Search products…" className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/38" />
            </label>
            <button type="submit" className="hf-search-submit" aria-label="Submit product search"><MagnifyingGlassIcon className="size-5" aria-hidden="true" /></button>

            {searchOpen && (
              <div className="hf-search-results absolute right-0 top-[52px] overflow-hidden rounded-[var(--hf-radius-md)] border border-black/[.07] bg-white shadow-[var(--hf-shadow-float)]" onMouseDown={(event) => event.preventDefault()}>
                {query.trim().length < 2 ? (
                  <div className="p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-black/35">Popular searches</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {popularSearches.map((value) => <button key={value} type="button" onClick={() => choosePopularSearch(value)} className="hf-button-tertiary !min-h-11 px-3 py-2 text-xs">{value}</button>)}
                    </div>
                    <Link href="/shop" onClick={closeSearch} className="hf-button-tertiary mt-5 w-full !justify-between">Browse all products <ArrowRightIcon className="size-4" /></Link>
                  </div>
                ) : (
                  <div>
                    {helpSuggestions.length > 0 && (
                      <div className="border-b border-black/[.06]">
                        <div className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[.22em] text-black/35">Help & order information</div>
                        {helpSuggestions.map((item) => <Link key={item.href} href={item.href} onClick={closeSearch} className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-[#f5f6f2]"><div><p className="text-sm font-semibold text-[#172018]">{item.title}</p><p className="mt-0.5 line-clamp-1 text-xs text-black/40">{item.description}</p></div><ArrowRightIcon className="size-4 shrink-0 text-[#557562]" /></Link>)}
                      </div>
                    )}

                    {!supportIntent && (suggestionLoading ? (
                      <div className="p-6 text-sm text-black/42">Searching useful finds…</div>
                    ) : suggestions.length > 0 ? (
                      <>
                        <div className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[.22em] text-black/35">Suggested products</div>
                        <div className="divide-y divide-black/[.05]">
                          {suggestions.map((suggestion) => (
                            <Link key={suggestion.id} href={`/product/${suggestion.slug}`} onClick={closeSearch} className="hf-search-suggestion grid grid-cols-[58px_1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-[#f5f6f2]">
                              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#efeee8]">{suggestion.image && <Image src={suggestion.image} alt="" fill sizes="58px" className="object-cover" />}</div>
                              <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#172018]">{suggestion.name}</p><p className="mt-0.5 truncate text-xs text-black/40">{suggestion.tagline}</p></div>
                              <span className="text-sm font-semibold text-[#172018]">{suggestion.price}</span>
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : helpSuggestions.length === 0 ? (
                      <div className="p-5"><p className="text-sm font-semibold text-[#172018]">No quick match yet.</p><p className="mt-1 text-xs leading-5 text-black/42">Try a broader product name or describe what you want to solve.</p></div>
                    ) : null)}

                    {supportIntent && helpSuggestions.length > 0 && <div className="px-5 py-3 text-xs leading-5 text-black/42">Showing customer-care results instead of unrelated products.</div>}
                    <button type="submit" className="flex w-full items-center justify-between border-t border-black/[.06] bg-[#f7f7f3] px-5 py-3 text-sm font-semibold text-[var(--hf-brand)] transition hover:bg-[var(--hf-brand-soft)]">See all results for “{query.trim()}” <ArrowRightIcon className="size-4" /></button>
                  </div>
                )}
              </div>
            )}
          </form>

        <div className="hf-header-actions ml-auto flex items-center gap-2">
          <CartButton />
          <button ref={menuToggleRef} type="button" aria-controls="mobile-menu" onClick={() => setMenuOpen((value) => !value)} className="hf-icon-button !shadow-none lg:hidden" aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <XMarkIcon className="size-5" /> : <Bars3Icon className="size-5" />}</button>
        </div>
        <nav className="hf-header-nav" aria-label="Shop navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`relative whitespace-nowrap py-2 transition ${isActive(item.href) ? 'text-[#294b3a]' : 'text-[var(--hf-ink-soft)] hover:text-black'}`} aria-current={pathname === item.href ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
          <Link href="/collections/under-20" className="hf-header-budget">Finds under £20 <ArrowRightIcon className="size-3.5" aria-hidden="true" /></Link>
        </nav>
      </div>

      </div>

      {menuOpen && (
        <div ref={menuRef} id="mobile-menu" className="hf-mobile-menu" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
          <div className="hf-mobile-menu-heading"><h2 id="mobile-menu-title">Find your useful bit.</h2><button className="hf-icon-button" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><XMarkIcon className="size-5" /></button></div>
          <form onSubmit={submitSearch} role="search">
            <label className="flex h-12 items-center gap-3 rounded-[var(--hf-radius-md)] border border-black/10 bg-white px-4 focus-within:border-[#557562]/45 focus-within:ring-4 focus-within:ring-[#557562]/10"><MagnifyingGlassIcon className="size-[18px] text-black/45" /><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/35" /></label>
          </form>
          <div className="mt-3 grid grid-cols-2 gap-2">{popularSearches.slice(0, 4).map((value) => <button key={value} type="button" onClick={() => { setMenuOpen(false); choosePopularSearch(value) }} className="hf-button-tertiary !min-h-11 px-3 py-2 text-xs">{value}</button>)}</div>

          <nav className="mt-4 grid" aria-label="Mobile shop navigation">
            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`border-b border-black/[.05] py-4 text-base font-semibold ${isActive(item.href) ? 'text-[#355f4a]' : 'text-[#172018]'}`}>{item.label}</Link>)}
            <Link href="/collections/under-20" onClick={() => setMenuOpen(false)} className="border-b border-black/[.05] py-4 text-base text-[var(--hf-brand)]">Finds under £20</Link>
          </nav>

          <div className="mt-5 border-t border-black/[.07] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-black/35">Customer care</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Link href="/track-order" onClick={() => setMenuOpen(false)} className="rounded-[var(--hf-radius-md)] bg-[var(--hf-brand-soft)] px-3 py-3 text-center text-xs font-semibold text-[var(--hf-brand)]">Track order</Link>
              <Link href="/returns" onClick={() => setMenuOpen(false)} className="rounded-[var(--hf-radius-md)] bg-[var(--hf-brand-soft)] px-3 py-3 text-center text-xs font-semibold text-[var(--hf-brand)]">Returns</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="rounded-[var(--hf-radius-md)] bg-[var(--hf-brand-soft)] px-3 py-3 text-center text-xs font-semibold text-[var(--hf-brand)]">Contact</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
