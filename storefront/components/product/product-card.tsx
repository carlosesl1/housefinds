import Link from 'next/link'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { displayProductName, displayProductTagline, storefrontProductSlug } from '@/lib/woocommerce/presentation'
import { ProductCardMedia } from '@/components/product/product-card-media'
import { toStorefrontImages } from '@/lib/storefront/client-product'

export function ProductCard({ product }: { product: WooProduct }) {
  const name = displayProductName(product.name)
  const tagline = displayProductTagline(product)
  const href = `/product/${storefrontProductSlug(product)}`
  const previewImages = toStorefrontImages(product.images || []).slice(0, 3)
  const imageCount = product.images?.length || previewImages.length

  return (
    <article className="group min-w-0">
      <ProductCardMedia images={previewImages} imageCount={imageCount} name={name} href={href} />

      <div className="mt-4">
        <Link href={href} className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#557562]">
          <h3 className="line-clamp-2 text-[16px] font-semibold tracking-[-.025em] sm:text-[17px]">{name}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-black/45">{tagline}</p>
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
          <Link href={href} className="text-base font-semibold transition hover:text-[#355f4a] sm:text-lg">{formatProductPrice(product)}</Link>
          {product.review_count > 0 && (
            <a href={`${href}#reviews`} className="shrink-0 text-[11px] font-medium text-black/45 transition hover:text-black">
              <span className="text-[#b17928]">★</span> {product.average_rating} ({product.review_count})
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
