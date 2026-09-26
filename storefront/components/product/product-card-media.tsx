import Image from 'next/image'
import Link from 'next/link'
import { PhotoIcon } from '@heroicons/react/24/outline'
import type { StorefrontImage } from '@/lib/storefront/client-product'

export function ProductCardMedia({ images, name, href }: { images: StorefrontImage[]; name: string; href: string }) {
  const primary = images[0]
  const secondary = images[1]

  return (
    <div className="hf-card-media">
      {primary ? (
        <>
          <Image
            src={primary.src}
            alt={primary.alt || `${name} product photo`}
            fill
            sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
            className={`object-cover transition duration-500 ${secondary ? 'group-hover:opacity-0 group-focus-within:opacity-0' : 'group-hover:scale-[1.025]'}`}
          />
          {secondary && (
            <Image
              src={secondary.src}
              alt=""
              fill
              sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
              className="object-cover opacity-0 transition duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center text-black/18"><PhotoIcon className="size-9" /></div>
      )}
      <Link href={href} aria-label={`View ${name}`} className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--hf-brand)]" />
    </div>
  )
}
