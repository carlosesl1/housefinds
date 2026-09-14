import { notFound, permanentRedirect } from 'next/navigation'
import { getProductByStorefrontSlug, getProductReviews, getProductVariations, getRelatedProducts } from '@/lib/woocommerce/client'
import { DefaultProduct } from '@/components/product/default-product'
import { ProductFAQ } from '@/components/product/product-faq'
import { ProductReviews } from '@/components/product/product-reviews'
import { RelatedProducts } from '@/components/product/related-products'
import { RecentlyViewed } from '@/components/product/recently-viewed'
import { AuroraProjectorExperience } from '@/experiences/aurora-projector'
import { experienceRegistry } from '@/experiences/registry'
import { displayProductName, displayProductTagline, storefrontProductSlug } from '@/lib/woocommerce/presentation'
import { formatProductPrice } from '@/lib/woocommerce/money'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://housefindsstore.com').replace(/\/$/, '')

function decimalPrice(amount: string, minorUnit: number) {
  return (Number(amount || 0) / Math.pow(10, minorUnit)).toFixed(minorUnit)
}

const ukOfferPolicy = {
  shippingDetails: {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: 0,
      currency: 'GBP',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'GB',
    },
  },
  hasMerchantReturnPolicy: {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'GB',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 14,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
    merchantReturnLink: `${SITE_URL}/returns`,
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductByStorefrontSlug(slug)
  if (!product) return {}

  const title = displayProductName(product.name)
  const description = displayProductTagline(product)
  const publicSlug = storefrontProductSlug(product)
  const canonical = `${SITE_URL}/product/${publicSlug}`

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
  const product = await getProductByStorefrontSlug(slug)
  if (!product) notFound()

  const publicSlug = storefrontProductSlug(product)
  if (slug !== publicSlug) permanentRedirect(`/product/${publicSlug}`)

  const [reviews, relatedProducts, variations] = await Promise.all([
    getProductReviews(product.id, 12).catch(() => []),
    getRelatedProducts(product.id, 8).catch(() => []),
    product.type === 'variable' || product.variations?.length
      ? getProductVariations(product.id).catch(() => [])
      : Promise.resolve([]),
  ])

  const name = displayProductName(product.name)
  const description = displayProductTagline(product)
  const prices = product.prices
  const range = prices.price_range
  const productUrl = `${SITE_URL}/product/${publicSlug}`
  const offer = range
    ? {
        '@type': 'AggregateOffer',
        priceCurrency: prices.currency_code,
        lowPrice: decimalPrice(range.min_amount, prices.currency_minor_unit),
        highPrice: decimalPrice(range.max_amount, prices.currency_minor_unit),
        offerCount: variations.length || product.variations?.length || 1,
        availability: product.is_in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: productUrl,
        ...ukOfferPolicy,
      }
    : {
        '@type': 'Offer',
        priceCurrency: prices.currency_code,
        price: decimalPrice(prices.price, prices.currency_minor_unit),
        availability: product.is_in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: productUrl,
        ...ukOfferPolicy,
      }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: product.images?.map((image) => image.src).slice(0, 8),
    url: productUrl,
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

  const recentlyViewedProduct = {
    id: product.id,
    slug: publicSlug,
    name,
    tagline: description,
    price: formatProductPrice(product),
    image: product.images?.[0]?.thumbnail || product.images?.[0]?.src || '',
  }

  const experience = experienceRegistry[product.slug]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {experience === 'aurora-projector' ? (
        <>
          <AuroraProjectorExperience product={product} variations={variations} />
          <ProductFAQ product={product} />
          <ProductReviews product={product} reviews={reviews} />
          <RelatedProducts products={relatedProducts} />
        </>
      ) : (
        <DefaultProduct product={product} variations={variations} reviews={reviews} relatedProducts={relatedProducts} />
      )}
      <RecentlyViewed product={recentlyViewedProduct} />
    </>
  )
}
