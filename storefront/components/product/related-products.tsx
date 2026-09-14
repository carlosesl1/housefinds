import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { dedupeStoreProducts } from '@/lib/storefront/catalog'
import { ProductCard } from '@/components/product/product-card'

export function RelatedProducts({ products }: { products: WooProduct[] }) {
  const visibleProducts = dedupeStoreProducts(products).slice(0, 8)
  if (!visibleProducts.length) return null

  return (
    <section className="hf-section border-t border-black/[.06] bg-[var(--hf-background)]">
      <div className="hf-container">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="hf-eyebrow text-[var(--hf-brand-muted)]">Keep exploring</p>
            <h2 className="hf-section-title mt-4 max-w-[760px]">More useful finds for <span className="text-[var(--hf-brand-muted)]">everyday home life.</span></h2>
          </div>
          <Link href="/shop" className="hf-button-tertiary w-fit">Browse all products <ArrowRightIcon className="size-4" /></Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-5">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  )
}
