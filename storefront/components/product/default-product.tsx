import Image from 'next/image'
import Link from 'next/link'
import { CheckCircleIcon, ChevronRightIcon, LockClosedIcon, TruckIcon } from '@heroicons/react/24/outline'
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
        <nav className="mb-7 flex min-w-0 items-center gap-2 overflow-hidden text-sm text-black/42" aria-label="Breadcrumb">
          <Link href="/" className="shrink-0 transition hover:text-black">Home</Link><ChevronRightIcon className="size-3.5 shrink-0" />
          <Link href="/shop" className="shrink-0 transition hover:text-black">Shop</Link><ChevronRightIcon className="size-3.5 shrink-0" />
          <span className="truncate text-black/62">{name}</span>
        </nav>

        <div className="grid gap-10 xl:grid-cols-[1.08fr_.92fr] xl:gap-16">
          <section className="min-w-0" aria-label={`${name} product images`}>
            <div className="grid gap-3 sm:grid-cols-2">
              {gallery.map((image, index) => (
                <div key={image.id || index} className={`relative overflow-hidden bg-[#efede7] ${index === 0 ? 'aspect-[4/3] rounded-[32px] sm:col-span-2' : 'aspect-square rounded-[26px]'}`}>
                  <Image
                    src={image.src}
                    alt={image.alt || `${name} view ${index + 1}`}
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
            <h1 className="mt-4 max-w-2xl text-[clamp(3rem,4.5vw,5.7rem)] font-semibold leading-[.9] tracking-[-.065em] text-[#101622]">{name}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/52">{tagline}</p>

            {product.review_count > 0 && <p className="mt-5 text-sm font-medium text-black/50">★ {product.average_rating} · {product.review_count} reviews</p>}

            <div className="mt-8 rounded-[30px] border border-black/[.07] bg-white p-6 shadow-[0_18px_70px_rgba(34,45,37,.045)] sm:p-7">
              <ProductPurchasePanel product={product} />
            </div>

            <div className="mt-5 divide-y divide-black/[.07] rounded-[24px] border border-black/[.07] bg-white px-5">
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#172018]">
                  <span className="inline-flex items-center gap-2"><TruckIcon className="size-5 text-[#557562]" /> Delivery & total cost</span><span className="text-xl font-normal text-black/35 group-open:rotate-45">+</span>
                </summary>
                <p className="pb-2 pt-3 text-sm leading-6 text-black/50">Available delivery methods and costs are calculated from the delivery address during checkout. The order total is shown before payment.</p>
              </details>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#172018]">
                  <span>Product options & details</span><span className="text-xl font-normal text-black/35 group-open:rotate-45">+</span>
                </summary>
                <p className="pb-2 pt-3 text-sm leading-6 text-black/50">Choose the product options above before adding to cart. Your selected variant remains visible in the cart so you can verify it before checkout.</p>
              </details>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              {[
                ['Secure checkout', 'Card payment is handled securely at checkout.', LockClosedIcon],
                ['Cost before payment', 'Delivery and total are shown before you pay.', TruckIcon],
                ['Options stay clear', 'Selected variants remain visible in your cart.', CheckCircleIcon],
              ].map(([title, copy, Icon]) => {
                const IconComponent = Icon as typeof CheckCircleIcon
                return (
                  <div key={title as string} className="rounded-2xl bg-[#f0f2ed] p-4">
                    <IconComponent className="size-5 text-[#557562]" />
                    <p className="mt-3 text-sm font-semibold text-[#172018]">{title as string}</p>
                    <p className="mt-1 text-xs leading-5 text-black/42">{copy as string}</p>
                  </div>
                )
              })}
            </div>
          </aside>
        </div>
      </div>

      <section className="border-y border-black/[.06] bg-[#f0f1eb] px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[.95fr_1.05fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-black/40">Why it earns a spot</p>
            <h2 className="mt-5 text-[clamp(3.2rem,5vw,6rem)] font-semibold leading-[.9] tracking-[-.06em] text-[#101622]">{story.headline}</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/50">{story.intro}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:self-end">
            {story.benefits.map((benefit, index) => (
              <div key={benefit} className="flex min-h-[220px] flex-col justify-between rounded-[28px] bg-white p-6 shadow-[0_16px_55px_rgba(31,42,34,.04)]">
                <div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[.2em] text-black/28">0{index + 1}</span><CheckCircleIcon className="size-6 text-[#557562]" /></div>
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
              <div><p className="text-[11px] font-semibold uppercase tracking-[.28em] text-black/40">Product details</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em]">The useful bits, clearly.</h2></div>
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
