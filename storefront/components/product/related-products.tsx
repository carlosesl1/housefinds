import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { ProductCard } from '@/components/product/product-card'

export function RelatedProducts({ products }: { products: WooProduct[] }) {
  if (!products.length) return null

  return (
    <section className="bg-[#fbfaf7] px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-[1480px]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Keep exploring</p>
            <h2 className="mt-4 text-[clamp(3rem,5vw,5.8rem)] font-semibold leading-[.92] tracking-[-.06em] text-[#101622]">You might also find<br /><span className="text-[#557562]">these useful.</span></h2>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-[#355f4a]">Browse all products <ArrowRightIcon className="size-4" /></Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  )
}
