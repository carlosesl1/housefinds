import Link from 'next/link'
import {
  AdjustmentsHorizontalIcon,
  BarsArrowDownIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { getProducts } from '@/lib/woocommerce/client'
import { ProductCard } from '@/components/product/product-card'
import { STORE_CATEGORIES, filterProductsByStoreCategory, getStoreCategory } from '@/lib/storefront/categories'
import { dedupeStoreProducts } from '@/lib/storefront/catalog'
import type { WooProduct } from '@/lib/woocommerce/types'

export const metadata = { title: 'Shop' }

type ShopSearchParams = { category?: string; sort?: string; price?: string }

const sorts = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'new', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
]

const priceFilters = [
  { value: 'under-10', label: 'Under £10' },
  { value: '10-20', label: '£10–£20' },
  { value: '20-plus', label: '£20+' },
]

function sortQuery(sort: string) {
  if (sort === 'new') return { orderby: 'date', order: 'desc' as const }
  if (sort === 'popular') return { orderby: 'popularity', order: 'desc' as const }
  if (sort === 'price-low') return { orderby: 'price', order: 'asc' as const }
  if (sort === 'price-high') return { orderby: 'price', order: 'desc' as const }
  return { orderby: 'menu_order', order: 'asc' as const }
}

function productPriceBounds(product: WooProduct) {
  const divisor = Math.pow(10, product.prices.currency_minor_unit)
  const range = product.prices.price_range
  if (range) return { min: Number(range.min_amount) / divisor, max: Number(range.max_amount) / divisor }
  const price = Number(product.prices.price) / divisor
  return { min: price, max: price }
}

