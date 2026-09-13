import type { WooProduct, WooProductReview } from '@/lib/woocommerce/types'

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function reviewImages(review: string) {
  const matches = Array.from(review.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi))
  return Array.from(new Set(matches.map((match) => match[1]).filter(Boolean)))
}

function safeReviewerName(value: string) {
  const name = stripHtml(value || '').trim()
  if (!name) return 'Product reviewer'
  if (name.includes('@')) return name.split('@')[0]
  return name.length > 28 ? `${name.slice(0, 25)}…` : name
}

function Stars({ rating, size = 'text-base' }: { rating: number; size?: string }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span className={`${size} tracking-[.08em] text-[#b17928]`} aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rounded)}<span className="text-black/12">{'★'.repeat(5 - rounded)}</span>
    </span>
  )
}

export function ProductReviews({ product, reviews }: { product: WooProduct; reviews: WooProductReview[] }) {
  const productAverage = Number(product.average_rating || 0)
  const fetchedAverage = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
  const average = productAverage > 0 ? productAverage : fetchedAverage
  const count = product.review_count > 0 ? product.review_count : reviews.length

  if (!count && !reviews.length) return null

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => Math.round(review.rating) === star).length,
  }))
  const distributionBase = Math.max(reviews.length, 1)
  const photos = reviews.flatMap((review) => reviewImages(review.review)).slice(0, 8)

  return (
    <section id="reviews" className="border-t border-black/[.06] bg-[#f6f5f0] px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid gap-10 lg:grid-cols-[360px_1fr] lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Product reviews</p>
            <h2 className="mt-4 text-5xl font-semibold tracking-[-.055em] text-[#101622]">What people say about this product.</h2>

            <div className="mt-7 rounded-[28px] bg-white p-6 shadow-[0_18px_60px_rgba(34,45,37,.04)]">
              <div className="flex items-end gap-3">
                <strong className="text-5xl tracking-[-.06em]">{average ? average.toFixed(1) : '—'}</strong>
                <span className="pb-1 text-sm text-black/42">out of 5</span>
              </div>
              {average > 0 && <div className="mt-2"><Stars rating={average} size="text-xl" /></div>}
              <p className="mt-2 text-sm text-black/45">Based on {count} product review{count === 1 ? '' : 's'}.</p>

              {reviews.length > 0 && (
                <div className="mt-6 space-y-2.5">
                  {distribution.map(({ star, count: starCount }) => (
                    <div key={star} className="grid grid-cols-[30px_1fr_32px] items-center gap-3 text-xs">
                      <span className="font-semibold text-black/55">{star}★</span>
                      <div className="h-2 overflow-hidden rounded-full bg-black/[.06]">
                        <div className="h-full rounded-full bg-[#8ea596]" style={{ width: `${Math.round((starCount / distributionBase) * 100)}%` }} />
                      </div>
                      <span className="text-right text-black/35">{starCount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-5 text-xs leading-5 text-black/38">
              Reviews shown here relate to this product. Feedback may include reviews collected for the same product on third-party marketplaces as well as reviews submitted directly to Housefinds.
            </p>
          </div>

          <div>
            {photos.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-[-.03em]">Customer photos</h3>
                  <span className="text-xs text-black/35">From product reviews</span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                  {photos.map((src, index) => (
                    <div key={`${src}-${index}`} className="aspect-square overflow-hidden rounded-2xl bg-[#e9e8e2]">
                      {/* External review imagery is intentionally rendered as a native image so imported marketplace review media can display without host allowlisting. */}
                      <img src={src} alt={`Customer review photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviews.length > 0 ? (
              <div className={`${photos.length ? 'mt-8' : ''} divide-y divide-black/[.07] border-y border-black/[.07]`}>
                {reviews.slice(0, 12).map((review) => {
                  const copy = stripHtml(review.review)
                  return (
                    <article key={review.id} className="grid gap-4 py-7 sm:grid-cols-[170px_1fr]">
                      <div>
                        <Stars rating={review.rating} />
                        <p className="mt-2 text-sm font-semibold text-[#172018]">{safeReviewerName(review.reviewer)}</p>
                        <p className="mt-1 text-xs text-black/36">{review.formatted_date_created || new Date(review.date_created).toLocaleDateString('en-GB')}</p>
                        {review.verified && <span className="mt-2 inline-flex rounded-full bg-[#e8efe9] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[#456b55]">Verified purchase</span>}
                      </div>
                      <div>
                        {copy ? <p className="text-[15px] leading-7 text-black/66">{copy}</p> : <p className="text-sm italic text-black/38">Rating submitted without a written comment.</p>}
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-[28px] border border-black/[.06] bg-white p-8 text-sm leading-6 text-black/48">
                The aggregate rating is available for this product. Individual written reviews will appear here when they are synchronized into the Housefinds catalog.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
