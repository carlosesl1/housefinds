import Link from 'next/link'
import { AdjustmentsHorizontalIcon, ChevronRightIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getProducts } from '@/lib/woocommerce/client'
import { ProductCard } from '@/components/product/product-card'
import { STORE_CATEGORIES, filterProductsByStoreCategory, getStoreCategory } from '@/lib/storefront/categories'
import type { WooProduct } from '@/lib/woocommerce/types'

export const metadata = { title: 'Shop' }

type ShopSearchParams = { category?: string; sort?: string; price?: string; sale?: string }

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
  const query = sortQuery(activeSort)
  const allProducts = await getProducts({ per_page: 100, ...query })
  let products = filterProductsByStoreCategory(allProducts, params.category)
  products = filterByPrice(products, activePrice)
  if (params.sale === '1') products = products.filter((product) => product.on_sale)
  const activeCategory = getStoreCategory(params.category)
  const hasFilters = Boolean(activeCategory || activePrice || params.sale === '1' || activeSort !== 'recommended')

  const makeHref = (next: { category?: string; sort?: string; price?: string; sale?: string }) => {
    const url = new URLSearchParams()
    const category = next.category === undefined ? params.category : next.category
    const sort = next.sort === undefined ? activeSort : next.sort
    const price = next.price === undefined ? activePrice : next.price
    const sale = next.sale === undefined ? params.sale : next.sale
    if (category) url.set('category', category)
    if (sort && sort !== 'recommended') url.set('sort', sort)
    if (price) url.set('price', price)
    if (sale === '1') url.set('sale', '1')
    const queryString = url.toString()
    return `/shop${queryString ? `?${queryString}` : ''}`
  }

  return (
    <main className="bg-[#fbfaf7] px-5 pb-24 pt-9 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <nav className="flex items-center gap-2 text-sm text-black/42" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-black">Home</Link><ChevronRightIcon className="size-3.5" />
          <span className="text-black/65">Shop</span>
          {activeCategory && <><ChevronRightIcon className="size-3.5" /><span className="text-black/65">{activeCategory.title}</span></>}
        </nav>

        <div className="mt-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Housefinds collection</p>
            <h1 className="mt-4 text-[clamp(3.7rem,6vw,7.2rem)] font-semibold leading-[.9] tracking-[-.065em]">
              {activeCategory ? activeCategory.title : 'Clever finds'}<br />
              <span className="text-[#557562]">for everyday living.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-black/48">
              {activeCategory?.copy || 'Browse useful home products by category, narrow the results and open any product for full details before adding it to your cart.'}
            </p>
          </div>
          <div className="rounded-2xl bg-[#eef1ec] px-4 py-3 text-sm text-black/55">
            <strong className="text-[#172018]">{products.length}</strong> product{products.length === 1 ? '' : 's'} in this view
          </div>
        </div>

        <section className="mt-12 border-y border-black/[.07] py-5" aria-label="Product filters">
          <div className="space-y-4">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
                <span className="mr-1 hidden shrink-0 items-center gap-2 text-sm font-semibold text-black/45 sm:flex"><AdjustmentsHorizontalIcon className="size-4" /> Category</span>
                <Link href={makeHref({ category: '' })} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${!activeCategory ? 'border-[#557562] bg-[#e4ede7] text-[#294b3a]' : 'border-black/10 bg-white text-black/58 hover:border-black/20'}`}>All</Link>
                {STORE_CATEGORIES.map((category) => (
                  <Link key={category.slug} href={makeHref({ category: category.slug })} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCategory?.slug === category.slug ? 'border-[#557562] bg-[#e4ede7] text-[#294b3a]' : 'border-black/10 bg-white text-black/58 hover:border-black/20'}`}>{category.title}</Link>
                ))}
              </div>

              <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 text-sm">
                <span className="mr-1 shrink-0 font-semibold text-black/45">Sort</span>
                {sorts.map((item) => (
                  <Link key={item.value} href={makeHref({ sort: item.value })} className={`shrink-0 rounded-full px-3 py-2 transition ${activeSort === item.value ? 'bg-[#172018] font-semibold text-white' : 'text-black/50 hover:bg-black/5 hover:text-black'}`}>{item.label}</Link>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 inline-flex items-center gap-2 text-sm font-semibold text-black/45"><TagIcon className="size-4" /> Price</span>
              {priceFilters.map((item) => (
                <Link key={item.value} href={makeHref({ price: activePrice === item.value ? '' : item.value })} className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${activePrice === item.value ? 'border-[#557562] bg-[#e4ede7] text-[#294b3a]' : 'border-black/10 bg-white text-black/55 hover:border-black/20'}`}>{item.label}</Link>
              ))}
              <Link href={makeHref({ sale: params.sale === '1' ? '' : '1' })} className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${params.sale === '1' ? 'border-[#557562] bg-[#e4ede7] text-[#294b3a]' : 'border-black/10 bg-white text-black/55 hover:border-black/20'}`}>On sale</Link>
              {hasFilters && <Link href="/shop" className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-black/45 transition hover:bg-black/5 hover:text-black"><XMarkIcon className="size-3.5" /> Clear filters</Link>}
            </div>
          </div>
        </section>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="mt-12 rounded-[32px] bg-[#f0f1eb] p-10 text-center">
            <h2 className="text-3xl font-semibold tracking-[-.04em]">No products match those filters.</h2>
            <p className="mx-auto mt-3 max-w-lg text-black/48">Broaden the price range, remove a filter or search by the problem you are trying to solve.</p>
            <div className="mt-6 flex justify-center gap-3"><Link href="/shop" className="rounded-full bg-[#355f4a] px-5 py-3 text-sm font-semibold text-white">Clear filters</Link><Link href="/search" className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold">Search</Link></div>
          </div>
        )}
      </div>
    </main>
  )
}
