import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon, CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct, WooProductReview } from '@/lib/woocommerce/types'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductPurchasePanel } from '@/components/product/product-purchase-panel'
import { ProductFAQ } from '@/components/product/product-faq'
import { ProductReviews } from '@/components/product/product-reviews'
import { RelatedProducts } from '@/components/product/related-products'
import { displayProductName, displayProductTagline, getProductStory } from '@/lib/woocommerce/presentation'
import { isOperationalAttribute, storefrontAttributeName, storefrontTermName } from '@/lib/storefront/catalog'
import { toPurchaseProduct, toPurchaseVariations, toStorefrontImages } from '@/lib/storefront/client-product'

export function DefaultProduct({
  product,
  variations = [],
  reviews = [],
  relatedProducts = [],
}: {
  product: WooProduct
  variations?: WooProduct[]
  reviews?: WooProductReview[]
  relatedProducts?: WooProduct[]
}) {
  const name = displayProductName(product.name)
  const tagline = displayProductTagline(product)
  const story = getProductStory(product)
  const visibleAttributes = product.attributes.filter((attribute) => attribute.terms.length > 0 && !isOperationalAttribute(attribute))
  const purchaseProduct = toPurchaseProduct(product)
  const purchaseVariations = toPurchaseVariations(variations)
  const storefrontImages = toStorefrontImages(product.images || []).slice(0, 12)
  const storyImages = storefrontImages.length > 1 ? storefrontImages.slice(1, 4) : storefrontImages.slice(0, 1)
  const showDetails = visibleAttributes.length >= 2

  return (
    <main className="bg-[var(--hf-background)]">
      <div className="hf-container pb-20 pt-6 lg:pb-28 lg:pt-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-black/40 sm:text-sm" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-black">Home</Link>
          <ChevronRightIcon className="size-3.5" />
          <Link href="/shop" className="transition hover:text-black">Shop</Link>
          <ChevronRightIcon className="size-3.5" />
          <span className="max-w-[45vw] truncate text-black/62">{name}</span>
        </nav>

        <div className="grid gap-9 xl:grid-cols-[1.08fr_.92fr] xl:gap-14">
          <section className="min-w-0" aria-label={`${name} product gallery`}>
            <ProductGallery images={storefrontImages} productName={name} />
          </section>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <Link href="/shop" className="mb-5 inline-flex items-center gap-2 text-sm text-black/42 transition hover:text-black xl:hidden"><ArrowLeftIcon className="size-4" /> Back to shop</Link>
            <p className="hf-eyebrow text-[var(--hf-brand-muted)]">{story.eyebrow}</p>
            <h1 className="mt-4 max-w-[760px] text-[clamp(2.65rem,3.8vw,4rem)] font-semibold leading-[.96] tracking-[-.052em] text-[var(--hf-ink)]">{name}</h1>
            <p className="mt-5 max-w-xl text-[17px] leading-7 text-black/52">{tagline}</p>

            {product.review_count > 0 && (
              <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-black/55 transition hover:text-black">
                <span className="tracking-[.08em] text-[#b17928]">★★★★★</span>
                <span>{Number(product.average_rating || 0).toFixed(1)} · {product.review_count} product review{product.review_count === 1 ? '' : 's'}</span>
              </a>
            )}

            <div className="mt-7 rounded-[var(--hf-radius-md)] border border-black/[.07] bg-white p-5 shadow-[var(--hf-shadow-soft)] sm:p-6">
              <ProductPurchasePanel product={purchaseProduct} variations={purchaseVariations} />
            </div>
          </aside>
        </div>
      </div>

      <section className="hf-section border-y border-black/[.06] bg-[var(--hf-surface-soft)]">
        <div className="hf-container grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16">
          <div className="grid gap-3 sm:grid-cols-[1.12fr_.88fr]">
            <div className="relative min-h-[420px] overflow-hidden rounded-[var(--hf-radius-lg)] bg-[#e8e6df] sm:min-h-[560px]">
              {storyImages[0] ? (
                <Image src={storyImages[0].src} alt={storyImages[0].alt || `${name} detail`} fill sizes="(max-width:1024px) 100vw, 38vw" className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#ebe8df,#dfe7e1)]" />
              )}
            </div>
            <div className="grid gap-3 sm:grid-rows-2">
              {[storyImages[1], storyImages[2]].map((image, index) => (
                <div key={image?.id || image?.src || `story-placeholder-${index}`} className="relative min-h-[220px] overflow-hidden rounded-[var(--hf-radius-md)] bg-[#e8e6df] sm:min-h-0">
                  {image ? (
                    <Image src={image.src} alt={image.alt || `${name} detail ${index + 2}`} fill sizes="(max-width:1024px) 50vw, 22vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,#e4ece6,transparent_35%),linear-gradient(135deg,#efede7,#e4e6df)]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:py-6">
            <p className="hf-eyebrow">Why it earns a spot</p>
            <h2 className="hf-section-title mt-5 max-w-[720px]">{story.headline}</h2>
            <p className="hf-copy-lg mt-6 max-w-xl">{story.intro}</p>

            <div className="mt-9 divide-y divide-black/[.08] border-y border-black/[.08]">
              {story.benefits.map((benefit, index) => (
                <div key={benefit} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5">
                  <span className="text-xs font-semibold tracking-[.18em] text-black/30">0{index + 1}</span>
                  <p className="text-base font-semibold leading-6 tracking-[-.018em]">{benefit}</p>
                  <CheckCircleIcon className="size-5 text-[var(--hf-brand-muted)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {showDetails && (
        <section className="hf-section bg-[var(--hf-background)]">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
              <div>
                <p className="hf-eyebrow">Product details</p>
                <h2 className="mt-4 text-[clamp(2.4rem,3.8vw,3.8rem)] font-semibold leading-[.98] tracking-[-.05em]">The useful bits, clearly.</h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-black/45">The key options and specifications available for this product.</p>
              </div>
              <dl className="divide-y divide-black/[.07] border-y border-black/[.07]">
                {visibleAttributes.map((attribute) => (
                  <div key={attribute.name} className="grid gap-2 py-5 sm:grid-cols-[180px_1fr]"><dt className="text-sm font-semibold text-black/45">{storefrontAttributeName(attribute)}</dt><dd className="text-sm leading-6 text-black/68">{attribute.terms.map((term) => storefrontTermName(term)).join(', ')}</dd></div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      <ProductFAQ product={product} />
      <ProductReviews product={product} reviews={reviews} />
      <RelatedProducts products={relatedProducts} />
    </main>
  )
}
