import Image from 'next/image'
import Link from 'next/link'
import { CheckIcon, ChevronRightIcon, CubeIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import type { WooProduct, WooProductReview } from '@/lib/woocommerce/types'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductPurchasePanel } from '@/components/product/product-purchase-panel'
import { ProductFAQ } from '@/components/product/product-faq'
import { ProductReviews } from '@/components/product/product-reviews'
import { ProductRating } from '@/components/product/product-rating'
import { ProductOptionGuide } from '@/components/product/product-option-guide'
import { RelatedProducts } from '@/components/product/related-products'
import { displayProductName, displayProductTagline, getProductStory } from '@/lib/woocommerce/presentation'
import { isOperationalAttribute } from '@/lib/storefront/catalog'
import { storefrontAttributeRows } from '@/lib/storefront/product-attributes'
import { getProductContent, approvedProductVideo, dimensionOptions } from '@/lib/storefront/product-content'
import { HOME_COLLECTION_BG, PAPER_TEXTURE, SAGE_TEXTURE } from '@/lib/storefront/home-backgrounds'
import { toPurchaseProduct, toPurchaseVariations, toStorefrontImages } from '@/lib/storefront/client-product'
import { ProductViewTracker } from '@/components/analytics/product-view-tracker'

export function DefaultProduct({ product, variations = [], reviews = [], relatedProducts = [] }: {
  product: WooProduct; variations?: WooProduct[]; reviews?: WooProductReview[]; relatedProducts?: WooProduct[]
}) {
  const name = displayProductName(product.name)
  const story = getProductStory(product)
  const content = getProductContent(product)
  const images = toStorefrontImages(product.images || []).slice(0, 12)
  const purchaseProduct = toPurchaseProduct(product)
  const attributes = product.attributes.filter((attribute) => attribute.terms.length > 0 && !isOperationalAttribute(attribute)
    && !(product.id === 333 && /load\s*bearing/i.test(attribute.name)))
  const optionRows = attributes.flatMap((attribute) => storefrontAttributeRows(attribute))
  const dimensions = product.id === 452 ? dimensionOptions(attributes.flatMap((attribute) => attribute.terms.map((term) => term.name))) : []
  const facts = content?.facts || []
  const hasDetails = facts.length > 0 || optionRows.length > 0 || Boolean(content?.included || content?.care)
  const highlights = content?.highlights || story.benefits.slice(0, 3)
  const detailImage = images[1] || images[0]
  const topBackground = `linear-gradient(rgba(247,245,239,.88), rgba(251,250,247,.96)), url("${HOME_COLLECTION_BG}"), url("${PAPER_TEXTURE}")`
  const storyBackground = `linear-gradient(rgba(240,241,235,.90), rgba(240,241,235,.96)), url("${SAGE_TEXTURE}")`

  return (
    <main className="bg-[var(--hf-background)]">
      <ProductViewTracker id={product.id} name={name} price={product.prices.price} currency={product.prices.currency_code} minorUnit={product.prices.currency_minor_unit} />
      <section className="border-b border-black/[.06] bg-[#f7f5ef]" style={{ backgroundImage: topBackground, backgroundPosition: 'center', backgroundRepeat: 'no-repeat, no-repeat, repeat', backgroundSize: 'cover, cover, 192px 192px' }}>
        <div className="hf-container pb-10 pt-5 lg:pb-14 lg:pt-6">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs leading-5 text-black/65 sm:text-sm" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link><ChevronRightIcon className="size-3" aria-hidden="true" />
            <Link href="/shop" className="hover:underline">Shop</Link><ChevronRightIcon className="size-3" aria-hidden="true" />
            <span aria-current="page" className="max-w-[60vw] truncate text-[var(--hf-ink)]">{name}</span>
          </nav>
          <div className="grid gap-5 lg:grid-cols-[1.08fr_.92fr] lg:items-start lg:gap-x-10 lg:gap-y-5 xl:gap-x-14">
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--hf-brand)]">Housefinds · everyday home essentials</p>
              <h1 className="mt-3 text-[clamp(1.9rem,3.2vw,2.85rem)] font-semibold leading-[1.06] tracking-[-.04em] text-[var(--hf-ink)]">{name}</h1>
              <p className="mt-3 text-base leading-7 text-black/65">{displayProductTagline(product)}</p>
              <ProductRating rating={Number(product.average_rating)} count={product.review_count} />
              <ul className="mt-4 grid gap-2" aria-label="Product highlights">
                {highlights.map((benefit) => <li key={benefit} className="flex items-start gap-2.5 text-sm leading-6 text-[var(--hf-ink)]">
                  <CheckIcon className="mt-1 size-4 shrink-0 text-[var(--hf-brand)]" aria-hidden="true" />{benefit}
                </li>)}
              </ul>
            </div>
            <section className="min-w-0 lg:sticky lg:top-24 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start" aria-label={`${name} product gallery`}>
              <ProductGallery key={product.id} images={images} productName={name} video={approvedProductVideo(content?.video)} />
            </section>
            <aside className="min-w-0 lg:col-start-2 lg:row-start-2" aria-label="Choose options and buy">
              {content?.guide && <ProductOptionGuide guide={content.guide} sizes={dimensions} />}
              <div className="hf-purchase-shell rounded-[var(--hf-radius-lg)] border border-black/[.07] bg-white p-4 sm:p-5">
                <ProductPurchasePanel key={product.id} product={purchaseProduct} variations={toPurchaseVariations(variations)} />
              </div>
              {content?.included && <p className="mt-4 flex items-start gap-2.5 px-1 text-xs leading-6 text-black/65"><CubeIcon className="mt-1 size-4 shrink-0 text-[var(--hf-brand)]" aria-hidden="true" /><span><strong className="font-semibold text-[var(--hf-ink)]">In the box: </strong>{content.included}</span></p>}
            </aside>
          </div>
        </div>
      </section>

      <nav className="border-b border-black/[.07] bg-white/70" aria-label="Product information">
        <div className="hf-container flex gap-1 overflow-x-auto py-2 text-sm font-medium text-[var(--hf-brand)]">
          <a href="#product-overview" className="inline-flex min-h-11 shrink-0 items-center rounded-full px-4 hover:bg-[var(--hf-brand-soft)]">Overview</a>
          {content?.steps && <a href="#product-use" className="inline-flex min-h-11 shrink-0 items-center rounded-full px-4 hover:bg-[var(--hf-brand-soft)]">How to use</a>}
          {hasDetails && <a href="#product-details" className="inline-flex min-h-11 shrink-0 items-center rounded-full px-4 hover:bg-[var(--hf-brand-soft)]">Details & care</a>}
          <a href="#product-questions" className="inline-flex min-h-11 shrink-0 items-center rounded-full px-4 hover:bg-[var(--hf-brand-soft)]">Questions</a>
          {product.review_count > 0 && <a href="#reviews" className="inline-flex min-h-11 shrink-0 items-center rounded-full px-4 hover:bg-[var(--hf-brand-soft)]">Reviews</a>}
        </div>
      </nav>

      <section id="product-overview" className="scroll-mt-24 border-b border-black/[.06] py-12 lg:py-16" style={{ backgroundImage: storyBackground, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className={`hf-container grid gap-8 ${detailImage ? 'lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14' : ''}`}>
          <div>
            <p className="hf-eyebrow text-[var(--hf-brand)]">Made for everyday life</p>
            <h2 className="mt-4 max-w-xl text-[clamp(1.9rem,3vw,3rem)] font-semibold leading-[1.08] tracking-[-.04em]">{story.headline}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-black/65">{product.id === 399 ? 'A compact pull-cord closer for everyday internal doors that are regularly left open.' : story.intro}</p>
            {content?.detail && <div className="mt-6 border-l-2 border-[var(--hf-brand)]/25 pl-5">
              <p className="text-sm font-semibold text-[var(--hf-ink)]">A closer look</p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-black/65">{content.detail}</p>
            </div>}
            {hasDetails && <a href="#product-details" className="hf-button-tertiary mt-6">See details & care <ChevronRightIcon className="size-4" aria-hidden="true" /></a>}
          </div>
          {detailImage && <figure className="overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.06] bg-white/65">
            <div className="relative aspect-[4/3] sm:aspect-[5/4] lg:max-h-[460px]"><Image src={detailImage.src} alt={detailImage.alt || `${name} — additional product view`} fill sizes="(max-width:1023px) calc(100vw - 40px), 48vw" className="object-contain p-4" /></div>
            <figcaption className="border-t border-black/[.06] px-5 py-3 text-xs leading-5 text-black/65">{name} · Product detail. Contents depend on the option selected.</figcaption>
          </figure>}
        </div>
      </section>

      {content?.steps && <section id="product-use" className="scroll-mt-24 border-b border-black/[.06] bg-white/60 py-12 lg:py-16">
        <div className="hf-container">
          <p className="hf-eyebrow text-[var(--hf-brand)]">How to use</p>
          <h2 className="mt-3 text-[clamp(1.8rem,2.6vw,2.7rem)] font-semibold leading-tight tracking-[-.035em]">{content.steps.title}</h2>
          <ol className="mt-7 grid gap-4 md:grid-cols-3">
            {content.steps.items.map((step, index) => <li key={step.title} className="rounded-[var(--hf-radius-md)] border border-black/[.07] bg-[var(--hf-background)] p-5 sm:p-6">
              <span className="grid size-9 place-items-center rounded-full bg-[var(--hf-brand-soft)] text-xs font-bold text-[var(--hf-brand)]" aria-hidden="true">0{index + 1}</span>
              <h3 className="mt-4 text-lg font-semibold tracking-[-.02em]">{step.title}</h3><p className="mt-2 text-sm leading-6 text-black/65">{step.text}</p>
            </li>)}
          </ol>
          {content.steps.note && <p className="mt-4 text-sm leading-6 text-black/65">{content.steps.note}</p>}
        </div>
      </section>}

      {hasDetails && <section id="product-details" className="scroll-mt-24 border-b border-black/[.06] py-12 lg:py-16">
        <div className="hf-container grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-14">
          <div><p className="hf-eyebrow text-[var(--hf-brand)]">Details & care</p><h2 className="mt-4 text-[clamp(1.9rem,3vw,3rem)] font-semibold leading-[1.08] tracking-[-.04em]">The useful details.<br />All in one place.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-black/65">Materials, listed options and care information for this product.</p></div>
          <div className="min-w-0 space-y-4">
            <dl className="divide-y divide-black/[.07] overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.07] bg-white">
              {facts.map((fact) => <div key={fact.label} className="grid gap-2 px-5 py-4 sm:grid-cols-[170px_1fr]"><dt className="text-sm font-semibold text-[var(--hf-ink)]">{fact.label}</dt><dd className="text-sm leading-6 text-black/65">{fact.value}</dd></div>)}
              {optionRows.map((row, index) => <div key={`${row.label}-${index}`} className="grid gap-2 px-5 py-4 sm:grid-cols-[170px_1fr]"><dt className="text-sm font-semibold text-[var(--hf-ink)]">{row.label}</dt><dd className="text-sm leading-6 text-black/65">{row.values.join(' · ')}</dd></div>)}
            </dl>
            {(content?.included || content?.care) && <div className="grid gap-4 sm:grid-cols-2">
              {content.included && <section className="rounded-[var(--hf-radius-md)] border border-black/[.07] bg-[var(--hf-brand-soft)]/45 p-5"><CubeIcon className="size-5 text-[var(--hf-brand)]" aria-hidden="true" /><h3 className="mt-3 text-base font-semibold">What’s in the box</h3><p className="mt-2 text-sm leading-6 text-black/65">{content.included}</p></section>}
              {content.care && <section className="rounded-[var(--hf-radius-md)] border border-black/[.07] bg-white p-5"><InformationCircleIcon className="size-5 text-[var(--hf-brand)]" aria-hidden="true" /><h3 className="mt-3 text-base font-semibold">Care & everyday use</h3><p className="mt-2 text-sm leading-6 text-black/65">{content.care}</p></section>}
            </div>}
          </div>
        </div>
      </section>}
      <ProductFAQ product={product} />
      <ProductReviews summary={{ average_rating: product.average_rating, review_count: product.review_count }} reviews={reviews} />
      <RelatedProducts products={relatedProducts.slice(0, 4)} />
    </main>
  )
}
