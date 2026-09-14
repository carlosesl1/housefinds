import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { displayProductName, displayProductTagline, storefrontProductSlug } from '@/lib/woocommerce/presentation'

export function FeaturedFind({ product }: { product?: WooProduct }) {
  if (!product) return null

  const image = product.images?.[0]
  const name = displayProductName(product.name)
  const copy = displayProductTagline(product)
  const href = `/product/${storefrontProductSlug(product)}`

  return (
    <section id="featured-find" className="bg-[#121714] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid max-w-[1480px] overflow-hidden rounded-[var(--hf-radius-lg)] border border-white/[.06] bg-[#19211b] lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative min-h-[480px] overflow-hidden lg:min-h-[650px]">
          {image ? (
            <Image src={image.src} alt={image.alt || name} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover transition duration-700 hover:scale-[1.015]" />
          ) : (
            <div className="absolute inset-0 bg-[#26352c]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/48 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 text-xs font-semibold uppercase tracking-[.18em] text-white/70 lg:bottom-8 lg:left-8">Selected by Housefinds</p>
        </div>

        <div className="flex flex-col justify-center px-7 py-14 sm:px-10 lg:px-14 xl:px-16">
          <p className="hf-eyebrow text-white/42">Featured find</p>
          <h2 className="mt-5 text-[clamp(2.9rem,4.4vw,4.8rem)] font-semibold leading-[.94] tracking-[-.052em]">
            One useful find. <span className="text-[#a4bba9]">A better little routine.</span>
          </h2>
          <h3 className="mt-7 max-w-xl text-2xl font-semibold leading-tight tracking-[-.03em] text-white/94">{name}</h3>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/52">{copy}</p>

          <div className="mt-8 grid gap-3 border-y border-white/10 py-5 sm:grid-cols-3">
            {['Useful by design', 'Easy to understand', 'Made for everyday life'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-medium text-white/72">
                <CheckIcon className="size-4 shrink-0 text-[#a8c6b0]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href={href} className="inline-flex min-h-13 items-center gap-3 rounded-[var(--hf-radius-sm)] bg-[#dce8df] px-6 font-semibold text-[#172018] transition hover:bg-white">
              Explore this find <ArrowRightIcon className="size-4" />
            </Link>
            <span className="text-xl font-semibold">{formatProductPrice(product)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
