import Link from 'next/link'
import {
  ArrowRightIcon,
  CubeTransparentIcon,
  LightBulbIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline'
import { getProductReviews, getProducts } from '@/lib/woocommerce/client'
import { findProductByKeywords } from '@/lib/woocommerce/presentation'
import { dedupeStoreProducts } from '@/lib/storefront/catalog'
import { Hero } from '@/components/home/hero'
import { CategoryGrid } from '@/components/home/category-grid'
import { FeaturedFind } from '@/components/home/featured-find'
import { ProductReviewHighlights } from '@/components/home/product-review-highlights'
import { ProductCard } from '@/components/product/product-card'

export default async function HomePage() {
  const [rawProducts, reviews] = await Promise.all([
    getProducts({ per_page: 16 }),
    getProductReviews(undefined, 8).catch(() => []),
  ])
  const products = dedupeStoreProducts(rawProducts)

  const featuredProduct =
    findProductByKeywords(products, ['spoon scale']) ||
    findProductByKeywords(products, ['motion sensor led']) ||
    products[0]

  const showcaseProducts = products.filter((product) => product.id !== featuredProduct?.id).slice(0, 8)

  return (
    <main className="overflow-hidden bg-[var(--hf-background)]">
      <Hero products={products} />

      {showcaseProducts.length > 0 && (
        <section className="hf-section bg-[var(--hf-background)]">
          <div className="hf-container">
            <div className="grid gap-7 lg:grid-cols-[1fr_390px] lg:items-end">
              <div>
                <p className="hf-eyebrow">Explore the collection</p>
                <h2 className="hf-section-title mt-5 max-w-[850px]">Useful things, <span className="text-[var(--hf-brand-muted)]">without the clutter.</span></h2>
              </div>
              <div className="lg:justify-self-end">
                <p className="hf-copy-lg max-w-md">A quick edit of practical products already in the Housefinds collection.</p>
                <Link href="/shop" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--hf-brand)]">Browse the full shop <ArrowRightIcon className="size-4" /></Link>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-5">
              {showcaseProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      <CategoryGrid products={products} />
      <FeaturedFind product={featuredProduct} />
      <ProductReviewHighlights products={products} reviews={reviews} />

      <section className="hf-section border-t border-black/[.06] bg-[var(--hf-surface-soft)]">
        <div className="hf-container grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="hf-eyebrow">The Housefinds standard</p>
            <h2 className="hf-section-title mt-5 max-w-[700px]">A smaller, smarter edit for the home.</h2>
            <p className="hf-copy-lg mt-6 max-w-xl">We would rather show fewer useful ideas clearly than fill the store with things that do not earn their space.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:self-end">
            {[
              { icon: RectangleGroupIcon, title: 'Useful first', copy: 'A product should solve something real before it earns a place in the store.' },
              { icon: LightBulbIcon, title: 'Easy to understand', copy: 'The best finds make sense quickly and fit naturally into everyday routines.' },
              { icon: CubeTransparentIcon, title: 'Worth the space', copy: 'Practical upgrades should feel more useful than the room they take up.' },
            ].map(({ icon: Icon, title, copy }) => (
              <article key={title} className="border-t border-black/10 pt-5">
                <Icon className="size-5 text-[var(--hf-brand-muted)]" />
                <h3 className="mt-5 text-xl font-semibold tracking-[-.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/48">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
