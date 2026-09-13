import { notFound } from 'next/navigation'
import { getProductBySlug, getProductReviews, getRelatedProducts } from '@/lib/woocommerce/client'
import { DefaultProduct } from '@/components/product/default-product'
import { ProductReviews } from '@/components/product/product-reviews'
import { RelatedProducts } from '@/components/product/related-products'
import { RecentlyViewed } from '@/components/product/recently-viewed'
import { AuroraProjectorExperience } from '@/experiences/aurora-projector'
import { experienceRegistry } from '@/experiences/registry'
import { displayProductName, displayProductTagline } from '@/lib/woocommerce/presentation'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://housefindsstore.com').replace(/\/$/, '')

function decimalPrice(amount: string, minorUnit: number) {
  return (Number(amount || 0) / Math.pow(10, minorUnit)).toFixed(minorUnit)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const title = displayProductName(product.name)
  const description = displayProductTagline(product)
  const canonical = `${SITE_URL}/produto/${product.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: product.images?.[0]?.src ? [{ url: product.images[0].src, alt: title }] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [reviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id, 12).catch(() => []),
    getRelatedProducts(product.id, 8).catch(() => []),
  ])

  const name = displayProductName(product.name)
  const description = displayProductTagline(product)
  const prices = product.prices
  const range = prices.price_range
  const offer = range
    ? {
        '@type': 'AggregateOffer',
        priceCurrency: prices.currency_code,
        lowPrice: decimalPrice(range.min_amount, prices.currency_minor_unit),
        highPrice: decimalPrice(range.max_amount, prices.currency_minor_unit),
        offerCount: product.variations?.length || 1,
        availability: product.is_in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      }
    : {
        '@type': 'Offer',
        priceCurrency: prices.currency_code,
        price: decimalPrice(prices.price, prices.currency_minor_unit),
        availability: product.is_in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${SITE_URL}/produto/${product.slug}`,
      }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: product.images?.map((image) => image.src).slice(0, 8),
    sku: product.sku || undefined,
    url: `${SITE_URL}/produto/${product.slug}`,
    offers: offer,
    ...(product.review_count > 0 && Number(product.average_rating) > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(product.average_rating),
            reviewCount: product.review_count,
          },
        }
      : {}),
  }

  const experience = experienceRegistry[slug]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {experience === 'aurora-projector' ? (
        <>
          <AuroraProjectorExperience product={product} />
          <ProductReviews product={product} reviews={reviews} />
          <RelatedProducts products={relatedProducts} />
        </>
      ) : (
        <DefaultProduct product={product} reviews={reviews} relatedProducts={relatedProducts} />
      )}
      <RecentlyViewed product={product} />
    </>
  )
}
