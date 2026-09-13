import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { getProducts } from '@/lib/woocommerce/client'
import { ProductCard } from '@/components/product/product-card'
import { searchStoreProducts } from '@/lib/storefront/search'
import { STORE_CATEGORIES } from '@/lib/storefront/categories'

export const metadata = { title: 'Search' }

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const products = await getProducts({ per_page: 100 })
  const results = q.trim() ? searchStoreProducts(products, q) : []

  return (
    <main className="bg-[#fbfaf7] px-5 pb-24 pt-12 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Product search</p>
          <h1 className="mt-4 text-[clamp(3.6rem,6vw,6.8rem)] font-semibold leading-[.9] tracking-[-.065em]">Find it by name,<br /><span className="text-[#557562]">use or problem.</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-black/48">Try a product name or describe what you need — for example “door”, “shoe storage”, “mosquito”, “kitchen” or “closet light”.</p>
          <form action="/search" className="mx-auto mt-8 flex max-w-2xl items-center rounded-full border border-black/10 bg-white p-1.5 shadow-[0_14px_50px_rgba(31,42,34,.06)]" role="search">
            <MagnifyingGlassIcon className="ml-4 size-5 shrink-0 text-black/40" />
            <input name="q" defaultValue={q} autoFocus placeholder="What are you trying to find or fix?" className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-black/32" />
            <button className="h-12 rounded-full bg-[#355f4a] px-6 text-sm font-semibold text-white">Search</button>
          </form>
        </div>

        {!q.trim() ? (
          <section className="mt-14">
            <p className="text-center text-sm font-semibold text-black/45">Or start with a category</p>
            <div className="mx-auto mt-5 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STORE_CATEGORIES.map((category) => (
                <Link key={category.slug} href={`/shop?category=${category.slug}`} className={`rounded-[24px] ${category.tone} p-5 transition hover:-translate-y-1`}>
                  <p className="font-semibold text-[#172018]">{category.title}</p>
                  <p className="mt-2 text-sm leading-5 text-black/48">{category.copy}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : results.length > 0 ? (
          <section className="mt-16">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div><p className="text-xs uppercase tracking-[.2em] text-black/38">Search results</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">{results.length} result{results.length === 1 ? '' : 's'} for “{q}”</h2></div>
              <Link href="/shop" className="text-sm font-semibold text-[#355f4a]">Browse all products →</Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
              {results.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        ) : (
          <section className="mx-auto mt-16 max-w-3xl rounded-[32px] bg-[#f0f1eb] p-8 text-center sm:p-12">
            <h2 className="text-3xl font-semibold tracking-[-.04em]">No exact match for “{q}”.</h2>
            <p className="mx-auto mt-3 max-w-xl text-black/48">Try a broader word such as “kitchen”, “door”, “storage”, “light” or “bathroom”, or browse one of the categories below.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {STORE_CATEGORIES.map((category) => <Link key={category.slug} href={`/shop?category=${category.slug}`} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold">{category.title}</Link>)}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
