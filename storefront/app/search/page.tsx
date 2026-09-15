import Link from 'next/link'
import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { getProducts } from '@/lib/woocommerce/client'
import { ProductCard } from '@/components/product/product-card'
import { searchStoreProducts } from '@/lib/storefront/search'
import { STORE_CATEGORIES } from '@/lib/storefront/categories'
import { dedupeStoreProducts } from '@/lib/storefront/catalog'
import { isSupportIntent, searchHelp } from '@/lib/storefront/help'
import { SearchTracker } from '@/components/analytics/search-tracker'

export const metadata = {
  title: 'Search',
  description: 'Search Housefinds products, delivery information, returns, support and order tracking.',
  robots: { index: false, follow: true },
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const query = q.trim()
  const supportIntent = isSupportIntent(query)
  let catalogUnavailable = false
  const products = supportIntent ? [] : dedupeStoreProducts(await getProducts({ per_page: 100 }).catch(() => {
    catalogUnavailable = true
    return []
  }))
  const results = query && !supportIntent && !catalogUnavailable ? searchStoreProducts(products, query) : []
  const helpResults = query ? searchHelp(query) : []
  const hasResults = results.length > 0 || helpResults.length > 0

  return (
    <main className="bg-[var(--hf-background)] px-5 pb-24 pt-10 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        <div className={`mx-auto max-w-3xl text-center ${query ? 'pt-1' : 'pt-3'}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Search Housefinds</p>
          <h1 className={`${query ? 'mt-3 text-[clamp(2.8rem,5vw,4.8rem)]' : 'mt-4 text-[clamp(3.4rem,6vw,6.4rem)]'} font-semibold leading-[.92] tracking-[-.06em]`}>{query ? <>Search results for<br /><span className="text-[var(--hf-brand-muted)]">“{query}”</span></> : <>Find a product,<br /><span className="text-[var(--hf-brand-muted)]">answer or order update.</span></>}</h1>
          <p className={`mx-auto max-w-2xl leading-8 text-black/50 ${query ? 'mt-4 text-base' : 'mt-5 text-lg'}`}>{query ? 'Refine the search, browse matching products or jump straight to order and support information.' : 'Search by product, use or problem — or ask for things like “track order”, “returns”, “damaged item” or “delivery”.'}</p>
          <form action="/search" className="mx-auto mt-8 flex max-w-2xl items-center rounded-full border border-black/10 bg-white p-1.5 shadow-[0_14px_50px_rgba(31,42,34,.06)]" role="search">
            <MagnifyingGlassIcon className="ml-4 size-5 shrink-0 text-black/52" />
            <label htmlFor="housefinds-search" className="sr-only">Search Housefinds</label><input id="housefinds-search" name="q" defaultValue={q} autoFocus placeholder="What are you trying to find, fix or check?" className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-black/32" />
            <button className="h-12 rounded-full bg-[#355f4a] px-6 text-sm font-semibold text-white">Search</button>
          </form>
        </div>

        {query && <SearchTracker query={query} resultCount={results.length + helpResults.length} />}

        {!query ? (
          <section className="mt-14">
            <p className="text-center text-sm font-semibold text-black/55">Start with a category or a common task</p>
            <div className="mx-auto mt-5 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STORE_CATEGORIES.map((category) => (
                <Link key={category.slug} href={`/shop?category=${category.slug}`} className={`rounded-[var(--hf-radius-md)] ${category.tone} p-5 transition hover:-translate-y-1`}>
                  <p className="font-semibold text-[#172018]">{category.title}</p>
                  <p className="mt-2 text-sm leading-5 text-black/58">{category.copy}</p>
                </Link>
              ))}
            </div>
            <div className="mx-auto mt-4 grid max-w-4xl gap-3 sm:grid-cols-3">
              <Link href="/track-order" className="rounded-[var(--hf-radius-md)] border border-black/[.07] bg-white p-5 transition hover:border-[#557562]/30 hover:bg-[#f4f7f3]"><p className="font-semibold">Track an order</p><p className="mt-1 text-sm text-black/55">Check the latest order status.</p></Link>
              <Link href="/returns" className="rounded-[var(--hf-radius-md)] border border-black/[.07] bg-white p-5 transition hover:border-[#557562]/30 hover:bg-[#f4f7f3]"><p className="font-semibold">Returns & problems</p><p className="mt-1 text-sm text-black/55">Refunds, damage and replacements.</p></Link>
              <Link href="/shipping" className="rounded-[var(--hf-radius-md)] border border-black/[.07] bg-white p-5 transition hover:border-[#557562]/30 hover:bg-[#f4f7f3]"><p className="font-semibold">Delivery</p><p className="mt-1 text-sm text-black/55">Free UK delivery and timing.</p></Link>
            </div>
          </section>
        ) : (
          <>
            {catalogUnavailable && !supportIntent && (
              <div className="mx-auto mt-10 max-w-4xl rounded-[var(--hf-radius-md)] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">The product catalogue is temporarily slow to respond. Help and order information is still available; refresh to retry product search.</div>
            )}
            {helpResults.length > 0 && (
              <section className="mx-auto mt-14 max-w-5xl">
                <div className="flex items-end justify-between gap-4">
                  <div><p className="text-xs uppercase tracking-[.2em] text-black/52">Help & order information</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Useful answers for “{q}”</h2></div>
                  <Link href="/faq" className="hidden text-sm font-semibold text-[#355f4a] sm:inline">View FAQ →</Link>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {helpResults.map((item) => (
                    <Link key={item.href} href={item.href} className="group flex items-center justify-between gap-5 rounded-[var(--hf-radius-md)] border border-black/[.07] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#557562]/30">
                      <div><p className="text-lg font-semibold tracking-[-.025em] text-[#172018]">{item.title}</p><p className="mt-2 text-sm leading-6 text-black/58">{item.description}</p></div><ArrowRightIcon className="size-5 shrink-0 text-[#557562] transition group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.length > 0 && (
              <section className="mt-16">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div><p className="text-xs uppercase tracking-[.2em] text-black/52">Product results</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">{results.length} product{results.length === 1 ? '' : 's'} for “{q}”</h2></div>
                  <Link href="/shop" className="text-sm font-semibold text-[#355f4a]">Browse all products →</Link>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
                  {results.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              </section>
            )}

            {supportIntent && helpResults.length > 0 && (
              <div className="mx-auto mt-8 max-w-5xl rounded-2xl bg-[#f1f3ee] px-5 py-4 text-sm leading-6 text-black/58">
                Looking for a product instead? <Link href="/shop" className="font-semibold text-[#355f4a] underline underline-offset-3">Browse the shop</Link> or search by the product or problem it solves.
              </div>
            )}

            {!hasResults && !catalogUnavailable && (
              <section className="mx-auto mt-16 max-w-3xl rounded-[var(--hf-radius-lg)] bg-[#f0f1eb] p-8 text-center sm:p-12">
                <h2 className="text-3xl font-semibold tracking-[-.04em]">No exact match for “{q}”.</h2>
                <p className="mx-auto mt-3 max-w-xl text-black/58">Try a broader product word such as “kitchen”, “door”, “storage” or “light”, or use the help centre for delivery, returns and order questions.</p>
                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  <Link href="/faq" className="rounded-full bg-[#355f4a] px-4 py-2 text-sm font-semibold text-white">Help centre</Link>
                  <Link href="/track-order" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold">Track order</Link>
                  {STORE_CATEGORIES.slice(0, 3).map((category) => <Link key={category.slug} href={`/shop?category=${category.slug}`} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold">{category.title}</Link>)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
