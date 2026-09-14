import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { displayProductName, pickHeroProduct } from '@/lib/woocommerce/presentation'

export function Hero({ products }: { products: WooProduct[] }) {
  const featured = pickHeroProduct(products)
  const image = featured?.images?.[0]
  const featuredName = featured ? displayProductName(featured.name) : ''

  return (
    <section className="relative overflow-hidden border-b border-black/[.06] bg-[#f7f6f1]">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#dfe8e1]/70 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_75%_22%,rgba(85,117,96,.16),transparent_34%)]" />

      <div className="mx-auto grid min-h-[760px] max-w-[1600px] lg:grid-cols-[.92fr_1.08fr]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-16 lg:px-10 xl:px-14">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-black/[.08] bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[.28em] text-black/55 backdrop-blur">
            <SparklesIcon className="size-4 text-[#4d735e]" /> Small changes · Bigger living
          </div>

          <h1 className="mt-8 max-w-[760px] text-[clamp(4.25rem,6.4vw,7.6rem)] font-semibold leading-[.86] tracking-[-.07em] text-[#0d1320]">
            Smart finds<br />for a <span className="text-[#557562]">better home.</span>
          </h1>

          <p className="mt-8 max-w-[610px] text-[clamp(1.05rem,1.45vw,1.35rem)] leading-8 text-black/52">
            Clever, useful and well-designed home products chosen to make everyday life simpler, tidier and a little smarter.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/shop" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#355f4a] px-7 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2d513f]">Shop the collection <ArrowRightIcon className="size-4" /></Link>
            <Link href="/search" className="inline-flex h-14 items-center rounded-full border border-black/12 bg-white/70 px-7 font-semibold backdrop-blur transition hover:bg-white">Search by need</Link>
          </div>

          <div className="mt-12 grid max-w-[660px] grid-cols-3 gap-5 border-t border-black/[.08] pt-6 text-sm">
            <div><strong className="block text-[#172018]">Curated</strong><span className="mt-1 block text-black/42">Useful over gimmicky.</span></div>
            <div><strong className="block text-[#172018]">Practical</strong><span className="mt-1 block text-black/42">Made for daily life.</span></div>
            <div><strong className="block text-[#172018]">Clear</strong><span className="mt-1 block text-black/42">Options before checkout.</span></div>
          </div>
        </div>

        <div className="relative min-h-[620px] overflow-hidden lg:min-h-[760px]">
          <div className="absolute inset-3 overflow-hidden rounded-[42px] bg-[#e7e6df] lg:inset-y-6 lg:left-3 lg:right-6">
            {image ? (
              <Image src={image.src} alt={image.alt || featuredName} fill priority sizes="(max-width: 1024px) 100vw, 54vw" className="object-cover object-center transition duration-700 hover:scale-[1.015]" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,#dfe8e1,transparent_35%),linear-gradient(135deg,#eeeae0,#d9ddd5)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
          </div>

          {featured && (
            <>
              <div className="absolute bottom-14 left-8 right-12 rounded-[28px] border border-white/30 bg-white/88 p-5 shadow-[0_24px_80px_rgba(24,35,28,.14)] backdrop-blur-xl lg:left-10 lg:right-auto lg:w-[390px]">
                <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#557562]">Featured find</p>
                <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[-.03em] text-[#111720]">{featuredName}</h2>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-lg font-semibold">{formatProductPrice(featured)}</span>
                  <Link href={`/product/${featured.slug}`} className="inline-flex items-center gap-2 rounded-full bg-[#355f4a] px-4 py-2 text-sm font-semibold text-white">View find <ArrowRightIcon className="size-3.5" /></Link>
                </div>
              </div>
              <div className="absolute right-8 top-12 rounded-2xl border border-white/40 bg-white/82 px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-xl lg:right-12"><span className="mr-2 inline-block size-2 rounded-full bg-[#5c806b]" />Housefinds pick</div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-black/[.06] bg-white/65">
        <div className="mx-auto grid max-w-[1600px] divide-y divide-black/[.06] px-6 md:grid-cols-4 md:divide-x md:divide-y-0 lg:px-10">
          {[
            ['Free UK delivery', 'Standard delivery is included in the price.'],
            ['Around 14 days', 'Current delivery estimate for UK orders.'],
            ['Free 14-day returns', 'Eligible online orders can be returned without return postage.'],
            ['Secure payment', 'Visa, Mastercard, Amex, Apple Pay, Google Pay and Link via Stripe.'],
          ].map(([title, copy]) => (
            <div key={title} className="py-6 md:px-7 first:md:pl-0"><p className="font-semibold text-[#172018]">{title}</p><p className="mt-1 text-sm text-black/42">{copy}</p></div>
          ))}
        </div>
      </div>
    </section>
  )
}
