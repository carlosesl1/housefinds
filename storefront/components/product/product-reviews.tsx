'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { WooProductReview } from '@/lib/woocommerce/types'

type ProductReviewSummary = {
  average_rating?: string
  review_count?: number
}

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

export function ProductReviews({ summary, reviews }: { summary: ProductReviewSummary; reviews: WooProductReview[] }) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [activePhoto, setActivePhoto] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const productAverage = Number(summary.average_rating || 0)
  const fetchedAverage = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
  const average = productAverage > 0 ? productAverage : fetchedAverage
  const reviewCount = summary.review_count || 0
  const count = reviewCount > 0 ? reviewCount : reviews.length

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => Math.round(review.rating) === star).length,
  }))
  const distributionBase = Math.max(reviews.length, 1)
  const photos = Array.from(new Set(reviews.flatMap((review) => reviewImages(review.review)))).slice(0, 24)
  const previewPhotos = photos.slice(0, 8)
  const filteredReviews = selectedRating
    ? reviews.filter((review) => Math.round(review.rating) === selectedRating)
    : reviews

  const closePhotoViewer = () => setActivePhoto(null)
  const previousPhoto = () => setActivePhoto((current) => current === null ? null : (current - 1 + photos.length) % photos.length)
  const nextPhoto = () => setActivePhoto((current) => current === null ? null : (current + 1) % photos.length)

  useEffect(() => {
    if (activePhoto === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeRef.current?.focus(), 0)

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closePhotoViewer()
      }
      if (event.key === 'ArrowLeft' && photos.length > 1) {
        event.preventDefault()
        previousPhoto()
      }
      if (event.key === 'ArrowRight' && photos.length > 1) {
        event.preventDefault()
        nextPhoto()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [activePhoto, photos.length])

  if (!count && !reviews.length) return null

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
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-black/38">Filter by rating</span>
                    {selectedRating && <button type="button" onClick={() => setSelectedRating(null)} className="min-h-7 text-xs font-semibold text-[#355f4a] underline underline-offset-3">Clear</button>}
                  </div>
                  <div className="space-y-1.5">
                    {distribution.map(({ star, count: starCount }) => {
                      const active = selectedRating === star
                      return (
                        <button
                          type="button"
                          key={star}
                          aria-pressed={active}
                          onClick={() => setSelectedRating((current) => current === star ? null : star)}
                          className={`grid min-h-9 w-full grid-cols-[30px_1fr_32px] items-center gap-3 rounded-xl px-2 text-xs transition ${active ? 'bg-[#edf3ee] ring-1 ring-[#557562]/25' : 'hover:bg-black/[.025]'}`}
                        >
                          <span className="font-semibold text-black/55">{star}★</span>
                          <span className="h-2 overflow-hidden rounded-full bg-black/[.06]">
                            <span className="block h-full rounded-full bg-[#8ea596]" style={{ width: `${Math.round((starCount / distributionBase) * 100)}%` }} />
                          </span>
                          <span className="text-right text-black/35">{starCount}</span>
                        </button>
                      )
                    })}
                  </div>
                  {reviewCount > reviews.length && <p className="mt-3 text-[11px] leading-4 text-black/34">Rating mix shown from the latest {reviews.length} synchronized reviews.</p>}
                </div>
              )}
            </div>

            <p className="mt-5 text-xs leading-5 text-black/38">
              Reviews shown here relate to this product. Feedback may include reviews collected for the same product on third-party marketplaces as well as reviews submitted directly to Housefinds.
            </p>
          </div>

          <div>
            {previewPhotos.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-[-.03em]">Customer photos</h3>
                  <span className="text-xs text-black/35">Tap to browse all</span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                  {previewPhotos.map((src, index) => (
                    <button
                      type="button"
                      key={`${src}-${index}`}
                      onClick={() => setActivePhoto(index)}
                      className="group relative aspect-square min-h-11 overflow-hidden rounded-2xl bg-[#e9e8e2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#557562]"
                      aria-label={`Open customer review photo ${index + 1} of ${photos.length}`}
                    >
                      <img src={src} alt={`Customer review photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                      {index === previewPhotos.length - 1 && photos.length > previewPhotos.length && (
                        <span className="absolute inset-0 grid place-items-center bg-black/42 text-sm font-semibold text-white">+{photos.length - previewPhotos.length} photos</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {reviews.length > 0 ? (
              <div className={`${previewPhotos.length ? 'mt-8' : ''}`}>
                {selectedRating && (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#557562]/15 bg-[#edf3ee] px-4 py-3 text-sm">
                    <span><strong>{filteredReviews.length}</strong> review{filteredReviews.length === 1 ? '' : 's'} rated {selectedRating} star{selectedRating === 1 ? '' : 's'}</span>
                    <button type="button" onClick={() => setSelectedRating(null)} className="font-semibold text-[#355f4a] underline underline-offset-3">Show all reviews</button>
                  </div>
                )}

                <div className="divide-y divide-black/[.07] border-y border-black/[.07]">
                  {filteredReviews.length > 0 ? filteredReviews.slice(0, 20).map((review) => {
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
                  }) : (
                    <div className="py-8 text-sm leading-6 text-black/48">No synchronized written reviews with this rating yet. <button type="button" onClick={() => setSelectedRating(null)} className="font-semibold text-[#355f4a] underline underline-offset-3">Show all reviews</button>.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-black/[.06] bg-white p-8 text-sm leading-6 text-black/48">
                The aggregate rating is available for this product. Individual written reviews will appear here when they are synchronized into the Housefinds catalog.
              </div>
            )}
          </div>
        </div>
      </div>

      {activePhoto !== null && photos[activePhoto] && (
        <div
          className="fixed inset-0 z-[170] bg-[#0d100e]/96 p-3 text-white sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Customer review photo viewer"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closePhotoViewer() }}
        >
          <div className="mx-auto flex h-full max-w-[1300px] flex-col">
            <div className="flex items-center justify-between gap-4 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-white/40">Customer photo</p>
                <p className="mt-1 text-sm text-white/64">Photo {activePhoto + 1} of {photos.length}</p>
              </div>
              <button ref={closeRef} type="button" onClick={closePhotoViewer} className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/10 transition hover:bg-white/15" aria-label="Close customer photo viewer"><XMarkIcon className="size-5" /></button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[var(--hf-radius-md)] bg-black/20">
              <img src={photos[activePhoto]} alt={`Customer review photo ${activePhoto + 1}`} className="h-full w-full object-contain p-2 sm:p-6" />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={previousPhoto} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl border border-white/15 bg-black/40 backdrop-blur transition hover:bg-black/60 sm:left-5 sm:size-12" aria-label="Previous customer photo"><ChevronLeftIcon className="size-6" /></button>
                  <button type="button" onClick={nextPhoto} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl border border-white/15 bg-black/40 backdrop-blur transition hover:bg-black/60 sm:right-5 sm:size-12" aria-label="Next customer photo"><ChevronRightIcon className="size-6" /></button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
