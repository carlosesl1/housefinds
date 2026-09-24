import Link from 'next/link'
import { getProducts } from '@/lib/woocommerce/client'
import { dedupeStoreProducts } from '@/lib/storefront/catalog'
import { isUnderTwentyProduct } from '@/lib/storefront/home-promotions'
import { SITE_URL } from '@/lib/storefront/site-url'
import { editorialFont } from '@/lib/storefront/editorial-font'
import { ProductCard } from '@/components/product/product-card'

export const metadata = {
  title: 'Useful finds under £20',
  description: 'Shop practical Housefinds home upgrades priced below £20, with free standard UK delivery.',
  alternates: { canonical: `${SITE_URL}/collections/under-20` },
}

export default async function UnderTwentyCollection() {
  let unavailable = false
  const rawProducts = await getProducts({ per_page: 100, orderby: 'price', order: 'asc' }).catch(() => {
    unavailable = true
    return []
  })
  const products = dedupeStoreProducts(rawProducts).filter(isUnderTwentyProduct)
  return (
    <main className={`${editorialFont.variable} hf-editorial-scope hf-page`}>
      <div className="hf-container pb-16 pt-7 lg:pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-black/65">
          <Link href="/" className="hover:underline">Home</Link><span aria-hidden="true">/</span>
          <Link href="/shop" className="hover:underline">Shop</Link><span aria-hidden="true">/</span>
          <span aria-current="page">Under £20</span>
        </nav>
        <header className="mb-9 mt-9 max-w-2xl">
          <p className="hf-eyebrow text-[var(--hf-brand)]">Small upgrades, thoughtful prices</p>
          <h1 className="hf-editorial-title hf-editorial-collection-title mt-4">Useful finds <span className="text-[var(--hf-brand)]">under £20.</span></h1>
          <p className="mt-4 text-base leading-7 text-black/65">Practical home upgrades priced below £20. Every listed option of each product in this edit is under £20, with free standard UK delivery.</p>
        </header>
        {unavailable ? (
          <section className="hf-panel p-6" role="status">
            <h2 className="text-xl font-semibold">The collection is taking a moment.</h2>
            <p className="mt-3 text-sm leading-6 text-black/65">We could not check current prices and availability. Please try again.</p>
            <a href="/collections/under-20" className="hf-button-primary mt-5">Try again</a>
          </section>
        ) : products.length ? (
          <>
            <p className="mb-5 text-sm text-black/65">{products.length} useful find{products.length === 1 ? '' : 's'}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </>
        ) : (
          <section className="hf-panel p-6">
            <h2 className="text-xl font-semibold">More little finds are on their way.</h2>
            <p className="mt-3 text-sm leading-6 text-black/65">There are no available products in this edit right now. Explore the full collection instead.</p>
            <Link href="/shop" className="hf-button-primary mt-5">Browse the shop</Link>
          </section>
        )}
        {products.length > 0 && <Link href="/shop" className="hf-button-secondary mt-10">Explore all products</Link>}
      </div>
    </main>
  )
}
