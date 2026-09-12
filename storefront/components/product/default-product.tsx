import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { ProductPurchasePanel } from '@/components/product/product-purchase-panel'
import { displayProductName, displayProductTagline, getProductStory } from '@/lib/woocommerce/presentation'

export function DefaultProduct({ product }: { product: WooProduct }) {
  const name = displayProductName(product.name)
  const tagline = displayProductTagline(product)
  const story = getProductStory(product)
  const gallery = product.images?.slice(0, 6) || []
  const visibleAttributes = product.attributes.filter((attribute) => attribute.terms.length > 0)

  return (
    <main className="bg-[#fbfaf7]">
      <div className="mx-auto max-w-[1560px] px-5 pb-20 pt-7 lg:px-8 lg:pb-28">
        <div className="mb-7 flex items-center justify-between gap-4 text-sm text-black/45">
          <Link href="/shop" className="inline-flex items-center gap-2 transition hover:text-black">
            <ArrowLeftIcon className="size-4" /> Back to shop
          </Link>
          <span className="hidden sm:inline">Housefinds · Useful home finds</span>
        </div>

        <div className="grid gap-10 xl:grid-cols-[1.08fr_.92fr] xl:gap-16">
          <section className="min-w-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {gallery.map((image, index) => (
                <div
                  key={image.id || index}
                  className={`relative overflow-hidden bg-[#efede7] ${index === 0 ? 'aspect-[4/3] rounded-[32px] sm:col-span-2' : 'aspect-square rounded-[26px]'}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt || name}
                    fill
                    priority={index === 0}
                    className="object-cover transition duration-700 hover:scale-[1.015]"
                    sizes={index === 0 ? '(max-width:1280px) 100vw, 58vw' : '(max-width:768px) 100vw, 29vw'}
                  />
                </div>
              ))}
            </div>
          </section>

          <aside className="xl:sticky xl:top-28 xl:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">{story.eyebrow}</p>
            <h1 className="mt-4 max-w-2xl text-[clamp(3rem,4.5vw,5.7rem)] font-semibold leading-[.9] tracking-[-.065em] text-[#101622]">
              {name}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/52">{tagline}</p>

            {product.review_count > 0 && (
              <p className="mt-5 text-sm font-medium text-black/50">★ {product.average_rating} · {product.review_count} reviews</p>
            )}

            <div className="mt-8 rounded-[30px] border border-black/[.07] bg-white p-6 shadow-[0_18px_70px_rgba(34,45,37,.045)] sm:p-7">
              <ProductPurchasePanel product={product} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              {[
                ['Curated', 'Picked for everyday usefulness.'],
                ['Tracked', 'Order updates from checkout onward.'],
                ['Supported', 'Help when something needs attention.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl bg-[#f0f2ed] p-4">
                  <p className="text-sm font-semibold text-[#172018]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-black/42">{copy}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <section className="border-y border-black/[.06] bg-[#f0f1eb] px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[.95fr_1.05fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-black/40">Why it earns a spot</p>
            <h2 className="mt-5 text-[clamp(3.2rem,5vw,6rem)] font-semibold leading-[.9] tracking-[-.06em] text-[#101622]">
              {story.headline}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/50">{story.intro}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:self-end">
            {story.benefits.map((benefit, index) => (
              <div key={benefit} className="flex min-h-[220px] flex-col justify-between rounded-[28px] bg-white p-6 shadow-[0_16px_55px_rgba(31,42,34,.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[.2em] text-black/28">0{index + 1}</span>
                  <CheckCircleIcon className="size-6 text-[#557562]" />
                </div>
                <p className="text-lg font-semibold leading-7 tracking-[-.025em]">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {visibleAttributes.length > 0 && (
        <section className="px-5 py-24 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-black/40">Product details</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-.05em]">The useful bits, clearly.</h2>
              </div>
              <dl className="divide-y divide-black/[.07] border-y border-black/[.07]">
                {visibleAttributes.map((attribute) => (
                  <div key={attribute.name} className="grid gap-2 py-5 sm:grid-cols-[180px_1fr]">
                    <dt className="text-sm font-semibold text-black/45">{attribute.name}</dt>
                    <dd className="text-sm leading-6 text-black/68">{attribute.terms.map((term) => term.name).join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
