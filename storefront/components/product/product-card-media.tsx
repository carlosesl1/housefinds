import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRightIcon, PhotoIcon } from '@heroicons/react/24/outline'
import type { StorefrontImage } from '@/lib/storefront/client-product'

export function ProductCardMedia({ images, name, href }: { images: StorefrontImage[]; name: string; href: string }) {
  const primary = images[0]
  const secondary = images[1]

  return (
    <div className="relative aspect-[4/4.65] overflow-hidden rounded-[var(--hf-radius-md)] bg-[var(--hf-surface-soft)]">
      {primary ? (
        <>
          <Image
            src={primary.src}
            alt={primary.alt || `${name} product photo`}
            fill
            sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
            className={`object-cover transition duration-500 ${secondary ? 'group-hover:opacity-0' : 'group-hover:scale-[1.02]'}`}
          />
          {secondary && (
            <Image
              src={secondary.src}
              alt=""
              fill
              sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
              className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center text-black/18"><PhotoIcon className="size-9" /></div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/12 to-transparent opacity-70" />
      <Link href={href} aria-label={`View ${name}`} className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white" />

      <span className="pointer-events-none absolute right-3 top-3 z-20 grid size-10 translate-y-1 place-items-center rounded-[var(--hf-radius-sm)] border border-white/55 bg-white/88 opacity-0 shadow-sm backdrop-blur transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRightIcon className="size-4" />
      </span>
    </div>
  )
}
