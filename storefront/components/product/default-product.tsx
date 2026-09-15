import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon, CheckCircleIcon, ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline'
import type { WooProduct, WooProductReview } from '@/lib/woocommerce/types'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductPurchasePanel } from '@/components/product/product-purchase-panel'
import { ProductFAQ } from '@/components/product/product-faq'
import { ProductReviews } from '@/components/product/product-reviews'
import { RelatedProducts } from '@/components/product/related-products'
import { displayProductName, displayProductTagline, getProductStory } from '@/lib/woocommerce/presentation'
import { isOperationalAttribute } from '@/lib/storefront/catalog'
import { storefrontAttributeRows } from '@/lib/storefront/product-attributes'
import { HOME_COLLECTION_BG, PAPER_TEXTURE, SAGE_TEXTURE } from '@/lib/storefront/home-backgrounds'
import { toPurchaseProduct, toPurchaseVariations, toStorefrontImages } from '@/lib/storefront/client-product'
import { ProductViewTracker } from '@/components/analytics/product-view-tracker'

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
  const detailRows = visibleAttributes.flatMap((attribute) => storefrontAttributeRows(attribute))
  const purchaseProduct = toPurchaseProduct(product)
  const purchaseVariations = toPurchaseVariations(variations)
  const storefrontImages = toStorefrontImages(product.images || []).slice(0, 12)
  const storyImages = storefrontImages.length > 1 ? storefrontImages.slice(1, 4) : storefrontImages.slice(0, 1)
  const showDetails = detailRows.length > 0

  const topBackground = `linear-gradient(rgba(247,245,239,.84), rgba(251,250,247,.93)), url("${HOME_COLLECTION_BG}"), url("${PAPER_TEXTURE}")`
  const storyBackground = `linear-gradient(rgba(240,241,235,.88), rgba(240,241,235,.95)), url("${SAGE_TEXTURE}"), url("${PAPER_TEXTURE}")`
  const detailsBackground = `linear-gradient(rgba(251,250,247,.9), rgba(251,250,247,.96)), url("${PAPER_TEXTURE}")`

  return (
    <main className="bg-[var(--hf-background)]">
      <ProductViewTracker id={product.id} name={name} price={product.prices.price} currency={product.prices.currency_code} minorUnit={product.prices.currency_minor_unit} />
      <section
        className="relative overflow-hidden border-b border-black/[.05] bg-[#f7f5ef]"
        style={{
          backgroundImage: topBackground,
          backgroundPosition: 'center, center, center',
          backgroundRepeat: 'no-repeat, no-repeat, repeat',
          backgroundSize: 'cover, cover, 192px 192px',
        }}
      >
        <div className="pointer-events-none absolute -left-32 top-28 h-80 w-80 rounded-full bg-[#dce7df]/30 blur-[110px]" />
        <div className="pointer-events-none absolute right-[12%] top-4 h-72 w-72 rounded-full bg-white/48 blur-[100px]" />

        <div className="hf-container relative pb-16 pt-5 lg:pb-24 lg:pt-7">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-black/52 sm:text-sm" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-black">Home</Link>
            <ChevronRightIcon className="size-3.5" />
            <Link href="/shop" className="transition hover:text-black">Shop</Link>
            <ChevronRightIcon className="size-3.5" />
            <span className="max-w-[52vw] truncate font-medium text-black/58">{name}</span>
          </nav>

          <div className="grid gap-7 lg:grid-cols-[1.08fr_.92fr] lg:items-start lg:gap-10 xl:gap-14">
            <div className="lg:col-start-2 lg:row-start-1 lg:pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="hf-eyebrow text-[var(--hf-brand-muted)]">{story.eyebrow}</p>
                <span className="inline-flex items-center gap-1.5 rounded-[var(--hf-radius-pill)] border border-[#557562]/12 bg-[#eef3ef] px-3 py-1.5 text-[11px] font-semibold text-[#355f4a]">
                  <SparklesIcon className="size-3.5" /> Housefinds edit
                </span>
              </div>
              <h1 className="mt-4 max-w-[720px] text-[clamp(2.45rem,4vw,3.45rem)] font-semibold leading-[.98] tracking-[-.045em] text-[var(--hf-ink)]">{name}</h1>
              <p className="mt-4 max-w-xl text-[16px] leading-7 text-black/55 sm:text-[17px]">{tagline}</p>
              {product.review_count > 0 && (
                <a href="#reviews" className="mt-5 inline-flex items-center gap-2 rounded-[var(--hf-radius-pill)] bg-[#fbf4e8] px-3.5 py-2 text-sm font-semibold text-black/60 transition hover:bg-[#f6ead8] hover:text-black">
                  <span className="tracking-[.08em] text-[#b17928]">★★★★★</span>
                  <span>{Number(product.average_rating || 0).toFixed(1)} · {product.review_count} review{product.review_count === 1 ? '' : 's'}</span>
                </a>
              )}
            </div>

            <section className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1" aria-label={`${name} product gallery`}>
              <ProductGallery images={storefrontImages} productName={name} />
            </section>

            <aside className="lg:col-start-2 lg:row-start-2 lg:sticky lg:top-24 lg:self-start">
              <Link href="/shop" className="mb-4 inline-flex items-center gap-2 text-sm text-black/55 transition hover:text-black lg:hidden"><ArrowLeftIcon className="size-4" /> Back to shop</Link>
              <div className="hf-purchase-shell overflow-visible rounded-[var(--hf-radius-lg)] border border-white/65 bg-white/90 p-5 shadow-[0_24px_72px_rgba(29,42,34,.09)] backdrop-blur-xl sm:p-6 lg:p-7">
                <ProductPurchasePanel product={purchaseProduct} variations={purchaseVariations} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section
        className="hf-section relative overflow-hidden border-b border-black/[.06] bg-[var(--hf-surface-soft)]"
        style={{
          backgroundImage: storyBackground,
          backgroundPosition: 'center, center, center',
          backgroundRepeat: 'no-repeat, no-repeat, repeat',
          backgroundSize: 'cover, cover, 192px 192px',
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="hf-container relative grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16">
          <div className="grid gap-3 sm:grid-cols-[1.12fr_.88fr]">
            <div className="relative min-h-[420px] overflow-hidden rounded-[var(--hf-radius-lg)] border border-white/50 bg-[#e8e6df] shadow-[0_24px_70px_rgba(38,52,42,.09)] sm:min-h-[560px]">
              {storyImages[0] ? (
                <Image src={storyImages[0].src} alt={storyImages[0].alt || `${name} detail`} fill sizes="(max-width:1024px) 100vw, 38vw" className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#ebe8df,#dfe7e1)]" />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/18 to-transparent" />
            </div>
            <div className="grid gap-3 sm:grid-rows-2">
              {[storyImages[1], storyImages[2]].map((image, index) => (
                <div key={image?.id || image?.src || `story-placeholder-${index}`} className="relative min-h-[220px] overflow-hidden rounded-[var(--hf-radius-md)] border border-white/50 bg-[#e8e6df] shadow-[0_16px_40px_rgba(38,52,42,.065)] sm:min-h-0">
                  {image ? (
                    <Image src={image.src} alt={image.alt || `${name} detail ${index + 2}`} fill sizes="(max-width:1024px) 50vw, 22vw" className="object-cover transition duration-700 hover:scale-[1.02]" />
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

            <div className="mt-8 grid gap-3">
              {story.benefits.map((benefit, index) => (
                <div key={benefit} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[var(--hf-radius-md)] border border-white/60 bg-white/46 px-4 py-4 shadow-[0_12px_30px_rgba(38,52,42,.04)] backdrop-blur-[2px] sm:px-5">
                  <span className="grid size-9 place-items-center rounded-full bg-white text-[11px] font-bold tracking-[.12em] text-black/52 shadow-sm">0{index + 1}</span>
                  <p className="text-base font-semibold leading-6 tracking-[-.018em]">{benefit}</p>
                  <CheckCircleIcon className="size-5 text-[var(--hf-brand-muted)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {showDetails && (
        <section
          className="hf-section relative overflow-hidden bg-[var(--hf-background)]"
          style={{
            backgroundImage: detailsBackground,
            backgroundPosition: 'center, center',
            backgroundRepeat: 'no-repeat, repeat',
            backgroundSize: 'cover, 192px 192px',
          }}
        >
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
              <div>
                <p className="hf-eyebrow">At a glance</p>
                <h2 className="mt-4 text-[clamp(2.3rem,3.35vw,3.45rem)] font-semibold leading-[.98] tracking-[-.045em]">The useful bits, clearly.</h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-black/55">Key options and verified listing details, presented in a way that is easy to scan.</p>
              </div>
              <dl className="overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.065] bg-white/88 shadow-[0_20px_58px_rgba(29,42,34,.065)] backdrop-blur-sm">
                {detailRows.map((row, index) => (
                  <div key={`${row.label}-${index}`} className={`grid gap-3 px-6 py-5 sm:grid-cols-[180px_1fr] sm:items-start sm:px-7 ${index > 0 ? 'border-t border-black/[.065]' : ''}`}>
                    <dt className="pt-1 text-sm font-semibold text-black/55">{row.label}</dt>
                    <dd className="flex flex-wrap gap-2">
                      {row.values.map((value) => (
                        <span key={`${row.label}-${value}`} className="inline-flex min-h-9 items-center rounded-[var(--hf-radius-pill)] border border-black/[.07] bg-[#f7f8f5] px-3.5 py-2 text-sm font-medium text-black/66">
                          {value}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      <ProductFAQ product={product} />
      <ProductReviews summary={{ average_rating: product.average_rating, review_count: product.review_count }} reviews={reviews} />
      <RelatedProducts products={relatedProducts} />
    </main>
  )
}
