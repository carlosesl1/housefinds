'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ArrowsPointingOutIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { StorefrontImage } from '@/lib/storefront/client-product'

export function ProductGallery({ images, productName }: { images: StorefrontImage[]; productName: string }) {
  const gallery = images.slice(0, 12)
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const touchStartX = useRef<number | null>(null)

  const previous = () => setActive((value) => (value - 1 + gallery.length) % gallery.length)
  const next = () => setActive((value) => (value + 1) % gallery.length)

  const closeExpanded = () => {
    setExpanded(false)
    window.setTimeout(() => openerRef.current?.focus(), 0)
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (gallery.length < 2 || touchStartX.current === null) return
    const endX = event.changedTouches[0]?.clientX
    if (typeof endX !== 'number') return
    const distance = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(distance) < 45) return
    if (distance > 0) previous()
    else next()
  }

  useEffect(() => {
    if (!expanded) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeRef.current?.focus(), 0)

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeExpanded()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        previous()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      }
      if (event.key === 'Tab') {
        const dialog = document.querySelector<HTMLElement>('[data-product-gallery-dialog]')
        if (!dialog) return
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'))
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [expanded, gallery.length])

  if (!gallery.length) {
    return <div className="grid aspect-[4/3] place-items-center rounded-[var(--hf-radius-lg)] bg-[var(--hf-surface-soft)] text-sm text-black/35">Product imagery coming soon</div>
  }

  const current = gallery[Math.min(active, gallery.length - 1)]
  const desktopThumbs = gallery.slice(0, 5)
  const remaining = Math.max(0, gallery.length - desktopThumbs.length)

  return (
    <>
      <div className="relative aspect-[4/3] touch-pan-y overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.05] bg-[#efede7]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <button ref={openerRef} type="button" onClick={() => setExpanded(true)} className="absolute inset-0 z-10" aria-label={`Expand ${productName} image ${active + 1}`} />
        <Image
          key={current.id || current.src}
          src={current.src}
          alt={current.alt || `${productName} product photo ${active + 1}`}
          fill
          priority={active === 0}
          sizes="(max-width:1280px) 100vw, 58vw"
          className="object-contain p-2 sm:p-4"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />

        <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-[var(--hf-radius-sm)] border border-white/55 bg-white/88 px-3 py-1.5 text-xs font-semibold text-black/55 backdrop-blur">
          {active + 1} / {gallery.length}
        </div>
        <div className="pointer-events-none absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-[var(--hf-radius-sm)] border border-white/55 bg-white/88 text-black/55 backdrop-blur" aria-hidden="true">
          <ArrowsPointingOutIcon className="size-4" />
        </div>

        {gallery.length > 1 && (
          <>
            <button type="button" onClick={(event) => { event.stopPropagation(); previous() }} className="absolute left-3 top-1/2 z-30 hidden size-11 -translate-y-1/2 place-items-center rounded-[var(--hf-radius-sm)] border border-white/50 bg-white/88 shadow-sm backdrop-blur transition hover:bg-white sm:grid" aria-label="Previous product image"><ChevronLeftIcon className="size-5" /></button>
            <button type="button" onClick={(event) => { event.stopPropagation(); next() }} className="absolute right-3 top-1/2 z-30 hidden size-11 -translate-y-1/2 place-items-center rounded-[var(--hf-radius-sm)] border border-white/50 bg-white/88 shadow-sm backdrop-blur transition hover:bg-white sm:grid" aria-label="Next product image"><ChevronRightIcon className="size-5" /></button>
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:hidden" aria-hidden="true">
              {gallery.slice(0, 6).map((image, index) => <span key={image.id || index} className={`h-1.5 rounded-full bg-white shadow-sm transition-all ${active === index ? 'w-5' : 'w-1.5 opacity-65'}`} />)}
            </div>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 hidden items-stretch gap-2 sm:flex" aria-label="Product image thumbnails">
          {desktopThumbs.map((image, index) => (
            <button
              key={image.id || `${image.src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${productName} image ${index + 1}`}
              aria-current={active === index ? 'true' : undefined}
              className={`relative aspect-square w-[76px] shrink-0 overflow-hidden rounded-[var(--hf-radius-sm)] border bg-[#efede7] transition lg:w-[84px] ${active === index ? 'border-[var(--hf-brand-muted)] ring-2 ring-[#557562]/10' : 'border-black/[.07] opacity-72 hover:opacity-100'}`}
            >
              <Image src={image.thumbnail || image.src} alt="" fill sizes="84px" className="object-cover" />
            </button>
          ))}
          {remaining > 0 && (
            <button type="button" onClick={() => setExpanded(true)} className="grid min-w-[84px] place-items-center rounded-[var(--hf-radius-sm)] border border-black/[.08] bg-white px-3 text-center text-xs font-semibold text-black/55 transition hover:border-black/15 hover:text-black" aria-label={`View all ${gallery.length} product images`}>
              <span><strong className="block text-base text-[var(--hf-ink)]">+{remaining}</strong>View all</span>
            </button>
          )}
        </div>
      )}

      {expanded && (
        <div data-product-gallery-dialog className="fixed inset-0 z-[160] bg-[#0d100e]/96 p-3 text-white sm:p-6" role="dialog" aria-modal="true" aria-label={`${productName} image viewer`}>
          <div className="relative mx-auto flex h-full max-w-[1500px] flex-col">
            <div className="flex items-center justify-between gap-4 pb-3">
              <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-white/38">{productName}</p><p className="mt-1 text-sm text-white/60">Image {active + 1} of {gallery.length}</p></div>
              <button ref={closeRef} type="button" onClick={closeExpanded} className="grid size-11 place-items-center rounded-[var(--hf-radius-sm)] border border-white/15 bg-white/10 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white" aria-label="Close image viewer"><XMarkIcon className="size-5" /></button>
            </div>

            <div className="relative min-h-0 flex-1 touch-pan-y overflow-hidden rounded-[var(--hf-radius-md)] bg-black/20" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <Image key={`expanded-${current.id || current.src}`} src={current.src} alt={current.alt || `${productName} enlarged product photo ${active + 1}`} fill sizes="100vw" quality={90} className="object-contain p-2 sm:p-6" />
              {gallery.length > 1 && (
                <>
                  <button type="button" onClick={previous} className="absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-[var(--hf-radius-sm)] border border-white/15 bg-black/35 backdrop-blur transition hover:bg-black/55 sm:grid sm:left-5" aria-label="Previous image"><ChevronLeftIcon className="size-6" /></button>
                  <button type="button" onClick={next} className="absolute right-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-[var(--hf-radius-sm)] border border-white/15 bg-black/35 backdrop-blur transition hover:bg-black/55 sm:grid sm:right-5" aria-label="Next image"><ChevronRightIcon className="size-6" /></button>
                  <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden" aria-hidden="true">
                    {gallery.slice(0, 6).map((image, index) => <span key={`expanded-dot-${image.id || index}`} className={`h-1.5 rounded-full bg-white transition-all ${active === index ? 'w-5' : 'w-1.5 opacity-50'}`} />)}
                  </div>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 hidden justify-center gap-2 overflow-x-auto pb-1 sm:flex">
                {gallery.map((image, index) => (
                  <button key={`expanded-thumb-${image.id || index}`} type="button" onClick={() => setActive(index)} className={`relative aspect-square w-14 shrink-0 overflow-hidden rounded-[10px] border ${active === index ? 'border-white' : 'border-white/15 opacity-45 hover:opacity-80'}`} aria-label={`Show image ${index + 1}`}>
                    <Image src={image.thumbnail || image.src} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
