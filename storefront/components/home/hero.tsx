import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { displayProductName, pickHeroProduct, storefrontProductSlug } from '@/lib/woocommerce/presentation'

export function Hero({ products }: { products: WooProduct[] }) {
  const featured = pickHeroProduct(products)
  const image = featured?.images?.[0]
  const featuredName = featured ? displayProductName(featured.name) : ''
  const featuredHref = featured ? `/product/${storefrontProductSlug(featured)}` : '/shop'

  return (
    <section className="border-b border-black/[.06] bg-[#f6f4ee]">
      <div className="hf-container grid min-h-[690px] items-stretch gap-8 py-6 lg:grid-cols-[.88fr_1.12fr] lg:gap-10 lg:py-8">
        <div className="flex flex-col justify-center py-12 lg:py-16">
          <p className="hf-eyebrow text-[var(--hf-brand-muted)]">Small changes · Bigger living</p>

          <h1 className="hf-display mt-6">
            Smart finds for a <span className="text-[var(--hf-brand-muted)]">better home.</span>
          </h1>

          <p className="hf-copy-lg mt-7 max-w-[600px]">
            Clever, useful home products chosen to make everyday life simpler, tidier and a little smarter.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="hf-button-primary">Shop the collection <ArrowRightIcon className="size-4" /></Link>
            <Link href="/search" className="hf-button-secondary">Search by need</Link>
          </div>
        </div>

        <div className="relative min-h-[500px] overflow-hidden rounded-[var(--hf-radius-lg)] bg-[#e7e6df] lg:min-h-[620px]">
          {image ? (
            <Image src={image.src} alt={image.alt || featuredName} fill priority sizes="(max-width: 1024px) 100vw, 56vw" className="object-cover object-center transition duration-700 hover:scale-[1.012]" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,#dfe8e1,transparent_35%),linear-gradient(135deg,#eeeae0,#d9ddd5)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-white/5" />

          {featured && (
            <div className="absolute inset-x-4 bottom-4 z-10 grid gap-3 rounded-[var(--hf-radius-md)] border border-white/35 bg-white/90 p-4 shadow-[var(--hf-shadow-float)] backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[390px] sm:p-5">
              <div>
                <p className="hf-eyebrow text-[var(--hf-brand-muted)]">Featured find</p>
                <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[-.025em] text-[var(--hf-ink)]">{featuredName}</h2>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg font-semibold">{formatProductPrice(featured)}</span>
                <Link href={featuredHref} className="inline-flex min-h-10 items-center gap-2 rounded-[var(--hf-radius-sm)] bg-[var(--hf-brand)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--hf-brand-hover)]">
                  View find <ArrowRightIcon className="size-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-black/[.06] bg-white/72">
        <div className="hf-container grid divide-y divide-black/[.06] md:grid-cols-4 md:divide-x md:divide-y-0">
          {[
            ['Free UK delivery', 'Included as standard.'],
            ['Around 14 days', 'Current UK estimate.'],
            ['Free 14-day returns', 'On eligible online orders.'],
            ['Secure card payment', 'Processed by Stripe.'],
          ].map(([title, copy]) => (
            <div key={title} className="py-5 md:px-6 first:md:pl-0 last:md:pr-0">
              <p className="text-sm font-semibold text-[var(--hf-ink)]">{title}</p>
              <p className="mt-1 text-xs leading-5 text-black/43">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
