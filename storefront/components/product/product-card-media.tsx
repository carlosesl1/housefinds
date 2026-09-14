'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRightIcon, PhotoIcon } from '@heroicons/react/24/outline'
import type { StorefrontImage } from '@/lib/storefront/client-product'

export function ProductCardMedia({ images, imageCount, name, href }: { images: StorefrontImage[]; imageCount: number; name: string; href: string }) {
  const previewImages = images.slice(0, 3)
  const [active, setActive] = useState(0)
  const image = previewImages[active] || previewImages[0]

  return (
    <div className="relative aspect-[4/4.7] overflow-hidden rounded-[26px] bg-[#f1efe8] sm:rounded-[28px]">
      {image ? (
        <Image
          key={image.id || image.src}
          src={image.src}
          alt={image.alt || `${name} product photo ${active + 1}`}
          fill
          sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.015]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-black/20"><PhotoIcon className="size-9" /></div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/26 via-black/[.04] to-transparent opacity-70 transition group-hover:opacity-100" />
      <Link href={href} aria-label={`View ${name}`} className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white" />

      {imageCount > 1 && (
        <span className="pointer-events-none absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/88 px-2.5 py-1.5 text-[10px] font-semibold text-black/55 shadow-sm backdrop-blur">
          <PhotoIcon className="size-3.5" /> {imageCount} photos
        </span>
      )}

      <span className="pointer-events-none absolute right-3 top-3 z-20 grid size-10 translate-y-1 place-items-center rounded-full border border-white/50 bg-white/88 opacity-0 shadow-sm backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRightIcon className="size-4" />
      </span>

      {previewImages.length > 1 && (
        <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 rounded-full border border-white/35 bg-black/25 p-1.5 backdrop-blur-md" aria-label="Preview product photos">
          {previewImages.map((preview, index) => (
            <button
              key={preview.id || `${preview.src}-${index}`}
              type="button"
              aria-label={`Show product photo ${index + 1}`}
              aria-pressed={active === index}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setActive(index)
              }}
              className={`relative size-8 overflow-hidden rounded-full border-2 transition sm:size-9 ${active === index ? 'border-white shadow-md' : 'border-white/35 opacity-75 hover:opacity-100'}`}
            >
              <Image src={preview.thumbnail || preview.src} alt="" fill sizes="36px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <span className="pointer-events-none absolute bottom-3 right-3 z-20 hidden translate-y-1 rounded-full bg-[#172018]/92 px-3 py-2 text-[11px] font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">View product</span>
    </div>
  )
}
