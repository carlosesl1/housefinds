import Link from 'next/link'
import { ArrowLeftIcon, CheckCircleIcon, ChevronRightIcon, ShieldCheckIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import type { WooProduct, WooProductReview } from '@/lib/woocommerce/types'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductPurchasePanel } from '@/components/product/product-purchase-panel'
import { ProductReviews } from '@/components/product/product-reviews'
import { RelatedProducts } from '@/components/product/related-products'
import { displayProductName, displayProductTagline, getProductStory } from '@/lib/woocommerce/presentation'
import { isOperationalAttribute, storefrontAttributeName, storefrontTermName } from '@/lib/storefront/catalog'

export function DefaultProduct({
  product,
  reviews = [],
  relatedProducts = [],
}: {
  product: WooProduct
  reviews?: WooProductReview[]
  relatedProducts?: WooProduct[]
}) {
  const name = displayProductName(product.name)
  const tagline = displayProductTagline(product)
  const story = getProductStory(product)
  const visibleAttributes = product.attributes.filter((attribute) => attribute.terms.length > 0 && !isOperationalAttribute(attribute))

  return (
    <main className="bg-[#fbfaf7]">
      <div className="mx-auto max-w-[1560px] px-5 pb-20 pt-7 lg:px-8 lg:pb-28">
        <nav className="mb-7 flex flex-wrap items-center gap-2 text-sm text-black/42" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-black">Home</Link>
          <ChevronRightIcon className="size-3.5" />
          <Link href="/shop" className="transition hover:text-black">Shop</Link>
          <ChevronRightIcon className="size-3.5" />
          <span className="max-w-[45vw] truncate text-black/65">{name}</span>
        </nav>

        <div className="grid gap-10 xl:grid-cols-[1.08fr_.92fr] xl:gap-16">
          <section className="min-w-0" aria-label={`${name} product gallery`}>
            <ProductGallery images={product.images || []} productName={name} />
          </section>

          <aside className="xl:sticky xl:top-28 xl:self-start">
            <Link href="/shop" className="mb-5 inline-flex items-center gap-2 text-sm text-black/42 transition hover:text-black xl:hidden">
              <ArrowLeftIcon className="size-4" /> Back to shop
            </Link>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">{story.eyebrow}</p>
            <h1 className="mt-4 max-w-2xl text-[clamp(3rem,4.5vw,5.7rem)] font-semibold leading-[.9] tracking-[-.065em] text-[#101622]">{name}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/52">{tagline}</p>

            {product.review_count > 0 && (
              <a href="#reviews" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-black/55 transition hover:text-black">
                <span className="tracking-[.08em] text-[#b17928]">★★★★★</span>
                <span>{Number(product.average_rating || 0).toFixed(1)} · {product.review_count} product review{product.review_count === 1 ? '' : 's'}</span>
              </a>
            )}

            <div className="mt-8 rounded-[30px] border border-black/[.07] bg-white p-6 shadow-[0_18px_70px_rgba(34,45,37,.045)] sm:p-7">
              <ProductPurchasePanel product={product} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <Link href="/shipping" className="rounded-2xl bg-[#f0f2ed] p-4 transition hover:bg-[#e8ece6]">
                <TruckIcon className="size-5 text-[#557562]" />
                <p className="mt-3 text-sm font-semibold text-[#172018]">Delivery before payment</p>
                <p className="mt-1 text-xs leading-5 text-black/42">Available methods and totals are calculated at checkout.</p>
              </Link>
              <Link href="/returns" className="rounded-2xl bg-[#f0f2ed] p-4 transition hover:bg-[#e8ece6]">
                <ArrowPathIcon className="size-5 text-[#557562]" />
                <p className="mt-3 text-sm font-semibold text-[#172018]">14-day return request</p>
                <p className="mt-1 text-xs leading-5 text-black/42">Changed your mind? Start a return within 14 days of delivery.</p>
              </Link>
              <div className="rounded-2xl bg-[#f0f2ed] p-4">
                <ShieldCheckIcon className="size-5 text-[#557562]" />
                <p className="mt-3 text-sm font-semibold text-[#172018]">Secure checkout</p>
                <p className="mt-1 text-xs leading-5 text-black/42">Payment is handled through WooCommerce and Stripe.</p>
              </div>
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
                <p className="mt-4 max-w-sm text-sm leading-6 text-black/45">Customer-facing options and specifications from the live product catalog, cleaned up so operational fulfilment metadata does not get in the way.</p>
              </div>
              <dl className="divide-y divide-black/[.07] border-y border-black/[.07]">
                {visibleAttributes.map((attribute) => (
                  <div key={attribute.name} className="grid gap-2 py-5 sm:grid-cols-[180px_1fr]">
                    <dt className="text-sm font-semibold text-black/45">{storefrontAttributeName(attribute)}</dt>
                    <dd className="text-sm leading-6 text-black/68">{attribute.terms.map((term) => storefrontTermName(term)).join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      <ProductReviews product={product} reviews={reviews} />
      <RelatedProducts products={relatedProducts} />
    </main>
  )
}
