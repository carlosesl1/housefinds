import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { displayProductName, displayProductTagline } from '@/lib/woocommerce/presentation'

export function ProductCard({ product }: { product: WooProduct }) {
  const image = product.images?.[0]
  const previews = product.images?.slice(0, 3) || []
  const name = displayProductName(product.name)
  const tagline = displayProductTagline(product)

  return (
    <article className="group min-w-0">
      <Link href={`/produto/${product.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#557562]">
        <div className="relative aspect-[4/4.7] overflow-hidden rounded-[28px] bg-[#f1efe8]">
          {image && (
            <Image
              src={image.src}
              alt={image.alt || name}
              fill
              sizes="(max-width:768px) 70vw, 25vw"
              className="object-cover transition duration-700 group-hover:scale-[1.035]"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
          {product.on_sale && <span className="absolute left-3 top-3 rounded-full bg-[#355f4a] px-3 py-1.5 text-xs font-semibold text-white">Sale</span>}
          <span className="absolute right-3 top-3 grid size-10 translate-y-1 place-items-center rounded-full border border-white/50 bg-white/88 opacity-0 shadow-sm backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRightIcon className="size-4" />
          </span>
        </div>

        {previews.length > 1 && (
          <div className="mt-2.5 flex gap-2" aria-label={`More views of ${name}`}>
            {previews.map((preview, index) => (
              <span key={preview.id || index} className="relative size-10 overflow-hidden rounded-lg border border-black/[.07] bg-[#f3f1eb] sm:size-11">
                <Image src={preview.thumbnail || preview.src} alt={`${name} view ${index + 1}`} fill sizes="44px" className="object-cover" />
              </span>
            ))}
            {product.images.length > 3 && <span className="grid size-10 place-items-center rounded-lg border border-black/[.07] bg-white text-[11px] font-semibold text-black/45 sm:size-11">+{product.images.length - 3}</span>}
          </div>
        )}

        <div className="mt-4">
          <h3 className="line-clamp-2 text-[17px] font-semibold tracking-[-.025em]">{name}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-black/45">{tagline}</p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="text-lg font-semibold">{formatProductPrice(product)}</p>
            {product.review_count > 0 && <span className="text-xs text-black/45">★ {product.average_rating} ({product.review_count})</span>}
          </div>
        </div>
      </Link>
    </article>
  )
}
