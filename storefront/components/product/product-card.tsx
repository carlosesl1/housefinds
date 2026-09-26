import Link from 'next/link'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { displayProductName, displayProductTagline, storefrontProductSlug } from '@/lib/woocommerce/presentation'
import { ProductCardMedia } from '@/components/product/product-card-media'
import { toStorefrontImages } from '@/lib/storefront/client-product'
import { merchandisingImages } from '@/lib/storefront/merchandising-images'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'

export function ProductCard({ product }: { product: WooProduct }) {
  const name = displayProductName(product.name)
  const tagline = displayProductTagline(product)
  const href = `/product/${storefrontProductSlug(product)}`
  const previewImages = toStorefrontImages(merchandisingImages(product)).slice(0, 2)

  return (
    <article className="hf-product-card group">
      <ProductCardMedia images={previewImages} name={name} href={href} />

      <div className="hf-card-content">
        <Link href={href} className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--hf-brand-muted)]">
          <h3 className="text-[var(--hf-ink)]">{name}</h3>
          <p className="hf-card-description">{tagline}</p>
        </Link>
        <div className="hf-card-price-row">
          <span className="hf-card-price">{formatProductPrice(product)}</span>
          {product.review_count > 0 && (
            <a href={`${href}#reviews`} className="shrink-0 text-[11px] font-medium text-[var(--hf-ink-soft)] transition hover:text-black">
              <span className="text-[#b17928]">★</span> {product.average_rating} ({product.review_count})
            </a>
          )}
        </div>
        <Link href={href} className="hf-card-action" aria-label={`View options for ${name}`}><span>{product.type === 'variable' ? 'Choose options' : 'View product'}</span><ArrowUpRightIcon className="size-4" aria-hidden="true" /></Link>
      </div>
    </article>
  )
}
