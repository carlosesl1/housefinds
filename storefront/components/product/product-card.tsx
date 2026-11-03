import Link from 'next/link'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { displayProductName, displayProductTagline, storefrontProductSlug } from '@/lib/woocommerce/presentation'
import { ProductCardMedia } from '@/components/product/product-card-media'
import { toStorefrontImages } from '@/lib/storefront/client-product'
import { merchandisingImages } from '@/lib/storefront/merchandising-images'
import { AddToCart } from '@/components/cart/add-to-cart'
import { cardActionLabel, cardBadge, cardOptionSummary, cardRatingLabel, isQuickAddEligible } from '@/lib/storefront/card-presentation'
import styles from './product-card.module.css'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'

export function ProductCard({ product, quickAdd = false }: { product: WooProduct; quickAdd?: boolean }) {
  const name = displayProductName(product.name)
  const tagline = displayProductTagline(product)
  const href = `/product/${storefrontProductSlug(product)}`
  const previewImages = toStorefrontImages(merchandisingImages(product)).slice(0, 2)
  const quickAddEligible = quickAdd && isQuickAddEligible(product)
  const badge = quickAdd ? cardBadge(product) : undefined
  const optionSummary = quickAdd ? cardOptionSummary(product) : undefined
  const ratingLabel = cardRatingLabel(product)
  const actionLabel = cardActionLabel(product)

  return (
    <article className={`hf-product-card group ${quickAdd ? styles.quickAddCard : ''}`}>
      <div className={styles.media}>
        <ProductCardMedia images={previewImages} name={name} href={href} />
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>

      <div className="hf-card-content">
        <Link href={href} className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--hf-brand-muted)]">
          <h3 className="text-[var(--hf-ink)]">{name}</h3>
          <p className="hf-card-description">{tagline}</p>
        </Link>
        {quickAdd && optionSummary && <p className={styles.optionSummary}>{optionSummary}</p>}
        <div className="hf-card-price-row">
          <span className="hf-card-price">{formatProductPrice(product)}</span>
          {ratingLabel && (
            <a href={`${href}#reviews`} aria-label={`${ratingLabel} for ${name}`} className="shrink-0 text-[11px] font-medium text-[var(--hf-ink-soft)] transition hover:text-black">
              <span className="text-[#b17928]" aria-hidden="true">★</span> {product.average_rating} ({product.review_count})
            </a>
          )}
        </div>
        {quickAddEligible ? (
          <div className={styles.quickAddAction}>
            <AddToCart productId={product.id} label="Add to cart" />
          </div>
        ) : (
          <Link href={href} className="hf-card-action" aria-label={`${actionLabel} for ${name}`}><span>{actionLabel}</span><ArrowUpRightIcon className="size-4" aria-hidden="true" /></Link>
        )}
      </div>
    </article>
  )
}
