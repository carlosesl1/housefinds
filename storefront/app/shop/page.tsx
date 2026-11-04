import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { editorialFont } from '@/lib/storefront/editorial-font'
import { getProducts } from '@/lib/woocommerce/client'
import { ProductCard } from '@/components/product/product-card'
import { FindYourFit } from '@/components/shop/find-your-fit'
import { CatalogFilters } from '@/components/shop/catalog-filters'
import { CategoryBanner } from '@/components/shop/category-banner'
import { STORE_CATEGORIES, filterProductsByStoreCategory, getStoreCategory } from '@/lib/storefront/categories'
import { dedupeStoreProducts } from '@/lib/storefront/catalog'
import { isSupportIntent } from '@/lib/storefront/help'
import { SHOP_PRICES, SHOP_SORTS, filterShopPrice, searchShopProducts, shopHref, shopSortQuery, type ShopState } from '@/lib/storefront/shop'
import styles from '@/components/shop/shop.module.css'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const category = getStoreCategory(typeof params.category === 'string' ? params.category : '')
  return {
    title: category?.title || 'Shop',
    description: category?.copy || 'Find useful products for your home. Explore kitchen tools, space-saving ideas and everyday helpers, with free UK delivery.',
    ...(params.q ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams
  const param = (name: string) => typeof raw[name] === 'string' ? raw[name] as string : ''
  const sort = SHOP_SORTS.find(item => item.value === param('sort')) || SHOP_SORTS[0]
  const price = SHOP_PRICES.find(item => item.value === param('price'))
  const category = getStoreCategory(param('category'))
  const q = param('q').trim().slice(0, 120)
  const inStock = param('stock') === 'in-stock'
  if (isSupportIntent(q)) redirect(`/search?q=${encodeURIComponent(q)}`)
  const state: ShopState = { category: category?.slug, price: price?.value, sort: sort.value, q, stock: inStock ? 'in-stock' : '' }
  const href = (updates: ShopState = {}) => `${shopHref(state, updates)}#shop-results`
  const clearHref = href({ category: '', price: '', q: '', stock: '' })
  let unavailable = false
  const allProducts = dedupeStoreProducts(await getProducts({ per_page: 100, ...shopSortQuery(sort.value) }).catch(() => { unavailable = true; return [] }))
  const searched = searchShopProducts(allProducts, q, sort.value)
  const available = inStock ? searched.filter(product => product.is_in_stock && product.is_purchasable) : searched
  const scoped = filterProductsByStoreCategory(available, category?.slug)
  const products = filterShopPrice(scoped, price?.value)
  const categoryCounts = new Map(STORE_CATEGORIES.map(item => [item.slug, filterShopPrice(filterProductsByStoreCategory(available, item.slug), price?.value).length]))
  const priceCounts = new Map(SHOP_PRICES.map(item => [item.value, filterShopPrice(scoped, item.value).length]))
  const filterCount = Number(Boolean(category)) + Number(Boolean(price)) + Number(Boolean(q)) + Number(inStock)
  const otherCategories = STORE_CATEGORIES.filter(item => item.slug !== category?.slug && filterProductsByStoreCategory(allProducts, item.slug).length > 0).slice(0, 3)

  return <main className={`${editorialFont.variable} hf-editorial-scope ${styles.page}`}>
    <div className="hf-container">
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link prefetch={false} href="/">Home</Link><ChevronRightIcon aria-hidden="true" />
        {category ? <><Link prefetch={false} href="/shop">Shop</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">{category.title}</span></> : <span aria-current="page">Shop all</span>}
      </nav>
      <CategoryBanner category={category} products={filterProductsByStoreCategory(allProducts, category?.slug)} />
      {unavailable ? <section className={styles.empty} role="status">
        <h2>The collection is taking a little longer to load.</h2><p>Please try again in a moment. You can still get help with an existing order.</p>
        <div><Link prefetch={false} href={shopHref(state)} className="hf-button-primary">Try again</Link><Link prefetch={false} href="/contact" className="hf-button-secondary">Contact us</Link></div>
      </section> : <>
        <div className={styles.catalog} id="shop-results">
          <aside className={styles.sidebar} aria-label="Filter products">
            <CatalogFilters count={filterCount}>
                <nav aria-label="Filter by category"><h2>Shop by category</h2>
                  {[{ slug: '', title: 'All finds' }, ...STORE_CATEGORIES].map(item => {
                    const selected = (category?.slug || '') === item.slug
                    return <Link prefetch={false} key={item.slug} href={href({ category: item.slug })} aria-current={selected ? 'true' : undefined} className={styles.filterOption}><span className={styles.check}>{selected && <CheckIcon aria-hidden="true" />}</span><span>{item.title}</span><small>{item.slug ? categoryCounts.get(item.slug) : filterShopPrice(available, price?.value).length}</small></Link>
                  })}
                </nav>
                <nav aria-label="Filter by price"><h2>Your budget</h2>
                  {[{ value: '', label: 'Any price' }, ...SHOP_PRICES].map(item => {
                    const selected = (price?.value || '') === item.value
                    return <Link prefetch={false} key={item.value} href={href({ price: item.value })} aria-current={selected ? 'true' : undefined} className={styles.filterOption}><span className={styles.check}>{selected && <CheckIcon aria-hidden="true" />}</span><span>{item.label}</span><small>{item.value ? priceCounts.get(item.value) : scoped.length}</small></Link>
                  })}
                  <p className={styles.filterNote}>Products with options may span more than one price range.</p>
                </nav>
                <nav aria-label="Filter by availability"><h2>Availability</h2><Link prefetch={false} href={href({ stock: inStock ? '' : 'in-stock' })} aria-current={inStock ? 'true' : undefined} className={styles.filterOption}><span className={styles.check}>{inStock && <CheckIcon aria-hidden="true" />}</span><span>In stock only</span></Link></nav>
                {filterCount > 0 && <Link prefetch={false} className={styles.clear} href={clearHref}>Clear all filters <XMarkIcon aria-hidden="true" /></Link>}
            </CatalogFilters>
            <div className={styles.help}><p>A little help finding it?</p><span>We’re here for product questions, delivery and returns.</span><Link prefetch={false} href="/contact">Ask Housefinds <ArrowRightIcon aria-hidden="true" /></Link></div>
          </aside>
          <section className={styles.results} aria-labelledby="shop-products-heading">
            <div className={styles.toolbar}>
              <div><h2 id="shop-products-heading">{q ? `Results for “${q}”` : category?.title || 'Explore all finds'}</h2><p>{products.length} product{products.length === 1 ? '' : 's'}{filterCount ? ' matching your choices' : ' for a more useful home'}</p></div>
              <details key={shopHref(state)} className={styles.sort}>
                <summary><span>Sort: <strong>{sort.label}</strong></span><ChevronDownIcon aria-hidden="true" /></summary>
                <nav aria-label="Sort products">{SHOP_SORTS.map(item => <Link prefetch={false} key={item.value} href={href({ sort: item.value })} aria-current={sort.value === item.value ? 'true' : undefined}>{item.label}{sort.value === item.value && <CheckIcon aria-hidden="true" />}</Link>)}</nav>
              </details>
            </div>
            {filterCount > 0 && <div className={styles.applied} aria-label="Applied filters">
              {[category && { label: category.title, update: { category: '' } }, price && { label: price.label, update: { price: '' } }, q && { label: `Search: ${q}`, update: { q: '' } }, inStock && { label: 'In stock', update: { stock: '' } }].filter(item => !!item).map(item => item && <Link prefetch={false} key={item.label} href={href(item.update)} aria-label={`Remove filter: ${item.label}`}>{item.label}<XMarkIcon aria-hidden="true" /></Link>)}
              <Link prefetch={false} href={clearHref} className={styles.clear}>Clear all</Link>
            </div>}
            {products.length ? <div className={styles.productGrid}>
              {products.slice(0, 3).map(product => <ProductCard key={product.id} product={product} quickAdd />)}
              {!filterCount && <FindYourFit categories={STORE_CATEGORIES.filter(item => filterProductsByStoreCategory(allProducts, item.slug).length > 0).map(item => item.slug)} />}
              {products.slice(3).map(product => <ProductCard key={product.id} product={product} quickAdd />)}
            </div> : <div className={styles.empty}>
              <MagnifyingGlassIcon className={styles.emptyIcon} aria-hidden="true" /><h3>No finds for this combination yet.</h3><p>Try a wider budget or a simpler search, such as “storage” or “kitchen”.</p><div><Link prefetch={false} href={href({ price: '', q: '', stock: '' })} className="hf-button-primary hf-button-sm">{category ? 'View this category' : 'Reset search'}</Link><Link prefetch={false} href={clearHref} className="hf-button-secondary hf-button-sm">Browse all finds</Link></div>
            </div>}
          </section>
        </div>
        {otherCategories.length > 0 && <section className={styles.discover} aria-labelledby="discover-title">
          <div className={styles.discoverHeading}><p className="hf-eyebrow">A different place to start</p><h2 id="discover-title">More ways <span className="hf-accent">to make home work.</span></h2></div>
          <div className={styles.discoverGrid}>{otherCategories.map(item => <Link prefetch={false} key={item.slug} href={`/shop?category=${item.slug}`}><span>{item.shortTitle}</span><h3>{item.title}</h3><p>{item.copy}</p><span className={styles.discoverAction}>Explore {filterProductsByStoreCategory(allProducts, item.slug).length} finds <ArrowRightIcon aria-hidden="true" /></span></Link>)}</div>
        </section>}
      </>}
    </div>
  </main>
}
