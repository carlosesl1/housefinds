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
import { HOME_COLLECTION_BG, PAPER_TEXTURE, SAGE_TEXTURE } from '@/lib/storefront/home-backgrounds'
import { Hero } from '@/components/home/hero'
import { CategoryGrid } from '@/components/home/category-grid'
import { EditorialBanners } from '@/components/home/editorial-banners'
import { FeaturedFind } from '@/components/home/featured-find'
import { ProductReviewHighlights } from '@/components/home/product-review-highlights'
import { ProductCard } from '@/components/product/product-card'

export default async function HomePage() {
  const [rawProducts, reviews] = await Promise.all([
    getProducts({ per_page: 16 }).catch(() => []),
    getProductReviews(undefined, 8).catch(() => []),
  ])
  const products = dedupeStoreProducts(rawProducts)

  const featuredProduct =
    findProductByKeywords(products, ['spoon scale']) ||
    findProductByKeywords(products, ['motion sensor led']) ||
    products[0]

  const showcaseProducts = products.filter((product) => product.id !== featuredProduct?.id).slice(0, 6)

  return (
    <main className="overflow-hidden bg-[var(--hf-background)]">
      <Hero products={products} />

      <EditorialBanners products={products} placement="discovery" />

      <CategoryGrid products={products} />

      {showcaseProducts.length > 0 && (
        <section
          className="hf-section relative overflow-hidden border-t border-black/[.06] bg-[var(--hf-background)]"
          style={{
            backgroundImage: `linear-gradient(rgba(251,250,247,.78), rgba(251,250,247,.9)), url("${HOME_COLLECTION_BG}"), url("${PAPER_TEXTURE}")`,
            backgroundPosition: 'center, center, center',
            backgroundRepeat: 'no-repeat, no-repeat, repeat',
            backgroundSize: 'cover, cover, 192px 192px',
          }}
        >
          <div className="pointer-events-none absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[#dfe9e2]/28 blur-[100px]" />
          <div className="pointer-events-none absolute right-[-6rem] top-10 h-80 w-80 rounded-full bg-[#efe7db]/36 blur-[120px]" />

          <div className="hf-container relative">
            <div className="grid gap-7 lg:grid-cols-[1fr_390px] lg:items-end">
              <div>
                <p className="hf-eyebrow">Explore the collection</p>
                <h2 className="hf-section-title mt-5 max-w-[850px]">Useful things, <span className="text-[var(--hf-brand-muted)]">without the clutter.</span></h2>
              </div>
              <div className="lg:justify-self-end">
                <p className="hf-copy-lg max-w-md">A quick edit of practical products already in the Housefinds collection.</p>
                <Link href="/shop" className="hf-button-tertiary mt-5">
                  Browse the full shop <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-5">
              {showcaseProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      <EditorialBanners products={products} placement="curated" />

      <FeaturedFind product={featuredProduct} />
      <ProductReviewHighlights products={products} reviews={reviews} />

      <section
        className="hf-section relative overflow-hidden border-t border-black/[.06] bg-[var(--hf-surface-soft)]"
        style={{
          backgroundImage: `linear-gradient(rgba(240,241,235,.86), rgba(240,241,235,.94)), url("${SAGE_TEXTURE}"), url("${PAPER_TEXTURE}")`,
          backgroundPosition: 'center, center, center',
          backgroundRepeat: 'no-repeat, no-repeat, repeat',
          backgroundSize: 'cover, cover, 192px 192px',
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="hf-container relative grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
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
              <article key={title} className="rounded-[var(--hf-radius-md)] border border-white/55 bg-white/28 p-5 backdrop-blur-[2px]">
                <span className="grid size-10 place-items-center rounded-full bg-white text-[var(--hf-brand-muted)] shadow-sm">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-[-.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/58">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
