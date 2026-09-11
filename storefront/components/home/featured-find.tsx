import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatMoney } from '@/lib/woocommerce/money'

function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function FeaturedFind({ product }: { product?: WooProduct }) {
  if (!product) return null

  const image = product.images?.[0]
  const copy = plainText(product.short_description || product.description)

  return (
    <section id="featured-find" className="bg-[#101511] px-6 py-6 text-white lg:px-10 lg:py-10">
      <div className="mx-auto grid max-w-[1600px] overflow-hidden rounded-[40px] bg-[#171e19] lg:grid-cols-[1.06fr_.94fr]">
        <div className="relative min-h-[560px] overflow-hidden lg:min-h-[760px]">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#26352c]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute bottom-7 left-7 rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm backdrop-blur-xl lg:bottom-10 lg:left-10">
            <span className="mr-2 inline-block size-2 rounded-full bg-[#a8c6b0]" />
            Selected by Housefinds
          </div>
        </div>

        <div className="flex flex-col justify-center px-7 py-16 sm:px-10 lg:px-14 xl:px-20">
          <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.3em] text-white/45">
            Featured find <span className="h-px w-16 bg-white/20" />
          </div>

          <h2 className="mt-7 text-[clamp(3.5rem,5vw,6.5rem)] font-semibold leading-[.88] tracking-[-.065em]">
            One useful find.<br />
            <span className="text-[#9bb6a3]">A better little routine.</span>
          </h2>

          <h3 className="mt-8 max-w-xl text-2xl font-semibold leading-tight tracking-[-.035em] text-white/92">
            {product.name}
          </h3>

          {copy && (
            <p className="mt-4 max-w-xl text-base leading-7 text-white/52">
              {copy.slice(0, 220)}{copy.length > 220 ? '…' : ''}
            </p>
          )}

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[
              'Useful by design',
              'Easy to understand',
              'Made for everyday life',
            ].map((item) => (
              <div key={item} className="border-t border-white/12 pt-4">
                <CheckIcon className="size-5 text-[#9bb6a3]" />
                <p className="mt-3 text-sm font-medium text-white/75">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={`/produto/${product.slug}`}
              className="inline-flex h-14 items-center gap-3 rounded-full bg-[#dce8df] px-7 font-semibold text-[#172018] transition hover:-translate-y-0.5 hover:bg-white"
            >
              Explore this find <ArrowRightIcon className="size-4" />
            </Link>
            <span className="text-2xl font-semibold">
              {formatMoney(product.prices.price, product.prices.currency_minor_unit, product.prices.currency_symbol)}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
