'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowsPointingOutIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { WooImage } from '@/lib/woocommerce/types'

export function ProductGallery({ images, productName }: { images: WooImage[]; productName: string }) {
  const gallery = images.slice(0, 12)
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false)
      if (event.key === 'ArrowLeft') setActive((value) => (value - 1 + gallery.length) % gallery.length)
      if (event.key === 'ArrowRight') setActive((value) => (value + 1) % gallery.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [expanded, gallery.length])

  if (!gallery.length) {
    return <div className="grid aspect-[4/3] place-items-center rounded-[32px] bg-[#efede7] text-sm text-black/35">Product imagery coming soon</div>
  }

  const current = gallery[Math.min(active, gallery.length - 1)]
  const previous = () => setActive((value) => (value - 1 + gallery.length) % gallery.length)
  const next = () => setActive((value) => (value + 1) % gallery.length)

  return (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[#efede7] sm:rounded-[34px]">
        <button type="button" onClick={() => setExpanded(true)} className="absolute inset-0 z-10" aria-label={`Expand ${productName} image ${active + 1}`} />
        <Image
          key={current.id || current.src}
          src={current.src}
          alt={current.alt || `${productName} view ${active + 1}`}
          fill
          priority={active === 0}
          sizes="(max-width:1280px) 100vw, 58vw"
          className="object-contain p-2 sm:p-4"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/15 to-transparent" />

        <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/60 bg-white/88 px-3 py-1.5 text-xs font-semibold text-black/55 shadow-sm backdrop-blur">
          {active + 1} / {gallery.length}
        </div>
        <div className="pointer-events-none absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/88 px-3 py-1.5 text-xs font-semibold text-black/55 shadow-sm backdrop-blur">
          <ArrowsPointingOutIcon className="size-3.5" /> Expand
        </div>

        {gallery.length > 1 && (
          <>
            <button type="button" onClick={(event) => { event.stopPropagation(); previous() }} className="absolute left-3 top-1/2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-white/88 shadow-sm backdrop-blur transition hover:bg-white" aria-label="Previous product image"><ChevronLeftIcon className="size-5" /></button>
            <button type="button" onClick={(event) => { event.stopPropagation(); next() }} className="absolute right-3 top-1/2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-white/88 shadow-sm backdrop-blur transition hover:bg-white" aria-label="Next product image"><ChevronRightIcon className="size-5" /></button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Product image thumbnails">
          {gallery.map((image, index) => (
            <button
              key={image.id || `${image.src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${productName} image ${index + 1}`}
              aria-current={active === index ? 'true' : undefined}
              className={`relative aspect-square w-[72px] shrink-0 overflow-hidden rounded-2xl border bg-[#efede7] transition sm:w-[82px] ${active === index ? 'border-[#557562] ring-2 ring-[#557562]/12' : 'border-black/[.07] opacity-72 hover:opacity-100'}`}
            >
              <Image src={image.thumbnail || image.src} alt="" fill sizes="82px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {expanded && (
        <div className="fixed inset-0 z-[160] bg-[#0d100e]/96 p-3 text-white sm:p-6" role="dialog" aria-modal="true" aria-label={`${productName} image viewer`}>
          <div className="relative mx-auto flex h-full max-w-[1500px] flex-col">
            <div className="flex items-center justify-between gap-4 pb-3">
              <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-white/38">{productName}</p><p className="mt-1 text-sm text-white/60">Image {active + 1} of {gallery.length}</p></div>
              <button type="button" onClick={() => setExpanded(false)} className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/15" aria-label="Close image viewer"><XMarkIcon className="size-5" /></button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[24px] bg-black/20">
              <Image key={`expanded-${current.id || current.src}`} src={current.src} alt={current.alt || `${productName} enlarged view ${active + 1}`} fill sizes="100vw" quality={90} className="object-contain p-2 sm:p-6" />
              {gallery.length > 1 && (
                <>
                  <button type="button" onClick={previous} className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/35 backdrop-blur transition hover:bg-black/55 sm:left-5" aria-label="Previous image"><ChevronLeftIcon className="size-6" /></button>
                  <button type="button" onClick={next} className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/35 backdrop-blur transition hover:bg-black/55 sm:right-5" aria-label="Next image"><ChevronRightIcon className="size-6" /></button>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
                {gallery.map((image, index) => (
                  <button key={`expanded-thumb-${image.id || index}`} type="button" onClick={() => setActive(index)} className={`relative aspect-square w-14 shrink-0 overflow-hidden rounded-xl border ${active === index ? 'border-white' : 'border-white/15 opacity-45 hover:opacity-80'}`} aria-label={`Show image ${index + 1}`}>
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