function filterByPrice(products: WooProduct[], filter?: string) {
  if (!filter) return products
  return products.filter((product) => {
    const { min, max } = productPriceBounds(product)
    if (filter === 'under-10') return min < 10
    if (filter === '10-20') return max >= 10 && min < 20
    if (filter === '20-plus') return max >= 20
    return true
  })
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  const params = await searchParams
  const activeSort = sorts.some((item) => item.value === params.sort) ? params.sort || 'recommended' : 'recommended'
  const activePrice = priceFilters.some((item) => item.value === params.price) ? params.price : undefined
  const activeCategory = getStoreCategory(params.category)
  const activeCategorySlug = activeCategory?.slug
  const activePriceMeta = priceFilters.find((item) => item.value === activePrice)
  const activeSortMeta = sorts.find((item) => item.value === activeSort) || sorts[0]
  const query = sortQuery(activeSort)
  let catalogUnavailable = false
  const allProducts = dedupeStoreProducts(await getProducts({ per_page: 100, ...query }).catch(() => {
    catalogUnavailable = true
    return []
  }))
  const categoryScopedProducts = filterProductsByStoreCategory(allProducts, activeCategorySlug)
  const products = filterByPrice(categoryScopedProducts, activePrice)
  const hasFilters = Boolean(activeCategory || activePrice)
  const activeFilterCount = Number(Boolean(activeCategory)) + Number(Boolean(activePrice))

  const categoryCounts = new Map(
    STORE_CATEGORIES.map((category) => [
      category.slug,
      filterByPrice(filterProductsByStoreCategory(allProducts, category.slug), activePrice).length,
    ]),
  )
  const allCategoryCount = filterByPrice(allProducts, activePrice).length
  const priceCounts = new Map(
    priceFilters.map((filter) => [filter.value, filterByPrice(categoryScopedProducts, filter.value).length]),
  )

  const makeHref = (next: { category?: string; sort?: string; price?: string }) => {
    const url = new URLSearchParams()
    const category = next.category === undefined ? activeCategorySlug : next.category
    const sort = next.sort === undefined ? activeSort : next.sort
    const price = next.price === undefined ? activePrice : next.price
    if (category) url.set('category', category)
    if (sort && sort !== 'recommended') url.set('sort', sort)
    if (price) url.set('price', price)
    const queryString = url.toString()
    return `/shop${queryString ? `?${queryString}` : ''}`
  }

  const clearFiltersHref = makeHref({ category: '', price: '' })

  return (
    <main className="bg-[#fbfaf7] px-5 pb-24 pt-9 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <nav className="flex items-center gap-2 text-sm text-black/55" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-black">Home</Link><ChevronRightIcon className="size-3.5" />
          <span className="text-black/65">Shop</span>
          {activeCategory && <><ChevronRightIcon className="size-3.5" /><span className="text-black/65">{activeCategory.title}</span></>}
        </nav>

        <div className="mt-10 max-w-[1050px]">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Housefinds collection</p>
          <h1 className="mt-4 text-[clamp(3.2rem,5vw,5.8rem)] font-semibold leading-[.9] tracking-[-.065em]">
            {activeCategory ? activeCategory.title : 'Clever finds'}<br />
            <span className="text-[#557562]">for everyday living.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-black/58">
            {activeCategory?.copy || 'Browse useful home products by category, narrow the results and open any product for full details before adding it to your cart.'}
          </p>
        </div>

        {catalogUnavailable && (
          <section className="mt-10 rounded-[var(--hf-radius-lg)] border border-amber-200 bg-amber-50 p-6 sm:p-8" role="status">
            <p className="hf-eyebrow text-amber-700">Collection reconnecting</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-.035em] text-amber-950">The product catalogue is taking longer than usual to respond.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-900/75">Your cart is separate. Refresh this page in a moment, or use customer support if you were checking an existing order.</p>
            <div className="mt-5 flex flex-wrap gap-2"><Link href="/shop" className="hf-button-primary hf-button-sm">Try again</Link><Link href="/track-order" className="hf-button-secondary hf-button-sm">Track an order</Link></div>
          </section>
        )}

        {!catalogUnavailable && <section className="mt-12" aria-label="Product filters and sorting">
          <div className="overflow-visible rounded-[var(--hf-radius-lg)] border border-black/[.07] bg-white/82 shadow-[0_14px_42px_rgba(29,42,34,.045)]">
            <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="mr-1 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--hf-ink)]">
                  <AdjustmentsHorizontalIcon className="size-[18px] text-[var(--hf-brand-muted)]" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="grid size-6 place-items-center rounded-full bg-[var(--hf-brand)] text-[11px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </span>

                <details className="group relative">
                  <summary className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[var(--hf-radius-pill)] border px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hf-brand-muted)] ${activeCategory ? 'border-[#557562]/45 bg-[#e4ede7] text-[#294b3a]' : 'border-black/10 bg-white text-black/62 hover:border-black/20'}`}>
                    <span className="font-semibold">Category</span>
                    {activeCategory && <span className="max-w-[150px] truncate">· {activeCategory.title}</span>}
                    <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-[min(300px,calc(100vw-2.5rem))] overflow-hidden rounded-[var(--hf-radius-md)] border border-black/[.08] bg-white p-2 shadow-[var(--hf-shadow-float)]">
                    <div className="px-3 pb-2 pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-black/52">Choose a category</p>
                    </div>
                    <div className="space-y-1">
                      <Link href={makeHref({ category: '' })} className={`flex min-h-11 items-center justify-between gap-3 rounded-[var(--hf-radius-sm)] px-3 text-sm transition ${!activeCategory ? 'bg-[var(--hf-brand-soft)] font-semibold text-[var(--hf-brand)]' : 'text-black/62 hover:bg-black/[.035]'}`}>
                        <span className="flex items-center gap-2.5">
                          <span className={`grid size-5 place-items-center rounded-full border ${!activeCategory ? 'border-[var(--hf-brand-muted)] bg-white' : 'border-black/10'}`}>
                            {!activeCategory && <CheckIcon className="size-3.5" />}
                          </span>
                          All products
                        </span>
                        <span className="text-xs tabular-nums text-black/52">{allCategoryCount}</span>
                      </Link>
                      {STORE_CATEGORIES.map((category) => {
                        const selected = activeCategory?.slug === category.slug
                        return (
                          <Link key={category.slug} href={makeHref({ category: category.slug })} className={`flex min-h-11 items-center justify-between gap-3 rounded-[var(--hf-radius-sm)] px-3 text-sm transition ${selected ? 'bg-[var(--hf-brand-soft)] font-semibold text-[var(--hf-brand)]' : 'text-black/62 hover:bg-black/[.035]'}`}>
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${selected ? 'border-[var(--hf-brand-muted)] bg-white' : 'border-black/10'}`}>
                                {selected && <CheckIcon className="size-3.5" />}
                              </span>
                              <span className="truncate">{category.title}</span>
                            </span>
                            <span className="text-xs tabular-nums text-black/52">{categoryCounts.get(category.slug) || 0}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </details>

                <details className="group relative">
                  <summary className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[var(--hf-radius-pill)] border px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hf-brand-muted)] ${activePriceMeta ? 'border-[#557562]/45 bg-[#e4ede7] text-[#294b3a]' : 'border-black/10 bg-white text-black/62 hover:border-black/20'}`}>
                    <TagIcon className="size-4" />
                    <span className="font-semibold">Price</span>
                    {activePriceMeta && <span>· {activePriceMeta.label}</span>}
                    <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-[min(270px,calc(100vw-2.5rem))] overflow-hidden rounded-[var(--hf-radius-md)] border border-black/[.08] bg-white p-2 shadow-[var(--hf-shadow-float)]">
                    <div className="px-3 pb-2 pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-black/52">Price range</p>
                    </div>
                    <div className="space-y-1">
                      <Link href={makeHref({ price: '' })} className={`flex min-h-11 items-center justify-between gap-3 rounded-[var(--hf-radius-sm)] px-3 text-sm transition ${!activePrice ? 'bg-[var(--hf-brand-soft)] font-semibold text-[var(--hf-brand)]' : 'text-black/62 hover:bg-black/[.035]'}`}>
                        <span className="flex items-center gap-2.5">
                          <span className={`grid size-5 place-items-center rounded-full border ${!activePrice ? 'border-[var(--hf-brand-muted)] bg-white' : 'border-black/10'}`}>
                            {!activePrice && <CheckIcon className="size-3.5" />}
                          </span>
                          Any price
                        </span>
                        <span className="text-xs tabular-nums text-black/52">{categoryScopedProducts.length}</span>
                      </Link>
                      {priceFilters.map((item) => {
                        const selected = activePrice === item.value
                        return (
                          <Link key={item.value} href={makeHref({ price: selected ? '' : item.value })} className={`flex min-h-11 items-center justify-between gap-3 rounded-[var(--hf-radius-sm)] px-3 text-sm transition ${selected ? 'bg-[var(--hf-brand-soft)] font-semibold text-[var(--hf-brand)]' : 'text-black/62 hover:bg-black/[.035]'}`}>
                            <span className="flex items-center gap-2.5">
                              <span className={`grid size-5 place-items-center rounded-full border ${selected ? 'border-[var(--hf-brand-muted)] bg-white' : 'border-black/10'}`}>
                                {selected && <CheckIcon className="size-3.5" />}
                              </span>
                              {item.label}
                            </span>
                            <span className="text-xs tabular-nums text-black/52">{priceCounts.get(item.value) || 0}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </details>
              </div>

              <details className="group relative w-full sm:w-auto">
                <summary className="flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-3 rounded-[var(--hf-radius-pill)] border border-black/10 bg-[#f8f8f4] px-4 text-sm text-black/62 transition hover:border-black/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hf-brand-muted)] sm:w-auto sm:min-w-[220px]">
                  <span className="flex items-center gap-2 font-semibold text-[var(--hf-ink)]"><BarsArrowDownIcon className="size-[18px] text-[var(--hf-brand-muted)]" /> Sort</span>
                  <span className="ml-auto">{activeSortMeta.label}</span>
                  <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-full min-w-[min(270px,calc(100vw-2.5rem))] overflow-hidden rounded-[var(--hf-radius-md)] border border-black/[.08] bg-white p-2 shadow-[var(--hf-shadow-float)] sm:w-[290px]">
                  <div className="px-3 pb-2 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-black/52">Sort products</p>
                  </div>
                  <div className="space-y-1">
                    {sorts.map((item) => {
                      const selected = activeSort === item.value
                      return (
                        <Link key={item.value} href={makeHref({ sort: item.value })} className={`flex min-h-11 items-center justify-between rounded-[var(--hf-radius-sm)] px-3 text-sm transition ${selected ? 'bg-[var(--hf-brand-soft)] font-semibold text-[var(--hf-brand)]' : 'text-black/62 hover:bg-black/[.035]'}`}>
                          <span>{item.label}</span>
                          {selected && <CheckIcon className="size-4" />}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </details>
            </div>

            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 border-t border-black/[.06] bg-[#fafbf8] px-4 py-3 sm:px-5">
                <span className="mr-1 text-xs font-semibold uppercase tracking-[.12em] text-black/36">Applied</span>
                {activeCategory && (
                  <Link href={makeHref({ category: '' })} className="inline-flex min-h-9 items-center gap-2 rounded-[var(--hf-radius-pill)] border border-[#557562]/30 bg-white px-3 text-xs font-semibold text-[#294b3a] transition hover:border-[#557562]/55 hover:bg-[#f2f6f2]">
                    {activeCategory.title}<XMarkIcon className="size-3.5" />
                  </Link>
                )}
                {activePriceMeta && (
                  <Link href={makeHref({ price: '' })} className="inline-flex min-h-9 items-center gap-2 rounded-[var(--hf-radius-pill)] border border-[#557562]/30 bg-white px-3 text-xs font-semibold text-[#294b3a] transition hover:border-[#557562]/55 hover:bg-[#f2f6f2]">
                    {activePriceMeta.label}<XMarkIcon className="size-3.5" />
                  </Link>
                )}
                <Link href={clearFiltersHref} className="ml-auto inline-flex min-h-9 items-center rounded-[var(--hf-radius-pill)] px-3 text-xs font-semibold text-black/55 transition hover:bg-black/[.04] hover:text-black">
                  Clear all
                </Link>
              </div>
            )}
          </div>

          <div className="mt-7 flex items-end justify-between gap-4 border-b border-black/[.07] pb-4">
            <div>
              <p className="text-sm font-semibold text-[var(--hf-ink)]">
                {products.length} product{products.length === 1 ? '' : 's'}
              </p>
              {hasFilters && <p className="mt-1 text-xs text-black/52">Filtered from the Housefinds collection.</p>}
            </div>
            <p className="hidden text-xs text-black/52 sm:block">Sorted by <strong className="font-semibold text-black/55">{activeSortMeta.label}</strong></p>
          </div>
        </section>}

        {!catalogUnavailable && (products.length > 0 ? (
          <section className="mt-8" aria-labelledby="shop-products-heading">
            <h2 id="shop-products-heading" className="sr-only">Products</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        ) : (
          <div className="mt-12 rounded-[var(--hf-radius-lg)] bg-[#f0f1eb] p-10 text-center">
            <h2 className="text-3xl font-semibold tracking-[-.04em]">No products match those filters.</h2>
            <p className="mx-auto mt-3 max-w-lg text-black/58">Broaden the price range, remove a filter or search by the problem you are trying to solve.</p>
            <div className="mt-6 flex justify-center gap-3"><Link href={clearFiltersHref} className="hf-button-primary hf-button-sm">Clear filters</Link><Link href="/search" className="hf-button-secondary hf-button-sm">Search</Link></div>
          </div>
        ))}
      </div>
    </main>
  )
}
