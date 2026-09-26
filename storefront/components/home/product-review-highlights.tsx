import Link from 'next/link'
import type { WooProduct, WooProductReview } from '@/lib/woocommerce/types'
import { displayProductName, storefrontProductSlug } from '@/lib/woocommerce/presentation'

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
}

function reviewer(value: string) {
  const name = stripHtml(value || '').trim()
  if (!name) return 'Product reviewer'
  if (name.includes('@')) return name.split('@')[0]
  return name.length > 24 ? `${name.slice(0, 21)}…` : name
}

export function ProductReviewHighlights({ products, reviews }: { products: WooProduct[]; reviews: WooProductReview[] }) {
  const visible = reviews
    .map((review) => ({ review, product: products.find((product) => product.id === review.product_id) }))
    .filter((entry) => entry.product && stripHtml(entry.review.review))
    .slice(0, 3)

  if (visible.length < 2) return null

  return (
    <section className="hf-feedback hf-section">
      <div className="hf-container">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="hf-eyebrow">Product feedback</p>
            <h2 className="hf-section-title mt-4">Real experiences<br /><span>with the products.</span></h2>
            <p className="hf-section-intro">Feedback may include reviews of the same product collected on third-party marketplaces as well as reviews submitted directly to Housefinds.</p>
          </div>

          <div className="grid gap-6">
            {visible.map(({ review, product }) => (
              <Link key={review.id} href={`/product/${storefrontProductSlug(product!)}#reviews`} className="border-t border-[var(--hf-border-strong)] pt-5">
                <div>
                  <div className="tracking-[.08em] text-[#d5b074]">{'★'.repeat(Math.max(0, Math.min(5, Math.round(review.rating))))}</div>
                  <p className="mt-3 line-clamp-6 text-[15px] leading-7 text-[var(--hf-ink)]">“{stripHtml(review.review)}”</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold">{reviewer(review.reviewer)}</p>
                  <p className="line-clamp-1 text-xs text-[var(--hf-ink-soft)]">· {displayProductName(product!.name)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
