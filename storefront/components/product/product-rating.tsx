import { ratingFill } from '@/lib/storefront/product-content'

export function ProductRating({ rating, count }: { rating: number; count: number }) {
  if (!Number.isFinite(rating) || rating <= 0 || count <= 0) return null
  const value = Math.min(5, rating)
  return (
    <a href="#reviews" className="mt-3 inline-flex min-h-11 items-center gap-2.5 rounded-full px-1 text-sm font-medium text-[var(--hf-ink)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--hf-brand)]" aria-label={`${value.toFixed(1)} out of 5, ${count} product reviews. Read reviews`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {ratingFill(value).map((fill, index) => (
          <span key={index} className="relative inline-block leading-none text-black/20">
            ★<span className="absolute inset-y-0 left-0 overflow-hidden text-[#996517]" style={{ width: `${fill}%` }}>★</span>
          </span>
        ))}
      </span>
      <span>{value.toFixed(1)} <span className="text-black/60">({count} review{count === 1 ? '' : 's'})</span></span>
    </a>
  )
}
