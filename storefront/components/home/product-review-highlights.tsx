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
    <section className="bg-[#172018] px-6 py-24 text-white lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#a8c6b0]">Product feedback</p>
            <h2 className="mt-5 text-[clamp(3.4rem,5vw,6rem)] font-semibold leading-[.9] tracking-[-.06em]">Real experiences<br /><span className="text-[#9bb6a3]">with the products.</span></h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/48">Feedback may include reviews of the same product collected on third-party marketplaces as well as reviews submitted directly to Housefinds.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {visible.map(({ review, product }) => (
              <Link key={review.id} href={`/product/${storefrontProductSlug(product!)}#reviews`} className="flex min-h-[330px] flex-col justify-between rounded-[28px] border border-white/10 bg-white/[.055] p-6 transition hover:-translate-y-1 hover:bg-white/[.08]">
                <div>
                  <div className="tracking-[.08em] text-[#d5b074]">{'★'.repeat(Math.max(0, Math.min(5, Math.round(review.rating))))}</div>
                  <p className="mt-5 line-clamp-6 text-[15px] leading-7 text-white/72">“{stripHtml(review.review)}”</p>
                </div>
                <div className="mt-8 border-t border-white/10 pt-5">
                  <p className="text-sm font-semibold text-white/90">{reviewer(review.reviewer)}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-white/38">{displayProductName(product!.name)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
