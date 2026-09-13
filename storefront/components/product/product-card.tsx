import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRightIcon, PhotoIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { displayProductName, displayProductTagline } from '@/lib/woocommerce/presentation'

export function ProductCard({ product }: { product: WooProduct }) {
  const image = product.images?.[0]
  const secondImage = product.images?.[1]
  const name = displayProductName(product.name)
  const tagline = displayProductTagline(product)

  return (
    <article className="group min-w-0">
      <Link href={`/produto/${product.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#557562]">
        <div className="relative aspect-[4/4.7] overflow-hidden rounded-[26px] bg-[#f1efe8] sm:rounded-[28px]">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt || name}
              fill
              sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-black/20"><PhotoIcon className="size-9" /></div>
          )}

          {secondImage && (
            <Image
              src={secondImage.src}
              alt=""
              fill
              sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
              className="hidden object-cover opacity-0 transition duration-500 group-hover:opacity-100 sm:block"
            />
          )}

          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/22 to-transparent opacity-0 transition group-hover:opacity-100" />
          {product.on_sale && <span className="absolute left-3 top-3 rounded-full bg-[#355f4a] px-3 py-1.5 text-[11px] font-semibold text-white">Sale</span>}
          {product.images.length > 1 && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/86 px-2.5 py-1.5 text-[10px] font-semibold text-black/55 shadow-sm backdrop-blur">
              <PhotoIcon className="size-3.5" /> {product.images.length} views
            </span>
          )}
          <span className="absolute right-3 top-3 grid size-10 translate-y-1 place-items-center rounded-full border border-white/50 bg-white/88 opacity-0 shadow-sm backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRightIcon className="size-4" />
          </span>
          <span className="absolute bottom-3 right-3 hidden translate-y-1 rounded-full bg-[#172018]/92 px-3 py-2 text-[11px] font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">View product</span>
        </div>

        <div className="mt-4">
          <h3 className="line-clamp-2 text-[16px] font-semibold tracking-[-.025em] sm:text-[17px]">{name}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-black/45">{tagline}</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
            <p className="text-base font-semibold sm:text-lg">{formatProductPrice(product)}</p>
            {product.review_count > 0 && <span className="shrink-0 text-[11px] font-medium text-black/45"><span className="text-[#b17928]">★</span> {product.average_rating} ({product.review_count})</span>}
          </div>
        </div>
      </Link>
    </article>
  )
}
